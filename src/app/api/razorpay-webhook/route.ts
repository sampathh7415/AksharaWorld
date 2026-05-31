export const runtime = 'edge';
import { NextResponse } from 'next/server'
import { sendTelegramAlert } from '../../../lib/telegram'

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

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'akshara_secret_2026'

    // Verify Signature
    const expectedSignature = await hmacSha256Hex(secret, rawBody);

    if (signature !== expectedSignature) {
      console.warn('⚠️ Razorpay Webhook Signature Mismatch (Check secret)')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const body = JSON.parse(rawBody);
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
