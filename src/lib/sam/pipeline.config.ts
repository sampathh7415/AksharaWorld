export const pipelineConfig = {
  verifiedTools: {
    telegram: { status: "live", lastTest: "message_id_549", verified: true },
    googleSheets: { status: "live", lastTest: "row_19_written", verified: true },
    ollama: { status: "live", models: 5, verified: true },
    fastAPI: { status: "live", port: 8765, verified: true },
    razorpay: { status: "live", mode: "production", verified: true },
    cloudflarePages: { status: "live", url: "6439de63.aksharaworld-main.pages.dev", verified: true },
    email: {
      tool: "Gmail API + Gemini summarization",
      accounts: 3,
      handler: "services/email-bot/main.py",
      schedule: "daily_8am",
      output: "telegram_digest",
      status: "live"
    }
  }
};
