export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

interface MerchantProduct {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  price: string;
  availability: 'in stock' | 'out of stock';
  brand: string;
  condition: 'new' | 'used';
}

const mockMerchantProducts: MerchantProduct[] = [
  {
    id: 'PROD-001',
    title: 'Akshara World Premium SEO Blueprint E-Book',
    description: 'The masterclass guide to establishing a zero-expenditure digital business empire using serverless AI swarms.',
    link: 'https://aksharaworld.in/products/seo-blueprint',
    imageLink: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    price: '1500.00 INR',
    availability: 'in stock',
    brand: 'Akshara World',
    condition: 'new'
  },
  {
    id: 'PROD-002',
    title: 'Niche Automation Scaffolding Bundle',
    description: 'Pre-configured workspace scripts, memory vaults, and resilient API adapters to bootstrap your AI agency in seconds.',
    link: 'https://aksharaworld.in/products/niche-scaffolding',
    imageLink: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
    price: '3500.00 INR',
    availability: 'in stock',
    brand: 'Akshara World',
    condition: 'new'
  },
  {
    id: 'PROD-003',
    title: 'Automated AI Blogger Script (Clouflare Workers Edition)',
    description: 'A serverless worker script that fetches Google Trends, drafts detailed articles, and publishes them to Blogger daily.',
    link: 'https://aksharaworld.in/products/ai-blogger-worker',
    imageLink: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80',
    price: '4999.00 INR',
    availability: 'in stock',
    brand: 'Akshara World',
    condition: 'new'
  }
];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const format = url.searchParams.get('format') || 'xml';

  if (format === 'json') {
    return NextResponse.json({ success: true, products: mockMerchantProducts });
  }

  // Compile Google Merchant XML Feed format
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Akshara World Product Catalog</title>
    <link>https://aksharaworld.in</link>
    <description>₹0 Capex Digital products engineered by Sam CEO AI Swarm</description>
    ${mockMerchantProducts.map(p => `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${escapeXml(p.title)}</g:title>
      <g:description>${escapeXml(p.description)}</g:description>
      <g:link>${p.link}</g:link>
      <g:image_link>${p.imageLink}</g:image_link>
      <g:price>${p.price}</g:price>
      <g:availability>${p.availability}</g:availability>
      <g:brand>${p.brand}</g:brand>
      <g:condition>${p.condition}</g:condition>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
