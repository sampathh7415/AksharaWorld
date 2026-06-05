export const runtime = 'edge';
import { NextResponse } from 'next/server';

const SAM_BRAIN_URL = process.env.SAM_BRAIN_URL || process.env.NEXT_PUBLIC_SAM_URL || 'https://sam-ceo-brain.akshara-sam.workers.dev';

interface SamRequest {
  message: string;
}

interface SamResponse {
  reply: string;
  confidence: number;
  action?: string;
}

/**
 * 🤖 SAM BRAIN CEO INTERFACE
 * Routes user queries to Sam AI CEO for autonomous business decisions
 * Integrated with Cloudflare Worker backend
 */
export async function POST(request: Request) {
  try {
    const body: SamRequest = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: message required' },
        { status: 400 }
      );
    }

    // Call Sam Brain Cloudflare Worker
    const samResponse = await fetch(`${SAM_BRAIN_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: message,
        context: 'dashboard',
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!samResponse.ok) {
      throw new Error(`Sam Brain returned ${samResponse.status}`);
    }

    const samData: SamResponse = await samResponse.json();

    // Log decision for audit trail
    console.log('[Sam Decision]', {
      query: message,
      reply: samData.reply,
      confidence: samData.confidence,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        status: 'success',
        reply: samData.reply,
        confidence: samData.confidence,
        action: samData.action,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[Sam Brain Error]', err.message);

    // Fallback response when Sam Brain is offline
    const fallbackReplies = [
      'Sam Brain is thinking... Please check system status. Fallback memory engaged.',
      'I am rebooting my neural core. Ask again in a moment.',
      'Connection to Sam Brain lost. Consulting offline knowledge base.',
    ];

    const randomFallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

    return NextResponse.json(
      {
        status: 'fallback',
        reply: randomFallback,
        confidence: 0,
        error: err.message,
      },
      { status: 200 }
    );
  }
}

/**
 * GET /api/sam/health
 * Check if Sam Brain is reachable
 */
export async function GET() {
  try {
    const health = await fetch(`${SAM_BRAIN_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });

    if (health.ok) {
      const data = await health.json();
      return NextResponse.json(
        {
          status: 'online',
          samBrain: data,
        },
        { status: 200 }
      );
    }

    throw new Error(`Health check returned ${health.status}`);
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'offline',
        error: err.message,
      },
      { status: 503 }
    );
  }
}
