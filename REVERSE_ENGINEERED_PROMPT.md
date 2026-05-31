# 🧠 Akshara World: Reverse Engineered System Prompt

This document records the exact, reverse-engineered core system prompt used to prompt, build, and align the entire Akshara World digital business platform. It serves as a persistent, high-fidelity reference for subsequent AI models, developers, and autonomous agents (like Sam) to understand and rebuild the unified codebase structure.

---

## ⚡ The System Prompt Blueprint

```text
Build me Akshara World, a polished digital business command center and public website for an AI run business empire. I want a public landing page with the logo, about section, products, pricing links, and a clean catalog feel, plus an owner only dashboard where I can see transactions, traffic, assets, department logs, and approvals.

The main idea is Sam, the AI CEO, managing 8 departments like content, media, growth, revenue, tech, security, insights, and innovation. Show this in a simple visual way, and make the dashboard feel like a central brain where Sam posts updates, assigns tasks, and asks me to approve important actions before anything risky happens.

Please connect the business side around Google Drive, Google Sheets, Blogger, YouTube, Gmail, Razorpay payments, and Telegram style alerts where possible. Keep the setup focused on zero recurring cost hosting and simple deployment. Use the existing project direction, fill in missing screens, make it look professional, and look up current docs online if you need to.
```

---

## 🏛️ Architectural Manifestation in the Repository

The prompt’s requirements have been materialized in the repository through the following foundational implementation:

### 1. Public Storefront Landing Page (`/`)
*   **Logo & Brand**: Premium glowing branding mark with dynamic visual tokens.
*   **About Section**: Detailed description of the serverless digital empire.
*   **Clean Catalog Feel**: High-fidelity, hover-scalable product display blocks presenting the catalog.
*   **Pricing Links**: Direct payment gateway routes leading to checkout.

### 2. Owner-Only Command Center Dashboard (`/dashboard`)
*   **Secure Access**: JWT cookie verification with automated login guards coexisting alongside Clerk Authentication.
*   **Transactions Tracker**: Real-time integration pulling live transaction logs from Razorpay API.
*   **Traffic Telemetry**: Visitor statistics, acquisition channels, and session metrics pulled from Google Analytics (GA4).
*   **Department Logs**: Observable, real-time logging records covering Sam CEO's 8 swarm wings.
*   **Approvals Queue**: Human-in-the-Loop approval gate for critical operational tasks.

### 3. Zero Recurring Cost Standard
*   **Edge Compute**: Configured to build on Cloudflare Pages workers using the Edge runtime.
*   **Keyless Database Ledger**: Pushes metric logs and automation outputs directly to Google Sheets using a keyless Apps Script webhook, bypassing expensive database API expenses.
*   **Resilience & Alerts**: Integrated with a local database fallback (Firestore/Sheets) and instantaneous Telegram notification alerts on new transactions.
