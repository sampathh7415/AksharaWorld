import { getGoogleAuthToken } from './googleAuth';
import { resilientFetch } from './resilience';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getSheetData(spreadsheetId: string, range: string) {
  const token = await getGoogleAuthToken(SCOPES);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  const data = await resilientFetch<any>(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return data.values || [];
}

export async function appendSheetData(spreadsheetId: string, range: string, values: any[][]) {
  const token = await getGoogleAuthToken(SCOPES);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const data = await resilientFetch<any>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values,
    }),
  });

  return data;
}
