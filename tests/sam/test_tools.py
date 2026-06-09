"""
tests/sam/test_tools.py — Unit tests for tool definitions and ToolExecutor.

Run with:
    pytest tests/sam/test_tools.py -v
"""

import asyncio
import os
import tempfile
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio


@pytest.fixture
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def executor():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        db_path = tmp.name
    os.environ["SAM_MEMORY_DB"] = db_path

    from sam.agent.security import SecurityManager
    from sam.agent.audit import AuditLogger
    from sam.agent.tool_executor import ToolExecutor

    security = SecurityManager()
    audit = AuditLogger(db_path=db_path)
    await audit.init()

    exe = ToolExecutor(security=security, audit=audit)
    yield exe

    try:
        os.remove(db_path)
    except Exception:
        pass


# ── Tool: get_system_info ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_system_info_returns_info():
    from sam.agent.tools import get_system_info
    result = await get_system_info.ainvoke({})
    assert "CPU" in result
    assert "RAM" in result
    assert "Disk" in result


# ── Tool: list_directory ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_directory_valid():
    from sam.agent.tools import list_directory
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create a test file
        open(os.path.join(tmpdir, "test.txt"), "w").close()
        result = await list_directory.ainvoke({"path": tmpdir})
        assert "test.txt" in result


@pytest.mark.asyncio
async def test_list_directory_not_found():
    from sam.agent.tools import list_directory
    result = await list_directory.ainvoke({"path": "/nonexistent/path/xyz"})
    assert "Error" in result or "not exist" in result


# ── Tool: read_file ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_read_file_valid():
    from sam.agent.tools import read_file
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as tmp:
        tmp.write("Hello, Sam!")
        tmp_path = tmp.name

    try:
        result = await read_file.ainvoke({"path": tmp_path})
        assert "Hello, Sam!" in result
    finally:
        os.remove(tmp_path)


@pytest.mark.asyncio
async def test_read_file_line_range():
    from sam.agent.tools import read_file
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as tmp:
        for i in range(10):
            tmp.write(f"Line {i+1}\n")
        tmp_path = tmp.name

    try:
        result = await read_file.ainvoke({"path": tmp_path, "lines": "2-4"})
        assert "Line 2" in result
        assert "Line 4" in result
        assert "Line 1" not in result
        assert "Line 5" not in result
    finally:
        os.remove(tmp_path)


@pytest.mark.asyncio
async def test_read_file_not_found():
    from sam.agent.tools import read_file
    result = await read_file.ainvoke({"path": "/nonexistent/file.txt"})
    assert "Error" in result or "not found" in result


# ── Tool: write_file ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_write_file_valid():
    from sam.agent.tools import write_file
    with tempfile.TemporaryDirectory() as tmpdir:
        path = os.path.join(tmpdir, "output.txt")
        result = await write_file.ainvoke({"path": path, "content": "Test content"})
        assert "Written" in result
        with open(path) as f:
            assert f.read() == "Test content"


# ── Tool: search_files ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_search_files_finds_content():
    from sam.agent.tools import search_files
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create files with known content
        with open(os.path.join(tmpdir, "doc1.txt"), "w") as f:
            f.write("This file contains SECRET_KEYWORD")
        with open(os.path.join(tmpdir, "doc2.txt"), "w") as f:
            f.write("This file has nothing special")

        result = await search_files.ainvoke({"query": "SECRET_KEYWORD", "directory": tmpdir})
        assert "doc1.txt" in result
        assert "doc2.txt" not in result


@pytest.mark.asyncio
async def test_search_files_no_results():
    from sam.agent.tools import search_files
    with tempfile.TemporaryDirectory() as tmpdir:
        result = await search_files.ainvoke({"query": "XYZNONEXISTENT", "directory": tmpdir})
        assert "No files" in result


# ── ToolExecutor: security checks ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_executor_blocks_on_shutdown(executor):
    from sam.agent.tool_executor import ToolTimeoutError
    executor.security.emergency_shutdown()

    async def noop(**kwargs): return "done"
    executor.register("get_system_info", noop)

    with pytest.raises(PermissionError, match="SHUTDOWN"):
        await executor.execute("get_system_info", {})


@pytest.mark.asyncio
async def test_executor_blocks_unknown_tool(executor):
    """Executing an unknown tool should fail gracefully."""
    # Register nothing, try to execute
    async def noop(**kwargs): return "done"

    with pytest.raises(RuntimeError):
        await executor.execute("nonexistent_tool_xyz", {})


@pytest.mark.asyncio
async def test_executor_auto_reject_high_risk_without_approval(executor):
    """HIGH-risk tools without approval_fn should auto-reject."""
    from sam.agent.tool_executor import ApprovalDeniedError, RISK_HIGH

    # Register a fake write_file
    async def fake_write(**kwargs): return "written"
    executor.register("write_file", fake_write)
    executor._approval_fn = None  # no approval fn

    with pytest.raises(ApprovalDeniedError):
        await executor.execute("write_file", {"path": "/tmp/x", "content": "y"})


@pytest.mark.asyncio
async def test_executor_retry_on_transient_error(executor):
    """Executor should retry up to MAX_RETRIES on transient errors."""
    call_count = 0

    async def flaky(**kwargs):
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise ConnectionError("Transient!")
        return "success after retries"

    executor.register("get_system_info", flaky)

    result = await executor.execute("get_system_info", {})
    assert "success" in result
    assert call_count == 3


# ── Security tests ────────────────────────────────────────────────────────────

def test_path_validator_allows_home():
    from sam.agent.security import PathValidator
    import pathlib
    os.environ["SAM_ALLOWED_PATHS"] = str(pathlib.Path.home())
    validator = PathValidator()
    assert validator.validate(str(pathlib.Path.home() / "documents"))


def test_path_validator_blocks_system_paths():
    from sam.agent.security import PathValidator
    import pathlib
    os.environ["SAM_ALLOWED_PATHS"] = str(pathlib.Path.home())
    validator = PathValidator()
    assert not validator.validate("/etc/passwd")
    assert not validator.validate("C:/Windows/System32")


def test_command_guard_blocks_rm_rf():
    from sam.agent.security import CommandGuard
    guard = CommandGuard()
    assert guard.is_blocked("rm -rf /")
    assert guard.is_blocked("sudo rm -rf /tmp")


def test_command_guard_allows_safe_commands():
    from sam.agent.security import CommandGuard
    guard = CommandGuard()
    assert not guard.is_blocked("ls -la")
    assert not guard.is_blocked("python script.py")
    assert not guard.is_blocked("git status")


def test_session_timeout_locks():
    from sam.agent.security import SecurityManager
    import time
    os.environ["SAM_SESSION_TIMEOUT_MINUTES"] = "0"  # instant timeout
    sm = SecurityManager()
    sm._last_activity = time.monotonic() - 999  # force timeout
    assert sm.check_session_timeout()
    assert sm.is_locked
