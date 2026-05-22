import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export const WS_EVENTS = {
  ORDER_CREATED: 'orderCreated',
  ORDER_UPDATED: 'orderUpdated',
  PAYMENT_UPDATED: 'paymentUpdated',
  INVENTORY_UPDATED: 'inventoryUpdated',
  LOW_STOCK_ALERT: 'lowStockAlert',
  NOTIFICATION_CREATED: 'notificationCreated',
  DASHBOARD_METRICS_UPDATED: 'dashboardMetricsUpdated',
} as const;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${WS_URL}/realtime`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
