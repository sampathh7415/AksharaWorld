#!/usr/bin/env node
/**
 * Smoke test: Razorpay webhook path + Sheets + Telegram (read-only checks where possible).
 *
 * Usage:
 *   BASE_URL=https://your-akshara.pages.dev \
 *   TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... \
 *   node scripts/smoke-test-payment-flow.mjs
 */

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const checks = [];

function record(name, ok, detail) {
  checks.push({ name, ok, detail });
  const icon = ok ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${name}${detail ? ` — ${detail}` : ''}`);
}

async function fetchJson(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { res, body, url };
}

async function main() {
  console.log(`Akshara smoke test — BASE_URL=${BASE_URL}\n`);

  // 1. App health
  try {
    const { res } = await fetchJson('/');
    record('App reachable (GET /)', res.ok || res.status === 307, `status ${res.status}`);
  } catch (e) {
    record('App reachable (GET /)', false, e.message);
  }

  // 2. Internal dashboard (may require auth — expect 401/307, not 500)
  try {
    const { res } = await fetchJson('/internal');
    const ok = res.status === 200 || res.status === 401 || res.status === 307 || res.status === 302;
    record('Command Center route (/internal)', ok, `status ${res.status}`);
  } catch (e) {
    record('Command Center route (/internal)', false, e.message);
  }

  // 3. Razorpay webhook endpoint exists (POST without signature should 4xx, not 404)
  try {
    const { res } = await fetchJson('/api/razorpay-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'payment.smoke_test' }),
    });
    const ok = res.status !== 404 && res.status < 500;
    record('Razorpay webhook route', ok, `status ${res.status} (expect 400/401, not 404/5xx)`);
  } catch (e) {
    record('Razorpay webhook route', false, e.message);
  }

  // 4. Google Sheets API route (adapter)
  try {
    const { res, body } = await fetchJson('/api/google/sheets');
    const ok = res.status !== 404;
    record('Sheets API route', ok, `status ${res.status}`);
    if (typeof body === 'object' && body) {
      record('Sheets API returns JSON', true);
    }
  } catch (e) {
    record('Sheets API route', false, e.message);
  }

  // 5. Cron loop (Sam)
  try {
    const { res } = await fetchJson('/api/google/cron-loop');
    const ok = res.status !== 404;
    record('Sam cron-loop route', ok, `status ${res.status}`);
  } catch (e) {
    record('Sam cron-loop route', false, e.message);
  }

  // 6. Telegram (optional)
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    try {
      const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
      const tgRes = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `[Akshara smoke test] ${new Date().toISOString()} — payment flow check OK to run`,
        }),
      });
      const tgBody = await tgRes.json();
      record('Telegram alert delivery', tgRes.ok && tgBody.ok, tgBody.description || '');
    } catch (e) {
      record('Telegram alert delivery', false, e.message);
    }
  } else {
    record('Telegram alert delivery', true, 'skipped (set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID)');
  }

  // 7. Legal pages
  for (const path of ['/public/terms', '/public/privacy']) {
    try {
      const { res } = await fetchJson(path);
      record(`Legal page ${path}`, res.ok, `status ${res.status}`);
    } catch (e) {
      record(`Legal page ${path}`, false, e.message);
    }
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
  if (failed.length) {
    console.error('\nFailed checks:', failed.map((f) => f.name).join(', '));
    process.exit(1);
  }
  console.log('\nSmoke test complete. Manually verify: Razorpay test payment → Sheets Transaction row.');
}

main();
