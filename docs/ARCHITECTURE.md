# Architecture

## Overview

BizOps is a real-time business operations platform built as a monorepo with a **Next.js** frontend, **NestJS** backend, **PostgreSQL** database, and **Redis** cache.

```
┌─────────────┐     REST API      ┌─────────────┐     Prisma     ┌──────────────┐
│  Next.js    │ ────────────────► │   NestJS    │ ─────────────► │  PostgreSQL  │
│  Dashboard  │                   │   API       │                └──────────────┘
└──────┬──────┘                   └──────┬──────┘
       │                                 │
       │ WebSocket (Socket.IO)           │ Redis (metrics cache)
       └────────────────────────────────►│
```

## Real-time flow

1. User performs an action in the frontend (create order, adjust stock, etc.).
2. Frontend calls a REST endpoint with JWT bearer token.
3. Backend validates input (class-validator), checks RBAC, writes to PostgreSQL.
4. Backend optionally updates Redis cache (dashboard metrics).
5. Backend emits a Socket.IO event on namespace `/realtime`.
6. All connected dashboards receive the event and update UI without refresh.

## Modules

| Module | Responsibility |
|--------|----------------|
| Auth | JWT access + refresh tokens, bcrypt passwords |
| Users | Staff/admin CRUD, roles |
| Customers | Customer CRM |
| Products | Inventory, stock logs, low-stock alerts |
| Orders | Order lifecycle, stock deduction |
| Payments | Payment records, provider-ready fields |
| Notifications | In-app notifications + WS broadcast |
| Analytics | Dashboard metrics, sales charts |
| Events | WebSocket gateway |
| Audit | Immutable action log |

## Security

- Global JWT guard with `@Public()` for auth/health routes
- `@Roles()` guard for admin/manager endpoints
- Rate limiting via `@nestjs/throttler`
- CORS restricted to configured origins
- Secrets only in backend environment variables

## Legacy store

The repository root `src/` and `public/` contain the original PixelForge AI storefront (port 3847). It runs independently from BizOps.
