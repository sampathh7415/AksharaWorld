"""
sam/telegram_bot/bot.py — Sam's Telegram bot with full approval flow.

Features:
  - Inline YES/NO keyboard for MEDIUM and HIGH-risk tool approvals
  - 2-minute timeout → auto-reject (safe default)
  - /status /shutdown /logs /audit /unlock commands
  - Streaming responses via edit-in-place (Telegram message edits)
  - Whitelist enforced on every message

Setup:
  1. Message @BotFather on Telegram → /newbot → get token
  2. Set TELEGRAM_BOT_TOKEN in sam.env
  3. Set TELEGRAM_OWNER_CHAT_ID to your personal chat ID
     (get it from @userinfobot)
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import time
import uuid
from typing import Any, Callable, Dict, Optional

from telegram import (
    Bot,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Update,
)
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    ApplicationBuilder,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

logger = logging.getLogger(__name__)

APPROVAL_TIMEOUT = int(os.getenv("SAM_APPROVAL_TIMEOUT_SECONDS", "120"))
OWNER_CHAT_ID = os.getenv("TELEGRAM_OWNER_CHAT_ID", "")
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")


class SamTelegramBot:
    """
    Telegram bot interface for Sam.

    Lifecycle:
        bot = SamTelegramBot(agent, task_queue, security, audit, memory, scheduler)
        await bot.start()
        ...
        await bot.stop()

    Approval flow:
        approved = await bot.request_approval("write_file", {"path": "..."}, "HIGH", user_id)
        # Sends inline keyboard, blocks for up to APPROVAL_TIMEOUT seconds
        # Returns True if YES clicked, False if NO clicked or timeout
    """

    def __init__(
        self,
        agent,
        task_queue,
        security,
        audit,
        memory,
        scheduler,
    ):
        self.agent = agent
        self.task_queue = task_queue
        self.security = security
        self.audit = audit
        self.memory = memory
        self.scheduler = scheduler
        self._application: Optional[Application] = None
        # Pending approvals: approval_id → asyncio.Future
        self._pending_approvals: Dict[str, asyncio.Future] = {}

    # ── Lifecycle ──────────────────────────────────────────────────────────────

    async def start(self) -> None:
        """Build and start the Telegram bot polling loop."""
        if not BOT_TOKEN:
            raise ValueError("TELEGRAM_BOT_TOKEN is not set.")

        app = (
            ApplicationBuilder()
            .token(BOT_TOKEN)
            .build()
        )
        self._application = app

        # Register handlers
        app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self._on_message))
        app.add_handler(CommandHandler("start",    self._cmd_start))
        app.add_handler(CommandHandler("status",   self._cmd_status))
        app.add_handler(CommandHandler("shutdown", self._cmd_shutdown))
        app.add_handler(CommandHandler("logs",     self._cmd_logs))
        app.add_handler(CommandHandler("audit",    self._cmd_audit))
        app.add_handler(CommandHandler("unlock",   self._cmd_unlock))
        app.add_handler(CommandHandler("schedules",self._cmd_schedules))
        app.add_handler(CommandHandler("memory",   self._cmd_memory))
        app.add_handler(CommandHandler("help",     self._cmd_help))
        app.add_handler(CallbackQueryHandler(self._on_callback))

        await app.initialize()
        await app.start()
        await app.updater.start_polling(drop_pending_updates=True)
        logger.info("[TelegramBot] Polling started.")

    async def stop(self) -> None:
        if self._application:
            try:
                await self._application.updater.stop()
                await self._application.stop()
                await self._application.shutdown()
            except Exception as exc:
                logger.warning(f"[TelegramBot] Stop error: {exc}")

    async def notify(self, text: str, parse_mode: str = ParseMode.MARKDOWN) -> None:
        """Send a plain notification message to the owner."""
        if not self._application or not OWNER_CHAT_ID:
            return
        try:
            await self._application.bot.send_message(
                chat_id=OWNER_CHAT_ID,
                text=text[:4096],
                parse_mode=parse_mode,
            )
        except Exception as exc:
            logger.warning(f"[TelegramBot] Notify failed: {exc}")

    # ── Approval flow ─────────────────────────────────────────────────────────

    async def request_approval(
        self,
        tool_name: str,
        tool_input: Dict[str, Any],
        risk_level: str,
        user_id: Optional[str] = None,
    ) -> bool:
        """
        Send an approval request to the owner via Telegram inline keyboard.
        Blocks for up to APPROVAL_TIMEOUT seconds.
        Returns True = approved, False = rejected or timed out.

        This is the callback injected into ToolExecutor.
        """
        if not self._application or not OWNER_CHAT_ID:
            logger.warning("[TelegramBot] Approval requested but bot not running — auto-reject.")
            return False

        approval_id = str(uuid.uuid4())[:8]
        risk_emoji = "⚠️" if risk_level == "MEDIUM" else "🚨"

        # Format input nicely
        input_str = json.dumps(tool_input, indent=2, ensure_ascii=False)[:300]

        text = (
            f"{risk_emoji} *{risk_level} RISK ACTION REQUESTED*\n\n"
            f"🔧 Tool: `{tool_name}`\n"
            f"📋 Input:\n```\n{input_str}\n```\n\n"
            f"⏱ Auto-reject in {APPROVAL_TIMEOUT}s\n"
            f"ID: `{approval_id}`"
        )

        keyboard = InlineKeyboardMarkup(
            [
                [
                    InlineKeyboardButton("✅ YES — Approve", callback_data=f"approve:{approval_id}"),
                    InlineKeyboardButton("❌ NO — Reject",   callback_data=f"reject:{approval_id}"),
                ]
            ]
        )

        # Create future to wait on
        loop = asyncio.get_event_loop()
        future: asyncio.Future = loop.create_future()
        self._pending_approvals[approval_id] = future

        try:
            await self._application.bot.send_message(
                chat_id=OWNER_CHAT_ID,
                text=text,
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=keyboard,
            )
        except Exception as exc:
            logger.error(f"[TelegramBot] Failed to send approval request: {exc}")
            self._pending_approvals.pop(approval_id, None)
            return False

        # Wait for response with timeout
        try:
            approved = await asyncio.wait_for(asyncio.shield(future), timeout=APPROVAL_TIMEOUT)
            return approved
        except asyncio.TimeoutError:
            self._pending_approvals.pop(approval_id, None)
            logger.info(f"[TelegramBot] Approval {approval_id} timed out → auto-REJECT.")
            await self.notify(
                f"⏰ Approval `{approval_id}` timed out after {APPROVAL_TIMEOUT}s → *REJECTED*"
            )
            return False

    # ── Callback handler (YES/NO buttons) ────────────────────────────────────

    async def _on_callback(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()

        data = query.data or ""
        if not data.startswith(("approve:", "reject:")):
            return

        action, approval_id = data.split(":", 1)
        future = self._pending_approvals.pop(approval_id, None)

        if future is None or future.done():
            await query.edit_message_text("⚠️ This approval request has already expired.")
            return

        approved = action == "approve"
        future.set_result(approved)

        status_text = "✅ *APPROVED*" if approved else "❌ *REJECTED*"
        await query.edit_message_text(
            f"{status_text} by {query.from_user.first_name}\nApproval ID: `{approval_id}`",
            parse_mode=ParseMode.MARKDOWN,
        )

    # ── Message handler ───────────────────────────────────────────────────────

    async def _on_message(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        """Route plain text messages to Sam agent."""
        if not update.message or not update.message.text:
            return

        user_id = str(update.effective_user.id)
        chat_id = update.effective_chat.id

        # Security check
        if not self.security.is_allowed_user(user_id):
            await update.message.reply_text("🔒 You are not authorized to use Sam.")
            return

        text = update.message.text.strip()

        # Unlock command
        if text.lower().startswith("unlock "):
            code = text[7:].strip()
            success = self.security.unlock(code)
            await update.message.reply_text(
                "🔓 Session unlocked!" if success else "❌ Invalid unlock code."
            )
            return

        # Check session/shutdown
        if self.security.is_shutdown:
            await update.message.reply_text(
                "🛑 Sam is in SHUTDOWN mode. Restart the daemon or contact the owner."
            )
            return

        if self.security.check_session_timeout():
            await update.message.reply_text(
                f"🔒 Sam locked due to inactivity.\n"
                f"Send: `unlock {os.getenv('SAM_UNLOCK_CODE', '1234')}` to resume.",
                parse_mode=ParseMode.MARKDOWN,
            )
            return

        self.security.touch_activity()

        # Add task to queue for processing
        task_id = await self.task_queue.add_task(
            command=text,
            user_id=user_id,
            approval_required=False,
        )

        # For immediate interactive response, run directly (non-queued):
        thinking_msg = await update.message.reply_text("🤔 Sam is thinking…")

        try:
            response = await asyncio.wait_for(
                self.agent.run(text, session_id=f"tg_{user_id}", user_id=user_id),
                timeout=90,
            )
        except asyncio.TimeoutError:
            response = "⏳ This is taking longer than expected. Check /status for updates."
        except Exception as exc:
            response = f"⚠️ Error: {exc}"

        # Update the thinking message with the actual response
        try:
            await thinking_msg.edit_text(
                response[:4096],
                parse_mode=ParseMode.MARKDOWN,
            )
        except Exception:
            # If markdown fails, send as plain text
            try:
                await thinking_msg.edit_text(response[:4096])
            except Exception as exc2:
                logger.warning(f"[TelegramBot] Reply failed: {exc2}")

        # Mark task done
        await self.task_queue.update_status(task_id, "done", result=response[:500])

    # ── Commands ───────────────────────────────────────────────────────────────

    async def _check_auth(self, update: Update) -> bool:
        user_id = str(update.effective_user.id)
        if not self.security.is_allowed_user(user_id):
            await update.message.reply_text("🔒 Unauthorized.")
            return False
        return True

    async def _cmd_start(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        if not await self._check_auth(update):
            return
        await update.message.reply_text(
            "👋 *Sam is online and ready.*\n\n"
            "Just send me any message or use:\n"
            "/status — current state\n"
            "/logs — last 10 actions\n"
            "/audit — full audit report\n"
            "/schedules — cron schedules\n"
            "/shutdown — emergency stop\n"
            "/help — all commands",
            parse_mode=ParseMode.MARKDOWN,
        )

    async def _cmd_help(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        if not await self._check_auth(update):
            return
        await update.message.reply_text(
            "🤖 *Sam Commands*\n\n"
            "📩 Send any message → Sam responds\n"
            "/status — pending tasks, resource usage\n"
            "/logs [n] — last N actions (default 10)\n"
            "/audit — daily audit summary\n"
            "/schedules — list cron schedules\n"
            "/memory — memory statistics\n"
            "/shutdown — freeze all actions\n"
            "/unlock CODE — unlock locked session\n\n"
            "🔐 *Approval Buttons*\n"
            "When Sam requests a MEDIUM/HIGH risk action,\n"
            "you'll see YES/NO buttons in Telegram.\n"
            "No response in 2 minutes → auto-rejected.",
            parse_mode=ParseMode.MARKDOWN,
        )

    async def _cmd_status(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        if not await self._check_auth(update):
            return
        import psutil

        queue_summary = await self.task_queue.get_status_summary()
        mem_stats = await self.memory.get_stats()
        cpu = psutil.cpu_percent(interval=0.3)
        ram = psutil.virtual_memory()

        status_lines = [
            "📊 *Sam Status*",
            f"🔒 Locked: {'Yes' if self.security.is_locked else 'No'}",
            f"🛑 Shutdown: {'Yes' if self.security.is_shutdown else 'No'}",
            "",
            "📋 *Task Queue:*",
        ]
        for status, count in queue_summary.items():
            status_lines.append(f"  {status}: {count}")

        status_lines += [
            "",
            f"🧠 Memories: {mem_stats.get('memories', 0)}",
            f"💬 Conversations: {mem_stats.get('conversations', 0)}",
            "",
            f"⚡ CPU: {cpu:.1f}%",
            f"🧠 RAM: {ram.percent:.1f}%",
        ]

        await update.message.reply_text(
            "\n".join(status_lines),
            parse_mode=ParseMode.MARKDOWN,
        )

    async def _cmd_shutdown(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        if not await self._check_auth(update):
            return
        self.security.emergency_shutdown()
        await update.message.reply_text(
            "🛑 *EMERGENCY SHUTDOWN ACTIVATED*\n\n"
            "All Sam actions are now frozen.\n"
            "Restart the sam daemon to resume.",
            parse_mode=ParseMode.MARKDOWN,
        )

    async def _cmd_logs(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        if not await self._check_auth(update):
            return
        args = ctx.args
        n = int(args[0]) if args and args[0].isdigit() else 10
        formatted = await self.audit.format_for_telegram(n)
        await update.message.reply_text(formatted[:4096], parse_mode=ParseMode.MARKDOWN)

    async def _cmd_audit(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        if not await self._check_auth(update):
            return
        summary = await self.audit.daily_summary()
        await update.message.reply_text(summary[:4096], parse_mode=ParseMode.MARKDOWN)

    async def _cmd_unlock(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        if not await self._check_auth(update):
            return
        args = ctx.args
        code = args[0] if args else ""
        success = self.security.unlock(code)
        await update.message.reply_text(
            "🔓 Session unlocked!" if success else "❌ Invalid unlock code.",
        )

    async def _cmd_schedules(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        if not await self._check_auth(update):
            return
        schedules = await self.scheduler.list_schedules()
        if not schedules:
            await update.message.reply_text("📅 No schedules configured.")
            return
        lines = ["📅 *Active Schedules:*\n"]
        for s in schedules:
            enabled = "✅" if s.get("enabled") else "⏸"
            lines.append(
                f"{enabled} `{s['cron_expression']}` → {s['command']}\n"
                f"   Next: {(s.get('next_run') or 'N/A')[:16]}"
            )
        await update.message.reply_text(
            "\n".join(lines)[:4096],
            parse_mode=ParseMode.MARKDOWN,
        )

    async def _cmd_memory(self, update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
        if not await self._check_auth(update):
            return
        stats = await self.memory.get_stats()
        await update.message.reply_text(
            f"🧠 *Memory Stats:*\n"
            f"Short-term conversations: {stats.get('conversations', 0)}\n"
            f"Long-term memories: {stats.get('memories', 0)}",
            parse_mode=ParseMode.MARKDOWN,
        )
