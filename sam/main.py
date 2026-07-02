"""
sam/main.py — Sam local agent daemon.

FastAPI server running on :8765 with:
  - REST API: POST /command, GET /status, GET /logs, GET /health
  - WebSocket: /ws/chat  (real-time streaming to dashboard)
  - Static web dashboard: GET / → sam/web_dashboard/index.html

Start: python sam/main.py
       or: uvicorn sam.main:app --host 0.0.0.0 --port 8765 --reload
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, Optional

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Load environment variables from sam.env if available (needed for direct scheduled task execution)
def _load_env():
    env_file = Path(__file__).resolve().parent.parent / "sam.env"
    if not env_file.exists():
        env_file = Path("sam.env")
    if env_file.exists():
        with open(env_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, val = line.partition("=")
                    val_clean = val.partition("#")[0].strip()
                    os.environ.setdefault(key.strip(), val_clean)

_load_env()

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=os.getenv("SAM_LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("sam.main")

# ── Sam agent components ──────────────────────────────────────────────────────
from sam.agent.memory import MemoryManager
from sam.agent.security import SecurityManager
from sam.agent.audit import AuditLogger
from sam.agent.tool_executor import ToolExecutor
from sam.agent.scheduler import TaskQueue, Scheduler
from sam.agent.graph import SamAgent

# ── Globals ───────────────────────────────────────────────────────────────────
agent: Optional[SamAgent] = None
memory: Optional[MemoryManager] = None
security: Optional[SecurityManager] = None
audit: Optional[AuditLogger] = None
task_queue: Optional[TaskQueue] = None
scheduler: Optional[Scheduler] = None
telegram_bot = None

SAM_DATA_DIR = os.getenv("SAM_DATA_DIR", "./sam-data")
os.makedirs(SAM_DATA_DIR, exist_ok=True)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize all Sam components on startup, clean up on shutdown."""
    global agent, memory, security, audit, task_queue, scheduler, telegram_bot

    logger.info("=" * 60)
    logger.info("  Sam Agent Daemon starting…")
    logger.info("=" * 60)

    # Core components
    memory = MemoryManager()
    security = SecurityManager()
    audit = AuditLogger()

    # Task queue
    task_queue = TaskQueue()
    await task_queue.init()
    task_queue.set_process_fn(_process_task)

    # Agent
    agent = SamAgent()
    await agent.init(
        memory_manager=memory,
        security=security,
        audit=audit,
    )

    # Scheduler
    scheduler = Scheduler(task_queue)
    await scheduler.install_default_schedules()
    await scheduler.start()

    # Worker
    await task_queue.start_worker()

    # Telegram bot (optional — starts only if token configured)
    tg_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    if tg_token and tg_token != "123456:ABCDEFghijklmnopqrstuvwxyz":
        try:
            from sam.telegram_bot.bot import SamTelegramBot
            telegram_bot = SamTelegramBot(
                agent=agent,
                task_queue=task_queue,
                security=security,
                audit=audit,
                memory=memory,
                scheduler=scheduler,
            )
            # Inject approval callback into tool_executor
            agent.tool_executor.set_approval_fn(telegram_bot.request_approval)
            asyncio.create_task(telegram_bot.start())
            logger.info("[Main] Telegram bot started.")
        except Exception as exc:
            logger.warning(f"[Main] Telegram bot failed to start: {exc}")
    else:
        logger.info("[Main] No Telegram token — bot disabled.")

    logger.info(f"[Main] Sam daemon ready on port {os.getenv('SAM_PORT', '8765')}")
    logger.info(f"[Main] GPU: {agent._gpu_info}")

    yield

    # Shutdown
    logger.info("[Main] Shutting down…")
    await scheduler.stop()
    await task_queue.stop_worker()
    if telegram_bot:
        try:
            await telegram_bot.stop()
        except Exception:
            pass
    logger.info("[Main] Goodbye.")


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="Sam Agent", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static dashboard
DASHBOARD_DIR = Path(__file__).parent / "web_dashboard"
if DASHBOARD_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(DASHBOARD_DIR)), name="static")


# ── Request models ────────────────────────────────────────────────────────────

class CommandRequest(BaseModel):
    message: str
    session_id: str = "default"
    user_id: Optional[str] = None


class ScheduleRequest(BaseModel):
    cron_expression: str
    command: str
    description: str = ""


# ── Auth helper ───────────────────────────────────────────────────────────────

