import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';
import { sendTelegramAlert } from '../../../lib/telegram';

vi.mock('../../../lib/telegram', () => ({
  sendTelegramAlert: vi.fn(),
}));

describe('Data API GET', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 500 if Razorpay keys are missing', async () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Razorpay keys missing');
  });

  it('should return successfully aggregated data when fetch succeeds', async () => {
    process.env.RAZORPAY_KEY_ID = 'test_id';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';

    const mockPaymentsData = {
      count: 2,
      items: [
        { status: 'captured', amount: 50000 },
        { status: 'failed', amount: 20000 },
      ],
    };

    const mockLinksData = {
      items: [
        { status: 'active' },
        { status: 'inactive' },
      ],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockPaymentsData),
    }).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockLinksData),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.metrics).toEqual({
      revenue: 500, // 50000 / 100
      transactions: 2,
      activeLinks: 1,
      status: 'Live',
    });
    expect(data.recentPayments).toEqual(mockPaymentsData.items);
    expect(data.recentLinks).toEqual(mockLinksData.items);
    expect(data.systemHealth).toBe('Optimal');
    expect(data.timestamp).toBeDefined();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://api.razorpay.com/v1/payments?count=10', expect.any(Object));
    expect(global.fetch).toHaveBeenNthCalledWith(2, 'https://api.razorpay.com/v1/payment_links?count=10', expect.any(Object));
  });

  it('should handle safely when items is missing or undefined', async () => {
    process.env.RAZORPAY_KEY_ID = 'test_id';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';

    const mockPaymentsData = {
      count: 0,
      // no items
    };

    const mockLinksData = {
      // no items
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockPaymentsData),
    }).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(mockLinksData),
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.metrics).toEqual({
      revenue: 0,
      transactions: 0,
      activeLinks: 0,
      status: 'Live',
    });
    expect(data.recentPayments).toEqual([]);
    expect(data.recentLinks).toEqual([]);
  });

  it('should catch error, call sendTelegramAlert, and return 500 on fetch failure', async () => {
    process.env.RAZORPAY_KEY_ID = 'test_id';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';

    const errorMessage = 'Network error';
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error(errorMessage));

    // Suppress console.error for this test as it's expected
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to aggregate live data');

    expect(sendTelegramAlert).toHaveBeenCalledWith(`🚨 <b>Guardian_Ops Alert</b>\nData API Failure: ${errorMessage}`);

    consoleSpy.mockRestore();
  });
});
