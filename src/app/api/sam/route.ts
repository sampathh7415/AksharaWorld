import { NextRequest, NextResponse } from 'next/server';

const SAM_BRAIN_URL = process.env.SAM_BRAIN_URL || 'https://sam-ceo-brain.akshara-sam.workers.dev';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  try {
    const res = await fetch(`${SAM_BRAIN_URL}/api/sam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      throw new Error(`Worker failed with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ reply: data.reply });
  } catch (error: unknown) {
    try {
      const API_KEY = process.env.GEMINI_API_KEY;
      if (!API_KEY) throw new Error('No API key');
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: 'You are Sam, AI CEO of Akshara World. Be concise and action-oriented.' }],
            },
            contents: [{ role: 'user', parts: [{ text: message }] }],
          }),
        }
      );
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[No response]';
      return NextResponse.json({ reply: `[Direct Gemini] ${reply}` });
    } catch {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json({
        reply: `[Error] Both Sam Brain and direct Gemini failed. Check connections. Error: ${errorMessage}`,
      });
    }
  }
}
