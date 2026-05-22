# Deployment Guide

## Docker Compose (recommended)

```bash
docker compose up --build -d
docker compose exec backend npx prisma db seed
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API docs: http://localhost:4000/api/docs

## Manual production build

### Backend

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL, JWT secrets, REDIS_URL, CORS_ORIGIN
npm ci
npx prisma migrate deploy
npx prisma db seed
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL to your API host
npm ci
npm run build
npm run start
```

## Environment checklist

| Variable | Service | Required |
|----------|---------|----------|
| DATABASE_URL | Backend | Yes |
| JWT_ACCESS_SECRET | Backend | Yes (32+ chars) |
| JWT_REFRESH_SECRET | Backend | Yes (32+ chars) |
| REDIS_URL | Backend | Recommended |
| CORS_ORIGIN | Backend | Yes (frontend URL) |
| NEXT_PUBLIC_API_URL | Frontend | Yes |
| NEXT_PUBLIC_WS_URL | Frontend | Yes |

## Health checks

- `GET /health` — database connectivity
- Use behind reverse proxy (nginx/Caddy) with TLS in production

## Scaling notes

- Run multiple backend instances behind a load balancer
- Use Redis adapter for Socket.IO for multi-instance WS
- Use managed PostgreSQL (RDS, Supabase, Neon)
