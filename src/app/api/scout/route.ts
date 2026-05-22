/**
 * GET /api/scout — Run Innovation Scout or fetch cached report
 * POST /api/scout — Trigger full live scan
 */
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { runInnovationScan } from '../../../lib/scout';

// Simple in-memory cache (edge memory, lasts per cold start)
let cachedReport: any = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET() {
  if (cachedReport && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json({ success: true, cached: true, data: cachedReport });
  }
  // Return mock data if no cache yet
  return NextResponse.json({
    success: true,
    cached: false,
    data: {
      timestamp: new Date().toISOString(),
      news: [],
      trends: [],
      patents: [],
      scholar: [],
      summary: 'No scan run yet. Click "Run Scout Scan" to fetch live data.',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const report = await runInnovationScan();
    cachedReport = report;
    cacheTime = Date.now();
    return NextResponse.json({ success: true, data: report });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