def _check_secret(request: Request) -> None:
    """Simple bearer-token auth for the web dashboard API."""
    secret = os.getenv("SAM_DASHBOARD_SECRET", "")
    if not secret:
        return  # no secret configured → open
    auth = request.headers.get("Authorization", "")
    if auth != f"Bearer {secret}":
        raise HTTPException(status_code=401, detail="Unauthorized")


# ── REST Endpoints ─────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def serve_dashboard():
    """Serve the web dashboard."""
    html_path = DASHBOARD_DIR / "index.html"
    if html_path.exists():
        return HTMLResponse(html_path.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Sam Dashboard</h1><p>dashboard/index.html not found</p>")


@app.get("/api/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check: verifies Ollama reachability, SQLite, and queue status.
    Returns 200 if healthy, 503 if degraded.
    """
    import httpx
    from datetime import datetime

    ollama_ok = False
    ollama_error = ""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(
                f"{os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')}/api/tags"
            )
            ollama_ok = resp.status_code == 200
    except Exception as exc:
        ollama_error = str(exc)

    sqlite_ok = False
    try:
        stats = await memory.get_stats() if memory else {}
        sqlite_ok = True
    except Exception:
        stats = {}

    queue_stats = {}
    try:
        queue_stats = await task_queue.get_status_summary() if task_queue else {}
    except Exception:
        pass

    status = "healthy" if (ollama_ok and sqlite_ok) else "degraded"
    code = 200 if status == "healthy" else 503

    return JSONResponse(
        {
            "status": status,
            "timestamp": datetime.utcnow().isoformat(),
            "ollama": {"ok": ollama_ok, "error": ollama_error},
            "sqlite": {"ok": sqlite_ok, "stats": stats},
            "queue": queue_stats,
            "gpu": agent._gpu_info if agent else "unknown",
        },
        status_code=code,
    )


@app.post("/api/command")
async def send_command(req: CommandRequest, request: Request) -> Dict[str, Any]:
    """
    Send a text command to Sam.
    Returns Sam's response (blocking, up to 120s).
    For streaming, use the WebSocket endpoint instead.
    """
    _check_secret(request)
    if not agent:
        raise HTTPException(503, "Sam not initialized")

    start = time.monotonic()
    try:
        response = await asyncio.wait_for(
            agent.run(req.message, session_id=req.session_id, user_id=req.user_id),
            timeout=120,
        )
    except asyncio.TimeoutError:
        response = "⏳ Sam is thinking… this is taking longer than expected. Try again."
    except Exception as exc:
        logger.error(f"[API] Command error: {exc}", exc_info=True)
        response = f"⚠️ Error: {exc}"

    return {
        "response": response,
        "duration_ms": int((time.monotonic() - start) * 1000),
        "session_id": req.session_id,
    }


@app.get("/api/status")
async def get_status(request: Request) -> Dict[str, Any]:
    """Sam's current state: pending tasks, last action, resource usage."""
    _check_secret(request)
    import psutil

    recent = await audit.get_recent(1) if audit else []
    queue_summary = await task_queue.get_status_summary() if task_queue else {}
    schedules = await scheduler.list_schedules() if scheduler else []

    cpu = psutil.cpu_percent(interval=0.1)
    ram = psutil.virtual_memory()

    return {
        "locked": security.is_locked if security else False,
        "shutdown": security.is_shutdown if security else False,
        "last_action": recent[0] if recent else None,
        "queue": queue_summary,
        "schedules_count": len([s for s in schedules if s.get("enabled")]),
        "cpu_percent": cpu,
        "ram_percent": ram.percent,
        "gpu": agent._gpu_info if agent else "unknown",
    }


@app.get("/api/logs")
async def get_logs(n: int = 50, request: Request = None) -> Dict[str, Any]:
    """Return the last N audit log entries."""
    if request:
        _check_secret(request)
    entries = await audit.get_recent(n) if audit else []
    return {"logs": entries, "count": len(entries)}


@app.get("/api/tasks")
async def get_tasks(request: Request) -> Dict[str, Any]:
    _check_secret(request)
    tasks = await task_queue.get_all_tasks() if task_queue else []
    return {"tasks": tasks}


@app.post("/api/tasks")
async def create_task(body: Dict[str, Any], request: Request) -> Dict[str, Any]:
    _check_secret(request)
    command = body.get("command", "")
    if not command:
        raise HTTPException(400, "command is required")
    task_id = await task_queue.add_task(
        command=command,
        args=body.get("args"),
        approval_required=body.get("approval_required", False),
    )
    return {"task_id": task_id}


@app.post("/api/tasks/{task_id}/approve")
async def approve_task(task_id: str, body: Dict[str, Any], request: Request):
    _check_secret(request)
    approved = body.get("approved", False)
    await task_queue.set_approval(task_id, approved)
    return {"task_id": task_id, "approved": approved}


@app.post("/api/schedules")
async def add_schedule(req: ScheduleRequest, request: Request) -> Dict[str, Any]:
    _check_secret(request)
    try:
        sched_id = await scheduler.add_schedule(
            req.cron_expression, req.command, description=req.description
        )
        return {"schedule_id": sched_id}
    except ValueError as exc:
        raise HTTPException(400, str(exc))


@app.post("/api/shutdown")
async def emergency_shutdown(request: Request):
    """Activate emergency shutdown — blocks all tool execution."""
    _check_secret(request)
    if security:
        security.emergency_shutdown()
    return {"status": "shutdown", "message": "All Sam actions frozen."}


@app.post("/api/unlock")
async def unlock_session(body: Dict[str, Any], request: Request):
    _check_secret(request)
    code = body.get("code", "")
    success = security.unlock(code) if security else False
    if not success:
        raise HTTPException(403, "Invalid unlock code")
    return {"status": "unlocked"}


@app.get("/api/memory/stats")
async def memory_stats(request: Request):
    _check_secret(request)
    stats = await memory.get_stats() if memory else {}
    return stats


@app.get("/api/audit/summary")
async def audit_summary(request: Request):
    _check_secret(request)
    summary = await audit.daily_summary() if audit else "No audit data."
    return {"summary": summary}


# ── WebSocket: real-time streaming chat ───────────────────────────────────────

active_connections: list[WebSocket] = []


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """
    WebSocket endpoint for real-time streaming chat.

    Client sends: {"message": "...", "session_id": "..."}
    Server streams: {"type": "token", "content": "..."} chunks
                    {"type": "done", "content": "full_response"} at end
                    {"type": "error", "content": "..."} on error
    """
    await websocket.accept()
    active_connections.append(websocket)
    logger.info(f"[WS] Client connected. Total: {len(active_connections)}")

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "content": "Invalid JSON"})
                continue

            message = data.get("message", "").strip()
            session_id = data.get("session_id", "default")
            user_id = data.get("user_id")

            if not message:
                continue

            # Stream response
            full_response = ""
            try:
                async for token in agent.stream(message, session_id=session_id, user_id=user_id):
                    full_response += token
                    await websocket.send_json({"type": "token", "content": token})
                await websocket.send_json({"type": "done", "content": full_response})
            except Exception as exc:
                await websocket.send_json({"type": "error", "content": str(exc)})

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.error(f"[WS] Error: {exc}")
    finally:
        active_connections.remove(websocket)
        logger.info(f"[WS] Client disconnected. Total: {len(active_connections)}")


