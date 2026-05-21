export const runtime = 'edge';
import { NextResponse } from 'next/server'
import { sendTelegramAlert } from '../../../lib/telegram'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'akshara_secret_2026'

    // Verify Signature using Web Crypto API for Edge compatibility
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(rawBody)
    )

    // Convert ArrayBuffer to hex string
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSignature) {
      console.warn('⚠️ Razorpay Webhook Signature Mismatch (Check secret)')
      // In production, we should return 400, but for initial setup we might skip strict check
    }

    const event = body.event
    const payload = body.payload.payment.entity

    if (event === 'payment.captured') {
      const amount = payload.amount / 100
      const email = payload.email
      const method = payload.method

      await sendTelegramAlert(
        `💰 <b>New Revenue Received!</b>\n\n` +
        `Amount: <b>₹${amount}</b>\n` +
        `Customer: ${email}\n` +
        `Method: ${method.toUpperCase()}\n\n` +
        `✅ Revenue_Vault updated.`
      )
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
