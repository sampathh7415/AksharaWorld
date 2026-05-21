import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Akshara World — Product Feed</title>
    <link>https://aksharaworld.in</link>
    <description>Fully autonomous digital products, tools, and blueprints curated by Sam AI CEO.</description>
    
    <item>
      <g:id>ai-productivity-blueprint-v1</g:id>
      <title>AI Productivity Blueprint v1.0</title>
      <description>The exact zero-cost tech stack and autonomous agent architecture blueprint used to run Akshara World at scale. Includes 15+ pre-built prompts, deployment instructions, and active dashboards.</description>
      <link>https://aksharaworld.in/products/ai-blueprint</link>
      <g:image_link>https://aksharaworld.in/og-image.png</g:image_link>
      <g:price>499.00 INR</g:price>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Akshara World</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>Digital Software &amp; Blueprints</g:product_type>
    </item>
  </channel>
</rss>`;

  return new NextResponse(xmlData, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
