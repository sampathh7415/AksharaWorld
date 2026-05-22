import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getDashboardMetrics() {
    const cached = await this.redis.get('dashboard:metrics');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        /* recompute */
      }
    }
    return this.computeDashboardMetrics();
  }

  async computeDashboardMetrics() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      activeCustomers,
      lowStockProducts,
      completedPaymentsToday,
      completedPaymentsMonth,
      revenueTodayAgg,
      revenueMonthAgg,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.customer.count({ where: { isActive: true } }),
      Promise.resolve(0),
      this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: { gte: startOfDay },
        },
        select: { amount: true },
      }),
      this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: { gte: startOfMonth },
        },
        select: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED, createdAt: { gte: startOfDay } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED, createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
    ]);

    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { stock: true, lowStockThreshold: true },
    });
    const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

    const totalSales = completedPaymentsMonth.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const liveRevenue = completedPaymentsToday.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    return {
      totalSales: Number(revenueMonthAgg._sum.amount ?? totalSales),
      totalOrders,
      pendingOrders,
      lowStockProducts: lowStockCount || lowStockProducts,
      activeCustomers,
      liveRevenue: Number(revenueTodayAgg._sum.amount ?? liveRevenue),
      dailyRevenue: Number(revenueTodayAgg._sum.amount ?? liveRevenue),
      monthlyRevenue: Number(revenueMonthAgg._sum.amount ?? totalSales),
      updatedAt: new Date().toISOString(),
    };
  }

  async getDailySales(days = 7) {
    const results: { date: string; revenue: number; orders: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const [payments, orders] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            status: PaymentStatus.COMPLETED,
            createdAt: { gte: start, lte: end },
          },
          _sum: { amount: true },
        }),
        this.prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
      ]);

      results.push({
        date: start.toISOString().slice(0, 10),
        revenue: Number(payments._sum.amount ?? 0),
        orders,
      });
    }
    return results;
  }

  async getTopProducts(limit = 5) {
    const items = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });
    const products = await this.prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });
    return items.map((item) => ({
      product: products.find((p) => p.id === item.productId),
      quantitySold: item._sum.quantity ?? 0,
    }));
  }
}
