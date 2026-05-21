export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { SheetsDb } from '../../../lib/google/sheetsDb';

// Sam ops-config: max 2 owner approvals per day (30-day launch policy)
const MAX_DAILY_APPROVALS = 2;

export async function POST(req: NextRequest) {
  const { id, action, department, title } = await req.json();

  if (!id || !action) {
    return NextResponse.json({ error: 'id and action are required' }, { status: 400 });
  }

  try {
    if (action === 'approve') {
      // ── Daily cap check (ops-config: maxDailyApprovals = 2) ──
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      let todayApprovals = 0;
      try {
        const logs = await SheetsDb.getSystemLogs?.() ?? [];
        todayApprovals = logs.filter((l: any) =>
          l.message?.includes('APPROVED') &&
          l.timestamp?.startsWith(today)
        ).length;
      } catch {
        // If Sheets unreachable, allow approval (fail open for critical ops)
        todayApprovals = 0;
      }

      if (todayApprovals >= MAX_DAILY_APPROVALS) {
        return NextResponse.json({
          success: false,
          message: `Daily approval cap reached (${MAX_DAILY_APPROVALS}/day). Resume tomorrow. This is by design — sam-brain/ops-config.json maxDailyApprovals=2.`,
          todayApprovals,
          cap: MAX_DAILY_APPROVALS,
        }, { status: 429 });
      }

      // ── Log approval to Sheets SystemLog ──
      await SheetsDb.addSystemLog({
        department: department || 'Guardian_Ops',
        message: `APPROVED: ${id} — "${title || id}" approved by owner. Daily count: ${todayApprovals + 1}/${MAX_DAILY_APPROVALS}`,
        status: 'info',
      });

      return NextResponse.json({
        success: true,
        message: `Approved ${id}`,
        todayApprovals: todayApprovals + 1,
        remainingToday: MAX_DAILY_APPROVALS - todayApprovals - 1,
      });
    }

    if (action === 'reject') {
      await SheetsDb.addSystemLog({
        department: department || 'Guardian_Ops',
        message: `REJECTED: ${id} — "${title || id}" rejected by owner.`,
        status: 'warn',
      });
      return NextResponse.json({ success: true, message: `Rejected ${id}` });
    }

    return NextResponse.json({ success: false, message: 'Unknown action. Use approve or reject.' }, { status: 400 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Return today's approval count
  try {
    const today = new Date().toISOString().split('T')[0];
    const logs = await SheetsDb.getSystemLogs?.() ?? [];
    const todayApprovals = logs.filter((l: any) =>
      l.message?.includes('APPROVED') && l.timestamp?.startsWith(today)
    ).length;
    return NextResponse.json({
      todayApprovals,
      cap: MAX_DAILY_APPROVALS,
      remaining: Math.max(0, MAX_DAILY_APPROVALS - todayApprovals),
      date: today,
    });
  } catch (e: any) {
    return NextResponse.json({ todayApprovals: 0, cap: MAX_DAILY_APPROVALS, remaining: MAX_DAILY_APPROVALS });
  }
}
