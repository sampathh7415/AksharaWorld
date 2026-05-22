/**
 * POST /api/contact — reCAPTCHA-protected contact form handler
 * Verifies token, then sends Telegram alert to owner
 */
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptchaToken } from '../../../lib/recaptcha';
import { sendTelegramAlert } from '../../../lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, recaptchaToken } = await req.json();

    // 🛡️ Verify reCAPTCHA Enterprise token
    const assessment = await verifyRecaptchaToken(recaptchaToken, 'CONTACT_FORM', 0.5);

    if (!assessment.valid) {
      return NextResponse.json({
        success: false,
        blocked: true,
        reason: assessment.reason,
        score: assessment.score,
      });
    }

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Send Telegram notification to owner
    try {
      await sendTelegramAlert(
        `📬 <b>New Contact Form Submission</b>\n\n` +
        `<b>Name:</b> ${name}\n` +
        `<b>Email:</b> ${email}\n` +
        `<b>Subject:</b> ${subject || 'Not specified'}\n` +
        `<b>Message:</b>\n${message}\n\n` +
        `<b>reCAPTCHA Score:</b> ${assessment.score.toFixed(2)} ✅`
      );
    } catch {
      // Telegram notification optional — don't fail the request
    }

    return NextResponse.json({
      success: true,
      message: 'Message received. We will reply within 24 hours.',
      score: assessment.score,
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
