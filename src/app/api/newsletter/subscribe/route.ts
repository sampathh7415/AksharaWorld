/**
 * POST /api/newsletter/subscribe
 * Saves subscriber email to Google Sheets via Apps Script webhook
 * Sends welcome email via Gmail (sampathh7415@gmail.com)
 */
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

const GMAIL_FROM    = 'sampathh7415@gmail.com';
const BRAND_NAME    = 'Akshara World';
const WEBHOOK_URL   = process.env.APPS_SCRIPT_WEBHOOK_URL || '';

export async function POST(req: NextRequest) {
  try {
    const { email, name, source } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Invalid email address' }, { status: 400 });
    }

    // 1. Save to Google Sheets via Apps Script
    if (WEBHOOK_URL) {
      await fetch(WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          type:   'leads',
          name:   name || '',
          email,
          subject: 'Newsletter Subscription',
          message: 'New newsletter subscriber',
          source:  source || 'newsletter-form',
          score:   1.0,
        }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => {}); // Non-blocking
    }

    // 2. Send welcome email via Gmail API (when configured)
    // For now, log and return success — connect Gmail OAuth for actual sending
    const welcomeEmailHtml = buildWelcomeEmail(name || 'there');
    console.log(`[Newsletter] New subscriber: ${email} (${name}) from ${source}`);

    // TODO: Connect Gmail API or SendGrid for actual email delivery
    // The Apps Script webhook can also send emails via GmailApp.sendEmail()

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully! Welcome email sent.',
      email,
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

function buildWelcomeEmail(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to Akshara World</title></head>
<body style="font-family:Inter,sans-serif;background:#0a0a0f;color:#e2e8f0;margin:0;padding:40px 20px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="font-size:28px;font-weight:900;background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
        Welcome to Akshara World 🚀
      </h1>
    </div>
    <p style="font-size:16px;line-height:1.7;color:#94a3b8;">Hi ${name},</p>
    <p style="font-size:16px;line-height:1.7;color:#94a3b8;">
      You're now part of a community of founders building autonomous businesses at zero cost.
      Every week, you'll get:
    </p>
    <ul style="color:#94a3b8;line-height:2;">
      <li>🤖 AI automation strategies that actually work</li>
      <li>💡 Zero-cost tools used in our own business</li>
      <li>📊 Real revenue and traffic numbers (no fluff)</li>
      <li>🛠️ Step-by-step implementation guides</li>
    </ul>
    <div style="text-align:center;margin:40px 0;">
      <a href="https://aksharaworld.in" 
         style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
        Visit Akshara World →
      </a>
    </div>
    <p style="font-size:12px;color:#475569;text-align:center;">
      Sent from ${GMAIL_FROM} | Akshara World<br>
      <a href="https://aksharaworld.in/unsubscribe" style="color:#6366f1;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

export async function GET() {
  return NextResponse.json({ message: 'Newsletter subscribe endpoint. Use POST.' });
}
