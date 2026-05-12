import { NextResponse } from 'next/server';
import fs from 'fs';

const CAPSULE_PATH = 'G:\\My Drive\\Akshara World\\01_Capsule\\capsule_latest.md';
const RESOURCES_PATH = 'G:\\My Drive\\Akshara World\\05_Resources\\resources.json';
const SAM_BRAIN_URL = process.env.SAM_BRAIN_URL || 'https://sam-ceo-brain.akshara-sam.workers.dev';

export async function GET() {
  const result: any = { timestamp: new Date().toISOString() };

  // 1. Read local Drive files
  try {
    result.capsule = fs.readFileSync(CAPSULE_PATH, 'utf8');
    result.resources = JSON.parse(fs.readFileSync(RESOURCES_PATH, 'utf8'));
  } catch {
    result.capsule = 'Drive not synced to local filesystem.';
    result.resources = null;
  }

  // 2. Ping Sam Brain for live status
  try {
    const res = await fetch(`${SAM_BRAIN_URL}/health`, { signal: AbortSignal.timeout(4000) });
    const brain = await res.json();
    result.samBrain = { status: 'online', ...brain };
  } catch {
    result.samBrain = { status: 'offline', reason: 'Worker unreachable or not deployed yet.' };
  }

  // 3. Static business metrics (real data only — no fake numbers)
  result.metrics = {
    revenue: { today: 0, week: 0, month: 0, currency: 'INR', note: 'Pre-revenue phase' },
    uptime: 'N/A — UptimeRobot not yet configured',
    activeUsers: 'N/A — GA4 not yet configured',
    cost: 0,
    phase: 'Phase 0 — Setup (98% complete)',
    departments: 8,
    pendingApprovals: 2,
  };

  return NextResponse.json(result);
}
