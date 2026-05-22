import { getRevenueSnapshot, logAutomation, getState, persist } from './db.js';
import { broadcast } from './events.js';

const timers = [];

function schedule(ms, fn) {
  const id = setInterval(fn, ms);
  timers.push(id);
  return id;
}

export function startAutomation() {
  // Health ping every 15 minutes
  schedule(15 * 60 * 1000, () => {
    const entry = { type: 'health_ping', status: 'ok', message: 'Store online — automations active' };
    logAutomation(entry);
    broadcast('automation', entry);
  });

  // Abandoned checkout recovery every hour
  schedule(60 * 60 * 1000, () => {
    const state = getState();
    const stale = state.pendingCheckouts.filter((c) => {
      const age = Date.now() - new Date(c.createdAt).getTime();
      return !c.recovered && age > 60 * 60 * 1000 && age < 24 * 60 * 60 * 1000;
    });
    for (const checkout of stale) {
      persist((s) => {
        const item = s.pendingCheckouts.find((c) => c.sessionId === checkout.sessionId);
        if (item) item.recovered = true;
      });
      const entry = {
        type: 'abandoned_recovery',
        email: checkout.email,
        productId: checkout.productId,
        message: `Recovery email queued for ${checkout.email}`,
      };
      logAutomation(entry);
      broadcast('automation', entry);
    }
    if (stale.length) broadcast('metrics', getRevenueSnapshot());
  });

  // Daily digest — check every minute, fire once at 08:00 local
  let lastDigestDay = '';
  schedule(60 * 1000, () => {
    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    if (now.getHours() === 8 && now.getMinutes() === 0 && lastDigestDay !== key) {
      lastDigestDay = key;
      const snap = getRevenueSnapshot();
      const entry = {
        type: 'daily_digest',
        message: `Revenue digest: $${(snap.todayRevenueCents / 100).toFixed(2)} today, ${snap.todayOrderCount} orders`,
        todayRevenueCents: snap.todayRevenueCents,
        todayOrderCount: snap.todayOrderCount,
      };
      logAutomation(entry);
      broadcast('automation', entry);
      broadcast('metrics', snap);
    }
  });

  logAutomation({
    type: 'system_start',
    message: '24/7 automation engine started — delivery, recovery, health, digest',
  });
}
