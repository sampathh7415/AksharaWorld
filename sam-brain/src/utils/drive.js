// Google Drive Integration for Akshara World
// Handles saving reports, capsules, and backups

export class GoogleDriveManager {
  constructor(env) {
    this.env = env;
    // Using Google Drive API v3
    // Requires: GOOGLE_DRIVE_API_KEY or GOOGLE_DRIVE_SERVICE_ACCOUNT
    this.baseFolders = {
      root: env.DRIVE_FOLDER_ID || 'root',
      reports: '10_Upgrade_Proposals',
      capsules: '01_Business_Capsule',
      backups: '06_Backups',
      reviews: '09_File_Reviews',
    };
  }

  async authenticate() {
    // For Cloudflare Workers, use API key (simple) or service account (recommended)
    if (this.env.GOOGLE_DRIVE_API_KEY) {
      return { type: 'api_key', key: this.env.GOOGLE_DRIVE_API_KEY };
    } else if (this.env.GOOGLE_DRIVE_SERVICE_ACCOUNT) {
      // Parse service account JSON and get access token
      const account = JSON.parse(this.env.GOOGLE_DRIVE_SERVICE_ACCOUNT);
      const token = await this.getServiceAccountToken(account);
      return { type: 'service_account', token };
    }
    return null;
  }

  async getServiceAccountToken(account) {
    // Create JWT and exchange for access token
    // This is complex - for MVP, recommend using Google Drive API key with public folder
    const jwt = this.createJWT(account);
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });
    const data = await response.json();
    return data.access_token;
  }

  async saveReport(reportType, content, metadata = {}) {
    try {
      const auth = await this.authenticate();
      if (!auth) {
        console.error('[Drive] No authentication configured');
        return { error: 'Google Drive not configured' };
      }

      const fileName = `${reportType}_${new Date().toISOString().split('T')[0]}.md`;
      const fileMetadata = {
        name: fileName,
        mimeType: 'text/markdown',
        parents: [this.baseFolders.reports],
      };

      const formData = new FormData();
      formData.append('metadata', JSON.stringify(fileMetadata));
      formData.append('file', new Blob([content], { type: 'text/markdown' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token || auth.key}`,
        },
        body: formData,
      });

      if (response.ok) {
        const file = await response.json();
        return { success: true, fileId: file.id, fileName };
      } else {
        const error = await response.json();
        console.error('[Drive] Save failed:', error);
        return { error: error.error.message };
      }
    } catch (e) {
      console.error('[Drive] Error:', e.message);
      return { error: e.message };
    }
  }

  async getCapsule() {
    // Retrieve latest business capsule
    try {
      const auth = await this.authenticate();
      if (!auth) return null;

      const query = `parents='${this.baseFolders.capsules}' and name contains 'capsule_latest'`;
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
        {
          headers: { 'Authorization': `Bearer ${auth.token || auth.key}` },
        }
      );

      const data = await response.json();
      if (data.files && data.files.length > 0) {
        return await this.getFileContent(data.files[0].id, auth);
      }
      return null;
    } catch (e) {
      console.error('[Drive] Capsule fetch failed:', e.message);
      return null;
    }
  }

  async getFileContent(fileId, auth) {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${auth.token || auth.key}` },
      });
      return await response.text();
    } catch (e) {
      console.error('[Drive] Content fetch failed:', e.message);
      return null;
    }
  }

  createJWT(serviceAccount) {
    // JWT creation for service account (simplified)
    // In production, use a proper JWT library
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/drive',
      aud: 'https://oauth2.googleapis.com/token',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    // This requires proper JWT signing - not implemented in Workers easily
    return null;
  }
}

// Usage in Innovation_Scout or other departments:
/*
import { GoogleDriveManager } from '../utils/drive.js';

export async function runInnovationScout(env) {
  const drive = new GoogleDriveManager(env);
  const report = await callGemini(prompt, env);

  const saved = await drive.saveReport('Innovation_Scout', report, {
    department: 'Innovation_Scout',
    timestamp: new Date().toISOString(),
  });

  if (!saved.error) {
    return {
      status: 'Success',
      report,
      saved_to_drive: saved.fileId,
    };
  }
}
*/
