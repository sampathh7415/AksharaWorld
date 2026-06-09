import { describe, it, expect } from 'vitest';
import { getAuthenticatorQRUrl } from '../totp';

describe('getAuthenticatorQRUrl', () => {
  it('should generate URL with default issuer (AksharaWorld)', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const account = 'test@example.com';
    const url = getAuthenticatorQRUrl(secret, account);

    expect(url).toContain('cht=qr');

    const expectedOtpAuth = `otpauth://totp/AksharaWorld:${encodeURIComponent(account)}?secret=${secret}&issuer=AksharaWorld&algorithm=SHA1&digits=6&period=30`;
    expect(url).toContain(`chl=${encodeURIComponent(expectedOtpAuth)}`);
  });

  it('should generate URL with custom issuer', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const account = 'test@example.com';
    const customIssuer = 'MyCustomApp';
    const url = getAuthenticatorQRUrl(secret, account, customIssuer);

    expect(url).toContain('cht=qr');

    const expectedOtpAuth = `otpauth://totp/${customIssuer}:${encodeURIComponent(account)}?secret=${secret}&issuer=${customIssuer}&algorithm=SHA1&digits=6&period=30`;
    expect(url).toContain(`chl=${encodeURIComponent(expectedOtpAuth)}`);
  });

  it('should properly encode account and issuer with special characters', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const account = 'test user+1@example.com';
    const customIssuer = 'App with spaces & symbols!';
    const url = getAuthenticatorQRUrl(secret, account, customIssuer);

    expect(url).toContain('cht=qr');

    const expectedOtpAuth = `otpauth://totp/${encodeURIComponent(customIssuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(customIssuer)}&algorithm=SHA1&digits=6&period=30`;
    expect(url).toContain(`chl=${encodeURIComponent(expectedOtpAuth)}`);
  });
});
