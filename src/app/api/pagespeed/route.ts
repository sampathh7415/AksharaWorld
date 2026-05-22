/**
 * GET /api/pagespeed — Google PageSpeed Insights
 * Uses the PUBLIC PageSpeed API — FREE, no API key required for basic use
 * Returns performance, accessibility, SEO scores + Core Web Vitals
 */
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url      = searchParams.get('url') || 'https://aksharaworld.in';
    const strategy = searchParams.get('strategy') || 'mobile';

    // Free PageSpeed API endpoint (no key needed for basic quota)
    const apiKey  = process.env.GOOGLE_CLOUD_API_KEY || '';
    const keyParam = apiKey ? `&key=${apiKey}` : '';

    const psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo${keyParam}`;

    const res = await fetch(psUrl, { signal: AbortSignal.timeout(30000) });

    if (!res.ok) {
      return NextResponse.json({ success: false, message: 'PageSpeed API unavailable' }, { status: 502 });
    }

    const d = await res.json();
    const cats = d.lighthouseResult?.categories || {};
    const audits = d.lighthouseResult?.audits || {};

    const score = (key: string) => Math.round((cats[key]?.score || 0) * 100);
    const ms    = (key: string) => {
      const val = audits[key]?.numericValue;
      if (!val) return '—';
      if (val >= 1000) return `${(val / 1000).toFixed(1)}s`;
      return `${Math.round(val)}ms`;
    };
    const cls = () => {
      const val = audits['cumulative-layout-shift']?.numericValue;
      return val !== undefined ? val.toFixed(3) : '—';
    };

    return NextResponse.json({
      success: true,
      data: {
        url,
        strategy,
        performance:   score('performance'),
        accessibility: score('accessibility'),
        bestPractices: score('best-practices'),
        seo:           score('seo'),
        fcp:           ms('first-contentful-paint'),
        lcp:           ms('largest-contentful-paint'),
        tbt:           ms('total-blocking-time'),
        cls:           cls(),
        si:            ms('speed-index'),
        tti:           ms('interactive'),
        tested:        new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      },
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
