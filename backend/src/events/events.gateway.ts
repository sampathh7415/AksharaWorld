import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggerService } from '../common/logger/logger.service';

export const WS_EVENTS = {
  ORDER_CREATED: 'orderCreated',
  ORDER_UPDATED: 'orderUpdated',
  PAYMENT_UPDATED: 'paymentUpdated',
  INVENTORY_UPDATED: 'inventoryUpdated',
  LOW_STOCK_ALERT: 'lowStockAlert',
  NOTIFICATION_CREATED: 'notificationCreated',
  DASHBOARD_METRICS_UPDATED: 'dashboardMetricsUpdated',
} as const;

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/realtime',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private logger: LoggerService) {}

  handleConnection(client: Socket) {
    this.logger.debug(`WS connected: ${client.id}`, 'EventsGateway');
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`WS disconnected: ${client.id}`, 'EventsGateway');
  }

  emitOrderCreated(payload: unknown) {
    this.server?.emit(WS_EVENTS.ORDER_CREATED, payload);
  }

  emitOrderUpdated(payload: unknown) {
    this.server?.emit(WS_EVENTS.ORDER_UPDATED, payload);
  }

  emitPaymentUpdated(payload: unknown) {
    this.server?.emit(WS_EVENTS.PAYMENT_UPDATED, payload);
  }

  emitInventoryUpdated(payload: unknown) {
    this.server?.emit(WS_EVENTS.INVENTORY_UPDATED, payload);
  }

  emitLowStockAlert(payload: unknown) {
    this.server?.emit(WS_EVENTS.LOW_STOCK_ALERT, payload);
  }

  emitNotificationCreated(payload: unknown) {
    this.server?.emit(WS_EVENTS.NOTIFICATION_CREATED, payload);
  }

  emitDashboardMetricsUpdated(payload: unknown) {
    this.server?.emit(WS_EVENTS.DASHBOARD_METRICS_UPDATED, payload);
  }
}
