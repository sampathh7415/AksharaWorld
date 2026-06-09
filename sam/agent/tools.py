"""
sam/agent/tools.py — LangChain tool definitions for Sam.

9 tools registered in LangChain @tool format with:
  - name, description, parameters
  - risk_level annotation (used by ToolExecutor)
  - timeout / path safety enforced by ToolExecutor, not here

Each tool here is a pure async function.  ToolExecutor wraps them
with timeout, retry, approval, and audit logging.

Registration happens in sam/agent/graph.py via build_tool_registry().
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import platform
import subprocess
from pathlib import Path
from typing import List, Optional

import aiofiles
import psutil
from langchain_core.tools import tool

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Shared path validator (module-level singleton — set by graph.py)
# ---------------------------------------------------------------------------
_path_validator = None
_command_guard = None

def set_validators(path_validator, command_guard):
    global _path_validator, _command_guard
    _path_validator = path_validator
    _command_guard = command_guard


def _validate_path(p: str) -> str:
    if _path_validator:
        _path_validator.assert_valid(p)
    return p


def _validate_command(cmd: str, override: bool = False) -> str:
    if _command_guard:
        _command_guard.assert_safe(cmd, override=override)
    return cmd


# ===========================================================================
# 1. run_terminal — MEDIUM risk
# ===========================================================================
@tool
async def run_terminal(command: str, cwd: Optional[str] = None, override: bool = False) -> str:
    """
    Execute a shell command in a sandboxed directory.

    Args:
        command:  Shell command to run (e.g. 'ls -la', 'python script.py')
        cwd:      Working directory (must be within allowed paths)
        override: Set True to run blocked commands (requires HIGH-risk approval)

    Returns:
        Combined stdout and stderr output (capped at 2000 chars by ToolExecutor).

    Risk: MEDIUM — write access, but limited to allowed paths.
    """
    _validate_command(command, override=override)
    if cwd:
        _validate_path(cwd)

    try:
        proc = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=cwd,
        )
        stdout, stderr = await proc.communicate()
        out = stdout.decode("utf-8", errors="replace")
        err = stderr.decode("utf-8", errors="replace")
        combined = (out + ("\n[stderr]\n" + err if err else "")).strip()
        exit_info = f"\n[exit code: {proc.returncode}]"
        return combined + exit_info
    except FileNotFoundError:
        return f"[Error] Command not found or cwd doesn't exist: {command}"
    except Exception as exc:
        return f"[Error] {exc}"


# ===========================================================================
# 2. browse — LOW risk
# ===========================================================================
@tool
async def browse(url: str, extract_text: bool = True, screenshot: bool = False) -> str:
    """
    Open a URL in a headless browser and return its text content.

    Args:
        url:           Full URL to browse (e.g. 'https://example.com')
        extract_text:  If True, return the page's text content (default).
        screenshot:    If True, save a screenshot to sam-data/screenshots/.

    Returns:
        Page text content or error message.

    Risk: LOW — read-only web browsing.
    """
    try:
        from playwright.async_api import async_playwright  # type: ignore

        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle", timeout=55_000)

            result = ""
            if extract_text:
                result = await page.inner_text("body")

            if screenshot:
                ss_dir = "./sam-data/screenshots"
                os.makedirs(ss_dir, exist_ok=True)
                fname = url.split("//")[-1].replace("/", "_")[:60] + ".png"
                await page.screenshot(path=os.path.join(ss_dir, fname), full_page=True)
                result += f"\n[Screenshot saved: {ss_dir}/{fname}]"

            await browser.close()
            return result or "(empty page)"

    except ImportError:
        # Fallback: httpx plain text fetch
        try:
            import httpx
            async with httpx.AsyncClient(follow_redirects=True, timeout=55) as client:
                resp = await client.get(url, headers={"User-Agent": "Sam/1.0"})
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(resp.text, "html.parser")
                return soup.get_text(separator="\n", strip=True)
        except Exception as exc:
            return f"[Browse Error] {exc}"
    except Exception as exc:
        return f"[Browse Error] {exc}"


# ===========================================================================
# 3. read_file — LOW risk
# ===========================================================================
@tool
async def read_file(path: str, lines: Optional[str] = None) -> str:
    """
    Read a file and return its contents.

    Args:
        path:  Absolute or relative path to the file.
        lines: Optional line range, e.g. '1-50' or '100-200'.

    Returns:
        File contents as a string.

    Risk: LOW — read-only.
    """
    _validate_path(path)
    try:
        async with aiofiles.open(path, "r", encoding="utf-8", errors="replace") as f:
            content = await f.read()

        if lines:
            # Parse line range
            parts = lines.split("-")
            start = int(parts[0]) - 1
            end = int(parts[1]) if len(parts) > 1 else start + 1
            content_lines = content.splitlines()
            content = "\n".join(content_lines[start:end])

        return content or "(empty file)"
    except FileNotFoundError:
        return f"[Error] File not found: {path}"
    except PermissionError:
        return f"[Error] Permission denied: {path}"
    except Exception as exc:
        return f"[Error] {exc}"


# ===========================================================================
# 4. write_file — HIGH risk
# ===========================================================================
@tool
async def write_file(path: str, content: str) -> str:
    """
    Write content to a file (creates or overwrites).

    Args:
        path:    File path to write to.
        content: Text content to write.

    Returns:
        Confirmation message.

    Risk: HIGH — requires Telegram 2-factor approval.
    """
    _validate_path(path)
    try:
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        async with aiofiles.open(path, "w", encoding="utf-8") as f:
            await f.write(content)
        size = len(content.encode("utf-8"))
        return f"✓ Written {size:,} bytes to {path}"
    except PermissionError:
        return f"[Error] Permission denied: {path}"
    except Exception as exc:
        return f"[Error] {exc}"


# ===========================================================================
# 5. delete_file — HIGH risk
# ===========================================================================
@tool
async def delete_file(path: str) -> str:
    """
    Move a file to the trash (safe delete — NOT permanent delete).

    Args:
        path: File or directory to delete.

    Returns:
        Confirmation or error message.

    Risk: HIGH — requires Telegram 2-factor approval.
    Note: Uses send2trash for reversible deletion.
    """
    _validate_path(path)
    try:
        import send2trash  # type: ignore
        send2trash.send2trash(path)
        return f"✓ Moved to trash: {path}"
    except ImportError:
        # Fallback — rename to .bak instead
        bak = path + f".bak_{int(asyncio.get_event_loop().time())}"
        os.rename(path, bak)
        return f"✓ Renamed to {bak} (send2trash not installed — not permanently deleted)"
    except FileNotFoundError:
        return f"[Error] File not found: {path}"
    except Exception as exc:
        return f"[Error] {exc}"


# ===========================================================================
# 6. send_email — MEDIUM risk
# ===========================================================================
@tool
async def send_email(to: str, subject: str, body: str) -> str:
    """
    Compose and optionally send an email.

    In draft mode (SAM_EMAIL_CAN_SEND=false), creates a draft and
    notifies you on Telegram — you must approve the final send.
    In live mode (SAM_EMAIL_CAN_SEND=true), sends immediately after
    MEDIUM approval.

    Args:
        to:      Recipient email address.
        subject: Email subject line.
        body:    Plain-text email body.

    Returns:
        Status message.

    Risk: MEDIUM — requires single Telegram approval.
    """
    can_send = os.getenv("SAM_EMAIL_CAN_SEND", "false").lower() == "true"

    if not can_send:
        draft_info = (
            f"📧 *Email Draft (not sent)*\n"
            f"To: {to}\nSubject: {subject}\n\n{body[:500]}"
        )
        return f"[Draft mode] Email composed but NOT sent.\n\n{draft_info}"

    # Live send via SMTP
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")
    smtp_from = os.getenv("SMTP_FROM", smtp_user)

    try:
        import aiosmtplib  # type: ignore
        from email.message import EmailMessage

        msg = EmailMessage()
        msg["From"] = smtp_from
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body)

        await aiosmtplib.send(
            msg,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_pass,
            start_tls=True,
        )
        return f"✓ Email sent to {to} — Subject: {subject}"
    except Exception as exc:
        return f"[Email Error] {exc}"


# ===========================================================================
# 7. list_directory — LOW risk
# ===========================================================================
@tool
async def list_directory(path: str = ".", show_hidden: bool = False) -> str:
    """
    List files and directories at the given path.

    Args:
        path:        Directory path to list.
        show_hidden: Include hidden files (starting with '.').

    Returns:
        Formatted directory listing.

    Risk: LOW — read-only.
    """
    _validate_path(path)
    try:
        p = Path(path)
        if not p.exists():
            return f"[Error] Path does not exist: {path}"
        if not p.is_dir():
            return f"[Error] Not a directory: {path}"

        items = sorted(p.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
        lines = [f"📁 {p.resolve()}\n"]
        for item in items:
            if not show_hidden and item.name.startswith("."):
                continue
            if item.is_dir():
                lines.append(f"  📂 {item.name}/")
            else:
                size = item.stat().st_size
                size_str = (
                    f"{size/1024:.1f}KB" if size > 1024 else f"{size}B"
                ) if size < 1024*1024 else f"{size/1024/1024:.1f}MB"
                lines.append(f"  📄 {item.name}  ({size_str})")

        return "\n".join(lines) if len(lines) > 1 else f"📁 {p.resolve()}\n  (empty)"
    except PermissionError:
        return f"[Error] Permission denied: {path}"
    except Exception as exc:
        return f"[Error] {exc}"


# ===========================================================================
# 8. search_files — LOW risk
# ===========================================================================
@tool
async def search_files(query: str, directory: str = ".", file_pattern: str = "*") -> str:
    """
    Search for files matching a query (filename or content search).

    Args:
        query:        Search term (searches filenames and file contents).
        directory:    Root directory to search.
        file_pattern: Glob pattern to filter files (e.g. '*.py', '*.md').

    Returns:
        List of matching files with context snippets.

    Risk: LOW — read-only.
    """
    _validate_path(directory)
    try:
        root = Path(directory)
        matches = []
        query_lower = query.lower()

        for file_path in root.rglob(file_pattern):
            if not file_path.is_file():
                continue
            # Check filename match
            if query_lower in file_path.name.lower():
                matches.append(f"📄 {file_path} (filename match)")
                continue
            # Check content match (text files only, skip binaries)
            try:
                async with aiofiles.open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = await f.read(10_000)  # read first 10KB only
                if query_lower in content.lower():
                    # Find surrounding context
                    idx = content.lower().find(query_lower)
                    snippet = content[max(0, idx-50):idx+100].replace("\n", " ")
                    matches.append(f"📄 {file_path}\n   ...{snippet}...")
            except Exception:
                pass

            if len(matches) >= 20:
                matches.append("(truncated — first 20 matches shown)")
                break

        if not matches:
            return f"No files matching '{query}' found in {directory}"
        return f"🔍 Search results for '{query}':\n\n" + "\n".join(matches)
    except Exception as exc:
        return f"[Search Error] {exc}"


# ===========================================================================
# 9. get_system_info — LOW risk
# ===========================================================================
@tool
async def get_system_info() -> str:
    """
    Get current system resource usage (CPU, RAM, disk, battery, network).

    Returns:
        Formatted system information report.

    Risk: LOW — read-only.
    """
    try:
        # CPU
        cpu_percent = psutil.cpu_percent(interval=0.5)
        cpu_count = psutil.cpu_count(logical=True)
        cpu_freq = psutil.cpu_freq()
        freq_str = f"{cpu_freq.current:.0f}MHz" if cpu_freq else "N/A"

        # RAM
        ram = psutil.virtual_memory()
        ram_used = ram.used / 1024**3
        ram_total = ram.total / 1024**3

        # Disk
        disk = psutil.disk_usage("/")
        disk_used = disk.used / 1024**3
        disk_total = disk.total / 1024**3

        # Battery
        battery = psutil.sensors_battery()
        if battery:
            bat_str = (
                f"{battery.percent:.0f}% "
                f"({'charging' if battery.power_plugged else 'discharging'})"
            )
        else:
            bat_str = "N/A (desktop)"

        # Network
        net = psutil.net_io_counters()
        net_sent = net.bytes_sent / 1024**2
        net_recv = net.bytes_recv / 1024**2

        # OS info
        os_name = platform.system()
        os_ver = platform.version()[:60]

        report = (
            f"🖥️ *System Status*\n"
            f"OS: {os_name} — {os_ver}\n\n"
            f"⚡ CPU: {cpu_percent:.1f}% ({cpu_count} cores @ {freq_str})\n"
            f"🧠 RAM: {ram_used:.1f}/{ram_total:.1f} GB ({ram.percent:.0f}%)\n"
            f"💾 Disk: {disk_used:.1f}/{disk_total:.1f} GB ({disk.percent:.0f}%)\n"
            f"🔋 Battery: {bat_str}\n"
            f"🌐 Network: ↑{net_sent:.1f}MB ↓{net_recv:.1f}MB"
        )
        return report
    except Exception as exc:
        return f"[System Info Error] {exc}"


# ===========================================================================
# Tool registry builder
# ===========================================================================
ALL_TOOLS = [
    run_terminal,
    browse,
    read_file,
    write_file,
    delete_file,
    send_email,
    list_directory,
    search_files,
    get_system_info,
]


def build_tool_registry(executor) -> dict:
    """
    Register all tool implementations with the ToolExecutor.
    Returns a dict of name → LangChain tool for LangGraph.
    """
    for lc_tool in ALL_TOOLS:
        name = lc_tool.name
        # Get the underlying async function from the LangChain tool
        async def make_fn(t=lc_tool):
            async def _fn(**kwargs):
                return await t.ainvoke(kwargs)
            return _fn
        # We'll register the coroutine-based fn
        executor.register(name, lc_tool.coroutine)

    return {t.name: t for t in ALL_TOOLS}
