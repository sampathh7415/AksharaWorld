/**
 * POST /api/gchat — Google Chat webhook message sender
 * Sends formatted messages to a Google Chat space via webhook
 * No OAuth needed — just the webhook URL from the Chat space settings
 */
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_WEBHOOK = process.env.GCHAT_WEBHOOK_URL || '';

export async function POST(req: NextRequest) {
  try {
    const { text, webhookUrl, card } = await req.json();

    const url = webhookUrl || DEFAULT_WEBHOOK;
    if (!url) {
      return NextResponse.json({
        success: false,
        message: 'No webhook URL. Paste your Google Chat Space webhook URL.',
      }, { status: 400 });
    }

    if (!text && !card) {
      return NextResponse.json({ success: false, message: 'text or card required' }, { status: 400 });
    }

    // Build a rich card message if no card provided
    const payload = card || {
      text: `*Akshara World Dashboard*\n${text}`,
    };

    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, message: err }, { status: res.status });
    }

    return NextResponse.json({ success: true, message: 'Message sent to Google Chat!' });

  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

// ── Helper used by other API routes to send Chat alerts ──
export async function sendChatAlert(text: string): Promise<void> {
  const url = DEFAULT_WEBHOOK;
  if (!url) return;
  await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ text: `*Akshara World* — ${text}` }),
    signal:  AbortSignal.timeout(5000),
  }).catch(() => {});
}
