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

---

## ⚡ Gemini Spark Always-On Agent Prompt Blueprint

This prompt establishes **Gemini Spark** as the cloud-based executive engine that replaces legacy openclaw connections.

```text
# Gemini Spark: A replacement for openclaw

Gemini Spark is Google's always-on AI agent. It runs on Google's own cloud servers. You close your laptop. It keeps working.

It connects to Gmail, Calendar, Drive, Docs, Sheets, Slides, YouTube, and Google Maps natively.

---

> Spark is currently rolling out to AI Ultra subscribers in the US first. If you do not see it yet, check back in a few days.
> 

---

## Step 1: Access Gemini Spark

1. Open the Gemini app on your phone or go to gemini.google.com
2. Look for the **Agent** tab next to the regular Chat tab
3. If you do not see it, close the app fully and reopen after a few hours
4. Walk through the consent screen Google shows you
5. Read it carefully. Spark can act on your behalf even when your devices are off.

---

## Step 2: Connect Your Apps

All connections are turned off by default. You turn them on one at a time.

Go to **Settings** inside the Gemini app and look for **Connected Apps**.

Connect in this order on day one:

| App | Why It Matters |
| --- | --- |
| Gmail | Inbox triage, auto-replies, lead logging |
| Google Calendar | Schedule-aware task execution |
| Google Docs | Auto-drafting, meeting notes, summaries |
| Google Sheets | Data logging, reporting, tracking |
| Google Drive | File access and document creation |

> Skip third-party integrations on your first day. Get comfortable with Google tools first.
> 

---

## Step 3: Understand the 3 Core Concepts

Everything in Gemini Spark runs on three things.

**Tasks**

What you want Spark to do.

Example: Scan my inbox every morning and flag emails with the word invoice.

**Skills**

How you want Spark to do it. You define repeatable instructions once. Spark follows them every time without you re-explaining.

Example: When flagging emails, copy the sender name, subject line, and email body into a Google Sheet called Lead Tracker.

**Schedules**

When you want it to happen. You set a time or a trigger.

Example: Run this every day at 7am.

> Tasks plus Skills plus Schedules equals a fully automated workflow.
> 

---

## Step 4: Your First 3 Workflows to Set Up Today

### Workflow 1: Inbox Triage on Autopilot

**Task:** Check Gmail every morning at 7am

**Skill:** Summarise every unread email, flag anything with words like urgent, invoice, contract, or proposal, and log flagged emails into a Google Sheet with sender name, subject, and a one-line summary

**Schedule:** Daily at 7am

Result: You wake up to a clean summary instead of 80 unread emails.

---

### Workflow 2: Auto-Reply to Common Inquiries

**Task:** Monitor Gmail for new client inquiry emails

**Skill:** If the email asks about pricing, availability, or services, send a polite holding reply using the template below and flag the email for my review

Paste your template directly into the Skill instructions:

```
Hi, thanks for reaching out. I have received your message and will get back to you within 24 hours with all the details you need.
```

**Schedule:** Trigger-based, runs as emails arrive

Result: Every lead gets an instant reply even when you are offline.

---

### Workflow 3: Weekly Report to Google Docs

**Task:** Every Sunday at 8pm, pull a summary of the week

**Skill:** Check Google Calendar for completed meetings, check Gmail for sent emails, and write a short weekly summary into a Google Doc called Weekly Review with three sections: meetings completed, follow-ups pending, and key highlights

**Schedule:** Weekly on Sunday at 8pm

Result: A personal weekly report waiting for you every Monday morning.

---

## Step 5: How to Write a Good Skill

This is where most beginners go wrong. Treat it like briefing a new assistant on their first day.

**Be specific about the input.**

Bad: Check my Gmail

Good: Check Gmail for emails from clients containing the words proposal or invoice

**Be specific about the output.**

Bad: Log it

Good: Log it into a Google Sheet called Client Tracker with columns: date, sender name, email subject, action needed

**Be specific about exceptions.**

Tell Spark what to skip.

Example: Ignore promotional emails, newsletters, and emails from no-reply addresses.

---

## Things to Know Before You Hand Over Access

Spark can share your information with third-party services to complete tasks. This includes your name, contact details, files, and preferences.

To stay in control:

- Only connect apps you actively use
- Review Spark's activity log in the Agent tab every few days
- For any task involving sending emails externally, turn on confirmation prompts
- Do not give Spark access to financial accounts on day one

> Spark is still in beta. Supervise it closely the first two weeks.
> 

---

## What Is Coming Soon

These integrations are confirmed for summer 2026:

- Notion
- Slack
- GitHub
- Spotify
- Adobe
- Samsung

MCP support means Spark will eventually connect to most tools you already use.

---

## Quick Reference: Spark vs Regular Gemini

| Feature | Regular Gemini | Gemini Spark |
| --- | --- | --- |
| Works when you close the app | No | Yes |
| Runs on a schedule | No | Yes |
| Remembers your preferences | Limited | Yes, via Skills |
| Connects to Google Workspace | Chat only | Full action access |
| Requires your device to be on | Yes | No |

---

## Start Here If You Are Overwhelmed

Do not try to automate everything on day one.

Pick one workflow. Set it up. Watch it run for three days. Refine the Skill based on what the output looks like. Then add a second workflow.

Within two weeks you will have a personal automation stack running silently in the background while you focus on actual work.
```

