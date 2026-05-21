import { GET } from './route'
import { sendTelegramAlert } from '../../../lib/telegram'

// Mock the telegram lib
jest.mock('../../../lib/telegram', () => ({
  sendTelegramAlert: jest.fn()
}))

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn((body, init) => ({
        body,
        status: init?.status ?? 200,
        json: async () => body
      }))
    }
  }
})

describe('Data API Route', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
    process.env.RAZORPAY_KEY_ID = 'test_key_id';
    process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Success Cases', () => {
    it('should aggregate data correctly and return a 200 status', async () => {
      // Mock successful fetch
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes('payments')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              count: 2,
              items: [
                { status: 'captured', amount: 50000 }, // 500.00
                { status: 'failed', amount: 10000 }    // 100.00
              ]
            })
          });
        }
        if (url.includes('payment_links')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              items: [
                { status: 'active' },
                { status: 'cancelled' }
              ]
            })
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const response: any = await GET();

      expect(response.status).toBe(200);
      expect(response.body.metrics.revenue).toBe(500);
      expect(response.body.metrics.transactions).toBe(2);
      expect(response.body.metrics.activeLinks).toBe(1);
      expect(response.body.metrics.status).toBe('Live');
      expect(response.body.systemHealth).toBe('Optimal');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return a 500 status if Razorpay keys are missing', async () => {
      delete process.env.RAZORPAY_KEY_ID;

      const response: any = await GET();

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Razorpay keys missing' });
    });

    it('should catch fetch errors, send a telegram alert, and return a 500 status', async () => {
      // Suppress console.error during the test to keep output clean
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock fetch to simulate a failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Simulated network failure'));

      // Call the GET handler
      const response: any = await GET();

      // Assert that fetch was attempted
      expect(global.fetch).toHaveBeenCalled();

      // Assert that the telegram alert was triggered with the correct message format
      expect(sendTelegramAlert).toHaveBeenCalledWith(
        '🚨 <b>Guardian_Ops Alert</b>\nData API Failure: Simulated network failure'
      );
      expect(sendTelegramAlert).toHaveBeenCalledTimes(1);

      // Assert the fallback error response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to aggregate live data' });

      // Clean up the spy
      consoleErrorSpy.mockRestore();
    });
  });
});
