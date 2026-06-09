"""
sam/agent/scheduler.py — Persistent Task Queue + Cron Scheduler.

TaskQueue:
  - SQLite `tasks` table with status machine:
    pending → in_progress → done | failed | waiting_approval
  - Survives daemon restarts — pending tasks resume automatically.
  - One background worker processes tasks serially.

Scheduler:
  - Reads `schedules` table every 60s.
  - Parses cron expressions via `croniter`.
  - Supports natural-language registration:
    "every day at 9am, show me system status"
    → cron = "0 9 * * *", command = "get_system_info"

Usage:
    queue = TaskQueue()
    scheduler = Scheduler(queue)
    await queue.init()
    await scheduler.start()

    task_id = await queue.add_task("get_system_info", approval_required=False)
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import uuid
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional

import aiosqlite
from croniter import croniter  # type: ignore

logger = logging.getLogger(__name__)

DB_PATH = os.getenv("SAM_MEMORY_DB", "./sam-data/sam.db")

# Task status constants
STATUS_PENDING = "pending"
STATUS_IN_PROGRESS = "in_progress"
STATUS_DONE = "done"
STATUS_FAILED = "failed"
STATUS_WAITING_APPROVAL = "waiting_approval"
STATUS_CANCELLED = "cancelled"


# ---------------------------------------------------------------------------
# TaskQueue
# ---------------------------------------------------------------------------

class TaskQueue:
    """
    Persistent SQLite-backed task queue for Sam.

    All tasks survive daemon restarts.  The background worker calls
    process_fn for each task in FIFO order.
    """

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._process_fn: Optional[Callable] = None
        self._worker_task: Optional[asyncio.Task] = None
        self._running = False

    async def init(self) -> None:
        """Create task tables if they don't exist."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.executescript(
                """
                CREATE TABLE IF NOT EXISTS tasks (
                    id                  TEXT    PRIMARY KEY,
                    command             TEXT    NOT NULL,
                    args                TEXT,                   -- JSON dict
                    status              TEXT    NOT NULL DEFAULT 'pending',
                    created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
                    started_at          TEXT,
                    completed_at        TEXT,
                    result              TEXT,
                    error               TEXT,
                    approval_required   INTEGER NOT NULL DEFAULT 0,
                    approval_given      INTEGER,                -- NULL=pending 1=yes 0=no
                    user_id             TEXT,
                    priority            INTEGER NOT NULL DEFAULT 5  -- 1=high 10=low
                );
                CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status, created_at);

                CREATE TABLE IF NOT EXISTS schedules (
                    id              TEXT    PRIMARY KEY,
                    cron_expression TEXT    NOT NULL,
                    command         TEXT    NOT NULL,
                    args            TEXT,
                    enabled         INTEGER NOT NULL DEFAULT 1,
                    last_run        TEXT,
                    next_run        TEXT,
                    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
                    description     TEXT
                );
                """
            )
            await db.commit()
        logger.info("[TaskQueue] Tables ready.")

    # ── Write operations ──────────────────────────────────────────────────────

    async def add_task(
        self,
        command: str,
        args: Optional[Dict[str, Any]] = None,
        approval_required: bool = False,
        user_id: Optional[str] = None,
        priority: int = 5,
    ) -> str:
        """
        Add a new task to the queue.

        Returns the task UUID string.
        """
        task_id = str(uuid.uuid4())
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                INSERT INTO tasks (id, command, args, approval_required, user_id, priority)
                VALUES (?,?,?,?,?,?)
                """,
                (
                    task_id,
                    command,
                    json.dumps(args or {}),
                    int(approval_required),
                    user_id,
                    priority,
                ),
            )
            await db.commit()
        logger.info(f"[TaskQueue] Added task {task_id[:8]}: {command}")
        return task_id

    async def update_status(
        self,
        task_id: str,
        status: str,
        result: Optional[str] = None,
        error: Optional[str] = None,
    ) -> None:
        """Update task status and optional result/error."""
        now = datetime.utcnow().isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            if status == STATUS_IN_PROGRESS:
                await db.execute(
                    "UPDATE tasks SET status=?, started_at=? WHERE id=?",
                    (status, now, task_id),
                )
            elif status in (STATUS_DONE, STATUS_FAILED, STATUS_CANCELLED):
                await db.execute(
                    "UPDATE tasks SET status=?, completed_at=?, result=?, error=? WHERE id=?",
                    (status, now, result, error, task_id),
                )
            else:
                await db.execute(
                    "UPDATE tasks SET status=? WHERE id=?", (status, task_id)
                )
            await db.commit()

    async def set_approval(self, task_id: str, approved: bool) -> None:
        """Record the user's approval decision for a waiting task."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "UPDATE tasks SET approval_given=?, status=? WHERE id=?",
                (int(approved), STATUS_PENDING if approved else STATUS_CANCELLED, task_id),
            )
            await db.commit()
        logger.info(
            f"[TaskQueue] Task {task_id[:8]} {'approved' if approved else 'cancelled'}."
        )

    # ── Read operations ───────────────────────────────────────────────────────

    async def get_next_pending(self) -> Optional[Dict[str, Any]]:
        """
        Fetch the next pending task (highest priority, oldest first).
        Skips tasks that need approval and haven't been approved yet.
        """
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                """
                SELECT * FROM tasks
                WHERE status = ?
                  AND (approval_required = 0 OR approval_given = 1)
                ORDER BY priority ASC, created_at ASC
                LIMIT 1
                """,
                (STATUS_PENDING,),
            ) as cur:
                row = await cur.fetchone()
        if row is None:
            return None
        d = dict(row)
        d["args"] = json.loads(d.get("args") or "{}")
        return d

    async def get_all_tasks(
        self, limit: int = 50, status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Return recent tasks (newest first)."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            if status:
                async with db.execute(
                    "SELECT * FROM tasks WHERE status=? ORDER BY created_at DESC LIMIT ?",
                    (status, limit),
                ) as cur:
                    rows = await cur.fetchall()
            else:
                async with db.execute(
                    "SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?", (limit,)
                ) as cur:
                    rows = await cur.fetchall()
        return [dict(r) for r in rows]

    async def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT * FROM tasks WHERE id=?", (task_id,)
            ) as cur:
                row = await cur.fetchone()
        return dict(row) if row else None

    async def get_status_summary(self) -> Dict[str, int]:
        """Count tasks by status."""
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT status, COUNT(*) as n FROM tasks GROUP BY status"
            ) as cur:
                rows = await cur.fetchall()
        return {row[0]: row[1] for row in rows}

    # ── Worker ────────────────────────────────────────────────────────────────

    def set_process_fn(self, fn: Callable) -> None:
        """
        Register the async function called for each task.
        Signature: async fn(task_id, command, args) -> str
        """
        self._process_fn = fn

    async def start_worker(self) -> None:
        """Start the background task worker. Call once on daemon startup."""
        if self._running:
            return
        self._running = True
        self._worker_task = asyncio.create_task(self._worker_loop())
        logger.info("[TaskQueue] Worker started.")

    async def stop_worker(self) -> None:
        self._running = False
        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
        logger.info("[TaskQueue] Worker stopped.")

    async def _worker_loop(self) -> None:
        """Process pending tasks one by one, forever."""
        while self._running:
            try:
                task = await self.get_next_pending()
                if task is None:
                    await asyncio.sleep(2)
                    continue

                task_id = task["id"]
                command = task["command"]
                args = task["args"]

                await self.update_status(task_id, STATUS_IN_PROGRESS)
                logger.info(f"[TaskQueue] Processing task {task_id[:8]}: {command}")

                if self._process_fn is None:
                    await self.update_status(
                        task_id, STATUS_FAILED, error="No process_fn registered"
                    )
                    continue

                try:
                    result = await self._process_fn(task_id, command, args)
                    await self.update_status(task_id, STATUS_DONE, result=str(result))
                    logger.info(f"[TaskQueue] Task {task_id[:8]} done.")
                except Exception as exc:
                    logger.error(
                        f"[TaskQueue] Task {task_id[:8]} failed: {exc}", exc_info=True
                    )
                    await self.update_status(task_id, STATUS_FAILED, error=str(exc))

            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.error(f"[TaskQueue] Worker loop error: {exc}", exc_info=True)
                await asyncio.sleep(5)


