import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    service: 'Akshara World Dashboard',
    version: '0.1.0',
    phase: 'Phase 0 — Setup',
  });
}
