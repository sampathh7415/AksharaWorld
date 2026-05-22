# Push to GitHub

All project source is committed locally. Secrets (`.env`, `.env.local`) and local databases (`*.db`) are **not** included.

## Step 1 — Create an empty repo on GitHub

1. Go to https://github.com/new
2. Repository name: e.g. `bizops-platform` or `autopilot-store`
3. **Do not** add README, .gitignore, or license (repo must be empty)
4. Click **Create repository**
5. Copy the HTTPS URL, e.g. `https://github.com/YOUR_USERNAME/bizops-platform.git`

## Step 2 — Push (one command)

```powershell
cd "C:\Users\Lenovo\.cursor\projects\empty-window\autopilot-store"
powershell -ExecutionPolicy Bypass -File .\push-to-github.ps1 -RepoUrl "https://github.com/YOUR_USERNAME/YOUR_REPO.git"
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your values.

## Manual push (alternative)

```powershell
cd "C:\Users\Lenovo\.cursor\projects\empty-window\autopilot-store"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## What is included (145+ files)

| Area | Contents |
|------|----------|
| `backend/` | NestJS API, Prisma schemas, migrations, seed, tests |
| `frontend/` | Next.js app, all pages and components |
| `docs/` | Architecture, API, deployment, roadmap, real-time events |
| `docker-compose.yml` | Full stack |
| `start-bizops.ps1` | One-command local start |
| `src/`, `public/` | Legacy PixelForge store |

## Excluded (by design)

- `node_modules/`
- `.env`, `backend/.env`, `frontend/.env.local`
- `*.db` local SQLite files
- `data/store.json` (runtime data)
