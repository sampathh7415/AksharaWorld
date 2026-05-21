import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTelegramAlert } from './telegram';

describe('sendTelegramAlert', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should return error when credentials are missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;

    // Silence console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await sendTelegramAlert('Test message');

    expect(result).toEqual({ success: false, error: 'Credentials missing' });
    expect(consoleSpy).toHaveBeenCalledWith("❌ Telegram credentials missing");
  });

  it('should successfully send a message', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-token';
    process.env.TELEGRAM_CHAT_ID = 'mock-chat-id';

    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ok: true }),
    });

    const result = await sendTelegramAlert('Test message');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/botmock-token/sendMessage',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: 'mock-chat-id',
          text: 'Test message',
          parse_mode: 'HTML',
        }),
      }
    );
    expect(result).toEqual({ success: true });
  });

  it('should handle non-ok response from Telegram API', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-token';
    process.env.TELEGRAM_CHAT_ID = 'mock-chat-id';

    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ok: false, description: 'Bad Request: chat not found' }),
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await sendTelegramAlert('Test message');

    expect(result).toEqual({ success: false, error: 'Bad Request: chat not found' });
    expect(consoleSpy).toHaveBeenCalledWith("❌ Telegram Send Error:", 'Bad Request: chat not found');
  });

  it('should handle network errors thrown by fetch', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-token';
    process.env.TELEGRAM_CHAT_ID = 'mock-chat-id';

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await sendTelegramAlert('Test message');

    expect(result).toEqual({ success: false, error: 'Network error' });
    expect(consoleSpy).toHaveBeenCalledWith("❌ Telegram Send Error:", 'Network error');
  });
});
