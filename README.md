# BizOps — Real-Time Business Operations Platform

A production-ready platform for managing **customers**, **orders**, **inventory**, **payments**, **staff**, **notifications**, and **live analytics** — with instant WebSocket updates across all connected dashboards.

> **Note:** This repo also contains the legacy **PixelForge AI** storefront (`src/server.js` on port 3847). The BizOps platform lives in `frontend/` and `backend/`.

## Features

- JWT authentication with refresh tokens and role-based access (Admin, Manager, Staff)
- Real-time dashboard: sales, orders, pending orders, low stock, customers, live revenue
- Full CRUD for customers, products/inventory, orders, payments
- WebSocket events via Socket.IO (`orderCreated`, `inventoryUpdated`, `dashboardMetricsUpdated`, etc.)
- Toast notifications on live events
- PostgreSQL + Prisma ORM, Redis caching for metrics
- Audit logs, health check, metrics API, Swagger docs
- Docker Compose for local and production-style runs

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript, class-validator |
| Database | PostgreSQL, Prisma |
| Cache | Redis (ioredis) |
| Real-time | Socket.IO |
| Auth | JWT + bcrypt |
| DevOps | Docker, Docker Compose |
| Tests | Jest (backend), React Testing Library (frontend) |

## Quick start (one command — Windows)

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\Lenovo\.cursor\projects\empty-window\autopilot-store\start-bizops.ps1"
```

This installs dependencies, creates the database (SQLite if PostgreSQL/Docker is not available), seeds demo data, and starts the API + dashboard.

- **Dashboard:** http://localhost:3000  
- **API:** http://localhost:4000  
- **Login:** admin@bizops.local / Admin123!

### Manual start (optional)

```bash
cd backend && npm install && npm run start:dev
cd frontend && npm install && npm run dev
```

Use PostgreSQL via Docker: `docker compose up -d postgres redis` then run the start script again.

## Docker (all services)

```bash
docker compose up --build
# After containers are healthy:
docker compose exec backend npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:4000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis URL (optional) |
| `JWT_ACCESS_SECRET` | Access token secret (32+ chars) |
| `JWT_REFRESH_SECRET` | Refresh token secret (32+ chars) |
| `CORS_ORIGIN` | Frontend URL(s), comma-separated |
| `PORT` | API port (default 4000) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend REST URL |
| `NEXT_PUBLIC_WS_URL` | Backend WebSocket URL |

## Database commands

```bash
cd backend
npx prisma migrate dev      # development migrations
npx prisma migrate deploy   # production migrations
npm run prisma:seed         # demo data
npx prisma studio           # DB GUI
```

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bizops.local | Admin123! |
| Manager | manager@bizops.local | Manager123! |
| Staff | staff@bizops.local | Staff123! |

## Testing

```bash
cd backend && npm test
cd frontend && npm test
```

## Test real-time updates

1. Log in at http://localhost:3000
2. Open the dashboard in **two browser tabs**
3. In one tab, go to **Inventory** and adjust stock (+1 / -1)
4. The other tab shows a toast and refreshed metrics without reload

See [docs/REALTIME_EVENTS.md](./docs/REALTIME_EVENTS.md) for event names and payloads.

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API](./docs/API.md)
- [Real-time events](./docs/REALTIME_EVENTS.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Roadmap](./docs/ROADMAP.md)

## Project structure

```
backend/          NestJS API + Prisma + WebSocket gateway
frontend/         Next.js admin dashboard
docs/             Architecture, API, deployment, roadmap
docker-compose.yml
src/              Legacy PixelForge AI store (unchanged)
public/           Legacy store static files
```

## Production deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for build commands, env checklist, and scaling notes.

## License

MIT
