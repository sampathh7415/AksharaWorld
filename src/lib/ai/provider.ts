/**
 * 🤖 AI PROVIDER — Multi-Model Router
 *
 * Layer 1 Brain (README.md):
 *   qwen3            → Sam's reasoning / CEO brain / Stitch UI design
 *   gemma4           → Creative / generative tasks (Flow, Vids, Illuminate, Pomelli)
 *   llama3.2:1b      → Fast lightweight ops (data, health, simple queries)
 *   qwen2.5-coder:14b → Code tasks (Jules code review, Tech_Core)
 *
 * Environment routing:
 *   development → Ollama  (http://localhost:11434)
 *   production  → Google Gemini API
 *
 * Usage:
 *   import { callLocalAI, OllamaTask } from '@/lib/ai/provider';
 *   const text = await callLocalAI('You are Sam.', userInput, 'sam');
 */

const IS_DEV = process.env.NODE_ENV === 'development';

/* ── Task Types ─────────────────────────────────────────────────────────── */
export type OllamaTask =
  | 'sam'        // Sam CEO brain — deep reasoning
  | 'stitch'     // UI design layout generation
  | 'flow'       // Generative video script (Veo/Flow)
  | 'vids'       // Presentation/explainer video
  | 'illuminate' // Podcast/audio script generation
  | 'pomelli'    // Ad copy & landing page writing
  | 'jules'      // Code review & engineering audit
  | 'fast'       // Lightweight, fast queries (default)
  | 'default';   // Fallback → fast model

/* ── Model Registry (mirrors README Layer 1: Brain) ─────────────────────── */
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

const OLLAMA_MODELS: Record<OllamaTask, string> = {
  // Primary CEO brain — biggest, smartest
  // 'qwen3' is the correct Ollama Hub name (not 'qwen3.6')
  sam:       process.env.OLLAMA_MODEL_SAM       || 'qwen3',
  stitch:    process.env.OLLAMA_MODEL_STITCH    || 'qwen3',

  // Creative & generative — Google's Gemma
  flow:      process.env.OLLAMA_MODEL_CREATIVE  || 'gemma4',
  vids:      process.env.OLLAMA_MODEL_CREATIVE  || 'gemma4',
  illuminate:process.env.OLLAMA_MODEL_CREATIVE  || 'gemma4',
  pomelli:   process.env.OLLAMA_MODEL_CREATIVE  || 'gemma4',

  // Engineering & code
  jules:     process.env.OLLAMA_MODEL_CODE      || 'qwen2.5-coder:14b',

  // Fast/lightweight — general ops
  fast:      process.env.OLLAMA_MODEL_FAST      || 'llama3.2:1b',
  default:   process.env.OLLAMA_MODEL_FAST      || 'llama3.2:1b',
};

/* ── Ollama caller ───────────────────────────────────────────────────────── */
async function callOllama(
  systemPrompt: string,
  userPrompt  : string,
  task        : OllamaTask = 'default',
): Promise<string> {
  const model = OLLAMA_MODELS[task];

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      model,
      stream  : false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Ollama [${model}] error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.message?.content || `No response from Ollama [${model}].`;
}

/* ── Gemini caller ───────────────────────────────────────────────────────── */
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
 * Calls the correct AI provider AND the correct local model for the task.
 *
 * @param systemPrompt  - Instruction / persona context for the model
 * @param userPrompt    - The actual user task or question
 * @param task          - Which Ollama model to route to (dev only)
 * @returns             - Plain text response from the model
 *
 * @example
 *   // Sam CEO brain
 *   await callLocalAI(SAM_PROMPT, userMessage, 'sam');
 *   // Code review (Jules)
 *   await callLocalAI(JULES_PROMPT, codeSnippet, 'jules');
 *   // Ad copy (Pomelli)
 *   await callLocalAI(POMELLI_PROMPT, campaignBrief, 'pomelli');
 */
export async function callLocalAI(
  systemPrompt: string,
  userPrompt  : string,
  task        : OllamaTask = 'default',
): Promise<string> {
  if (IS_DEV) {
    return callOllama(systemPrompt, userPrompt, task);
  }
  return callGemini(systemPrompt, userPrompt);
}

/** Which provider is active in the current environment */
export const activeProvider: 'ollama' | 'gemini' = IS_DEV ? 'ollama' : 'gemini';

/**
 * Returns the Ollama model name that will be used for a given task.
 * Useful for logging / dashboard display.
 */
export function getActiveModel(task: OllamaTask = 'default'): string {
  if (!IS_DEV) return 'gemini-2.0-flash';
  return OLLAMA_MODELS[task];
}
