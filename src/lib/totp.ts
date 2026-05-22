/**
 * 🔐 GOOGLE AUTHENTICATOR — TOTP 2FA
 * RFC 6238 compliant Time-based One-Time Password
 * Pairs with Google Authenticator app — zero external dependency (pure math)
 * Mapped to: Guardian_Ops → 01_Security_2FA
 */

/* ─────────────────────────────────────────────
   TOTP Core (no npm package needed — pure implementation)
───────────────────────────────────────────── */

/** Generate a cryptographically random Base32 secret (80 bits = 16 chars) */
export function generateTOTPSecret(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let secret = '';
  for (let i = 0; i < 16; i++) {
    secret += alphabet[bytes[i] & 31];
  }
  return secret;
}

/** Base32 decode */
function base32Decode(encoded: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const char of encoded.toUpperCase().replace(/=/g, '')) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

/** HMAC-SHA1 using Web Crypto API */
async function hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return new Uint8Array(sig);
}

/** Convert counter to 8-byte big-endian buffer */
function counterToBuffer(counter: number): Uint8Array {
  const buf = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    buf[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }
  return buf;
}

/** Generate TOTP code for a given secret and timestamp */
export async function generateTOTP(secret: string, timestamp?: number): Promise<string> {
  const t = Math.floor((timestamp ?? Date.now()) / 1000 / 30);
  const key = base32Decode(secret);
  const msg = counterToBuffer(t);
  const hash = await hmacSha1(key, msg);

  const offset = hash[19] & 0x0f;
  const code = (
    ((hash[offset]     & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8)  |
    ((hash[offset + 3] & 0xff))
  ) % 1_000_000;

  return code.toString().padStart(6, '0');
}

/** Verify a TOTP code (±1 window for clock skew) */
export async function verifyTOTP(secret: string, token: string): Promise<boolean> {
  const now = Date.now();
  for (const delta of [-30000, 0, 30000]) {
    const expected = await generateTOTP(secret, now + delta);
    if (expected === token.replace(/\s/g, '')) return true;
  }
  return false;
}

/** Generate Google Authenticator QR code URL (via Google Charts QR API) */
export function getAuthenticatorQRUrl(secret: string, account: string, issuer = 'AksharaWorld'): string {
  const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  return `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpauth)}`;
}

/** Get remaining seconds in current TOTP window */
export function getTOTPRemainingSeconds(): number {
  return 30 - (Math.floor(Date.now() / 1000) % 30);
}

/* ─────────────────────────────────────────────
   Session Store (Edge-compatible, in-memory)
───────────────────────────────────────────── */
const verified2FATokens = new Set<string>();

export function mark2FAVerified(sessionId: string): void {
  verified2FATokens.add(sessionId);
  // Auto-expire after 8 hours
  setTimeout(() => verified2FATokens.delete(sessionId), 8 * 60 * 60 * 1000);
}

export function is2FAVerified(sessionId: string): boolean {
  return verified2FATokens.has(sessionId);
}
