"""
tests/sam/test_scheduler.py — Unit tests for TaskQueue and Scheduler.

Run with:
    pytest tests/sam/test_scheduler.py -v
"""

import asyncio
import os
import tempfile
from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio


@pytest.fixture
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def queue():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        db_path = tmp.name
    os.environ["SAM_MEMORY_DB"] = db_path

    from sam.agent.scheduler import TaskQueue
    q = TaskQueue(db_path=db_path)
    await q.init()
    yield q

    try:
        os.remove(db_path)
    except Exception:
        pass


@pytest_asyncio.fixture
async def scheduler(queue):
    from sam.agent.scheduler import Scheduler
    s = Scheduler(queue, check_interval=99999)  # disable auto-check
    yield s


# ── TaskQueue tests ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_add_task(queue):
    task_id = await queue.add_task("get_system_info", priority=3)
    assert isinstance(task_id, str) and len(task_id) > 0

    task = await queue.get_task(task_id)
    assert task is not None
    assert task["command"] == "get_system_info"
    assert task["status"] == "pending"
    assert task["priority"] == 3


@pytest.mark.asyncio
async def test_get_next_pending_fifo(queue):
    """Tasks should be returned in order of creation time."""
    id1 = await queue.add_task("task_first")
    id2 = await queue.add_task("task_second")

    next_task = await queue.get_next_pending()
    assert next_task["id"] == id1


@pytest.mark.asyncio
async def test_priority_ordering(queue):
    """Higher priority (lower number) tasks should be returned first."""
    low_prio = await queue.add_task("low_prio", priority=9)
    high_prio = await queue.add_task("high_prio", priority=1)

    next_task = await queue.get_next_pending()
    assert next_task["id"] == high_prio


@pytest.mark.asyncio
async def test_update_status(queue):
    task_id = await queue.add_task("test_command")
    await queue.update_status(task_id, "in_progress")

    task = await queue.get_task(task_id)
    assert task["status"] == "in_progress"
    assert task["started_at"] is not None


@pytest.mark.asyncio
async def test_update_status_done(queue):
    task_id = await queue.add_task("test_command")
    await queue.update_status(task_id, "done", result="Task completed!")

    task = await queue.get_task(task_id)
    assert task["status"] == "done"
    assert task["result"] == "Task completed!"
    assert task["completed_at"] is not None


@pytest.mark.asyncio
async def test_approval_flow(queue):
    """Tasks requiring approval should only be returned after approval."""
    task_id = await queue.add_task("risky_command", approval_required=True)

    # Before approval — should not appear in pending
    next_task = await queue.get_next_pending()
    assert next_task is None

    # Grant approval
    await queue.set_approval(task_id, approved=True)

    # Now should appear
    next_task = await queue.get_next_pending()
    assert next_task is not None
    assert next_task["id"] == task_id


@pytest.mark.asyncio
async def test_approval_rejection(queue):
    task_id = await queue.add_task("risky_command", approval_required=True)
    await queue.set_approval(task_id, approved=False)

    task = await queue.get_task(task_id)
    assert task["status"] == "cancelled"


@pytest.mark.asyncio
async def test_get_status_summary(queue):
    await queue.add_task("task1")
    await queue.add_task("task2")
    task3 = await queue.add_task("task3")
    await queue.update_status(task3, "done")

    summary = await queue.get_status_summary()
    assert summary.get("pending", 0) == 2
    assert summary.get("done", 0) == 1


@pytest.mark.asyncio
async def test_worker_processes_tasks(queue):
    """Worker should call process_fn for each pending task."""
    processed = []

    async def mock_process(task_id, command, args):
        processed.append(command)
        return "done"

    queue.set_process_fn(mock_process)

    await queue.add_task("cmd_alpha")
    await queue.add_task("cmd_beta")

    await queue.start_worker()
    await asyncio.sleep(0.5)  # let worker process
    await queue.stop_worker()

    assert "cmd_alpha" in processed
    assert "cmd_beta" in processed


# ── Scheduler tests ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_add_schedule(scheduler):
    sched_id = await scheduler.add_schedule(
        cron_expression="0 9 * * *",
        command="get_system_info",
        description="Daily status",
    )
    assert isinstance(sched_id, str) and len(sched_id) > 0

    schedules = await scheduler.list_schedules()
    assert len(schedules) == 1
    assert schedules[0]["command"] == "get_system_info"


@pytest.mark.asyncio
async def test_invalid_cron_raises(scheduler):
    with pytest.raises(ValueError):
        await scheduler.add_schedule(
            cron_expression="not_a_cron",
            command="something",
        )


@pytest.mark.asyncio
async def test_disable_schedule(scheduler):
    sched_id = await scheduler.add_schedule("0 9 * * *", "daily_task")
    await scheduler.disable_schedule(sched_id)

    schedules = await scheduler.list_schedules()
    disabled = next((s for s in schedules if s["id"] == sched_id), None)
    assert disabled is not None
    assert disabled["enabled"] == 0


@pytest.mark.asyncio
async def test_delete_schedule(scheduler):
    sched_id = await scheduler.add_schedule("0 9 * * *", "to_delete")
    await scheduler.delete_schedule(sched_id)

    schedules = await scheduler.list_schedules()
    assert all(s["id"] != sched_id for s in schedules)


@pytest.mark.asyncio
async def test_install_default_schedules(scheduler):
    await scheduler.install_default_schedules()
    schedules = await scheduler.list_schedules()
    commands = {s["command"] for s in schedules}
    assert "get_system_info" in commands
    assert "daily_audit" in commands
    assert "prune_memories" in commands


@pytest.mark.asyncio
async def test_fire_due_adds_to_queue(queue, scheduler):
    """Scheduler should add tasks to queue when cron is due."""
    import datetime

    # Force next_run to the past so it fires immediately
    sched_id = await scheduler.add_schedule("* * * * *", "test_fire_command")

    # Manually set next_run to past
    import aiosqlite
    past = "2000-01-01T00:00:00"
    async with aiosqlite.connect(queue.db_path) as db:
        await db.execute(
            "UPDATE schedules SET next_run=? WHERE id=?", (past, sched_id)
        )
        await db.commit()

    await scheduler._fire_due()

    tasks = await queue.get_all_tasks()
    assert any(t["command"] == "test_fire_command" for t in tasks)
