require('dotenv').config({ path: './.env.local' });

async function sendTelegramAlert(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  console.log(`Using token: ${token?.substring(0, 5)}... and chat: ${chatId}`);

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
    console.log("Response:", data);
    return data.ok;
  } catch (error) {
    console.error("Error:", error.message);
    return false;
  }
}

sendTelegramAlert('✅ <b>Guardian_Ops Activated</b>\nTelegram alerts are now LIVE for @Sampathh7.').then(ok => {
  console.log("Result:", ok ? "SUCCESS" : "FAILED");
  process.exit(ok ? 0 : 1);
});
