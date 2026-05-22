import { EventsGateway, WS_EVENTS } from '../src/events/events.gateway';

describe('EventsGateway', () => {
  let gateway: EventsGateway;

  beforeEach(() => {
    gateway = new EventsGateway({ debug: jest.fn() } as never);
    gateway.server = { emit: jest.fn() } as never;
  });

  it('emits orderCreated event', () => {
    const payload = { id: 'order-1' };
    gateway.emitOrderCreated(payload);
    expect(gateway.server.emit).toHaveBeenCalledWith(WS_EVENTS.ORDER_CREATED, payload);
  });

  it('emits dashboardMetricsUpdated event', () => {
    const metrics = { totalOrders: 10 };
    gateway.emitDashboardMetricsUpdated(metrics);
    expect(gateway.server.emit).toHaveBeenCalledWith(
      WS_EVENTS.DASHBOARD_METRICS_UPDATED,
      metrics,
    );
  });
});
