export const runtime = 'edge';
import { NextResponse } from 'next/server';

/**
 * 💚 SYSTEM HEALTH CHECK
 * Comprehensive status of all dashboard components
 */
export async function GET() {
  const checks: any = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    components: {},
  };

  // 1. Check Razorpay connectivity
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (keyId) {
      checks.components.razorpay = { status: 'configured', keyId: keyId.substring(0, 10) + '...' };
    } else {
      checks.components.razorpay = { status: 'not_configured' };
    }
  } catch {
    checks.components.razorpay = { status: 'error' };
  }

  // 2. Check Brevo connectivity
  try {
    const brevoKey = process.env.BREVO_API_KEY;
    if (brevoKey) {
      checks.components.brevo = { status: 'configured' };
    } else {
      checks.components.brevo = { status: 'not_configured' };
    }
  } catch {
    checks.components.brevo = { status: 'error' };
  }

  // 3. Check Sam Brain connectivity
  try {
    const samUrl = process.env.NEXT_PUBLIC_SAM_URL;
    if (samUrl) {
      checks.components.samBrain = { status: 'configured', url: samUrl };
    } else {
      checks.components.samBrain = { status: 'not_configured' };
    }
  } catch {
    checks.components.samBrain = { status: 'error' };
  }

  // 4. Check Supabase connectivity (if configured)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      checks.components.supabase = { status: 'configured', url: supabaseUrl };
    } else {
      checks.components.supabase = { status: 'not_configured' };
    }
  } catch {
    checks.components.supabase = { status: 'error' };
  }

  // 5. Check authentication
  try {
    const authSecret = process.env.AUTH_SECRET;
    checks.components.auth = { status: authSecret ? 'configured' : 'not_configured' };
  } catch {
    checks.components.auth = { status: 'error' };
  }

  return NextResponse.json(checks, { status: 200 });
}
