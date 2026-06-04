// NOTE: Edge runtime removed — localhost (Ollama) is not reachable from edge workers.
import { NextRequest, NextResponse } from 'next/server';

const SAM_BRAIN_URL = process.env.SAM_BRAIN_URL || 'https://sam-ceo-brain.akshara-sam.workers.dev';
const IS_DEV        = process.env.NODE_ENV === 'development';

/* ── Ollama local fallback ───────────────────────────────────────────────── */
async function callOllamaFallback(message: string): Promise<string> {
  const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const OLLAMA_MODEL    = process.env.OLLAMA_MODEL    || 'llama3.2';

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      model   : OLLAMA_MODEL,
      stream  : false,
      messages: [
        { role: 'system', content: 'You are Sam, AI CEO of Akshara World. Be concise and action-oriented.' },
        { role: 'user',   content: message },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Ollama responded with ${res.status}`);
  const data = await res.json();
  return data?.message?.content ?? '[No response from Ollama]';
}

/* ── Gemini cloud fallback ───────────────────────────────────────────────── */
async function callGeminiFallback(message: string): Promise<string> {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) throw new Error('No API key');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        system_instruction: {
          parts: [{ text: 'You are Sam, AI CEO of Akshara World. Be concise and action-oriented.' }],
        },
        contents: [{ role: 'user', parts: [{ text: message }] }],
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini responded with ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[No response]';
}

/* ── Route handler ───────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const { message } = await req.json();

  // Primary: Sam Brain Cloudflare Worker
  try {
    const res  = await fetch(`${SAM_BRAIN_URL}/api/sam`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ message }),
    });
    const data = await res.json();
    return NextResponse.json({ reply: data.reply });
  } catch (e: any) {
    // Fallback: Ollama (dev) or Gemini (prod)
    try {
      if (IS_DEV) {
        const reply = await callOllamaFallback(message);
        return NextResponse.json({ reply: `[Local Ollama] ${reply}` });
      } else {
        const reply = await callGeminiFallback(message);
        return NextResponse.json({ reply: `[Direct Gemini] ${reply}` });
      }
    } catch (fallbackErr: any) {
      const provider = IS_DEV ? 'Ollama' : 'Gemini';
      return NextResponse.json({
        reply: `[Error] Both Sam Brain and ${provider} fallback failed. Check connections. Error: ${e.message}`,
      });
    }
  }
}
