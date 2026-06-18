# Sam - Product Requirements Document (PRD)

## 1. Product Overview
Sam is a local AI coding assistant and agentic dashboard for the AksharaWorld ecosystem. It operates entirely locally without external dependencies (zero-cost architecture) and uses local LLM models (e.g., Ollama) to securely manage workflows, perform autonomous tasks, and interact with users across multiple interfaces.

## 2. Target Audience
- Developers and administrators of the AksharaWorld platform.
- Internal users managing automated routines and monitoring system logs locally without recurring cloud costs.

## 3. Core Capabilities
1. **Zero-Cost Operation**: Runs solely on local resources and free-tier infrastructure.
2. **Local AI Brain**: Integrates with a local Ollama instance (LangGraph ReAct loop).
3. **Task Scheduling**: Cron-like task scheduling and queueing capabilities.
4. **Tool Execution Engine**: Risk-based execution logic (LOW, MEDIUM, HIGH) requiring explicit user approval for high-risk actions.
5. **Memory System**: Context-aware interactions via SQLite (short-term conversation history and long-term embedded memory).
6. **Multi-Interface Access**: Accessible via a local web dashboard (`index.html`) and potentially Telegram (if explicitly configured).

## 4. Current Architecture
- **Entry Point**: `sam/main.py` (FastAPI backend).
- **Frontend**: Single-page application dashboard (`sam/web_dashboard/index.html`) using Vanilla CSS and pure JS.
- **State Persistence**: `sam-data/sam.db` (SQLite Database).
- **Core Agent Modules**:
  - `memory.py`: Short and long-term memory.
  - `security.py`: Validation, security blocks, and access constraints.
  - `scheduler.py`: Background task execution and task queue.
  - `tools.py` & `tool_executor.py`: Custom agent tools and execution hooks.
  - `graph.py`: LLM ReAct loop integration.
  - `audit.py`: Append-only security/activity logging.

## 5. Known Constraints and Risks
> [!WARNING]
> **Security Gap (Allowed IDs: ANY)**: Currently, if the `TELEGRAM_ALLOWED_IDS` environment variable is unset, `SecurityManager.is_allowed_user()` evaluates to True for ANY incoming ID. This is a critical risk if the system is ever exposed externally without explicit configurations.

> [!CAUTION]
> **Dynamic Pathing**: FFmpeg and other paths must be defined dynamically (e.g., `LOCALAPPDATA`) to adhere to audit rules and prevent ESM loader absolute path prefix errors.

## 6. Out of Scope (Do Not Implement)
- Cloud-based paid AI models (e.g., GPT-4, Claude).
- Paid infrastructure/subscriptions (AWS, paid email services, Twilio, etc.).
- Complicated frontend frameworks like Tailwind CSS; Stick to Vanilla CSS.
- Remote telemetry reporting (everything must stay in `sam.db`).
