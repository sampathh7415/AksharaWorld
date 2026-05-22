/**
 * POST /api/auth/2fa/setup  — Generate new TOTP secret + QR code
 * POST /api/auth/2fa/verify — Verify a submitted token
 * GET  /api/auth/2fa/status — Check if 2FA is configured
 */
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { generateTOTPSecret, getAuthenticatorQRUrl, verifyTOTP, getTOTPRemainingSeconds } from '../../../../lib/totp';

// In-memory store (persists per edge cold-start; for production use KV or D1)
let storedSecret: string | null = process.env.TOTP_SECRET || null;

export async function GET() {
  return NextResponse.json({
    configured: !!storedSecret,
    remainingSeconds: getTOTPRemainingSeconds(),
  });
}

export async function POST(req: NextRequest) {
  const url  = new URL(req.url);
  const path = url.pathname;

  if (path.endsWith('/setup')) {
    const secret = generateTOTPSecret();
    storedSecret = secret;

    const qrUrl = getAuthenticatorQRUrl(
      secret,
      'sampathh7415@gmail.com',
      'AksharaWorld CEO Dashboard'
    );

    return NextResponse.json({
      success: true,
      secret,
      qrUrl,
      instructions: [
        '1. Open Google Authenticator app on your phone',
        '2. Tap (+) → Scan a QR code',
        '3. Scan the QR code shown in the dashboard',
        '4. Enter the 6-digit code to confirm setup',
      ],
    });
  }

  if (path.endsWith('/verify')) {
    if (!storedSecret) {
      return NextResponse.json({ success: false, error: '2FA not configured. Run setup first.' }, { status: 400 });
    }
    const { token } = await req.json();
    const valid = await verifyTOTP(storedSecret, String(token));
    return NextResponse.json({
      success: valid,
      message: valid ? '✅ 2FA verified successfully' : '❌ Invalid or expired code. Try again.',
    });
  }

  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
}
