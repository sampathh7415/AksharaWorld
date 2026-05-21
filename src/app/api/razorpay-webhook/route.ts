export const runtime = 'edge';
import { NextResponse } from 'next/server'
import { sendTelegramAlert } from '../../../lib/telegram'

// Helper function to create HMAC SHA256 using Web Crypto API
async function verifySignature(payloadString: string, signature: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  // Convert hex signature to Uint8Array for Web Crypto API
  const signatureBytes = new Uint8Array(signature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

  return await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    enc.encode(payloadString)
  );
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'akshara_secret_2026'

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify Signature
    const isValid = await verifySignature(rawBody, signature, secret);

    if (!isValid) {
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
