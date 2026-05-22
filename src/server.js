import './env.js';

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS, getProduct } from './products.js';
import {
  addOrder,
  addPendingCheckout,
  removePendingCheckout,
  getRevenueSnapshot,
  getState,
  logAutomation,
  persist,
} from './db.js';
import { subscribe, broadcast, clientCount } from './events.js';
import { startAutomation } from './automation.js';
import { issueLicense, getLicenseByToken, useCredit } from './credits.js';
import { generateImage, generateVideo, aiConfigured } from './ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');
const PORT = Number(process.env.PORT) || 3847;
const BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const STORE_NAME = process.env.STORE_NAME || 'PixelForge AI';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-admin-token';
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function fulfillOrder({ source, sessionId, email, productId, amountCents, currency }) {
  const product = getProduct(productId);
  const order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sessionId,
    source,
    email,
    productId,
    productName: product?.name || productId,
    amountCents,
    currency: currency || 'usd',
    createdAt: new Date().toISOString(),
    delivered: Boolean(product),
  };
  addOrder(order);
  if (sessionId) removePendingCheckout(sessionId);

  const license = issueLicense(email, productId, order.id);
  if (license) order.accessToken = license.accessToken;

  logAutomation({
    type: 'order_fulfilled',
    orderId: order.id,
    email,
    productId,
    amountCents,
    message: `Studio credits activated for ${email}`,
  });
  broadcast('order', order);
  broadcast('metrics', getRevenueSnapshot());
  return order;
}

async function stripeCheckout(product, email) {
  const params = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price_data][currency]': product.currency,
    'line_items[0][price_data][product_data][name]': product.name,
    'line_items[0][price_data][product_data][description]': product.description,
    'line_items[0][price_data][unit_amount]': String(product.priceCents),
    'line_items[0][quantity]': '1',
    customer_email: email,
    'metadata[productId]': product.id,
    success_url: `${BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/?cancelled=1`,
  });
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Stripe error');
  return data;
}

