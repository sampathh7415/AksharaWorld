import { NextResponse } from 'next/server';
import { GoogleAI } from '@/lib/google/googleAI';

export async function GET() {
  try {
    const jobs = await GoogleAI.getAIJobs();
    return NextResponse.json(jobs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { tool, prompt, outputName } = await request.json();
    if (!tool || !prompt || !outputName) {
      return NextResponse.json({ error: 'Missing parameters: tool, prompt, outputName required' }, { status: 400 });
    }
    const job = await GoogleAI.triggerAIJob(tool, prompt, outputName);
    return NextResponse.json(job);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
