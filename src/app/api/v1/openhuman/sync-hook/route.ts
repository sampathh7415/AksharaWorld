/**
 * 📡 Next.js API Route for OpenHuman Sync Webhook
 * 📁 src/app/api/v1/openhuman/sync-hook/route.ts
 *
 * GET: Retrieves latest sync log cache.
 * POST: Handles incoming sync event telemetry, logs to Google Sheets, and alerts Telegram.
 */

export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { SheetsDb } from '../../../../../lib/google/sheetsDb';
import { sendTelegramAlert } from '../../../../../lib/telegram';

interface SyncPayload {
  agent: string;
  syncTimestamp: string;
  status: 'SUCCESS' | 'FAILED';
  eventsSynced: string[];
  errorMessage?: string;
}

// In-memory cache for recent sync event logs
let lastSyncEvent: SyncPayload | null = null;

export async function GET() {
  return NextResponse.json({
    success: true,
    lastSync: lastSyncEvent || {
      agent: 'OpenHuman-Local-Daemon',
      syncTimestamp: 'No sync executed yet.',
      status: 'SUCCESS',
      eventsSynced: []
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const payload: SyncPayload = await req.json();

    if (!payload.agent || !payload.syncTimestamp || !payload.status) {
      return NextResponse.json(
        { success: false, error: 'Malformed payload: missing core fields.' },
        { status: 400 }
      );
    }

    // Cache sync state
    lastSyncEvent = payload;

    // 1. Log to Google Sheets database ledger (resilient fallback database)
    await SheetsDb.addSystemLog({
      department: 'Tech_Core',
      message: `[OpenHuman Sync] Successfully ingested ${payload.eventsSynced.length} mock business events (Gmail, Stripe, Slack).`,
      status: payload.status === 'SUCCESS' ? 'info' : 'error'
    });

    // 2. Route real-time notification warnings to Telegram if sync suffers a failure
    if (payload.status === 'FAILED' || payload.errorMessage) {
      await sendTelegramAlert(
        `🚨 <b>OpenHuman Sync Failure Warning</b>\n\n` +
        `<b>Agent:</b> ${payload.agent}\n` +
        `<b>Timestamp:</b> ${payload.syncTimestamp}\n` +
        `<b>Error:</b> ${payload.errorMessage || 'Unknown system dropout'}`
      );
    } else {
      // Optional: Informational alert on successful integration check
      console.log(`[OpenHuman Webhook] Ingested telemetry sync at ${payload.syncTimestamp}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Sync telemetry ingested and processed successfully.',
      loggedToSheets: true
    });

  } catch (e: any) {
    console.error(`[OpenHuman Webhook Error] ${e.message}`);
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
