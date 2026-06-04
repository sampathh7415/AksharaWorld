/**
 * 🤖 AI PROVIDER ABSTRACTION
 *
 * Development  → Ollama  (http://localhost:11434)
 * Production   → Google Gemini API
 *
 * Usage:
 *   import { callLocalAI } from '@/lib/ai/provider';
 *   const text = await callLocalAI('You are a helpful assistant.', userInput);
 */

const IS_DEV = process.env.NODE_ENV === 'development';

/* ── Ollama ──────────────────────────────────────────────────────────────── */
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL    || 'llama3.2';

async function callOllama(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      model   : OLLAMA_MODEL,
      stream  : false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Ollama error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.message?.content || 'No response from Ollama.';
}

/* ── Gemini ──────────────────────────────────────────────────────────────── */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL     =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nTask: ${userPrompt}` }] },
      ],
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

/* ── Public entrypoint ───────────────────────────────────────────────────── */
/**
 * Calls the appropriate AI provider based on the current environment.
 *
 * @param systemPrompt  - Instruction / persona context for the model
 * @param userPrompt    - The actual user task or question
 * @returns             - Plain text response from the model
 */
export async function callLocalAI(
  systemPrompt: string,
  userPrompt  : string,
): Promise<string> {
  if (IS_DEV) {
    return callOllama(systemPrompt, userPrompt);
  }
  return callGemini(systemPrompt, userPrompt);
}

/** Convenience re-export so callers can tell which provider is active */
export const activeProvider: 'ollama' | 'gemini' = IS_DEV ? 'ollama' : 'gemini';
