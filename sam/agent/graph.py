"""
sam/agent/graph.py — LangGraph ReAct agent for Sam.

Architecture:
  StateGraph: think → act → observe → (loop | __end__)

  think:   LLM reasons about the task, retrieves relevant memories,
           constructs a plan (ReAct style).
  act:     Calls zero or more tools via ToolExecutor.
  observe: Evaluates tool results; loops back to think or ends.

LLM backend: Ollama (ChatOllama) — model configurable via SAM_MODEL env var.
Tracing: LangSmith if LANGCHAIN_TRACING_V2=true and LANGCHAIN_API_KEY set.

GPU detection: automatically configures OLLAMA_NUM_GPU env for max offload
when NVIDIA/AMD GPU is detected.

Usage:
    from sam.agent.graph import SamAgent
    agent = SamAgent()
    await agent.init()
    result = await agent.run("What's my CPU usage?", session_id="user-123")
"""

from __future__ import annotations

import asyncio
import logging
import os
import subprocess
from typing import Annotated, Any, AsyncIterator, Dict, List, Optional, TypedDict

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# LangSmith optional tracing setup (must happen before LangChain imports)
# ---------------------------------------------------------------------------
if os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true":
    api_key = os.getenv("LANGCHAIN_API_KEY", "")
    if api_key:
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGCHAIN_PROJECT", "sam-local")
        logger.info("[Agent] LangSmith tracing enabled.")
    else:
        logger.warning("[Agent] LANGCHAIN_TRACING_V2=true but LANGCHAIN_API_KEY is not set.")

# ---------------------------------------------------------------------------
# GPU detection — maximize Ollama GPU offload automatically
# ---------------------------------------------------------------------------

