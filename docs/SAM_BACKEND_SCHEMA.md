# Sam - Backend Schema Documentation

This document serves as the foundational reference for Sam's backend architecture and SQLite data structures. All future developments should consult this document to maintain consistency.

## 1. Database Schema (`sam-data/sam.db`)

The database consists of the following tables, mapped directly from the application's schema:

### `tasks`
Manages the queue of tasks (both scheduled and direct execution).
- `id` (TEXT, PK): Unique task ID.
- `command` (TEXT, NOT NULL): The command/tool to run.
- `args` (TEXT): JSON string of arguments.
- `status` (TEXT, Default `'pending'`): Status (pending, running, done, failed).
- `created_at` (TEXT, Default `datetime('now')`): Task creation time.
- `started_at` (TEXT): Execution start time.
- `completed_at` (TEXT): Execution end time.
- `result` (TEXT): Output or result payload.
- `error` (TEXT): Error message if execution failed.
- `approval_required` (INTEGER, Default `0`): Whether human intervention is required (1) or not (0).
- `approval_given` (INTEGER): Status of approval (1 for yes, 0 for no).
- `user_id` (TEXT): User ID executing the task.
- `priority` (INTEGER, Default `5`): Priority level.

### `schedules` & `scheduled_tasks`
Stores cron-like scheduled commands.
- `id` (TEXT, PK): Unique schedule ID.
- `cron_expression` (TEXT): Standard cron expression.
- `command` (TEXT, NOT NULL): The command/tool to execute.
- `args` (TEXT): JSON arguments for the command.
- `enabled` (INTEGER, Default `1`): Boolean flag to enable/disable the schedule.
- `last_run` (TEXT): Last execution timestamp.
- `next_run` (TEXT): Next calculated execution timestamp.
- `created_at` (TEXT, Default `datetime('now')`): Creation timestamp.
- `description` (TEXT): Description of the schedule.

### `conversations`
Tracks short-term history for LLM context.
- `id` (INTEGER, PK): Auto-incrementing message ID.
- `timestamp` (TEXT, Default `datetime('now')`): When the message occurred.
- `role` (TEXT, NOT NULL): Message role (user, assistant, tool, system).
- `content` (TEXT, NOT NULL): Message content.
- `tool_calls` (TEXT): JSON representation of tool calls made.
- `session_id` (TEXT, Default `'default'`): The conversation session identifier.

### `memories`
Stores long-term contextual knowledge with embeddings.
- `id` (INTEGER, PK): Auto-incrementing memory ID.
- `timestamp` (TEXT, Default `datetime('now')`): Time of memory insertion.
- `content` (TEXT, NOT NULL): Core memory text.
- `category` (TEXT, Default `'general'`): Categorization tag.
- `embedding` (TEXT): Vectorized representation for semantic search.
- `metadata` (TEXT): JSON string containing contextual metadata.

### `audit_log`
Append-only log of agent actions and security events.
- `id` (INTEGER, PK): Auto-incrementing audit ID.
- `timestamp` (TEXT, Default `datetime('now')`): Execution time.
- `user_id` (TEXT): User attempting the action.
- `tool_name` (TEXT, NOT NULL): Tool executed.
- `tool_input` (TEXT): Passed arguments.
- `tool_output` (TEXT): Result or trace.
- `success` (INTEGER, Default `1`): Boolean indicating execution success.
- `approval_status` (TEXT, Default `'auto'`): How the execution was approved (auto, manual, rejected).
- `duration_ms` (INTEGER): Time taken to run in milliseconds.

## 2. API Endpoints
Based on `sam/main.py` and `sam/web_dashboard/index.html`:

- **WebSocket (`/ws/chat`)**: Persistent, real-time connection for agentic chat and streaming responses.
- **REST Endpoints**:
  - `GET /api/status`: Returns system status (online, shutdown, locked), queue counts, CPU/RAM utilization.
  - `GET /api/tasks`: Returns recent queue items from the `tasks` table.
  - `GET /api/logs`: Returns recent entries from the `audit_log` table.
  - `GET /api/memory/stats`: Returns current long-term memory counts.
  - `POST /api/shutdown`: Emergency kill-switch endpoint.

## 3. Environment & Configuration
Primary configuration is managed through environment variables defined in `.env.local` based on `sam.env.example`.

> [!WARNING]
> **Security Gap (Allowed IDs: ANY)**: Currently, if `TELEGRAM_ALLOWED_IDS` is not strictly set, `SecurityManager` will bypass validation and treat ANY user ID as authorized. This must be resolved before enabling remote access.
