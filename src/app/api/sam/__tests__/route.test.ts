import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

// NOTE: Tests run in NODE_ENV=test (IS_DEV=false) → Gemini fallback path is exercised.

describe('Sam API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully fallback to Gemini if SAM_BRAIN_URL fetch fails', async () => {
    // Save original env vars to restore later
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      SAM_BRAIN_URL: 'http://test-sam-brain.local',
      GEMINI_API_KEY: 'test-gemini-key',
    };

    const mockMessage = 'Hello Sam';
    const mockRequest = new NextRequest('http://localhost/api/sam', {
      method: 'POST',
      body: JSON.stringify({ message: mockMessage }),
    });

    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // First fetch to Sam Brain fails
    mockFetch.mockRejectedValueOnce(new Error('Fetch failed'));

    // Second fetch to Gemini succeeds — must include ok:true so res.ok check passes
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: 'This is a mock Gemini response' }],
            },
          },
        ],
      }),
    } as unknown as Response);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Check first fetch call (Sam Brain)
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/api/sam'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mockMessage }),
      })
    );

    // Check second fetch call (Gemini fallback)
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=test-gemini-key',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    // Verify correct body was sent to Gemini
    const geminiCallArgs = mockFetch.mock.calls[1];
    expect(JSON.parse(geminiCallArgs[1].body)).toEqual({
      system_instruction: {
        parts: [{ text: 'You are Sam, AI CEO of Akshara World. Be concise and action-oriented.' }],
      },
      contents: [{ role: 'user', parts: [{ text: mockMessage }] }],
    });

    // Check final response
    expect(response.status).toBe(200);
    expect(data).toEqual({ reply: '[Direct Gemini] This is a mock Gemini response' });

    // Restore env vars
    process.env = originalEnv;
  });

  it('should successfully return data from Sam Brain if fetch succeeds', async () => {
    const mockMessage = 'Hello Sam';
    const mockRequest = new NextRequest('http://localhost/api/sam', {
      method: 'POST',
      body: JSON.stringify({ message: mockMessage }),
    });

    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Fetch to Sam Brain succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: 'This is a mock Sam Brain response',
      }),
    } as unknown as Response);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/api/sam'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mockMessage }),
      })
    );

    expect(response.status).toBe(200);
    expect(data).toEqual({ reply: 'This is a mock Sam Brain response' });
  });

  it('should handle failure of both Sam Brain and Gemini fallback', async () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      SAM_BRAIN_URL: 'http://test-sam-brain.local',
      GEMINI_API_KEY: 'test-gemini-key',
    };

    const mockMessage = 'Hello Sam';
    const mockRequest = new NextRequest('http://localhost/api/sam', {
      method: 'POST',
      body: JSON.stringify({ message: mockMessage }),
    });

    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // First fetch to Sam Brain fails
    mockFetch.mockRejectedValueOnce(new Error('Sam Brain fetch failed'));

    // Second fetch to Gemini also fails
    mockFetch.mockRejectedValueOnce(new Error('Gemini fetch failed'));

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledTimes(2);

    expect(response.status).toBe(200);
    // Error message now uses "Gemini fallback failed" (provider-aware wording)
    expect(data).toEqual({
      reply: '[Error] Both Sam Brain and Gemini fallback failed. Check connections. Error: Sam Brain fetch failed',
    });

    process.env = originalEnv;
  });

  it('should handle missing Gemini API key gracefully', async () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      GEMINI_API_KEY: '',
    };

    const mockMessage = 'Hello Sam';
    const mockRequest = new NextRequest('http://localhost/api/sam', {
      method: 'POST',
      body: JSON.stringify({ message: mockMessage }),
    });

    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // First fetch to Sam Brain fails
    mockFetch.mockRejectedValueOnce(new Error('Sam Brain fetch failed'));

    const response = await POST(mockRequest);
    const data = await response.json();

    // Only Sam Brain was called — Gemini throws synchronously due to missing API key
    expect(mockFetch).toHaveBeenCalledTimes(1);

    expect(response.status).toBe(200);
    expect(data).toEqual({
      reply: '[Error] Both Sam Brain and Gemini fallback failed. Check connections. Error: Sam Brain fetch failed',
    });

    process.env = originalEnv;
  });
});

