"""
sam/agent/security.py — SecurityManager, PathValidator, CommandGuard.

- Telegram ID whitelist: only the owner can issue commands.
- Session timeout: auto-lock after N minutes of inactivity.
- Path restrictions: file/terminal tools confined to allowlist.
- Command blocklist: dangerous shell commands require explicit override.
- Shutdown flag: /shutdown on Telegram freezes all actions until restart.
"""

from __future__ import annotations

import logging
import os
import re
import time
from pathlib import Path
from typing import FrozenSet, List, Optional, Set

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config helpers
# ---------------------------------------------------------------------------

def _parse_ids(env_var: str) -> Set[str]:
    raw = os.getenv(env_var, "")
    return {s.strip() for s in raw.split(",") if s.strip()}


def _parse_paths(env_var: str) -> List[Path]:
    raw = os.getenv(env_var, "")
    paths = [Path(p.strip()).resolve() for p in raw.split(",") if p.strip()]
    if not paths:
        # safe defaults — user home + temp
        paths = [Path.home().resolve(), Path(os.environ.get("TEMP", "/tmp")).resolve()]
    return paths


# ---------------------------------------------------------------------------
# PathValidator
# ---------------------------------------------------------------------------

class PathValidator:
    """
    Validates that a given file/directory path stays within the configured
    allowed directories.  Rejects path-traversal attempts (../).

    Usage:
        validator = PathValidator()
        safe = validator.validate("/home/user/documents/report.txt")   # True
        unsafe = validator.validate("/etc/passwd")                     # False
    """

    def __init__(self):
        self._allowed: List[Path] = _parse_paths("SAM_ALLOWED_PATHS")
        logger.info(f"[Security] Allowed paths: {[str(p) for p in self._allowed]}")

    def validate(self, path_str: str) -> bool:
        """Return True if `path_str` is within an allowed directory."""
        try:
            target = Path(path_str).resolve()
        except Exception:
            return False

        for allowed in self._allowed:
            try:
                target.relative_to(allowed)
                return True
            except ValueError:
                continue
        logger.warning(f"[Security] Path rejected (outside allowlist): {path_str}")
        return False

    def assert_valid(self, path_str: str) -> None:
        """Raise PermissionError if path is not allowed."""
        if not self.validate(path_str):
            raise PermissionError(
                f"Path '{path_str}' is outside the allowed directories. "
                f"Allowed: {[str(p) for p in self._allowed]}"
            )


# ---------------------------------------------------------------------------
# CommandGuard
# ---------------------------------------------------------------------------

# Built-in blocked patterns — always require explicit override
_DEFAULT_BLOCKED: FrozenSet[str] = frozenset(
    {
        "rm -rf", "rm -fr", "rm -f /",
        "dd ", "mkfs", "format ",
        "del /f /s /q", "rd /s /q",
        ":(){:|:&};:",                # fork bomb
        "chmod 777 /", "chown -R",
        "sudo rm", "sudo dd", "sudo mkfs",
        "shutdown", "reboot", "halt",
        "curl * | sh", "wget * | sh", "bash <(",
    }
)


class CommandGuard:
    """
    Checks shell commands against a blocklist.

    Blocked commands require the user to explicitly set `override=True`
    in the tool call (which itself requires HIGH-risk approval).
    """

    def __init__(self):
        env_blocks = os.getenv("SAM_BLOCKED_COMMANDS", "")
        extra = {c.strip() for c in env_blocks.split(",") if c.strip()}
        self._blocked = _DEFAULT_BLOCKED | extra

    def is_blocked(self, command: str) -> bool:
        """Return True if the command matches any blocked pattern."""
        cmd_lower = command.lower().strip()
        for pattern in self._blocked:
            if pattern.lower() in cmd_lower:
                return True
        return False

    def assert_safe(self, command: str, override: bool = False) -> None:
        """Raise PermissionError if command is blocked and override not set."""
        if self.is_blocked(command):
            if override:
                logger.warning(
                    f"[Security] Blocked command used with OVERRIDE: {command[:80]}"
                )
                return
            raise PermissionError(
                f"Command contains a blocked pattern and requires explicit override.\n"
                f"Command: {command[:80]}\n"
                "Set override=True to force execution (HIGH-risk approval required)."
            )


