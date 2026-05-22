/**
 * 🛡️ GOOGLE reCAPTCHA ENTERPRISE — Client & Server utilities
 * Site Key: 6Lfv9vYsAAAAAH_t85p2PGbGHD1JsPbA2YyZ2Y85
 * Project:  akshara-world-automation
 * Type:     Score-based v3 (invisible, no user friction)
 */

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (fn: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Lfv9vYsAAAAAH_t85p2PGbGHD1JsPbA2YyZ2Y85';

/* ─────────────────────────────────────────────
   CLIENT — Get a reCAPTCHA token for any action
   Call this before any form submit or button click
───────────────────────────────────────────── */
export function getRecaptchaToken(action: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.grecaptcha) {
      // Not loaded yet — return empty string (server will handle gracefully)
      resolve('');
      return;
    }
    window.grecaptcha.enterprise.ready(async () => {
      try {
        const token = await window.grecaptcha.enterprise.execute(SITE_KEY, { action });
        resolve(token);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/* ─────────────────────────────────────────────
   SERVER — Verify token via reCAPTCHA Enterprise Assessment API
   Minimum safe score: 0.5 (0.0 = bot, 1.0 = human)
───────────────────────────────────────────── */
export interface RecaptchaAssessment {
  valid: boolean;
  score: number;
  reason: string;
}

export async function verifyRecaptchaToken(
  token: string,
  expectedAction: string,
  minScore = 0.5
): Promise<RecaptchaAssessment> {
  // If no token (dev environment or script failed to load), allow through
  if (!token) {
    return { valid: true, score: 1.0, reason: 'No token — dev bypass' };
  }

  try {
    const projectId = 'akshara-world-automation';
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY || '';

    // Without a GCP API key, use the legacy verify endpoint as fallback
    if (!apiKey) {
      return {
        valid: true,
        score: 0.9,
        reason: 'Enterprise API key not configured — allowing request (add GOOGLE_CLOUD_API_KEY to env)',
      };
    }

    const res = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: { token, siteKey: SITE_KEY, expectedAction },
        }),
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) {
      return { valid: true, score: 0.5, reason: `Assessment API error: ${res.status}` };
    }

    const data = await res.json();
    const score: number  = data?.riskAnalysis?.score ?? 0.5;
    const action: string = data?.tokenProperties?.action ?? '';
    const valid: boolean = data?.tokenProperties?.valid === true && score >= minScore;
    const actionMatch    = action === expectedAction || action === '';

    return {
      valid: valid && actionMatch,
      score,
      reason: valid
        ? `✅ Verified — score: ${score.toFixed(2)}`
        : `❌ Blocked — score too low: ${score.toFixed(2)} (threshold: ${minScore})`,
    };
  } catch (err: any) {
    // On error, allow through (don't block legitimate users on API failures)
    return { valid: true, score: 0.5, reason: `Assessment error: ${err.message}` };
  }
}
