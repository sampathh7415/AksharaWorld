/**
 * 📱 TELEGRAM ALERT SYSTEM
 * Sends real-time notifications to Telegram for critical events
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API = 'https://api.telegram.org';

interface TelegramMessage {
  type: 'alert' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  details?: Record<string, any>;
}

/**
 * Send Telegram notification
 */
export async function sendTelegramAlert(message: TelegramMessage): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[Telegram] Bot token or chat ID not configured, skipping notification');
    return false;
  }

  try {
    const emoji = getEmoji(message.type);
    const formattedMessage = formatTelegramMessage(emoji, message);

    const response = await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: formattedMessage,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API returned ${response.status}`);
    }

    console.log('[Telegram] ✅ Alert sent:', message.title);
    return true;
  } catch (err: any) {
    console.error('[Telegram] Failed to send alert:', err.message);
    return false;
  }
}

/**
 * Send revenue alert
 */
export async function sendRevenueAlert(amount: number, todayTotal: number): Promise<boolean> {
  return sendTelegramAlert({
    type: 'success',
    title: '💰 New Transaction Captured',
    description: `₹${amount} received`,
    details: {
      amount: `₹${amount.toFixed(2)}`,
      todayTotal: `₹${todayTotal.toFixed(2)}`,
      timestamp: new Date().toLocaleString('en-IN'),
    },
  });
}

/**
 * Send system alert
 */
export async function sendSystemAlert(title: string, description: string, severity: 'warning' | 'error' = 'warning'): Promise<boolean> {
  return sendTelegramAlert({
    type: severity === 'error' ? 'alert' : 'warning',
    title,
    description,
  });
}

function getEmoji(type: string): string {
  const emojis: Record<string, string> = {
    alert: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅',
  };
  return emojis[type] || '📢';
}

function formatTelegramMessage(emoji: string, message: TelegramMessage): string {
  let text = `${emoji} <b>${message.title}</b>\n`;
  text += `${message.description}\n`;

  if (message.details) {
    text += '\n<code>';
    Object.entries(message.details).forEach(([key, value]) => {
      text += `${key}: ${value}\n`;
    });
    text += '</code>';
  }

  return text;
}
