export const runtime = 'edge';
import { NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'
import { sendTelegramAlert } from '../../../lib/telegram'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!secret) {
      console.error('⚠️ RAZORPAY_WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 })
    }

    if (!signature) {
      console.warn('⚠️ Razorpay Webhook Signature is missing')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify Signature
    const expectedSignature = CryptoJS.HmacSHA256(JSON.stringify(body), secret).toString(CryptoJS.enc.Hex)

    if (signature !== expectedSignature) {
      console.warn('⚠️ Razorpay Webhook Signature Mismatch')
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Webhook Error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
