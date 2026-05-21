import { NextResponse } from 'next/server';
import { getSheetData } from '../../../lib/googleSheets';

export const runtime = 'edge';

export async function GET() {
  try {
    const spreadsheetId = process.env.PRODUCTS_SPREADSHEET_ID;
    let items = '';

    if (spreadsheetId) {
      const rows = await getSheetData(spreadsheetId, 'Products!A2:H');
      // Assume columns: [id, title, description, link, image_link, price, availability, condition]

      items = rows.map((row: any) => `
    <item>
      <g:id>${row[0]}</g:id>
      <title>${row[1]}</title>
      <description>${row[2]}</description>
      <link>${row[3]}</link>
      <g:image_link>${row[4]}</g:image_link>
      <g:price>${row[5]} INR</g:price>
      <g:availability>${row[6] || 'in_stock'}</g:availability>
      <g:condition>${row[7] || 'new'}</g:condition>
      <g:brand>Akshara World</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>Digital Software &amp; Blueprints</g:product_type>
    </item>`).join('');
    } else {
      items = `
    <item>
      <g:id>ai-productivity-blueprint-v1</g:id>
      <title>AI Productivity Blueprint v1.0</title>
      <description>The exact zero-cost tech stack and autonomous agent architecture blueprint.</description>
      <link>https://aksharaworld.in/products/ai-blueprint</link>
      <g:image_link>https://aksharaworld.in/og-image.png</g:image_link>
      <g:price>499.00 INR</g:price>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Akshara World</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>Digital Software &amp; Blueprints</g:product_type>
    </item>`;
    }

    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Akshara World — Product Feed</title>
    <link>https://aksharaworld.in</link>
    <description>Fully autonomous digital products curated by Sam AI CEO.</description>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(xmlData, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error: any) {
    return new NextResponse(`<error>${error.message}</error>`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
