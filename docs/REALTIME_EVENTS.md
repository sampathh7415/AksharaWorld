# Real-Time WebSocket Events

## Connection

- **URL:** `http://localhost:4000` (same host as API)
- **Namespace:** `/realtime`
- **Library:** Socket.IO (client: `socket.io-client`)

```typescript
import { io } from 'socket.io-client';
const socket = io('http://localhost:4000/realtime');
```

## Events (server → client)

| Event | Payload | Trigger |
|-------|---------|---------|
| `orderCreated` | Order object | New order created |
| `orderUpdated` | Order object | Status change |
| `paymentUpdated` | Payment object | Payment create/update |
| `inventoryUpdated` | Product object | Stock or product change |
| `lowStockAlert` | `{ productId, name, stock, threshold }` | Stock at/below threshold |
| `notificationCreated` | Notification object | New notification |
| `dashboardMetricsUpdated` | Metrics object | Any metric-affecting change |

## Dashboard metrics payload

```json
{
  "totalSales": 1234.56,
  "totalOrders": 42,
  "pendingOrders": 3,
  "lowStockProducts": 2,
  "activeCustomers": 15,
  "liveRevenue": 89.00,
  "updatedAt": "2026-05-21T12:00:00.000Z"
}
```

## Testing real-time updates

1. Start backend and frontend.
2. Open dashboard in two browser tabs.
3. In tab A, go to **Inventory** and click **+1** on a low-stock product.
4. Tab B should show a toast and updated metrics without refresh.
5. Create an order or mark a payment complete — both tabs update.
