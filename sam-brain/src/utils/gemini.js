// Shared Gemini API caller for all departments

const SYSTEM_PROMPT = `You are Sam, the AI CEO of Akshara World. Business: aksharaworld.in | Budget: ₹0 | Goal: 24/7 autonomous digital services for 20+ years. Rules: No hallucinations. Ownership mindset. Three-Try Rule. Respond concisely.`;

const GEMINI_MODEL = 'gemini-2.0-flash-lite';

export async function callGemini(prompt, env, options = {}) {
  const API_KEY = env.GEMINI_API_KEY;
  if (!API_KEY) return '[Error] GEMINI_API_KEY not configured in Cloudflare Secrets.';

  const system = options.system || SYSTEM_PROMPT;
  const model = options.model || GEMINI_MODEL;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await res.json();
    if (data.error) return `[Gemini Error] ${data.error.message}`;
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[No response from Gemini]';
  } catch (e) {
    return `[Connection Error] ${e.message}`;
  }
}
