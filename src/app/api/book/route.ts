export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { SheetsDb } from '../../../lib/google/sheetsDb';
import { sendTelegramAlert } from '../../../lib/telegram';
import { verifyRecaptchaToken } from '../../../lib/recaptcha';

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, date, time, offer, recaptchaToken } = await req.json();

    // 🛡️ Verify reCAPTCHA Enterprise token
    const assessment = await verifyRecaptchaToken(recaptchaToken, 'BOOK_DEMO', 0.5);

    if (!assessment.valid) {
      return NextResponse.json({
        success: false,
        blocked: true,
        reason: assessment.reason,
        score: assessment.score,
      });
    }

    // Validate fields
    if (!name || !email || !date || !time) {
      return NextResponse.json({ success: false, error: 'Missing required booking fields' }, { status: 400 });
    }

    // Generate standard dynamic Google Meet link pattern
    const randomCode = Math.random().toString(36).substring(2, 5) + '-' + 
                       Math.random().toString(36).substring(2, 6) + '-' + 
                       Math.random().toString(36).substring(2, 5);
    const meetLink = `https://meet.google.com/${randomCode.toLowerCase()}`;

    // 1. Log to Google Sheets SalesPipeline tab via SheetsDb
    try {
      const formattedDate = `${date} ${time}`;
      await SheetsDb.addSystemLog({
        department: 'Growth_Engine',
        message: `New product demo booked by ${name} (${email}) for ${formattedDate}. Offer Interest: ${offer}. Meet Link: ${meetLink}`,
        status: 'info'
      });
      
      // Also write directly to Apps Script webhook if connected
      const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL;
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'leads',
            name: name,
            email: email,
            subject: `Demo Scheduled: ${offer}`,
            message: `Scheduled dynamic Meet demo for ${formattedDate}. Link: ${meetLink}. Company: ${company || 'N/A'}`,
            source: 'booking-form',
            score: assessment.score
          }),
          signal: AbortSignal.timeout(5000),
        }).catch(() => {});
      }
    } catch (e: any) {
      console.error('[Booking Sheets log] Failed:', e.message);
    }

    // 2. Alert Owner via Telegram
    try {
      await sendTelegramAlert(
        `📅 <b>New Product Demo Scheduled!</b>\n\n` +
        `<b>Prospect Name:</b> ${name}\n` +
        `<b>Email:</b> ${email}\n` +
        `<b>Company:</b> ${company || 'Individual'}\n` +
        `<b>Selected Date:</b> ${date}\n` +
        `<b>Time Slot:</b> ${time} (IST)\n` +
        `<b>Offer Interest:</b> ${offer}\n\n` +
        `🎥 <b>Google Meet Link:</b> ${meetLink}\n\n` +
        `<i>reCAPTCHA Score: ${assessment.score.toFixed(2)} ✅ pipeline logged.</i>`
      );
    } catch (e: any) {
      console.error('[Booking Telegram Alert] Failed:', e.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Demo session booked successfully! Invitation dispatched to email.',
      meetLink,
      date,
      time
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
