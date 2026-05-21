/**
 * Lightweight, Edge-compatible Google Service Account JWT token generator
 * Uses Web Crypto API to sign the JWT.
 */
import { SignJWT, importPKCS8 } from 'jose';

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

export async function getGoogleAuthToken(scopes: string[]): Promise<string> {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable is not set');
  }

  const sa: ServiceAccount = JSON.parse(credentials);

  // Format private key properly if it contains escaped newlines
  const privateKey = sa.private_key.replace(/\\n/g, '\n');

  const alg = 'RS256';
  const privateKeyObj = await importPKCS8(privateKey, alg);

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({ scope: scopes.join(' ') })
    .setProtectedHeader({ alg, typ: 'JWT' })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKeyObj);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to obtain Google Auth Token: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}
