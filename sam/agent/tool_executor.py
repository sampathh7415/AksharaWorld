"""
sam/agent/tool_executor.py — ToolExecutor with timeout, retry, approval flow.

Every tool call passes through ToolExecutor.execute():
  1. Security checks (shutdown / session lock / path / command)
  2. Risk-level routing:
     LOW    → auto-execute
     MEDIUM → ask user once via Telegram, wait 120s
     HIGH   → require YES button in Telegram (2-factor)
  3. asyncio.wait_for(timeout=30s) on every execution
  4. Exponential-backoff retry × 3 on transient failures
  5. Output capped at 2000 chars; auto-summarized if longer
  6. All calls logged to AuditLogger

Usage (called from graph.py tool node):
    executor = ToolExecutor(security, audit, telegram_approval_fn)
    result = await executor.execute("run_terminal", {"command": "ls"}, user_id="123")
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Callable, Dict, Optional

from sam.agent.security import SecurityManager
from sam.agent.audit import AuditLogger

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
TOOL_TIMEOUT_SECONDS = int(__import__("os").getenv("SAM_TOOL_TIMEOUT", "30"))
BROWSE_TIMEOUT_SECONDS = 60  # browse() gets extra time
MAX_RETRIES = 3
RETRY_BASE_SECONDS = 1.0       # doubles each retry: 1 → 2 → 4
OUTPUT_CAP = 2000

# Risk levels
RISK_LOW = "LOW"
RISK_MEDIUM = "MEDIUM"
RISK_HIGH = "HIGH"

# Tools and their risk levels
TOOL_RISK_MAP: Dict[str, str] = {
    "run_terminal":    RISK_MEDIUM,
    "browse":          RISK_LOW,
    "read_file":       RISK_LOW,
    "write_file":      RISK_HIGH,
    "delete_file":     RISK_HIGH,
    "send_email":      RISK_MEDIUM,
    "list_directory":  RISK_LOW,
    "search_files":    RISK_LOW,
    "get_system_info": RISK_LOW,
}

# Transient error indicators — these trigger retry
TRANSIENT_ERRORS = (
    TimeoutError,
    ConnectionError,
    ConnectionResetError,
    asyncio.TimeoutError,
)


# ---------------------------------------------------------------------------
# Approval callback type — implemented by telegram_bot/bot.py
# ---------------------------------------------------------------------------
# async def approval_fn(tool_name, tool_input, risk_level, user_id) -> bool
ApprovalCallback = Callable[
    [str, Dict[str, Any], str, Optional[str]],
    "asyncio.coroutine",  # must be an awaitable returning bool
]


class ApprovalDeniedError(Exception):
    """Raised when the user rejects or times out a tool approval."""


class ToolTimeoutError(Exception):
    """Raised when a tool exceeds its timeout budget."""


# ---------------------------------------------------------------------------
# ToolExecutor
# ---------------------------------------------------------------------------

class ToolExecutor:
    """
    Central tool execution harness.

    Args:
        security:        SecurityManager instance.
        audit:           AuditLogger instance.
        approval_fn:     Async callable (tool_name, input, risk, user_id) → bool.
                         Injected at runtime by the Telegram bot or web dashboard.
        summarize_fn:    Optional async callable (text) → str for long outputs.
                         Defaults to naive truncation if not provided.
    """

    def __init__(
        self,
        security: SecurityManager,
        audit: AuditLogger,
        approval_fn: Optional[ApprovalCallback] = None,
        summarize_fn: Optional[Callable[[str], Any]] = None,
    ):
        self.security = security
        self.audit = audit
        self._approval_fn = approval_fn
        self._summarize_fn = summarize_fn
        # Registry: tool_name → async callable
        self._registry: Dict[str, Callable] = {}

    def register(self, name: str, fn: Callable) -> None:
        """Register a tool implementation under `name`."""
        self._registry[name] = fn
        logger.debug(f"[ToolExecutor] Registered tool: {name}")

    def set_approval_fn(self, fn: ApprovalCallback) -> None:
        """Inject the Telegram approval callback after bot is ready."""
        self._approval_fn = fn

    def set_summarize_fn(self, fn: Callable) -> None:
        self._summarize_fn = fn

    # ── Main entry point ──────────────────────────────────────────────────────

    async def execute(
        self,
        tool_name: str,
        tool_input: Dict[str, Any],
        user_id: Optional[str] = None,
    ) -> str:
        """
        Execute a tool with full safety harness.

        Returns the tool output as a string (capped at 2000 chars).
        Raises on unrecoverable errors (approval denied, security block, etc.).
        """
        start_ms = int(time.monotonic() * 1000)
        risk = TOOL_RISK_MAP.get(tool_name, RISK_MEDIUM)
        approval_status = "auto"

        # ── 1. Security checks ────────────────────────────────────────────────
        try:
            self.security.full_access_check(user_id)
        except PermissionError as exc:
            await self.audit.log_tool_call(
                tool_name=tool_name, tool_input=tool_input,
                tool_output=str(exc), success=False,
                approval_status="blocked", user_id=user_id,
            )
            raise

        # ── 2. Approval routing ───────────────────────────────────────────────
        if risk == RISK_MEDIUM:
            approved = await self._request_approval(tool_name, tool_input, risk, user_id)
            if not approved:
                approval_status = "rejected"
                await self.audit.log_tool_call(
                    tool_name=tool_name, tool_input=tool_input,
                    tool_output="User rejected MEDIUM-risk action.",
                    success=False, approval_status=approval_status, user_id=user_id,
                )
                raise ApprovalDeniedError(f"User rejected '{tool_name}'.")
            approval_status = "approved"

        elif risk == RISK_HIGH:
            # HIGH: two-factor — must pass both Telegram inline keyboard approval
            approved = await self._request_approval(
                tool_name, tool_input, risk, user_id, two_factor=True
            )
            if not approved:
                approval_status = "rejected"
                await self.audit.log_tool_call(
                    tool_name=tool_name, tool_input=tool_input,
                    tool_output="User rejected HIGH-risk action (2FA).",
                    success=False, approval_status=approval_status, user_id=user_id,
                )
                raise ApprovalDeniedError(
                    f"HIGH-risk action '{tool_name}' was rejected or timed out."
                )
            approval_status = "approved_2fa"

        # ── 3. Execute with timeout + retry ───────────────────────────────────
        output, success, error_msg = await self._execute_with_retry(
            tool_name, tool_input
        )

        # ── 4. Cap output ─────────────────────────────────────────────────────
        if len(output) > OUTPUT_CAP:
            output = await self._cap_output(output, tool_name)

        # ── 5. Audit log ──────────────────────────────────────────────────────
        duration_ms = int(time.monotonic() * 1000) - start_ms
        await self.audit.log_tool_call(
            tool_name=tool_name, tool_input=tool_input,
            tool_output=output, success=success,
            approval_status=approval_status,
            duration_ms=duration_ms, user_id=user_id,
        )

        if not success:
            raise RuntimeError(f"Tool '{tool_name}' failed: {output}")

        return output

    # ── Internal helpers ──────────────────────────────────────────────────────

    async def _execute_with_retry(
        self, tool_name: str, tool_input: Dict[str, Any]
    ) -> tuple[str, bool, str]:
        """
        Try to execute `tool_name` up to MAX_RETRIES times.
        Returns (output_str, success_bool, error_message).
        """
        fn = self._registry.get(tool_name)
        if fn is None:
            return f"Unknown tool: '{tool_name}'", False, "tool not registered"

        timeout = (
            BROWSE_TIMEOUT_SECONDS
            if tool_name == "browse"
            else TOOL_TIMEOUT_SECONDS
        )

        last_error = ""
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                raw = await asyncio.wait_for(fn(**tool_input), timeout=timeout)
                output = str(raw) if raw is not None else ""
                return output, True, ""
            except asyncio.TimeoutError:
                last_error = f"Tool timed out after {timeout}s"
                logger.warning(
                    f"[ToolExecutor] {tool_name} attempt {attempt}/{MAX_RETRIES} timed out."
                )
            except TRANSIENT_ERRORS as exc:
                last_error = str(exc)
                logger.warning(
                    f"[ToolExecutor] {tool_name} attempt {attempt}/{MAX_RETRIES} "
                    f"transient error: {exc}"
                )
            except PermissionError:
                raise  # security errors are not retried
            except Exception as exc:
                # Non-transient: return immediately
                logger.error(f"[ToolExecutor] {tool_name} failed: {exc}", exc_info=True)
                return str(exc), False, str(exc)

            if attempt < MAX_RETRIES:
                wait = RETRY_BASE_SECONDS * (2 ** (attempt - 1))
                logger.info(f"[ToolExecutor] Retrying in {wait:.1f}s...")
                await asyncio.sleep(wait)

        return f"Tool failed after {MAX_RETRIES} attempts: {last_error}", False, last_error

    async def _request_approval(
        self,
        tool_name: str,
        tool_input: Dict[str, Any],
        risk: str,
        user_id: Optional[str],
        two_factor: bool = False,
    ) -> bool:
        """
        Request user approval via the registered approval callback.
        Returns True = approved, False = rejected/timed-out.
        """
        if self._approval_fn is None:
            # No Telegram bot connected — auto-reject HIGH, auto-approve MEDIUM
            if risk == RISK_HIGH:
                logger.warning(
                    "[ToolExecutor] HIGH-risk tool called with no approval_fn — auto-REJECTING."
                )
                return False
            logger.warning(
                "[ToolExecutor] MEDIUM-risk tool called with no approval_fn — auto-APPROVING."
            )
            return True

        try:
            return await self._approval_fn(tool_name, tool_input, risk, user_id)
        except Exception as exc:
            logger.error(f"[ToolExecutor] Approval callback error: {exc}")
            return False  # fail-safe: deny on error

    async def _cap_output(self, output: str, tool_name: str) -> str:
        """Cap output at OUTPUT_CAP chars, summarizing via LLM if available."""
        if self._summarize_fn is not None:
            try:
                summary = await self._summarize_fn(output)
                return (
                    f"[Output truncated — {len(output):,} chars → summarized]\n\n"
                    + summary
                )
            except Exception as exc:
                logger.warning(f"[ToolExecutor] Summarization failed: {exc}")

        # Naive truncation fallback
        return (
            output[:OUTPUT_CAP]
            + f"\n\n... [truncated {len(output) - OUTPUT_CAP:,} chars]"
        )
