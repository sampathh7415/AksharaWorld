/**
 * GET /api/gsc — Google Search Console data proxy
 * Returns live GSC data when GOOGLE_CLOUD_API_KEY + GSC OAuth is configured
 * Falls back to seeded data gracefully
 */
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const siteUrl    = 'https://aksharaworld.in';
    const apiKey     = process.env.GOOGLE_CLOUD_API_KEY || '';
    const endDate    = new Date().toISOString().split('T')[0];
    const startDate  = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0];

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'GSC API key not configured — add GOOGLE_CLOUD_API_KEY to enable live data',
        data: null,
      });
    }

    // Fetch top queries (Search Analytics)
    const queriesRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate, endDate,
          dimensions: ['query'],
          rowLimit: 10,
          dataState: 'all',
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    // Fetch top pages
    const pagesRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate, endDate,
          dimensions: ['page'],
          rowLimit: 8,
          dataState: 'all',
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!queriesRes.ok || !pagesRes.ok) {
      return NextResponse.json({ success: false, message: 'GSC API error', data: null });
    }

    const queriesData = await queriesRes.json();
    const pagesData   = await pagesRes.json();

    const topQueries = (queriesData.rows || []).map((r: any) => ({
      query:       r.keys[0],
      clicks:      r.clicks,
      impressions: r.impressions,
      ctr:         r.ctr * 100,
      position:    r.position,
    }));

    const topPages = (pagesData.rows || []).map((r: any) => ({
      page:        r.keys[0].replace('https://aksharaworld.in', ''),
      clicks:      r.clicks,
      impressions: r.impressions,
      ctr:         r.ctr * 100,
      position:    r.position,
    }));

    const totals = topQueries.reduce(
      (acc: any, q: any) => ({ clicks: acc.clicks + q.clicks, impressions: acc.impressions + q.impressions }),
      { clicks: 0, impressions: 0 }
    );

    return NextResponse.json({
      success: true,
      data: {
        totalClicks:      totals.clicks,
        totalImpressions: totals.impressions,
        avgCTR:           topQueries.length ? topQueries.reduce((a: any, q: any) => a + q.ctr, 0) / topQueries.length : 0,
        avgPosition:      topQueries.length ? topQueries.reduce((a: any, q: any) => a + q.position, 0) / topQueries.length : 0,
        topQueries,
        topPages,
        connected:        true,
        lastUpdated:      new Date().toISOString(),
      },
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message, data: null });
  }
}
