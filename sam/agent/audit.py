"""
sam/agent/audit.py — AuditLogger for Sam.

Every tool call is automatically logged to the `audit_log` SQLite table.
Provides:
  - AuditLogger.log_tool_call()      — called by ToolExecutor middleware
  - AuditLogger.get_recent(n)        — last N log entries
  - AuditLogger.rotate_old(days=90)  — archive entries > 90 days
  - AuditLogger.daily_summary()      — formatted daily Telegram report

Usage:
    audit = AuditLogger()
    await audit.init()
    log_id = await audit.log_tool_call(
        user_id="123", tool_name="run_terminal",
        tool_input={"command": "ls -la"}, tool_output="...",
        success=True, approval_status="auto", duration_ms=120
    )
"""

from __future__ import annotations

import gzip
import json
import logging
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import aiosqlite

logger = logging.getLogger(__name__)

DB_PATH = os.getenv("SAM_MEMORY_DB", "./sam-data/sam.db")
AUDIT_ARCHIVE_DIR = os.path.join(
    os.path.dirname(os.path.abspath(DB_PATH)), "audit_archives"
)


class AuditLogger:
    """
    Immutable audit log for all Sam tool executions.

    Design: the audit_log table is append-only from Sam's perspective.
    The table itself has no DELETE triggers, and Sam's tool system
    never issues DELETE on audit_log (enforced by the ToolExecutor
    allowlist — delete_file is blocked from the audit_log path).
    """

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path

    async def init(self) -> None:
        """Create audit_log table if not exists."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS audit_log (
                    id              INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp       TEXT    NOT NULL DEFAULT (datetime('now')),
                    user_id         TEXT,
                    tool_name       TEXT    NOT NULL,
                    tool_input      TEXT,   -- JSON
                    tool_output     TEXT,   -- truncated to 2000 chars
                    success         INTEGER NOT NULL DEFAULT 1,  -- 1=True 0=False
                    approval_status TEXT    NOT NULL DEFAULT 'auto',
                    duration_ms     INTEGER
                )
                """
            )
            await db.execute(
                "CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_log(timestamp DESC)"
            )
            await db.commit()
        logger.info("[Audit] Log table ready.")

    # ── Write ─────────────────────────────────────────────────────────────────

    async def log_tool_call(
        self,
        tool_name: str,
        tool_input: Any,
        tool_output: str,
        success: bool,
        approval_status: str = "auto",   # auto | pending | approved | rejected
        duration_ms: Optional[int] = None,
        user_id: Optional[str] = None,
    ) -> int:
        """Append a tool-call record. Returns the audit_log row id."""
        input_json = json.dumps(tool_input) if not isinstance(tool_input, str) else tool_input
        # Cap output at 2000 chars in the log (full output goes to caller)
        capped_output = (tool_output or "")[:2000]

        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                """
                INSERT INTO audit_log
                  (user_id, tool_name, tool_input, tool_output, success,
                   approval_status, duration_ms)
                VALUES (?,?,?,?,?,?,?)
                """,
                (
                    user_id,
                    tool_name,
                    input_json,
                    capped_output,
                    int(success),
                    approval_status,
                    duration_ms,
                ),
            )
            await db.commit()
            row_id = cursor.lastrowid

        logger.debug(
            f"[Audit] #{row_id} {tool_name} {'✓' if success else '✗'} "
            f"({duration_ms}ms) [{approval_status}]"
        )
        return row_id

    # ── Read ──────────────────────────────────────────────────────────────────

    async def get_recent(self, n: int = 10) -> List[Dict[str, Any]]:
        """Return the last N audit entries, newest first."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT * FROM audit_log ORDER BY id DESC LIMIT ?", (n,)
            ) as cur:
                rows = await cur.fetchall()
        return [dict(r) for r in rows]

    async def count_today(self) -> int:
        """Count tool calls executed today (UTC)."""
        today = datetime.utcnow().strftime("%Y-%m-%d")
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT COUNT(*) FROM audit_log WHERE timestamp >= ?", (today,)
            ) as cur:
                return (await cur.fetchone())[0]

    async def count_failures_today(self) -> int:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT COUNT(*) FROM audit_log WHERE timestamp >= ? AND success = 0",
                (today,),
            ) as cur:
                return (await cur.fetchone())[0]

    # ── Daily Summary ─────────────────────────────────────────────────────────

    async def daily_summary(self) -> str:
        """
        Generate a formatted plain-text daily summary for Telegram.
        Called automatically by the scheduler each day at 21:00.
        """
        total = await self.count_today()
        failures = await self.count_failures_today()
        recent = await self.get_recent(5)

        lines = [
            "📋 *Sam Daily Audit Report*",
            f"📅 {datetime.utcnow().strftime('%Y-%m-%d')} (UTC)",
            f"🔧 Tools executed today: *{total}*",
            f"❌ Failures: *{failures}*",
            f"✅ Success rate: *{((total-failures)/total*100):.0f}%*" if total else "✅ No actions today.",
            "",
            "*Last 5 actions:*",
        ]
        for entry in recent:
            ts = entry["timestamp"][:16]
            icon = "✓" if entry["success"] else "✗"
            lines.append(
                f"  {icon} `{entry['tool_name']}` ({entry['approval_status']}) — {ts}"
            )

        return "\n".join(lines)

    # ── Maintenance ───────────────────────────────────────────────────────────

    async def rotate_old(self, days: int = 90) -> int:
        """
        Archive entries older than `days` days to a .jsonl.gz file,
        then delete them from the live table.
        Returns number of archived rows.
        """
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()

        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT * FROM audit_log WHERE timestamp < ?", (cutoff,)
            ) as cur:
                rows = [dict(r) for r in await cur.fetchall()]

        if not rows:
            return 0

        # Archive to compressed file
        os.makedirs(AUDIT_ARCHIVE_DIR, exist_ok=True)
        archive_name = f"audit_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.jsonl.gz"
        archive_path = os.path.join(AUDIT_ARCHIVE_DIR, archive_name)
        with gzip.open(archive_path, "wt", encoding="utf-8") as f:
            for row in rows:
                f.write(json.dumps(row) + "\n")

        # Delete archived rows from live table
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "DELETE FROM audit_log WHERE timestamp < ?", (cutoff,)
            )
            await db.commit()

        logger.info(
            f"[Audit] Archived {len(rows)} rows to {archive_path} and deleted from live table."
        )
        return len(rows)

    async def format_for_telegram(self, n: int = 10) -> str:
        """Format last N entries as a Telegram message."""
        entries = await self.get_recent(n)
        if not entries:
            return "📋 Audit log is empty."
        lines = [f"📋 *Last {len(entries)} actions:*\n"]
        for e in entries:
            icon = "✅" if e["success"] else "❌"
            lines.append(
                f"{icon} `{e['tool_name']}` [{e['approval_status']}]\n"
                f"   _{e['timestamp'][:16]}_ — {(e['tool_output'] or '')[:80]}"
            )
        return "\n".join(lines)
