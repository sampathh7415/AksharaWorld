import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

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

    // Second fetch to Gemini succeeds
    mockFetch.mockResolvedValueOnce({
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

    // Check first fetch call
    expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://sam-ceo-brain.akshara-sam.workers.dev/api/sam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: mockMessage }),
    });

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
      json: async () => ({
        reply: 'This is a mock Sam Brain response',
      }),
    } as unknown as Response);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://sam-ceo-brain.akshara-sam.workers.dev/api/sam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: mockMessage }),
    });

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
    expect(data).toEqual({
      reply: '[Error] Both Sam Brain and direct Gemini failed. Check connections. Error: Sam Brain fetch failed',
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

    expect(mockFetch).toHaveBeenCalledTimes(1); // Gemini should not be called due to missing API key

    expect(response.status).toBe(200);
    expect(data).toEqual({
      reply: '[Error] Both Sam Brain and direct Gemini failed. Check connections. Error: Sam Brain fetch failed',
    });

    process.env = originalEnv;
  });
});
