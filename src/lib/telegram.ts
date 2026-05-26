import { resilientFetch } from './resilience';

export async function sendTelegramAlert(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("❌ Telegram credentials missing");
    return { success: false, error: "Credentials missing" };
  }

  try {
    const data = await resilientFetch<any>(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
        timeout: 5000,
        retries: 3,
      }
    );

    if (!data.ok) throw new Error(data.description || 'Unknown error');

    return { success: true };
  } catch (error: any) {
    console.error("❌ Telegram Send Error:", error.message);
    return { success: false, error: error.message };
  }
}