# ---------------------------------------------------------------------------
# Scheduler
# ---------------------------------------------------------------------------

class Scheduler:
    """
    Cron-based task scheduler for Sam.

    Checks the `schedules` table every 60 seconds.
    Fires tasks by adding them to the TaskQueue.

    Natural language → cron mapping is handled by sam/agent/graph.py
    (the LLM extracts the cron expression from user input).
    """

    def __init__(self, queue: TaskQueue, check_interval: int = 60):
        self.queue = queue
        self.check_interval = check_interval
        self._task: Optional[asyncio.Task] = None
        self._running = False

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._loop())
        logger.info("[Scheduler] Started.")

    async def stop(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _loop(self) -> None:
        """Check every `check_interval` seconds for due schedules."""
        while self._running:
            try:
                await self._fire_due()
            except Exception as exc:
                logger.error(f"[Scheduler] Loop error: {exc}", exc_info=True)
            await asyncio.sleep(self.check_interval)

    async def _fire_due(self) -> None:
        now_str = datetime.utcnow().isoformat()
        async with aiosqlite.connect(self.queue.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT * FROM schedules WHERE enabled=1 AND (next_run IS NULL OR next_run <= ?)",
                (now_str,),
            ) as cur:
                due = await cur.fetchall()

        for sched in due:
            s = dict(sched)
            logger.info(
                f"[Scheduler] Firing schedule '{s['id']}': {s['command']}"
            )
            args = json.loads(s.get("args") or "{}")
            await self.queue.add_task(
                command=s["command"],
                args=args,
                priority=3,  # scheduled tasks get elevated priority
            )
            # Compute next run
            try:
                cron = croniter(s["cron_expression"], datetime.utcnow())
                next_run = cron.get_next(datetime).isoformat()
            except Exception:
                next_run = None

            async with aiosqlite.connect(self.queue.db_path) as db:
                await db.execute(
                    "UPDATE schedules SET last_run=?, next_run=? WHERE id=?",
                    (now_str, next_run, s["id"]),
                )
                await db.commit()

    # ── Schedule management ───────────────────────────────────────────────────

    async def add_schedule(
        self,
        cron_expression: str,
        command: str,
        args: Optional[Dict] = None,
        description: str = "",
    ) -> str:
        """Add a new cron schedule. Returns schedule_id."""
        sched_id = str(uuid.uuid4())[:8]
        try:
            cron = croniter(cron_expression, datetime.utcnow())
            next_run = cron.get_next(datetime).isoformat()
        except Exception as exc:
            raise ValueError(f"Invalid cron expression '{cron_expression}': {exc}")

        async with aiosqlite.connect(self.queue.db_path) as db:
            await db.execute(
                """
                INSERT INTO schedules (id, cron_expression, command, args, next_run, description)
                VALUES (?,?,?,?,?,?)
                """,
                (sched_id, cron_expression, command, json.dumps(args or {}), next_run, description),
            )
            await db.commit()
        logger.info(
            f"[Scheduler] Added schedule {sched_id}: '{cron_expression}' → {command}"
        )
        return sched_id

    async def list_schedules(self) -> List[Dict]:
        async with aiosqlite.connect(self.queue.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM schedules ORDER BY next_run") as cur:
                return [dict(r) for r in await cur.fetchall()]

    async def disable_schedule(self, sched_id: str) -> None:
        async with aiosqlite.connect(self.queue.db_path) as db:
            await db.execute(
                "UPDATE schedules SET enabled=0 WHERE id=?", (sched_id,)
            )
            await db.commit()

    async def delete_schedule(self, sched_id: str) -> None:
        async with aiosqlite.connect(self.queue.db_path) as db:
            await db.execute("DELETE FROM schedules WHERE id=?", (sched_id,))
            await db.commit()

    # ── Built-in schedules ────────────────────────────────────────────────────

    async def install_default_schedules(self) -> None:
        """
        Install Sam's default cron schedules on first run.
        Idempotent — checks for existing schedules first.
        """
        schedules = await self.list_schedules()
        existing_commands = {s["command"] for s in schedules}

        defaults = [
            ("0 9 * * *",  "get_system_info", {}, "Daily 9am system status"),
            ("0 21 * * *", "daily_audit",     {}, "Daily 9pm audit summary"),
            ("0 */6 * * *","prune_memories",  {}, "Every 6h memory prune"),
        ]
        for cron_expr, cmd, args, desc in defaults:
            if cmd not in existing_commands:
                await self.add_schedule(cron_expr, cmd, args, desc)
                logger.info(f"[Scheduler] Installed default schedule: {desc}")