function serveStatic(urlPath, res) {
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(PUBLIC, safe === '/' || safe === '' ? 'index.html' : safe);
  if (!filePath.startsWith(PUBLIC)) return sendJson(res, 403, { error: 'Forbidden' });
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) return false;
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, BASE_URL);
  const { pathname } = url;

  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'ok',
        store: STORE_NAME,
        uptime: process.uptime(),
        stripe: STRIPE_KEY.startsWith('sk_'),
        ai: aiConfigured() ? 'replicate' : 'demo',
        sseClients: clientCount(),
      });
    }

    if (req.method === 'GET' && pathname === '/api/config') {
      return sendJson(res, 200, {
        storeName: STORE_NAME,
        stripeLive: STRIPE_KEY.startsWith('sk_'),
        aiMode: aiConfigured() ? 'replicate' : 'demo',
        stripeDashboard: 'https://dashboard.stripe.com/account',
      });
    }

    if (req.method === 'GET' && pathname === '/api/products') {
      return sendJson(res, 200, { products: PRODUCTS, stripeLive: STRIPE_KEY.startsWith('sk_'), storeName: STORE_NAME });
    }

    if (req.method === 'GET' && pathname === '/api/metrics') {
      return sendJson(res, 200, getRevenueSnapshot());
    }

    if (req.method === 'GET' && pathname === '/api/revenue/stream') {
      subscribe(res);
      res.write(`event: metrics\ndata: ${JSON.stringify(getRevenueSnapshot())}\n\n`);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/studio') {
      const token = url.searchParams.get('token');
      const lic = getLicenseByToken(token);
      if (!lic) return sendJson(res, 404, { error: 'Invalid studio token' });
      return sendJson(res, 200, {
        email: lic.email,
        imageCredits: lic.imageCredits,
        videoCredits: lic.videoCredits,
        aiMode: aiConfigured() ? 'replicate' : 'demo',
      });
    }

    if (req.method === 'POST' && pathname === '/api/studio/generate/image') {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const { token, prompt } = body;
      if (!token || !prompt?.trim()) return sendJson(res, 400, { error: 'token and prompt required' });
      const credit = useCredit(token, 'image');
      if (!credit.ok) return sendJson(res, 402, credit);
      const result = await generateImage(prompt.trim());
      return sendJson(res, 200, { ...result, credits: credit });
    }

    if (req.method === 'POST' && pathname === '/api/studio/generate/video') {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const { token, prompt } = body;
      if (!token || !prompt?.trim()) return sendJson(res, 400, { error: 'token and prompt required' });
      const credit = useCredit(token, 'video');
      if (!credit.ok) return sendJson(res, 402, credit);
      const result = await generateVideo(prompt.trim());
      return sendJson(res, 200, { ...result, credits: credit });
    }

    if (req.method === 'POST' && pathname === '/api/checkout') {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const { productId, email, mode } = body;
      const product = getProduct(productId);
      if (!product) return sendJson(res, 400, { error: 'Invalid product' });
      if (!email?.includes('@')) return sendJson(res, 400, { error: 'Valid email required' });

      const useStripe = STRIPE_KEY.startsWith('sk_') && mode !== 'demo';
      if (!useStripe) {
        const sessionId = `demo_${Date.now()}`;
        addPendingCheckout({
          sessionId,
          email,
          productId,
          amountCents: product.priceCents,
          createdAt: new Date().toISOString(),
          recovered: false,
        });
        const order = fulfillOrder({
          source: STRIPE_KEY.startsWith('sk_') ? 'demo' : 'simulated',
          sessionId,
          email,
          productId,
          amountCents: product.priceCents,
          currency: product.currency,
        });
        return sendJson(res, 200, {
          mode: STRIPE_KEY.startsWith('sk_') ? 'demo' : 'simulated',
          message: 'Credits activated — open your AI Studio',
          order,
          studioUrl: `/studio.html?token=${order.accessToken}`,
        });
      }

      const session = await stripeCheckout(product, email);
      addPendingCheckout({
        sessionId: session.id,
        email,
        productId,
        amountCents: product.priceCents,
        createdAt: new Date().toISOString(),
        recovered: false,
      });
      return sendJson(res, 200, { mode: 'stripe', url: session.url, sessionId: session.id });
    }

    if (req.method === 'GET' && pathname === '/api/order/lookup') {
      const sessionId = url.searchParams.get('session_id');
      const order = getState().orders.find((o) => o.sessionId === sessionId);
      if (!order) return sendJson(res, 404, { error: 'Order pending — webhook may still be processing' });
      return sendJson(res, 200, {
        order,
        studioUrl: order.accessToken ? `/studio.html?token=${order.accessToken}` : null,
      });
    }

    if (req.method === 'POST' && pathname === '/api/stripe-webhook') {
      const raw = await readBody(req);
      let event;
      try {
        event = JSON.parse(raw.toString());
      } catch {
        return res.writeHead(400).end('Invalid JSON');
      }
      if (event.type === 'checkout.session.completed') {
        const session = event.data?.object || event;
        fulfillOrder({
          source: 'stripe',
          sessionId: session.id,
          email: session.customer_details?.email || session.customer_email || 'customer@stripe.com',
          productId: session.metadata?.productId,
          amountCents: session.amount_total || 0,
          currency: session.currency,
        });
      }
      return sendJson(res, 200, { received: true });
    }

    if (req.method === 'POST' && pathname === '/api/admin/reset') {
      const token = req.headers['x-admin-token'];
      if (token !== ADMIN_TOKEN) return sendJson(res, 401, { error: 'Unauthorized' });
      persist((s) => {
        s.orders = [];
        s.licenses = [];
        s.pendingCheckouts = [];
        s.automationLog = [];
        s.metrics = { totalRevenueCents: 0, orderCount: 0, lastOrderAt: null };
      });
      broadcast('metrics', getRevenueSnapshot());
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'GET') {
      const staticPath = pathname === '/' ? '/index.html' : pathname;
      if (serveStatic(staticPath, res)) return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  startAutomation();
  console.log(`\n  ${STORE_NAME} — AI Image & Video Store`);
  console.log(`  Store:     ${BASE_URL}`);
  console.log(`  Studio:    ${BASE_URL}/studio.html`);
  console.log(`  Dashboard: ${BASE_URL}/dashboard.html`);
  console.log(`  Stripe:    ${STRIPE_KEY.startsWith('sk_') ? 'LIVE — payouts via your linked bank' : 'SIMULATED — add STRIPE_SECRET_KEY to .env'}`);
  console.log(`  AI engine: ${aiConfigured() ? 'Replicate (real generation)' : 'Demo previews — add REPLICATE_API_TOKEN'}\n`);
});
