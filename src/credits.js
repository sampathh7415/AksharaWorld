import crypto from 'crypto';
import { persist, getState } from './db.js';
import { getProduct } from './products.js';

function newToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function issueLicense(email, productId, orderId) {
  const product = getProduct(productId);
  if (!product) return null;

  let imageAdd = 0;
  let videoAdd = 0;
  if (product.type === 'image' || product.type === 'bundle') imageAdd = product.credits || 0;
  if (product.type === 'video') {
    videoAdd = product.credits || 0;
    imageAdd += product.imageBonus || 0;
  }
  if (product.type === 'bundle') videoAdd = product.videoCredits || 0;

  const e = email.toLowerCase();
  let license;

  persist((s) => {
    if (!s.licenses) s.licenses = [];
    license = s.licenses.find((l) => l.email === e);
    if (license) {
      license.imageCredits += imageAdd;
      license.videoCredits += videoAdd;
      license.lastOrderId = orderId;
    } else {
      license = {
        id: `lic_${Date.now()}`,
        orderId,
        lastOrderId: orderId,
        email: e,
        productId,
        accessToken: newToken(),
        imageCredits: imageAdd,
        videoCredits: videoAdd,
        createdAt: new Date().toISOString(),
      };
      s.licenses.unshift(license);
    }
  });

  return license;
}

export function getLicenseByToken(accessToken) {
  return getState().licenses?.find((l) => l.accessToken === accessToken);
}

export function getLicensesByEmail(email) {
  const e = email.toLowerCase();
  return getState().licenses?.filter((l) => l.email === e) || [];
}

export function useCredit(accessToken, type) {
  let result = { ok: false, error: 'Invalid token' };
  persist((s) => {
    const lic = s.licenses?.find((l) => l.accessToken === accessToken);
    if (!lic) return;
    if (type === 'image' && lic.imageCredits > 0) {
      lic.imageCredits -= 1;
      result = {
        ok: true,
        imageCredits: lic.imageCredits,
        videoCredits: lic.videoCredits,
      };
    } else if (type === 'video' && lic.videoCredits > 0) {
      lic.videoCredits -= 1;
      result = {
        ok: true,
        imageCredits: lic.imageCredits,
        videoCredits: lic.videoCredits,
      };
    } else {
      result = { ok: false, error: 'No credits remaining — buy more at the store' };
    }
  });
  return result;
}
