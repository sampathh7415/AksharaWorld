import { getGoogleAuthToken } from './googleAuth';
import { resilientFetch } from './resilience';

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata'];

export async function createDriveFolder(name: string, parentFolderId?: string): Promise<string> {
  const token = await getGoogleAuthToken(SCOPES);
  const url = 'https://www.googleapis.com/drive/v3/files';

  const parents = parentFolderId ? [parentFolderId] : [];

  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    parents
  };

  const data = await resilientFetch<any>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata)
  });

  return data.id;
}

export async function uploadDriveFile(name: string, content: string, mimeType: string, parentFolderId?: string): Promise<string> {
  const token = await getGoogleAuthToken(SCOPES);
  const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

  const metadata = {
    name,
    mimeType,
    parents: parentFolderId ? [parentFolderId] : []
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const data = await resilientFetch<any>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody
  });

  return data.id;
}

export async function getDriveStorageQuota(): Promise<{ limit: string, usage: string }> {
  const token = await getGoogleAuthToken(SCOPES);
  const url = 'https://www.googleapis.com/drive/v3/about?fields=storageQuota';

  const data = await resilientFetch<any>(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  return {
    limit: data.storageQuota.limit,
    usage: data.storageQuota.usage
  };
}