# ---------------------------------------------------------------------------
# SecurityManager
# ---------------------------------------------------------------------------

class SecurityManager:
    """
    Central security controller for Sam.

    - Maintains the session state (locked/unlocked, last activity).
    - Validates Telegram user IDs against the whitelist.
    - Exposes a global shutdown flag that freezes all tool execution.
    """

    def __init__(self):
        self._allowed_ids: Set[str] = _parse_ids("TELEGRAM_ALLOWED_IDS")
        self._session_timeout: int = (
            int(os.getenv("SAM_SESSION_TIMEOUT_MINUTES", "10")) * 60
        )
        self._unlock_code: str = os.getenv("SAM_UNLOCK_CODE", "1234")
        self._last_activity: float = time.monotonic()
        self._locked: bool = False
        self._shutdown: bool = False
        self.path_validator = PathValidator()
        self.command_guard = CommandGuard()
        logger.info(
            f"[Security] Initialized. Allowed IDs: {self._allowed_ids or 'ANY (WARNING)'}"
        )

    # ── Shutdown ──────────────────────────────────────────────────────────────

    @property
    def is_shutdown(self) -> bool:
        return self._shutdown

    def emergency_shutdown(self) -> None:
        """Activate the global shutdown flag — blocks all tool execution."""
        self._shutdown = True
        logger.critical("[Security] EMERGENCY SHUTDOWN ACTIVATED. All actions frozen.")

    def reset_shutdown(self) -> None:
        """Deactivate shutdown (owner must restart daemon manually in most cases)."""
        self._shutdown = False
        logger.info("[Security] Shutdown flag cleared.")

    def assert_not_shutdown(self) -> None:
        if self._shutdown:
            raise PermissionError(
                "Sam is in SHUTDOWN mode. Restart the daemon or send /restart."
            )

    # ── Session ───────────────────────────────────────────────────────────────

    def touch_activity(self) -> None:
        """Record that the user is active — resets inactivity timer."""
        self._last_activity = time.monotonic()
        if self._locked:
            logger.info("[Security] Activity recorded while locked.")

    def check_session_timeout(self) -> bool:
        """
        Returns True if the session has timed out and should be locked.
        Call this periodically from the background task.
        """
        if self._locked:
            return True
        elapsed = time.monotonic() - self._last_activity
        if elapsed > self._session_timeout:
            self._locked = True
            logger.info(
                f"[Security] Session locked after {elapsed:.0f}s of inactivity."
            )
            return True
        return False

    @property
    def is_locked(self) -> bool:
        return self._locked

    def unlock(self, code: str) -> bool:
        """Attempt to unlock the session with the configured unlock code."""
        if code == self._unlock_code:
            self._locked = False
            self._last_activity = time.monotonic()
            logger.info("[Security] Session unlocked.")
            return True
        logger.warning("[Security] Failed unlock attempt.")
        return False

    def assert_unlocked(self) -> None:
        if self._locked:
            raise PermissionError(
                f"Sam is locked due to inactivity. "
                f"Send 'unlock {self._unlock_code}' to resume."
            )

    # ── User whitelist ────────────────────────────────────────────────────────

    def is_allowed_user(self, user_id: str) -> bool:
        """Return True if `user_id` is in the Telegram allowlist."""
        if not self._allowed_ids:
            # No whitelist configured → block all users
            logger.warning("[Security] No TELEGRAM_ALLOWED_IDS set — blocking all users!")
            return False
        return str(user_id) in self._allowed_ids

    def assert_allowed_user(self, user_id: str) -> None:
        if not self.is_allowed_user(user_id):
            logger.warning(f"[Security] Unauthorized access attempt from: {user_id}")
            raise PermissionError(
                f"User {user_id} is not authorized to use Sam."
            )

    # ── Combined guard ────────────────────────────────────────────────────────

    def full_access_check(self, user_id: Optional[str] = None) -> None:
        """
        Run all security checks in order:
        1. Shutdown flag
        2. Session lock
        3. User whitelist
        """
        self.assert_not_shutdown()
        self.assert_unlocked()
        if user_id is not None:
            self.assert_allowed_user(user_id)
        self.touch_activity()
