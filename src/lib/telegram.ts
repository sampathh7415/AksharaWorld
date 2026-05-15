/**
 * 🛰️ Akshara World - Telegram Messenger (Guardian_Ops)
 * Sends real-time alerts to the owner (@Sampathh7)
 */

export async function sendTelegramAlert(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("❌ Telegram credentials missing");
    return { success: false, error: "Credentials missing" };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.description);

    return { success: true };
  } catch (error: any) {
    console.error("❌ Telegram Send Error:", error.message);
    return { success: false, error: error.message };
  }
}
