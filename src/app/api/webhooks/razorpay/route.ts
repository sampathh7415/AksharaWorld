/**
 * Razorpay Webhook Handler
 * Route: POST /api/webhooks/razorpay
 * 
 * Events handled:
 *  - payment.captured  → Telegram alert + Google Sheets log
 *  - payment.failed    → Telegram alert
 *  - payment.refunded  → Telegram alert
 */
export const runtime = 'edge';
import { NextResponse } from 'next/server'

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'akshara_secret_2026'
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || ''
const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || ''
const APPS_SCRIPT_WEBHOOK_URL = process.env.APPS_SCRIPT_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL || ''

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    secretKeyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sendTelegram(text: string, token: string, chatId: string) {
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

async function logToSheets(row: string[], webhookUrl: string, apiKey: string, sheetId: string) {
  // Try Apps Script Webhook first (zero-cost, no API key required)
  if (webhookUrl) {
    try {
      const payload = {
        type: 'revenue',
        paymentId: row[2], // row[2] = paymentId
        amount: parseFloat(row[4].replace(/[^\d.]/g, '')), // row[4] = amount
        status: row[6] || 'captured', // row[6] = status (fixed from row[5])
        notes: `Customer: ${row[3] || 'N/A'} - Product: ${row[5]} (Logged via Webhook)` // row[3] = email, row[5] = productName
      }
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return
    } catch (e) {
      console.error('[Webhook Sheets Log] Failed via Apps Script Webhook:', e)
    }
  }

  // Fallback to Google Sheets API Key if present
  if (apiKey && sheetId) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Transactions!A:G:append?valueInputOption=USER_ENTERED&key=${apiKey}`
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row] }),
    })
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature') || ''

    // Read environment variables at runtime
    const telegramToken = process.env.TELEGRAM_TOKEN || ''
    const telegramChatId = process.env.TELEGRAM_CHAT_ID || ''
    const razorpaySecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'akshara_secret_2026'
    const sheetsApiKey = process.env.GOOGLE_SHEETS_API_KEY || ''
    const sheetsId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || ''
    const appsScriptUrl = process.env.APPS_SCRIPT_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL || ''

    // Verify Razorpay signature using Edge Web Crypto HMAC helper
    const expectedSig = await hmacSha256Hex(razorpaySecret, rawBody);

    if (signature !== expectedSig) {
      console.warn('⚠️ Razorpay Webhook: Signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const body = JSON.parse(rawBody)
    const event: string = body.event
    const payment = body.payload?.payment?.entity || {}

    const date = new Date().toISOString().split('T')[0]
    const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
    const amount = (payment.amount || 0) / 100
    const email = payment.email || 'N/A'
    const method = payment.method || 'N/A'
    const paymentId = payment.id || 'N/A'

    // Map amount to product name
    const productName: string = (
      amount === 999     ? 'Resume ATS Optimization Suite' :
      amount === 2499    ? 'AI Avatar & 3D Character Design' :
      amount === 1       ? 'Test Payment' :
      `Unknown Product (₹${amount})`
    )

    if (event === 'payment.captured') {
      await sendTelegram(
        `💰 <b>New Revenue — ₹${amount} received!</b>\n\n` +
        `🆔 Payment ID: ${paymentId}\n` +
        `📧 Customer: ${email}\n` +
        `💳 Method: ${method.toUpperCase()}\n` +
        `📅 Date: ${date} ${time} IST\n\n` +
        `🛒 Product: ${productName}\n` +
        `✅ Revenue recorded in Sheets!`,
        telegramToken, telegramChatId
      )
      await logToSheets([date, time, paymentId, email, `₹${amount}`, productName, 'captured'], appsScriptUrl, sheetsApiKey, sheetsId)
    }

    if (event === 'payment.failed') {
      await sendTelegram(
        `⚠️ <b>Payment Failed</b>\n\n` +
        `🆔 Payment ID: ${paymentId}\n` +
        `📧 Customer: ${email}\n` +
        `💳 Method: ${method.toUpperCase()}\n` +
        `🛒 Product: ${productName}\n` +
        `📅 Date: ${date} ${time} IST`,
        telegramToken, telegramChatId
      )
      await logToSheets([date, time, paymentId, email, `₹${amount}`, productName, 'failed'], appsScriptUrl, sheetsApiKey, sheetsId)
    }

    if (event === 'payment.refunded') {
      await sendTelegram(
        `🔄 <b>Payment Refunded</b>\n\n` +
        `🆔 Payment ID: ${paymentId}\n` +
        `📧 Customer: ${email}\n` +
        `🛒 Product: ${productName}\n` +
        `💵 Refund Amount: ₹${amount}\n` +
        `📅 Date: ${date} ${time} IST`,
        telegramToken, telegramChatId
      )
      await logToSheets([date, time, paymentId, email, `₹${amount}`, productName, 'refunded'], appsScriptUrl, sheetsApiKey, sheetsId)
    }

    return NextResponse.json({ received: true, event })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Webhook error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
