/**
 * POST /api/translate — Google Translate (free unofficial API)
 * No API key required — uses the same endpoint Chrome uses internally
 * Auto-detects source language, supports 100+ languages
 */
export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang = 'hi', sourceLang = 'auto' } = await req.json();

    if (!text || text.length > 5000) {
      return NextResponse.json({ success: false, message: 'Text required (max 5000 chars)' }, { status: 400 });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=ld&q=${encodeURIComponent(text)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept':     'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, message: 'Translation service unavailable' }, { status: 502 });
    }

    const data = await res.json();

    // Response structure: [[["translated","original",null,null,null,null,null,null,null,null,null,null,[["word"]],""]]]
    const translated    = data[0]?.map((item: any) => item[0]).filter(Boolean).join('') || '';
    const detectedLang  = data[2] || sourceLang;

    return NextResponse.json({
      success:      true,
      translated,
      detectedLang,
      sourceLang:   detectedLang,
      targetLang,
      characterCount: text.length,
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message:   'Google Translate proxy — use POST with { text, targetLang }',
    languages: ['hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'en', 'ar', 'zh', 'fr', 'de', 'es', 'ja', 'ko'],
  });
}
