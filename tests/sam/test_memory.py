"""
tests/sam/test_memory.py — Unit tests for MemoryManager.

Run with:
    pytest tests/sam/test_memory.py -v
"""

import asyncio
import os
import tempfile
from typing import AsyncGenerator

import pytest
import pytest_asyncio

# Use in-memory or temp DB for tests
os.environ.setdefault("SAM_MEMORY_DB", ":memory:")


@pytest.fixture
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def memory_manager():
    """Fresh MemoryManager backed by a temp SQLite file."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        db_path = tmp.name

    from sam.agent.memory import MemoryManager
    mm = MemoryManager(db_path=db_path)
    await mm.init()
    yield mm

    try:
        os.remove(db_path)
    except Exception:
        pass


# ── Conversation tests ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_add_and_retrieve_conversation(memory_manager):
    """Messages added should appear in get_short_term_context."""
    mm = memory_manager
    await mm.add_conversation("user", "Hello Sam!")
    await mm.add_conversation("assistant", "Hello! How can I help?")

    ctx = await mm.get_short_term_context()
    assert len(ctx) == 2
    assert ctx[0]["role"] == "user"
    assert ctx[0]["content"] == "Hello Sam!"
    assert ctx[1]["role"] == "assistant"


@pytest.mark.asyncio
async def test_session_isolation(memory_manager):
    """Messages from different sessions should not mix."""
    mm = memory_manager
    await mm.add_conversation("user", "Session A message", session_id="a")
    await mm.add_conversation("user", "Session B message", session_id="b")

    ctx_a = await mm.get_short_term_context(session_id="a")
    ctx_b = await mm.get_short_term_context(session_id="b")

    assert len(ctx_a) == 1
    assert "Session A" in ctx_a[0]["content"]
    assert len(ctx_b) == 1
    assert "Session B" in ctx_b[0]["content"]


@pytest.mark.asyncio
async def test_conversation_limit(memory_manager):
    """get_short_term_context should respect the limit parameter."""
    mm = memory_manager
    for i in range(20):
        await mm.add_conversation("user", f"Message {i}")

    ctx = await mm.get_short_term_context(limit=5)
    assert len(ctx) == 5
    # Should be the 5 most recent
    assert "Message 19" in ctx[-1]["content"]


@pytest.mark.asyncio
async def test_clear_session(memory_manager):
    mm = memory_manager
    await mm.add_conversation("user", "This will be cleared")
    await mm.clear_session()
    ctx = await mm.get_short_term_context()
    assert len(ctx) == 0


# ── Memory tests ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_add_and_search_memory(memory_manager):
    """Stored memories should be retrievable by keyword search."""
    mm = memory_manager
    mem_id = await mm.add_to_memory(
        "Sam prefers dark mode interfaces",
        category="preference"
    )
    assert isinstance(mem_id, int)

    results = await mm.search_memories("dark mode")
    assert len(results) >= 1
    assert any("dark mode" in r["content"] for r in results)


@pytest.mark.asyncio
async def test_memory_categories(memory_manager):
    mm = memory_manager
    await mm.add_to_memory("User's birthday is in March", category="fact")
    await mm.add_to_memory("User prefers email over SMS", category="preference")

    # Category filter should only return the right category
    facts = await mm.search_memories("birthday", category="fact")
    assert all(r["category"] == "fact" for r in facts)


@pytest.mark.asyncio
async def test_delete_memory(memory_manager):
    mm = memory_manager
    mem_id = await mm.add_to_memory("Temporary memory to delete")
    await mm.delete_memory(mem_id)

    results = await mm.search_memories("Temporary memory")
    assert all(r["id"] != mem_id for r in results)


@pytest.mark.asyncio
async def test_prune_old_memories(memory_manager):
    """Prune with days=0 should remove all memories."""
    mm = memory_manager
    await mm.add_to_memory("Old memory 1")
    await mm.add_to_memory("Old memory 2")
    count = await mm.prune_old_memories(days=0)
    assert count == 2

    stats = await mm.get_stats()
    assert stats["memories"] == 0


# ── Stats ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_stats(memory_manager):
    mm = memory_manager
    await mm.add_conversation("user", "Hi")
    await mm.add_to_memory("A fact")

    stats = await mm.get_stats()
    assert stats["conversations"] == 1
    assert stats["memories"] == 1


# ── Schedule helpers ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_add_schedule(memory_manager):
    mm = memory_manager
    await mm.add_schedule(
        task_id="test-sched-1",
        command="get_system_info",
        cron_expression="0 9 * * *",
        next_run="2030-01-01T09:00:00",
    )
    schedules = await mm.get_schedules()
    assert len(schedules) == 1
    assert schedules[0]["command"] == "get_system_info"
