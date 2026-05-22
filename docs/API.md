# API Reference

Base URL: `http://localhost:4000`

Swagger UI: `http://localhost:4000/api/docs`

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Register user |
| POST | `/auth/login` | Public | Login, returns tokens + user |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Bearer | Invalidate refresh token |

## Users

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/users` | Admin, Manager | List users |
| POST | `/users` | Admin | Create user |
| PATCH | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Deactivate user |

## Customers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/customers?search=` | List/search |
| GET | `/customers/:id` | Get one |
| POST | `/customers` | Create |
| PATCH | `/customers/:id` | Update |
| DELETE | `/customers/:id` | Deactivate |

## Products

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products?search=&lowStock=true` | List products |
| POST | `/products` | Create product |
| PATCH | `/products/:id` | Update |
| POST | `/products/:id/stock` | Adjust stock `{ change, reason }` |
| DELETE | `/products/:id` | Deactivate |

## Orders

| Method | Path | Description |
|--------|------|-------------|
| GET | `/orders?status=&customerId=&search=` | List |
| POST | `/orders` | Create with items |
| PATCH | `/orders/:id/status` | Update status |
| POST | `/orders/:id/cancel` | Cancel order |

## Payments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/payments` | List |
| POST | `/payments` | Create payment |
| PATCH | `/payments/:id` | Update status/refund |

## Notifications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | List for user |
| PATCH | `/notifications/:id/read` | Mark read |
| POST | `/notifications/read-all` | Mark all read |

## Analytics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics/dashboard` | Live dashboard metrics |
| GET | `/analytics/daily-sales?days=7` | Daily revenue |
| GET | `/analytics/top-products` | Top sellers |

## Settings & Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/settings` | Business settings |
| PATCH | `/settings` | Update (Admin) |
| GET | `/health` | Health check |
| GET | `/metrics` | Extended metrics (Admin/Manager) |

All protected routes require header: `Authorization: Bearer <accessToken>`
