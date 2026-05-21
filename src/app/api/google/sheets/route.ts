export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { SheetsDb } from '../../../../lib/google/sheetsDb';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    if (action === 'getLogs') {
      const logs = await SheetsDb.getSystemLogs();
      return NextResponse.json({ success: true, items: logs });
    } else if (action === 'getQueue') {
      const queue = await SheetsDb.getQueue();
      return NextResponse.json({ success: true, items: queue });
    } else {
      const transactions = await SheetsDb.getTransactions();
      return NextResponse.json({ success: true, items: transactions });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'addTransaction') {
      const txn = await SheetsDb.addTransaction(body.data);
      return NextResponse.json({ success: true, item: txn });
    } else if (action === 'addLog') {
      const log = await SheetsDb.addSystemLog(body.data);
      return NextResponse.json({ success: true, item: log });
    } else if (action === 'updateQueue') {
      const ok = await SheetsDb.updateQueueStatus(body.id, body.status);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
