/**
 * POST /api/recaptcha/assess — Verify reCAPTCHA Enterprise token
 * Used by product pages before redirecting to payment
 */
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptchaToken } from '../../../../lib/recaptcha';

export async function POST(req: NextRequest) {
  try {
    const { token, action } = await req.json();
    const assessment = await verifyRecaptchaToken(token, action || 'DEFAULT', 0.5);
    return NextResponse.json(assessment);
  } catch (e: any) {
    // On error, allow through
    return NextResponse.json({ valid: true, score: 0.5, reason: `Error: ${e.message}` });
  }
}
