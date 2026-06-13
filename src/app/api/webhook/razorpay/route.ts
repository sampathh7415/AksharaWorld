/**
 * GET /api/webhook/razorpay
 * 
 * This is the Razorpay Payment Link CALLBACK URL
 * Called when a customer completes payment and is redirected back
 * 
 * Query params from Razorpay:
 *   razorpay_payment_id  — e.g. pay_SuSQQJjpD5HwoO
 *   razorpay_payment_link_id — plink_xxx
 *   razorpay_payment_link_reference_id
 *   razorpay_payment_link_status — paid
 *   razorpay_signature
 */
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''

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

async function sendTelegram(text: string) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    })
  } catch { /* silent fail */ }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const paymentId = searchParams.get('razorpay_payment_id') || ''
  const linkId = searchParams.get('razorpay_payment_link_id') || ''
  const referenceId = searchParams.get('razorpay_payment_link_reference_id') || ''
  const status = searchParams.get('razorpay_payment_link_status') || ''
  const signature = searchParams.get('razorpay_signature') || ''

  // Verify Razorpay signature for payment links
  let isVerified = false
  if (RAZORPAY_KEY_SECRET && paymentId && linkId) {
    const payload = `${linkId}|${referenceId}|${status}|${paymentId}`
    const expectedSig = await hmacSha256Hex(RAZORPAY_KEY_SECRET, payload);
    isVerified = signature === expectedSig
  }

  // Send Telegram alert for successful payment
  if (status === 'paid' && paymentId) {
    const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    await sendTelegram(
      `PAYMENT RECEIVED! AI Productivity Blueprint sold!\n\nPayment ID: ${paymentId}\nStatus: ${status}\nVerified: ${isVerified ? 'Yes' : 'Unverified'}\nDate: ${date} IST\n\nProduct: aksharaworld.in/products/ai-blueprint`
    )
  }

  // Redirect to generic thank-you page
  const thankyouUrl = new URL('/public/thank-you', req.url)
  thankyouUrl.searchParams.set('payment_id', paymentId)
  thankyouUrl.searchParams.set('status', status)

  return NextResponse.redirect(thankyouUrl)
}
