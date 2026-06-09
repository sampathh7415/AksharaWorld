"""
sam/agent/memory.py — Sam's persistent memory system.

SHORT-TERM: SQLite `conversations` table (last 50 exchanges in context).
LONG-TERM: SQLite `memories` table with fastembed vector embeddings for
           semantic retrieval before each response.

Usage:
    from sam.agent.memory import MemoryManager
    mm = MemoryManager()
    await mm.init()
    await mm.add_conversation("user", "Hello Sam!")
    memories = await mm.search_memories("greeting")
    context = await mm.get_short_term_context()
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import aiosqlite
import numpy as np

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
DB_PATH = os.getenv("SAM_MEMORY_DB", "./sam-data/sam.db")
SHORT_TERM_LIMIT = int(os.getenv("SAM_SHORT_TERM_LIMIT", "50"))
PRUNE_DAYS = int(os.getenv("SAM_MEMORY_PRUNE_DAYS", "30"))
EMBEDDING_MODEL = os.getenv(
    "SAM_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
)

# ---------------------------------------------------------------------------
# Lazy embedding loader — uses fastembed (already in requirements.txt)
# ---------------------------------------------------------------------------
_embed_model = None
_embed_lock = asyncio.Lock()


async def _get_embed_model():
    """Load fastembed model once; thread-safe."""
    global _embed_model
    if _embed_model is not None:
        return _embed_model
    async with _embed_lock:
        if _embed_model is not None:
            return _embed_model
        try:
            from fastembed import TextEmbedding  # type: ignore

            logger.info(f"[Memory] Loading embedding model: {EMBEDDING_MODEL}")
            _embed_model = await asyncio.to_thread(
                TextEmbedding, model_name=EMBEDDING_MODEL
            )
            logger.info("[Memory] Embedding model loaded.")
        except ImportError:
            logger.warning(
                "[Memory] fastembed not installed — falling back to keyword search."
            )
            _embed_model = None
    return _embed_model


async def _embed(text: str) -> Optional[List[float]]:
    """Embed a single text string. Returns None if embedding unavailable."""
    model = await _get_embed_model()
    if model is None:
        return None
    try:
        vectors = await asyncio.to_thread(
            lambda: list(model.embed([text]))
        )
        return vectors[0].tolist()
    except Exception as exc:
        logger.warning(f"[Memory] Embedding failed: {exc}")
        return None


def _cosine_sim(a: List[float], b: List[float]) -> float:
    """Cosine similarity between two vectors."""
    va, vb = np.array(a, dtype=np.float32), np.array(b, dtype=np.float32)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    return float(np.dot(va, vb) / denom) if denom > 0 else 0.0


# ---------------------------------------------------------------------------
# MemoryManager
# ---------------------------------------------------------------------------
class MemoryManager:
    """
    Manages Sam's short-term conversation history and long-term semantic memory.

    Tables created on `init()`:
      conversations   — rolling window of recent messages
      memories        — long-term facts with embedding vector
      scheduled_tasks — cron / one-shot scheduled commands
    """

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)

    # ── Lifecycle ────────────────────────────────────────────────────────────

    async def init(self) -> None:
        """Create tables if they don't exist."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.executescript(
                """
                PRAGMA journal_mode=WAL;
                PRAGMA foreign_keys=ON;

                CREATE TABLE IF NOT EXISTS conversations (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp   TEXT    NOT NULL DEFAULT (datetime('now')),
                    role        TEXT    NOT NULL,          -- user | assistant | tool
                    content     TEXT    NOT NULL,
                    tool_calls  TEXT,                      -- JSON blob or NULL
                    session_id  TEXT    NOT NULL DEFAULT 'default'
                );
                CREATE INDEX IF NOT EXISTS idx_conv_ts ON conversations(timestamp DESC);

                CREATE TABLE IF NOT EXISTS memories (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp   TEXT    NOT NULL DEFAULT (datetime('now')),
                    content     TEXT    NOT NULL,
                    category    TEXT    NOT NULL DEFAULT 'general', -- fact | preference | task | general
                    embedding   TEXT,                      -- JSON float array or NULL
                    metadata    TEXT                       -- JSON dict
                );
                CREATE INDEX IF NOT EXISTS idx_mem_ts ON memories(timestamp DESC);

                CREATE TABLE IF NOT EXISTS scheduled_tasks (
                    id              TEXT    PRIMARY KEY,
                    cron_expression TEXT,                  -- NULL = one-shot
                    command         TEXT    NOT NULL,
                    enabled         INTEGER NOT NULL DEFAULT 1,
                    last_run        TEXT,
                    next_run        TEXT,
                    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
                );
                """
            )
            await db.commit()
        logger.info(f"[Memory] Database ready: {self.db_path}")

    # ── Short-term: Conversations ────────────────────────────────────────────

    async def add_conversation(
        self,
        role: str,
        content: str,
        tool_calls: Optional[Any] = None,
        session_id: str = "default",
    ) -> None:
        """Add a message to the conversation history."""
        tool_json = json.dumps(tool_calls) if tool_calls is not None else None
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO conversations (role, content, tool_calls, session_id) VALUES (?,?,?,?)",
                (role, content, tool_json, session_id),
            )
            await db.commit()

    async def get_short_term_context(
        self, limit: int = SHORT_TERM_LIMIT, session_id: str = "default"
    ) -> List[Dict[str, str]]:
        """
        Return the last `limit` conversation turns for the given session,
        formatted as LangChain-style messages [{"role": ..., "content": ...}].
        """
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                """
                SELECT role, content, tool_calls FROM conversations
                WHERE session_id = ?
                ORDER BY id DESC LIMIT ?
                """,
                (session_id, limit),
            ) as cursor:
                rows = await cursor.fetchall()

        messages = []
        for row in reversed(rows):  # chronological order
            msg: Dict[str, Any] = {"role": row["role"], "content": row["content"]}
            if row["tool_calls"]:
                msg["tool_calls"] = json.loads(row["tool_calls"])
            messages.append(msg)
        return messages

    async def clear_session(self, session_id: str = "default") -> None:
        """Delete all conversation history for a session."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "DELETE FROM conversations WHERE session_id = ?", (session_id,)
            )
            await db.commit()

    # ── Long-term: Semantic Memory ────────────────────────────────────────────

    async def add_to_memory(
        self,
        content: str,
        category: str = "general",
        metadata: Optional[Dict] = None,
    ) -> int:
        """
        Store a fact/preference/task in long-term memory with an embedding vector.
        Returns the row id of the inserted memory.
        """
        embedding = await _embed(content)
        embed_json = json.dumps(embedding) if embedding else None
        meta_json = json.dumps(metadata) if metadata else None

        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                "INSERT INTO memories (content, category, embedding, metadata) VALUES (?,?,?,?)",
                (content, category, embed_json, meta_json),
            )
            await db.commit()
            row_id = cursor.lastrowid

        logger.debug(f"[Memory] Stored memory #{row_id}: {content[:60]}...")
        return row_id

    async def search_memories(
        self, query: str, k: int = 5, category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve the top-k most relevant memories for `query`.
        Uses cosine similarity when embeddings available, otherwise
        falls back to SQLite LIKE keyword search.
        """
        query_embedding = await _embed(query)

        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            if category:
                async with db.execute(
                    "SELECT * FROM memories WHERE category = ? ORDER BY id DESC LIMIT 500",
                    (category,),
                ) as cur:
                    rows = await cur.fetchall()
            else:
                async with db.execute(
                    "SELECT * FROM memories ORDER BY id DESC LIMIT 500"
                ) as cur:
                    rows = await cur.fetchall()

        if not rows:
            return []

        results = []
        for row in rows:
            d = dict(row)
            if query_embedding and d.get("embedding"):
                stored_emb = json.loads(d["embedding"])
                score = _cosine_sim(query_embedding, stored_emb)
            else:
                # keyword fallback
                score = 1.0 if query.lower() in d["content"].lower() else 0.0
            d["score"] = score
            d.pop("embedding", None)  # don't send raw vectors to LLM
            results.append(d)

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:k]

    async def delete_memory(self, memory_id: int) -> None:
        """Delete a specific memory by id."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
            await db.commit()

    # ── Maintenance ───────────────────────────────────────────────────────────

    async def prune_old_memories(self, days: int = PRUNE_DAYS) -> int:
        """
        Delete memories older than `days` days.
        Returns the number of rows deleted.
        """
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                "DELETE FROM memories WHERE timestamp < ?", (cutoff,)
            )
            await db.commit()
            count = cursor.rowcount
        if count:
            logger.info(f"[Memory] Pruned {count} memories older than {days} days.")
        return count

    async def prune_conversations(
        self, keep: int = SHORT_TERM_LIMIT * 2, session_id: str = "default"
    ) -> int:
        """Keep only the most recent `keep` conversation rows per session."""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                """
                DELETE FROM conversations
                WHERE session_id = ?
                AND id NOT IN (
                    SELECT id FROM conversations
                    WHERE session_id = ?
                    ORDER BY id DESC LIMIT ?
                )
                """,
                (session_id, session_id, keep),
            )
            await db.commit()
            return cursor.rowcount

    async def get_stats(self) -> Dict[str, int]:
        """Return memory statistics."""
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("SELECT COUNT(*) FROM conversations") as cur:
                conv_count = (await cur.fetchone())[0]
            async with db.execute("SELECT COUNT(*) FROM memories") as cur:
                mem_count = (await cur.fetchone())[0]
        return {"conversations": conv_count, "memories": mem_count}

    # ── Scheduled tasks table helpers ─────────────────────────────────────────

    async def add_schedule(
        self,
        task_id: str,
        command: str,
        cron_expression: Optional[str] = None,
        next_run: Optional[str] = None,
    ) -> None:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                INSERT OR REPLACE INTO scheduled_tasks
                  (id, cron_expression, command, next_run)
                VALUES (?,?,?,?)
                """,
                (task_id, cron_expression, command, next_run),
            )
            await db.commit()

    async def get_schedules(self) -> List[Dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT * FROM scheduled_tasks WHERE enabled = 1"
            ) as cur:
                return [dict(r) for r in await cur.fetchall()]
