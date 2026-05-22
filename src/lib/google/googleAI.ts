/**
 * 🧠 GOOGLE AI TOOLS SUITE — Powered by Gemini API
 * Tools: Flow (Veo video), Vids, Illuminate (audio), Pomelli (ad copy),
 *        Jules (code review), Stitch (UI layout)
 * Uses GEMINI_API_KEY — already configured in .env.local
 */

import { resilientFetch } from '../resilience';

export interface AIJob {
  id: string;
  tool: 'Flow' | 'Vids' | 'Illuminate' | 'Pomelli' | 'Jules' | 'Stitch';
  prompt: string;
  outputName: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  result?: string;   // The actual Gemini output text / script / JSON
  sizeBytes?: number;
  duration?: string;
  createdAt: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL     = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/* ─────────────────────────────────────────────
   Core Gemini call
───────────────────────────────────────────── */
async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nTask: ${userPrompt}` }] }
      ],
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

/* ─────────────────────────────────────────────
   Tool-specific prompts
───────────────────────────────────────────── */
const TOOL_SYSTEM_PROMPTS: Record<AIJob['tool'], string> = {
  Flow: `You are Gemini Flow — an AI video director. Generate a detailed cinematic video script and shot list for a Veo-model short film. Include scene descriptions, visual style, transitions, and voice-over copy. Format as a production-ready screenplay.`,

  Vids: `You are Google Vids AI — a presentation and explainer video generator. Create a structured slide-by-slide script with visual descriptions, key points, and animations for a Google Slides-based video. Make it compelling and business-ready.`,

  Illuminate: `You are Google Illuminate — an audio podcast generator. Convert the provided content into a natural, engaging 2-person podcast dialogue script. Include host names, timestamps, tone guidance, and emphasis notes for TTS rendering.`,

  Pomelli: `You are Google Pomelli — an expert performance ad copywriter. Generate 5 variations of high-converting Google Ads copy (headline + description) and a long-form landing page copy for the provided product/campaign. Follow Google Ads best practices.`,

  Jules: `You are Google Jules — an autonomous AI developer. Perform a thorough code review and improvement analysis on the provided code or system description. Output: issues found, severity levels, suggested fixes with code snippets, and a quality score.`,

  Stitch: `You are Google Stitch — a generative UI designer. Generate a detailed UI layout specification in JSON format including component hierarchy, color tokens, typography, spacing, and interaction states for the described interface. Use a premium dark glassmorphic design language.`,
};

/* ─────────────────────────────────────────────
   In-memory job queue
───────────────────────────────────────────── */
let localAIJobs: AIJob[] = [
  { id: 'JOB-201', tool: 'Flow',      prompt: 'Cinematic short showcasing AI agents executing sales ledger updates', outputName: 'Octopus_Strategy_Sales_Teaser_Script.txt',    status: 'completed', duration: '0:15', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'JOB-202', tool: 'Illuminate', prompt: 'Summarize VISION_AND_SYSTEM_MAP.md into podcast dialogue',          outputName: 'Akshara_World_Corporate_Podcast_Script.txt',  status: 'completed', duration: '4:12', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'JOB-203', tool: 'Stitch',    prompt: 'Glassmorphic tabbed Next.js dashboard viewport wireframe',           outputName: 'Command_Center_UI_Spec.json',                status: 'completed',               createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'JOB-204', tool: 'Pomelli',   prompt: 'High-converting Google Ads copy for SEO E-Book',                     outputName: 'AdSense_SEO_Campaign_Copies.txt',            status: 'completed',               createdAt: new Date(Date.now() - 18000000).toISOString() },
  { id: 'JOB-205', tool: 'Jules',     prompt: 'Code coverage and edge runtime audit on src/app/api/',               outputName: 'Jules_Edge_Lint_Report.md',                  status: 'completed',               createdAt: new Date(Date.now() - 21600000).toISOString() },
];

/* ─────────────────────────────────────────────
   Public API
───────────────────────────────────────────── */
export class GoogleAI {
  public static async getAIJobs(): Promise<AIJob[]> {
    return localAIJobs;
  }

  public static async triggerAIJob(tool: AIJob['tool'], prompt: string, outputName: string): Promise<AIJob> {
    const newJob: AIJob = {
      id: `JOB-${Date.now().toString(36).toUpperCase()}`,
      tool,
      prompt,
      outputName,
      status: 'rendering',
      createdAt: new Date().toISOString(),
    };
    localAIJobs.unshift(newJob);

    // Run Gemini in background
    (async () => {
      try {
        const systemPrompt = TOOL_SYSTEM_PROMPTS[tool];
        const result = await callGemini(systemPrompt, prompt);

        newJob.status   = 'completed';
        newJob.result   = result;
        newJob.sizeBytes = result.length * 2;

        // Estimate "duration" for audio/video tools
        if (tool === 'Flow' || tool === 'Vids') newJob.duration = '0:30';
        if (tool === 'Illuminate') newJob.duration = `${Math.floor(result.length / 500)}:${Math.floor((result.length % 500) / 8).toString().padStart(2,'0')}`;

      } catch (err: any) {
        newJob.status = 'failed';
        newJob.result = `Error: ${err.message}`;
      }
    })();

    return newJob;
  }

  /** Get the result text for a completed job */
  public static getJobResult(jobId: string): string | null {
    return localAIJobs.find(j => j.id === jobId)?.result || null;
  }
}
