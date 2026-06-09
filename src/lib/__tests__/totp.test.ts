import { describe, it, expect } from 'vitest';
import { getAuthenticatorQRUrl } from '../totp';

describe('TOTP Utilities', () => {
  describe('getAuthenticatorQRUrl', () => {
    it('should generate a valid Google Charts QR URL with default issuer', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const account = 'test@example.com';
      const url = getAuthenticatorQRUrl(secret, account);

      const expectedOtpAuth = `otpauth://totp/AksharaWorld:${encodeURIComponent(account)}?secret=${secret}&issuer=AksharaWorld&algorithm=SHA1&digits=6&period=30`;
      const expectedUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(expectedOtpAuth)}`;

      expect(url).toBe(expectedUrl);
    });

    it('should correctly include a custom issuer', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const account = 'test@example.com';
      const issuer = 'My Custom App';
      const url = getAuthenticatorQRUrl(secret, account, issuer);

      const expectedOtpAuth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
      const expectedUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(expectedOtpAuth)}`;

      expect(url).toBe(expectedUrl);
    });

    it('should properly encode special characters in account and issuer', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const account = 'user+test@domain.com!';
      const issuer = 'Corp & Co / Inc';
      const url = getAuthenticatorQRUrl(secret, account, issuer);

      const expectedOtpAuth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
      const expectedUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(expectedOtpAuth)}`;

      expect(url).toBe(expectedUrl);

      // Additional verification that URL actually contains the encoded characters
      expect(url).toContain(encodeURIComponent(encodeURIComponent('Corp & Co / Inc')));
      expect(url).toContain(encodeURIComponent(encodeURIComponent('user+test@domain.com!')));
    });

    it('should generate correct secret parameter', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const account = 'test';
      const url = getAuthenticatorQRUrl(secret, account);

      // Check that secret is passed directly (not double encoded or modified)
      const decodedChl = decodeURIComponent(new URL(url).searchParams.get('chl') || '');
      expect(decodedChl).toContain(`secret=${secret}`);
    });
  });
});
