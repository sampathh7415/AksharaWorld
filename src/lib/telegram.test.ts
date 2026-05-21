import { sendTelegramAlert } from './telegram';

describe('sendTelegramAlert', () => {
  const originalEnv = process.env;
  let mockFetch: jest.Mock;
  let mockConsoleError: jest.Mock;

  beforeEach(() => {
    jest.resetModules(); // clears the cache
    process.env = { ...originalEnv }; // Make a copy

    mockFetch = jest.fn();
    global.fetch = mockFetch as any;

    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv; // Restore old environment
    mockConsoleError.mockRestore();
  });

  it('should return error if token is missing', async () => {
    process.env.TELEGRAM_BOT_TOKEN = '';
    process.env.TELEGRAM_CHAT_ID = 'chat123';

    const result = await sendTelegramAlert('Test message');

    expect(result).toEqual({ success: false, error: 'Credentials missing' });
    expect(mockConsoleError).toHaveBeenCalledWith("❌ Telegram credentials missing");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should return error if chatId is missing', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'bot123';
    process.env.TELEGRAM_CHAT_ID = '';

    const result = await sendTelegramAlert('Test message');

    expect(result).toEqual({ success: false, error: 'Credentials missing' });
    expect(mockConsoleError).toHaveBeenCalledWith("❌ Telegram credentials missing");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should send message successfully when credentials are valid', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'bot123';
    process.env.TELEGRAM_CHAT_ID = 'chat123';

    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ ok: true })
    });

    const result = await sendTelegramAlert('Test message');

    expect(result).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/botbot123/sendMessage',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: 'chat123',
          text: 'Test message',
          parse_mode: 'HTML',
        }),
      }
    );
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should handle API errors returned by Telegram', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'bot123';
    process.env.TELEGRAM_CHAT_ID = 'chat123';

    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ ok: false, description: 'Bad Request' })
    });

    const result = await sendTelegramAlert('Test message');

    expect(result).toEqual({ success: false, error: 'Bad Request' });
    expect(mockConsoleError).toHaveBeenCalledWith("❌ Telegram Send Error:", "Bad Request");
  });

  it('should handle network errors or fetch throwing', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'bot123';
    process.env.TELEGRAM_CHAT_ID = 'chat123';

    mockFetch.mockRejectedValueOnce(new Error('Network Error'));

    const result = await sendTelegramAlert('Test message');

    expect(result).toEqual({ success: false, error: 'Network Error' });
    expect(mockConsoleError).toHaveBeenCalledWith("❌ Telegram Send Error:", "Network Error");
  });
});
