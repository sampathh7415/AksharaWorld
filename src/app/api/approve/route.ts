export const runtime = 'edge';
import { NextResponse } from 'next/server';

import { SheetsDb } from '../../../lib/google/sheetsDb';
import { sendTelegramAlert } from '../../../lib/telegram';

interface ApprovalRequest {
  id: string;
  action: 'approve' | 'reject';
}

/**
 * 🔏 APPROVAL DECISION LOGGER
 * Handles approval/rejection of pending business decisions
 * Updates SheetsDb queue and alerts the owner on Telegram
 */
export async function POST(request: Request) {
  try {
    const body: ApprovalRequest = await request.json();
    const { id, action } = body;

    if (!id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request: id and action (approve|reject) required' },
        { status: 400 }
      );
    }

    // Update state in Google Sheets / local queue state
    const mappedStatus = action === 'approve' ? 'approved' : 'rejected';
    await SheetsDb.updateQueueStatus(id, mappedStatus);

    const approvalRecord = {
      id,
      action: mappedStatus,
      timestamp: new Date().toISOString(),
      approvedBy: 'admin',
    };

    console.log('[Approval Logger]', approvalRecord);

    // Send Telegram notification
    try {
      await sendTelegramAlert(`<b>[Decision Logged]</b>\nID: <code>${id}</code>\nAction: <b>${mappedStatus.toUpperCase()}</b>\nTimestamp: <i>${approvalRecord.timestamp}</i>`);
    } catch (tgErr: any) {
      console.warn('[Telegram Alert Failed]', tgErr.message);
    }

    return NextResponse.json(
      {
        status: 'success',
        message: `Approval ${action}ed for ${id}`,
        record: approvalRecord,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[Approval Error]', err.message);
    return NextResponse.json(
      { error: 'Failed to process approval', details: err.message },
      { status: 500 }
    );
  }
}

