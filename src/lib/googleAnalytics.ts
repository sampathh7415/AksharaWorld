import { getGoogleAuthToken } from './googleAuth';
import { resilientFetch } from './resilience';

const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly'
];

export async function getGA4Metrics(propertyId: string) {
  const token = await getGoogleAuthToken(SCOPES);
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  const data = await resilientFetch<any>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' }
      ]
    }),
  });

  return data;
}

export async function getSearchConsoleMetrics(siteUrl: string) {
  const token = await getGoogleAuthToken(SCOPES);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const data = await resilientFetch<any>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 10
    }),
  });

  return data.rows || [];
}