def _detect_and_configure_gpu() -> str:
    """
    Detect NVIDIA or AMD GPU and configure OLLAMA_NUM_GPU.
    Returns a human-readable string describing what was found.
    """
    num_gpu = os.getenv("OLLAMA_NUM_GPU", "auto")
    if num_gpu != "auto":
        return f"GPU layers: {num_gpu} (manual override)"

    # Try NVIDIA
    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0 and result.stdout.strip():
            gpu_info = result.stdout.strip().split("\n")[0]
            os.environ["OLLAMA_NUM_GPU"] = "99"  # max offload
            logger.info(f"[Agent] NVIDIA GPU detected: {gpu_info} → OLLAMA_NUM_GPU=99")
            return f"NVIDIA GPU: {gpu_info}"
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # Try AMD (ROCm)
    try:
        result = subprocess.run(
            ["rocm-smi", "--showproductname"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            os.environ["OLLAMA_NUM_GPU"] = "99"
            logger.info("[Agent] AMD GPU (ROCm) detected → OLLAMA_NUM_GPU=99")
            return "AMD GPU (ROCm)"
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # CPU fallback
    os.environ["OLLAMA_NUM_GPU"] = "0"
    logger.info("[Agent] No GPU detected → CPU-only inference (OLLAMA_NUM_GPU=0)")
    return "CPU only"


# ---------------------------------------------------------------------------
# LangGraph state schema
# ---------------------------------------------------------------------------

class SamState(TypedDict):
    """State passed between graph nodes."""
    messages:        List[Dict[str, Any]]   # LangChain message dicts
    memories:        List[Dict[str, Any]]   # relevant long-term memories
    session_id:      str
    user_id:         Optional[str]
    tool_calls:      List[Dict[str, Any]]   # pending tool calls from last think
    observations:    List[str]              # tool results from act node
    final_answer:    Optional[str]
    error:           Optional[str]
    iteration:       int                    # loop counter (safety break at 10)


# ---------------------------------------------------------------------------
# SamAgent
# ---------------------------------------------------------------------------

class SamAgent:
    """
    J.A.R.V.I.S.-style autonomous agent using LangGraph ReAct loop.

    Initialization:
        agent = SamAgent()
        await agent.init()

    Single query:
        result = await agent.run("show me my disk usage", session_id="abc")

    Streaming:
        async for token in agent.stream("summarize example.com"):
            print(token, end="", flush=True)
    """

    MAX_ITERATIONS = 10

    def __init__(self):
        self.memory_manager = None
        self.tool_executor = None
        self.security = None
        self.audit = None
        self.llm = None
        self.graph = None
        self._gpu_info = "unknown"

    async def init(
        self,
        memory_manager=None,
        tool_executor=None,
        security=None,
        audit=None,
    ) -> None:
        """Initialize all components and build the LangGraph."""
        from sam.agent.memory import MemoryManager
        from sam.agent.tool_executor import ToolExecutor
        from sam.agent.security import SecurityManager
        from sam.agent.audit import AuditLogger
        from sam.agent.tools import set_validators, ALL_TOOLS

        # Components
        self.memory_manager = memory_manager or MemoryManager()
        self.security = security or SecurityManager()
        self.audit = audit or AuditLogger()
        await self.memory_manager.init()
        await self.audit.init()

        # GPU config
        self._gpu_info = await asyncio.to_thread(_detect_and_configure_gpu)
        logger.info(f"[Agent] GPU: {self._gpu_info}")

        # Inject path/command validators into tools module
        set_validators(self.security.path_validator, self.security.command_guard)

        # ToolExecutor setup (approval_fn injected later by telegram bot)
        if tool_executor is None:
            self.tool_executor = ToolExecutor(
                security=self.security,
                audit=self.audit,
                summarize_fn=self._summarize_long_output,
            )
        else:
            self.tool_executor = tool_executor

        # Register all tools
        for lc_tool in ALL_TOOLS:
            # Wrap LangChain tool as awaitable for executor
            fn = lc_tool.coroutine if hasattr(lc_tool, "coroutine") and lc_tool.coroutine else None
            if fn is None:
                # sync tool — wrap in thread
                sync_fn = lc_tool.func
                async def _async_wrap(sync_fn=sync_fn, **kwargs):
                    return await asyncio.to_thread(sync_fn, **kwargs)
                fn = _async_wrap
            self.tool_executor.register(lc_tool.name, fn)

        # LLM: ChatOllama
        self._init_llm()

        # Build graph
        self.graph = self._build_graph()
        logger.info("[Agent] SamAgent initialized and graph built.")

    def _init_llm(self) -> None:
        """Initialize ChatOllama with the configured model."""
        from langchain_ollama import ChatOllama  # type: ignore

        model = os.getenv("SAM_MODEL", "qwen3.6")
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

        self.llm = ChatOllama(
            model=model,
            base_url=base_url,
            temperature=0.1,
            num_predict=2048,
            # Streaming is handled separately via stream()
        )
        self.llm_tools = self.llm.bind_tools(
            [t for t in self._get_langchain_tools()]
        )
        logger.info(f"[Agent] LLM: {model} @ {base_url}")

    def _get_langchain_tools(self):
        from sam.agent.tools import ALL_TOOLS
        return ALL_TOOLS

    def _build_graph(self):
        """Build the LangGraph StateGraph with ReAct nodes."""
        from langgraph.graph import StateGraph, END  # type: ignore
        from langgraph.prebuilt import ToolNode       # type: ignore

        builder = StateGraph(SamState)

        # Nodes
        builder.add_node("think", self._think_node)
        builder.add_node("act",   self._act_node)
        builder.add_node("observe", self._observe_node)

        # Edges
        builder.set_entry_point("think")
        builder.add_conditional_edges(
            "think",
            self._should_act,
            {"act": "act", "end": END},
        )
        builder.add_edge("act", "observe")
        builder.add_conditional_edges(
            "observe",
            self._should_continue,
            {"think": "think", "end": END},
        )

        return builder.compile()

    # ── Graph nodes ───────────────────────────────────────────────────────────

    async def _think_node(self, state: SamState) -> SamState:
        """
        THINK: Retrieve memories, build context, call LLM to reason and
               decide next actions (tools to call or final answer).
        """
        session_id = state.get("session_id", "default")
        messages = state["messages"]

        # Retrieve relevant memories
        last_user_msg = next(
            (m["content"] for m in reversed(messages) if m.get("role") == "user"), ""
        )
        memories = []
        if self.memory_manager and last_user_msg:
            try:
                memories = await self.memory_manager.search_memories(last_user_msg, k=5)
            except Exception as exc:
                logger.warning(f"[Agent] Memory retrieval failed: {exc}")

        # Build system prompt
        system_prompt = self._build_system_prompt(memories)

        # Build LangChain messages
        from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage

        lc_messages = [SystemMessage(content=system_prompt)]
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "user":
                lc_messages.append(HumanMessage(content=content))
            elif role == "assistant":
                lc_messages.append(AIMessage(content=content))

        # Call LLM with tools bound
        try:
            ai_response = await self.llm_tools.ainvoke(lc_messages)
        except Exception as exc:
            logger.error(f"[Agent] LLM call failed: {exc}", exc_info=True)
            # Fallback: inform user without crashing
            return {
                **state,
                "error": str(exc),
                "final_answer": (
                    f"I encountered an issue connecting to the AI model: {exc}\n"
                    "Please check if Ollama is running (`ollama serve`)."
                ),
                "tool_calls": [],
                "memories": memories,
            }

        # Extract tool calls if present
        tool_calls = []
        if hasattr(ai_response, "tool_calls") and ai_response.tool_calls:
            tool_calls = [
                {"name": tc["name"], "args": tc["args"], "id": tc.get("id", "")}
                for tc in ai_response.tool_calls
            ]

        final_answer = None
        if not tool_calls:
            # No tools → this is the final answer
            final_answer = (
                ai_response.content
                if isinstance(ai_response.content, str)
                else str(ai_response.content)
            )

        return {
            **state,
            "tool_calls": tool_calls,
            "final_answer": final_answer,
            "memories": memories,
            "iteration": state.get("iteration", 0) + 1,
        }

    async def _act_node(self, state: SamState) -> SamState:
        """
        ACT: Execute the tool calls decided in the think node.
        """
        tool_calls = state.get("tool_calls", [])
        user_id = state.get("user_id")
        observations = []

        for tc in tool_calls:
            tool_name = tc["name"]
            tool_args = tc.get("args", {})
            try:
                result = await self.tool_executor.execute(
                    tool_name, tool_args, user_id=user_id
                )
                observations.append(f"[{tool_name}] ✓\n{result}")
            except Exception as exc:
                observations.append(f"[{tool_name}] ✗ Error: {exc}")
                logger.warning(f"[Agent] Tool {tool_name} error: {exc}")

        return {**state, "observations": observations}

    async def _observe_node(self, state: SamState) -> SamState:
        """
        OBSERVE: Add tool results to messages so the LLM can reason about them.
        """
        observations = state.get("observations", [])
        messages = list(state["messages"])

        for obs in observations:
            messages.append({"role": "tool", "content": obs})

        return {**state, "messages": messages, "observations": []}

    # ── Routing functions ─────────────────────────────────────────────────────

    def _should_act(self, state: SamState) -> str:
        """Route: has tool calls → act; has final answer or error → end."""
        if state.get("final_answer") or state.get("error"):
            return "end"
        if state.get("tool_calls"):
            return "act"
        return "end"

    def _should_continue(self, state: SamState) -> str:
        """Route: loop back to think or terminate."""
        if state.get("iteration", 0) >= self.MAX_ITERATIONS:
            logger.warning("[Agent] Max iterations reached — forcing end.")
            return "end"
        if state.get("error") or state.get("final_answer"):
            return "end"
        return "think"

    # ── Public API ────────────────────────────────────────────────────────────

    async def run(
        self,
        user_message: str,
        session_id: str = "default",
        user_id: Optional[str] = None,
    ) -> str:
        """
        Process a user message end-to-end.
        Saves the exchange to short-term memory.
        Returns Sam's final response string.
        """
        # Security check
        if self.security:
            try:
                self.security.full_access_check(user_id)
            except PermissionError as exc:
                return f"🔒 {exc}"

        # Load conversation history
        history = []
        if self.memory_manager:
            try:
                history = await self.memory_manager.get_short_term_context(
                    session_id=session_id
                )
            except Exception:
                pass

        # Build initial state
        messages = history + [{"role": "user", "content": user_message}]
        initial_state: SamState = {
            "messages": messages,
            "memories": [],
            "session_id": session_id,
            "user_id": user_id,
            "tool_calls": [],
            "observations": [],
            "final_answer": None,
            "error": None,
            "iteration": 0,
        }

        # Run graph
        try:
            final_state = await self.graph.ainvoke(initial_state)
        except Exception as exc:
            logger.error(f"[Agent] Graph execution error: {exc}", exc_info=True)
            return f"⚠️ Sam encountered an unexpected error: {exc}"

        response = (
            final_state.get("final_answer")
            or final_state.get("error")
            or "I completed the task but have no summary to report."
        )

        # Save to memory
        if self.memory_manager:
            try:
                await self.memory_manager.add_conversation(
                    "user", user_message, session_id=session_id
                )
                await self.memory_manager.add_conversation(
                    "assistant", response, session_id=session_id
                )
            except Exception:
                pass

        return response

    async def stream(
        self,
        user_message: str,
        session_id: str = "default",
        user_id: Optional[str] = None,
    ) -> AsyncIterator[str]:
        """
        Stream Sam's response token-by-token from Ollama.
        Yields string chunks as they arrive.
        """
        from langchain_core.messages import SystemMessage, HumanMessage

        history = []
        if self.memory_manager:
            try:
                history = await self.memory_manager.get_short_term_context(
                    session_id=session_id
                )
            except Exception:
                pass

        memories = []
        if self.memory_manager:
            memories = await self.memory_manager.search_memories(user_message, k=3)

        system_prompt = self._build_system_prompt(memories)
        lc_messages = [SystemMessage(content=system_prompt)]
        for m in history:
            from langchain_core.messages import AIMessage
            if m["role"] == "user":
                lc_messages.append(HumanMessage(content=m["content"]))
            else:
                lc_messages.append(AIMessage(content=m["content"]))
        lc_messages.append(HumanMessage(content=user_message))

        full_response = ""
        async for chunk in self.llm.astream(lc_messages):
            token = chunk.content if hasattr(chunk, "content") else str(chunk)
            if token:
                full_response += token
                yield token

        # Save to memory after stream completes
        if self.memory_manager and full_response:
            try:
                await self.memory_manager.add_conversation("user", user_message, session_id=session_id)
                await self.memory_manager.add_conversation("assistant", full_response, session_id=session_id)
            except Exception:
                pass

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _build_system_prompt(self, memories: List[Dict]) -> str:
        """Build the system prompt including relevant long-term memories."""
        mem_block = ""
        if memories:
            mem_lines = [f"- {m['content']}" for m in memories[:5]]
            mem_block = "\n\nRelevant memories:\n" + "\n".join(mem_lines)

        return (
            "You are Sam, a powerful local AI assistant inspired by J.A.R.V.I.S. "
            "You are precise, proactive, and autonomous. You can use tools to "
            "complete tasks. Think step by step. If a task is unclear, ask one "
            "clarifying question before proceeding. Be concise in your responses.\n\n"
            "IMPORTANT: For HIGH-risk actions (file deletion, writing to disk), "
            "always confirm with the user before proceeding."
            + mem_block
        )

    async def _summarize_long_output(self, text: str) -> str:
        """Summarize long tool output via LLM (used by ToolExecutor)."""
        try:
            from langchain_core.messages import HumanMessage
            prompt = (
                f"Summarize the following output in under 200 words, "
                f"keeping the most important information:\n\n{text[:4000]}"
            )
            result = await self.llm.ainvoke([HumanMessage(content=prompt)])
            return result.content
        except Exception:
            return text[:2000]
