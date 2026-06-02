/**
 * 🛒 GOOGLE MERCHANT CENTER — XML PRODUCT FEED
 * Endpoint: GET /api/merchant-feed
 * Auto-fetched by Google Merchant Center every 24 hours
 * 
 * Products: Digital downloads (no shipping required)
 * Standard: Google Content API for Shopping (RSS 2.0 + g: namespace)
 */

export const runtime = 'edge';

import { NextResponse } from 'next/server';

const BASE_URL = 'https://aksharaworld.in';
const BRAND     = 'Akshara World';
const CURRENCY  = 'INR';
const CONDITION = 'new';
const COUNTRY   = 'IN';
const LANG      = 'en';

// ── Product Catalog ────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id:             'akshara-ai-blueprint-v1',
    title:          'AI Autonomous Business Blueprint – Zero Cost Digital Empire',
    description:    'The complete production-grade guide to deploying a self-healing digital business with ₹0 infra cost. Includes full code templates for Edge JWT middleware, Razorpay integration, Google Sheets database connectors, and a 50-point 20-year horizon roadmap config. Instant digital delivery.',
    link:           `${BASE_URL}/public/products/ai-blueprint`,
    imageLink:      `${BASE_URL}/og-image.jpg`,
    price:          '499.00',
    originalPrice:  '1499.00',
    availability:   'in_stock',
    category:       'Media > Books > Computer Books',
    googleCategory: '784',        // Google product taxonomy: Software > Educational Software
    brand:          BRAND,
    mpn:            'AKW-BLUEPRINT-001',
    gtin:           '',           // Not required for digital — intentionally blank
    isDigital:      true,
    features: [
      'Zero-Cost Micro-Task entry models',
      'Edge JWT cookie middleware templates',
      'Razorpay & Brevo dynamic API routes',
      '50-point 20-year horizon roadmap',
      'Google Sheets DB connectors',
    ],
  },
  {
    id:             'akshara-launch-pilot-v1',
    title:          'Launch Pilot Strategy Pack – AI Business Deployment Kit',
    description:    'Guided blueprint deployment assets with ready-made content schemas, outbound triggers, and pre-packaged niche assets. Includes 5 pre-configured high-margin niches, WhatsApp outreach templates, SheetsDb layouts, GA4 measurement blueprints, and Sam CEO interactive prompt sets. Instant digital delivery.',
    link:           `${BASE_URL}/public/products/launch-pilot`,
    imageLink:      `${BASE_URL}/og-image.jpg`,
    price:          '999.00',
    originalPrice:  '2999.00',
    availability:   'in_stock',
    category:       'Media > Books > Computer Books',
    googleCategory: '784',
    brand:          BRAND,
    mpn:            'AKW-LAUNCHPILOT-001',
    gtin:           '',
    isDigital:      true,
    features: [
      '5 pre-configured high-margin niches',
      'WhatsApp outreach templates',
      'SheetsDb administrative layouts',
      'GA4 measurement blueprints',
      'Sam CEO interactive prompt sets',
    ],
  },
];

// ── Feed Generator ────────────────────────────────────────────────────────────
function buildProductXML(p: typeof PRODUCTS[0]): string {
  return `
    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <title>${escapeXml(p.title)}</title>
      <description>${escapeXml(p.description)}</description>
      <link>${escapeXml(p.link)}</link>
      <g:image_link>${escapeXml(p.imageLink)}</g:image_link>
      <g:price>${p.price} ${CURRENCY}</g:price>
      <g:sale_price>${p.price} ${CURRENCY}</g:sale_price>
      <g:availability>${p.availability}</g:availability>
      <g:condition>${CONDITION}</g:condition>
      <g:brand>${escapeXml(p.brand)}</g:brand>
      <g:mpn>${escapeXml(p.mpn)}</g:mpn>
      <g:google_product_category>${p.googleCategory}</g:google_product_category>
      <g:product_type>${escapeXml(p.category)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:is_bundle>no</g:is_bundle>
      <g:custom_label_0>digital-product</g:custom_label_0>
      <g:custom_label_1>india-market</g:custom_label_1>
      <g:shipping>
        <g:country>${COUNTRY}</g:country>
        <g:service>Digital Download (Instant)</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
      <g:tax>
        <g:country>${COUNTRY}</g:country>
        <g:rate>0</g:rate>
        <g:tax_ship>no</g:tax_ship>
      </g:tax>
    </item>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function GET() {
  const now     = new Date().toUTCString();
  const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(BRAND)} – Product Feed</title>
    <link>${BASE_URL}</link>
    <description>Digital products by ${escapeXml(BRAND)}. AI automation blueprints and business strategy packs for Indian entrepreneurs.</description>
    <language>${LANG}-${COUNTRY.toLowerCase()}</language>
    <lastBuildDate>${now}</lastBuildDate>
    ${PRODUCTS.map(buildProductXML).join('\n')}
  </channel>
</rss>`;

  return new NextResponse(feedXml, {
    status:  200,
    headers: {
      'Content-Type':  'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',     // Cache 24h on CDN
      'X-Robots-Tag':  'noindex',                                  // Don't index the feed URL itself
    },
  });
}