async def broadcast(message: Dict[str, Any]) -> None:
    """Broadcast a message to all connected WebSocket clients."""
    for ws in list(active_connections):
        try:
            await ws.send_json(message)
        except Exception:
            pass


# ── Task processor (called by TaskQueue worker) ───────────────────────────────

async def _process_task(task_id: str, command: str, args: Dict) -> str:
    """
    Process a queued task by running it through the Sam agent.
    Built-in commands are handled directly; everything else goes to the LLM.
    """
    # Built-in commands
    if command == "get_system_info":
        from sam.agent.tools import get_system_info
        return await get_system_info.ainvoke({})

    if command == "daily_audit":
        summary = await audit.daily_summary()
        if telegram_bot:
            await telegram_bot.notify(summary)
        return summary

    if command == "prune_memories":
        pruned = await memory.prune_old_memories()
        return f"Pruned {pruned} old memories."

    # General: run through agent
    if agent:
        return await agent.run(command, session_id="scheduler")

    return f"No agent to process: {command}"


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("SAM_PORT", "8765"))
    host = os.getenv("SAM_HOST", "0.0.0.0")
    uvicorn.run(
        "sam.main:app",
        host=host,
        port=port,
        reload=False,
        log_level=os.getenv("SAM_LOG_LEVEL", "info").lower(),
    )
