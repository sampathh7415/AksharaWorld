import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';
import { sendTelegramAlert } from '../../../lib/telegram';

// Mock the Telegram alert function
vi.mock('../../../lib/telegram', () => ({
  sendTelegramAlert: vi.fn(),
}));

describe('Data API Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Save original env and set test variables
    process.env = { ...originalEnv };
    process.env.RAZORPAY_KEY_ID = 'test_key_id';
    process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';

    // Mock global fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it('should return 500 error when Razorpay keys are missing', async () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Razorpay keys missing' });
  });

  it('should aggregate successful payments and active links correctly', async () => {
    // Mock successful fetch responses
    const mockPayments = {
      count: 2,
      items: [
        { id: 'pay_1', status: 'captured', amount: 150000 }, // 1500.00
        { id: 'pay_2', status: 'failed', amount: 50000 },    // Ignored, not captured
        { id: 'pay_3', status: 'captured', amount: 50000 }   // 500.00
      ]
    };

    const mockLinks = {
      count: 2,
      items: [
        { id: 'link_1', status: 'active' },
        { id: 'link_2', status: 'inactive' },
        { id: 'link_3', status: 'active' }
      ]
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/payments')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockPayments),
        });
      }
      if (url.includes('/payment_links')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockLinks),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);

    // Revenue should be (150000 + 50000) / 100 = 2000
    expect(data.metrics.revenue).toBe(2000);
    expect(data.metrics.transactions).toBe(2);
    expect(data.metrics.activeLinks).toBe(2);
    expect(data.metrics.status).toBe('Live');

    expect(data.recentPayments.length).toBe(3);
    expect(data.recentLinks.length).toBe(3);
    expect(data.systemHealth).toBe('Optimal');
    expect(data.timestamp).toBeDefined();

    // Verify fetch was called with correct headers
    const auth = Buffer.from('test_key_id:test_key_secret').toString('base64');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/payments'),
      { headers: { Authorization: `Basic ${auth}` } }
    );
  });

  it('should handle fetch errors, send Telegram alert, and return 500', async () => {
    // Mock fetch to throw an error
    const errorMessage = 'Network error';
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

    // Suppress console.error for this test to keep output clean
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to aggregate live data' });

    expect(sendTelegramAlert).toHaveBeenCalledWith(
      expect.stringContaining(`Data API Failure: ${errorMessage}`)
    );

    consoleSpy.mockRestore();
  });
});
