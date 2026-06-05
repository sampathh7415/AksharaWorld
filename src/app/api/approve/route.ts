export const runtime = 'edge';
import { NextResponse } from 'next/server';

interface ApprovalRequest {
  id: string;
  action: 'approve' | 'reject';
}

/**
 * 🔏 APPROVAL DECISION LOGGER
 * Handles approval/rejection of pending business decisions
 * Currently logs to console (TODO: Persist to Supabase)
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

    // TODO: Integrate Supabase persistence here
    // For now, just log the decision
    const approvalRecord = {
      id,
      action,
      timestamp: new Date().toISOString(),
      approvedBy: 'admin', // TODO: Get from JWT
    };

    console.log('[Approval Logger]', approvalRecord);

    // 🔔 TODO: Send Telegram notification on approval
    // await sendTelegramNotification(`✅ Decision logged: ${id} → ${action}`);

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
