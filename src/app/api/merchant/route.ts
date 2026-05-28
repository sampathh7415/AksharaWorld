export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      merchantId: '5782853246',
      businessName: 'Akshara World',
      totalProducts: 5,
      approvedProducts: 3,
      pendingProducts: 2,
      disapprovedProducts: 0,
      connected: true,
      products: [
        {
          id: 'ai-blueprint-v1',
          title: 'AI Productivity Blueprint v1.0',
          price: '₹499',
          status: 'approved',
          clicks: 182,
          impressions: 2400
        },
        {
          id: 'launch-pilot-30',
          title: 'Akshara Launch Pilot — 30-Day Real Business Setup',
          price: '₹999',
          status: 'approved',
          clicks: 95,
          impressions: 1150
        },
        {
          id: 'seo-blueprint-premium',
          title: 'Akshara World Premium SEO Blueprint E-Book',
          price: '₹1,500',
          status: 'approved',
          clicks: 48,
          impressions: 620
        },
        {
          id: 'niche-scaffolding-bundle',
          title: 'Niche Automation Scaffolding Bundle',
          price: '₹3,500',
          status: 'pending',
          clicks: 12,
          impressions: 180
        },
        {
          id: 'ai-blogger-script',
          title: 'Automated AI Blogger Script (Cloudflare Workers Edition)',
          price: '₹4,999',
          status: 'pending',
          clicks: 5,
          impressions: 92
        }
      ]
    }
  });
}
