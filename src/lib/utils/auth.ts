// src/lib/utils/auth.ts

/**
 * 🔒 NATIVE EDGE-SAFE JWT UTILITY
 * Signed using Web Crypto APIs (HMAC-SHA256)
 * No external dependencies required (zero-cost & Edge compatible)
 */

// Helper to convert string to ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer;
}

// Helper to convert ArrayBuffer to Base64URL
function arrayBufferToBase64Url(buf: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(buf));
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Helper to convert Base64URL to ArrayBuffer
function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Signs a payload and returns an HS256 JWT
 */
export async function signJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const encodedHeader = arrayBufferToBase64Url(stringToArrayBuffer(JSON.stringify(header)));
  const encodedPayload = arrayBufferToBase64Url(stringToArrayBuffer(JSON.stringify(payload)));
  
  const tokenInput = `${encodedHeader}.${encodedPayload}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    stringToArrayBuffer(tokenInput)
  );
  
  const encodedSignature = arrayBufferToBase64Url(signature);
  
  return `${tokenInput}.${encodedSignature}`;
}

/**
 * Verifies an HS256 JWT and returns the parsed payload if valid, otherwise null
 */
export async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, payload, signature] = parts;
    const tokenInput = `${header}.${payload}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      stringToArrayBuffer(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBuffer = base64UrlToArrayBuffer(signature);
    const verified = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      stringToArrayBuffer(tokenInput)
    );
    
    if (!verified) return null;
    
    const payloadJson = new TextDecoder().decode(base64UrlToArrayBuffer(payload));
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}
