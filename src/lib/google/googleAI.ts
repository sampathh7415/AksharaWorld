/**
 * 🧠 GOOGLE AI TOOLS SUITE — Multi-Model Local Execution
 * Tools: Flow (Veo video), Vids, Illuminate (audio), Pomelli (ad copy),
 *        Jules (code review), Stitch (UI layout)
 *
 * Model routing (dev / Ollama):
 *   Flow, Vids, Illuminate, Pomelli → gemma4       (creative/generative)
 *   Jules                           → qwen2.5-coder:14b  (engineering)
 *   Stitch                          → qwen3.6       (structured reasoning)
 *   Sam CEO brain                   → qwen3.6       (deep reasoning)
 *
 * Prod → Gemini API (all tasks)
 */

import { callLocalAI, getActiveModel, type OllamaTask } from '../ai/provider';

export interface AIJob {
  id        : string;
  tool      : 'Flow' | 'Vids' | 'Illuminate' | 'Pomelli' | 'Jules' | 'Stitch';
  prompt    : string;
  outputName: string;
  status    : 'queued' | 'rendering' | 'completed' | 'failed';
  model?    : string;   // Which Ollama model handled this job
  result?   : string;   // The actual output text / script / JSON
  sizeBytes?: number;
  duration? : string;
  createdAt : string;
}

/* ─────────────────────────────────────────────
   Tool → Ollama task mapping
   (matches README Layer 1: Brain)
───────────────────────────────────────────── */
const TOOL_TASK_MAP: Record<AIJob['tool'], OllamaTask> = {
  Flow      : 'flow',       // gemma4
  Vids      : 'vids',       // gemma4
  Illuminate: 'illuminate', // gemma4
  Pomelli   : 'pomelli',    // gemma4
  Jules     : 'jules',      // qwen2.5-coder:14b
  Stitch    : 'stitch',     // qwen3.6
};

/* ─────────────────────────────────────────────
   Tool-specific system prompts
───────────────────────────────────────────── */
const TOOL_SYSTEM_PROMPTS: Record<AIJob['tool'], string> = {
  Flow: `You are Gemini Flow — an AI video director. Generate a detailed cinematic video script and shot list for a Veo-model short film. Include scene descriptions, visual style, transitions, and voice-over copy. Format as a production-ready screenplay.`,

  Vids: `You are Google Vids AI — a presentation and explainer video generator. Create a structured slide-by-slide script with visual descriptions, key points, and animations for a Google Slides-based video. Make it compelling and business-ready.`,

  Illuminate: `You are Google Illuminate — an audio podcast generator. Convert the provided content into a natural, engaging 2-person podcast dialogue script. Include host names, timestamps, tone guidance, and emphasis notes for TTS rendering.`,

  Pomelli: `You are Google Pomelli — an expert performance ad copywriter. Generate 5 variations of high-converting Google Ads copy (headline + description) and a long-form landing page copy for the provided product/campaign. Follow Google Ads best practices.`,

  Jules: `You are Google Jules — an autonomous AI developer. Perform a thorough code review and improvement analysis on the provided code or system description. Output: issues found, severity levels, suggested fixes with code snippets, and a quality score out of 10.`,

  Stitch: `You are Google Stitch — a generative UI designer. Generate a detailed UI layout specification in JSON format including component hierarchy, color tokens, typography, spacing, and interaction states for the described interface. Use a premium dark glassmorphic design language.`,
};

/* ─────────────────────────────────────────────
   In-memory job queue (seed data)
───────────────────────────────────────────── */
let localAIJobs: AIJob[] = [
  {
    id: 'JOB-201', tool: 'Flow',
    prompt: 'Cinematic short showcasing AI agents executing sales ledger updates',
    outputName: 'Octopus_Strategy_Sales_Teaser_Script.txt',
    status: 'completed', model: 'gemma4', duration: '0:15',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'JOB-202', tool: 'Illuminate',
    prompt: 'Summarize VISION_AND_SYSTEM_MAP.md into podcast dialogue',
    outputName: 'Akshara_World_Corporate_Podcast_Script.txt',
    status: 'completed', model: 'gemma4', duration: '4:12',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'JOB-203', tool: 'Stitch',
    prompt: 'Glassmorphic tabbed Next.js dashboard viewport wireframe',
    outputName: 'Command_Center_UI_Spec.json',
    status: 'completed', model: 'qwen3.6',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'JOB-204', tool: 'Pomelli',
    prompt: 'High-converting Google Ads copy for SEO E-Book',
    outputName: 'AdSense_SEO_Campaign_Copies.txt',
    status: 'completed', model: 'gemma4',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'JOB-205', tool: 'Jules',
    prompt: 'Code coverage and edge runtime audit on src/app/api/',
    outputName: 'Jules_Edge_Lint_Report.md',
    status: 'completed', model: 'qwen2.5-coder:14b',
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
];

/* ─────────────────────────────────────────────
   Public API
───────────────────────────────────────────── */
export class GoogleAI {

  public static async getAIJobs(): Promise<AIJob[]> {
    return localAIJobs;
  }

  public static async triggerAIJob(
    tool      : AIJob['tool'],
    prompt    : string,
    outputName: string,
  ): Promise<AIJob> {
    const task  = TOOL_TASK_MAP[tool];
    const model = getActiveModel(task);

    const newJob: AIJob = {
      id: `JOB-${Date.now().toString(36).toUpperCase()}`,
      tool,
      prompt,
      outputName,
      status   : 'rendering',
      model,
      createdAt: new Date().toISOString(),
    };

    localAIJobs.unshift(newJob);

    // Run in background — routed to the correct model for this tool
    (async () => {
      try {
        const systemPrompt = TOOL_SYSTEM_PROMPTS[tool];
        const result       = await callLocalAI(systemPrompt, prompt, task);

        newJob.status    = 'completed';
        newJob.result    = result;
        newJob.sizeBytes = result.length * 2;

        if (tool === 'Flow' || tool === 'Vids') newJob.duration = '0:30';
        if (tool === 'Illuminate') {
          newJob.duration = `${Math.floor(result.length / 500)}:${Math.floor((result.length % 500) / 8).toString().padStart(2, '0')}`;
        }

      } catch (err: any) {
        newJob.status = 'failed';
        newJob.result = `Error: ${err.message}`;
      }
    })();

    return newJob;
  }

  /** Get result text for a completed job */
  public static getJobResult(jobId: string): string | null {
    return localAIJobs.find(j => j.id === jobId)?.result || null;
  }

  /** Get the model that will be / was used for a given tool */
  public static getToolModel(tool: AIJob['tool']): string {
    return getActiveModel(TOOL_TASK_MAP[tool]);
  }
}
