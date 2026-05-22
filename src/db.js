import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'store.json');

const defaultState = () => ({
  orders: [],
  licenses: [],
  pendingCheckouts: [],
  automationLog: [],
  metrics: {
    totalRevenueCents: 0,
    orderCount: 0,
    lastOrderAt: null,
  },
});

function readState() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial = defaultState();
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return defaultState();
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
}

let state = readState();

export function getState() {
  return state;
}

export function persist(mutator) {
  mutator(state);
  writeState(state);
  return state;
}

export function addOrder(order) {
  return persist((s) => {
    s.orders.unshift(order);
    if (s.orders.length > 500) s.orders = s.orders.slice(0, 500);
    s.metrics.totalRevenueCents += order.amountCents;
    s.metrics.orderCount += 1;
    s.metrics.lastOrderAt = order.createdAt;
  });
}

export function addPendingCheckout(checkout) {
  return persist((s) => {
    s.pendingCheckouts.push(checkout);
  });
}

export function removePendingCheckout(sessionId) {
  return persist((s) => {
    s.pendingCheckouts = s.pendingCheckouts.filter((c) => c.sessionId !== sessionId);
  });
}

export function logAutomation(entry) {
  return persist((s) => {
    s.automationLog.unshift({ ...entry, at: new Date().toISOString() });
    if (s.automationLog.length > 200) s.automationLog = s.automationLog.slice(0, 200);
  });
}

export function getRevenueSnapshot() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayOrders = state.orders.filter((o) => o.createdAt >= startOfDay);
  const todayRevenueCents = todayOrders.reduce((sum, o) => sum + o.amountCents, 0);
  const last24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const recent = state.orders.filter((o) => o.createdAt >= last24h);

  return {
    totalRevenueCents: state.metrics.totalRevenueCents,
    orderCount: state.metrics.orderCount,
    todayRevenueCents,
    todayOrderCount: todayOrders.length,
    last24hRevenueCents: recent.reduce((s, o) => s + o.amountCents, 0),
    last24hOrderCount: recent.length,
    lastOrderAt: state.metrics.lastOrderAt,
    recentOrders: state.orders.slice(0, 15),
    automationLog: state.automationLog.slice(0, 10),
    pendingAbandoned: state.pendingCheckouts.filter(
      (c) => !c.recovered && Date.now() - new Date(c.createdAt).getTime() > 60 * 60 * 1000
    ).length,
    stripeLive: Boolean(process.env.STRIPE_SECRET_KEY?.startsWith('sk_')),
    updatedAt: now.toISOString(),
  };
}
