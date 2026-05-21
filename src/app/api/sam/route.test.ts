import { POST } from './route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock process.env
process.env.SAM_BRAIN_URL = 'http://mock-sam-brain.url';
process.env.GEMINI_API_KEY = 'mock-api-key';

describe('SAM API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return a fallback error when both Sam Brain and direct Gemini fail', async () => {
    // Mock global fetch to throw errors for both calls
    global.fetch = vi.fn()
      .mockRejectedValueOnce(new Error('Sam Brain failed')) // First fetch (Sam Brain) throws
      .mockRejectedValueOnce(new Error('Gemini failed'));   // Second fetch (Gemini fallback) throws

    const req = new NextRequest('http://localhost:3000/api/sam', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(data).toEqual({
      reply: '[Error] Both Sam Brain and direct Gemini failed. Check connections. Error: Sam Brain failed',
    });
  });
});
