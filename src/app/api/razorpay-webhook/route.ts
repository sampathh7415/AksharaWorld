export const runtime = 'edge';
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendTelegramAlert } from '../../../lib/telegram'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'akshara_secret_2026'

    // Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex')

    if (signature !== expectedSignature) {
      console.warn('⚠️ Razorpay Webhook Signature Mismatch (Check secret)')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Webhook Error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
