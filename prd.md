# Product Requirements Document (PRD) — The North Star

## 1. Project Overview & Objective
* **Goal**: [Clear description of what this project/feature does]
* **Target Audience**: [Who is this for?]
* **Core Value Proposition**: [Why does this exist and what problem does it solve?]

---

## 2. Minimal Viable Product (MVP) Scope
Define the absolute bare minimum required to launch and prove value.
- [ ] **Feature 1**: [Description]
- [ ] **Feature 2**: [Description]
- [ ] **Feature 3**: [Description]

---

## 3. Strict Out-of-Scope (Non-Goals)
To prevent feature creep, the following features and enhancements are **explicitly forbidden** from this release cycle:
- [ ] **No Multi-Region/Scalability**: Do not write horizontal scaling code or distributed cache setup.
- [ ] **No Paid Integrations**: Only use the pre-configured free tiers (Razorpay gateway, Google Sheets, Gmail SMTP, Telegram Bot API).
- [ ] **No OAuth/3rd Party logins**: (unless specifically mandated). Stick to simple Supabase Email/Password Auth.
- [ ] **No Custom Domain setup**: (unless Vercel/Netlify free subdomains are insufficient).
- [ ] [Add other features that must be deferred to v2]

---

## 4. Technical Constraints & Foundations
* **Zero-Cost Tech Stack**: Supabase (Database/Auth free tier), Sentry (Free tier), EAS Local Build, Razorpay (Pay-as-you-go), Google Sheets (Ledger), Telegram Bot API.
* **Frontend Design**: Vanilla CSS (modular, responsive layout components) with clean VibeUI paradigms. No TailwindCSS.
* **Backend**: FastAPI (Python 3.14) local daemon + SQLite memory + Electron desktop wrapper.
* **Environment**: Absolute paths like `C:\...` or `G:\...` are prohibited. Use relative paths or ESM-safe URLs.
