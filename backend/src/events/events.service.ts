import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AnalyticsService } from '../analytics/analytics.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class EventsService {
  constructor(
    private gateway: EventsGateway,
    private analytics: AnalyticsService,
    private redis: RedisService,
  ) {}

  async broadcastDashboardMetrics() {
    const metrics = await this.analytics.getDashboardMetrics();
    await this.redis.set('dashboard:metrics', JSON.stringify(metrics), 30);
    this.gateway.emitDashboardMetricsUpdated(metrics);
    return metrics;
  }

  orderCreated(payload: unknown) {
    this.gateway.emitOrderCreated(payload);
    void this.broadcastDashboardMetrics();
  }

  orderUpdated(payload: unknown) {
    this.gateway.emitOrderUpdated(payload);
    void this.broadcastDashboardMetrics();
  }

  paymentUpdated(payload: unknown) {
    this.gateway.emitPaymentUpdated(payload);
    void this.broadcastDashboardMetrics();
  }

  inventoryUpdated(payload: unknown) {
    this.gateway.emitInventoryUpdated(payload);
    void this.broadcastDashboardMetrics();
  }

  lowStockAlert(payload: unknown) {
    this.gateway.emitLowStockAlert(payload);
  }

  notificationCreated(payload: unknown) {
    this.gateway.emitNotificationCreated(payload);
  }
}
