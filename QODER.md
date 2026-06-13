# AksharaWorld & Sam JARVIS — Unified IDE Rules

These instructions apply to all AI coding assistants in this workspace. Follow them strictly.

---

## 🤖 1. LOCAL OLLAMA MODELS
This project uses a local Ollama runtime on `http://localhost:11434` (mapped via Docker). Route tasks to the appropriate model:
*   **Chat & Planning (Sam CEO logic)**: `qwen3.6:latest` (23 GB) — Deep reasoning, stitch UI, business logic.
*   **Code Generation & Completion**: `qwen2.5-coder:14b` (9.0 GB) — TypeScript, React, Next.js, Python.
*   **Explanations & Code Review**: `gemma4:latest` (9.6 GB) — Balanced creative and review task understanding.
*   **Fast / Lightweight Ops**: `llama3:latest` (4.7 GB) — General queries, quick actions, utilities.
*   **Cloud Fallback**: `minimax-m3:cloud` (Only when online and local Ollama is overloaded/unavailable).

---

## 💸 2. ZERO-COST RESTRICTION (₹0 FOREVER)
The business must operate at **zero fixed monthly cost**. Never recommend or configure paid services (e.g. Brevo, Twilio, OpenAI/Anthropic paid keys, AWS paid tiers). Utilize our pre-configured free resources:
*   **Database & Subscribers**: Google Sheets (via the free `SheetsDb` Apps Script Webhook).
*   **Email Sending**: Gmail SMTP via free Google Apps Script webhooks (100 daily limit per account).
*   **System Logs & Transactions**: Appended to Google Sheets database ledger via Apps Script.
*   **Cloud Edge Routing**: Cloudflare Workers (Free tier: 100,000 requests/day).
*   **Mobile Alerts & Approvals**: Telegram Bot API (`@Akshu23bot`) — 100% free.
*   **E-Commerce Payments**: Razorpay Gateway (2% per transaction fee, no fixed cost).
*   **Content & Hosting**: Google Blogger (free CMS), YouTube (free media hosting), Vercel/Netlify (free hosting plans).

---

## 📊 3. CODE REVIEW GRAPH (CRG)
This repository has an active code knowledge graph. 
*   **Rule**: ALWAYS use `code-review-graph` MCP tools (`semantic_search_nodes`, `query_graph`, `detect_changes`, `get_review_context`) **BEFORE** falling back to Grep, Glob, or manually reading files.
*   It is faster, cheaper, and provides structural context (callers, dependents, and test coverage).

---

## 🛠️ 4. CODING CONVENTIONS
*   **Frontend**: Next.js 16 (React 19), TypeScript, and **Vanilla CSS** (defined in `style.css` and local `.css` files). Do NOT inject TailwindCSS unless explicitly requested.
*   **Backend**: Python 3.14 FastAPI local daemon (`sam/main.py`) running on port `8765`, SQLite vector memory using `fastembed`, and Electron desktop wrapper (`sam-desktop/`).
*   **Windows Environment**: Always support PowerShell compatibility. Use `;` instead of `&&` for chain commands, and use standard Windows paths.
