/**
 * Razorpay Webhook Handler
 * Route: POST /api/webhooks/razorpay
 * 
 * Events handled:
 *  - payment.captured  → Telegram alert + Google Sheets log
 *  - payment.failed    → Telegram alert
 *  - payment.refunded  → Telegram alert
 */
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'akshara_secret_2026'
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || ''
const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || ''
const APPS_SCRIPT_WEBHOOK_URL = process.env.APPS_SCRIPT_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL || ''

async function sendTelegram(text: string) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  })
}

async function logToSheets(row: string[]) {
  // Try Apps Script Webhook first (zero-cost, no API key required)
  if (APPS_SCRIPT_WEBHOOK_URL) {
    try {
      const payload = {
        type: 'revenue',
        paymentId: row[2], // row[2] = paymentId
        amount: parseFloat(row[4].replace(/[^\d.]/g, '')), // row[4] = amount
        status: row[5] || 'captured', // row[5] = status
        notes: `Customer: ${row[3] || 'N/A'} (Logged via Webhook)` // row[3] = email
      }
      await fetch(APPS_SCRIPT_WEBHOOK_URL, {
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
  if (GOOGLE_SHEETS_API_KEY && GOOGLE_SHEETS_SPREADSHEET_ID) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_SPREADSHEET_ID}/values/Transactions!A:F:append?valueInputOption=USER_ENTERED&key=${GOOGLE_SHEETS_API_KEY}`
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

    // Verify Razorpay signature
    const expectedSig = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex')

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

    if (event === 'payment.captured') {
      await sendTelegram(
        `💰 <b>New Revenue — ₹${amount} received!</b>\n\n` +
        `🆔 Payment ID: ${paymentId}\n` +
        `📧 Customer: ${email}\n` +
        `💳 Method: ${method.toUpperCase()}\n` +
        `📅 Date: ${date} ${time} IST\n\n` +
        `🛒 Product: AI Productivity Blueprint\n` +
        `✅ Revenue recorded!`
      )
      await logToSheets([date, time, paymentId, email, `₹${amount}`, 'captured'])
    }

    if (event === 'payment.failed') {
      await sendTelegram(
        `⚠️ <b>Payment Failed</b>\n\n` +
        `🆔 Payment ID: ${paymentId}\n` +
        `📧 Customer: ${email}\n` +
        `💳 Method: ${method.toUpperCase()}\n` +
        `📅 Date: ${date} ${time} IST`
      )
      await logToSheets([date, time, paymentId, email, `₹${amount}`, 'failed'])
    }

    if (event === 'payment.refunded') {
      await sendTelegram(
        `🔄 <b>Payment Refunded</b>\n\n` +
        `🆔 Payment ID: ${paymentId}\n` +
        `📧 Customer: ${email}\n` +
        `💵 Refund Amount: ₹${amount}\n` +
        `📅 Date: ${date} ${time} IST`
      )
      await logToSheets([date, time, paymentId, email, `₹${amount}`, 'refunded'])
    }

    return NextResponse.json({ received: true, event })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Webhook error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
