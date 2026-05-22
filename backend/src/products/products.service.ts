import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EventsService } from '../events/events.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateProductDto,
  UpdateProductDto,
  AdjustStockDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private events: EventsService,
    private notifications: NotificationsService,
  ) {}

  async findAll(search?: string, lowStockOnly?: boolean) {
    const where: Prisma.ProductWhereInput = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    const products = await this.prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    if (lowStockOnly) {
      return products.filter((p) => p.stock <= p.lowStockThreshold);
    }
    return products;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { inventoryLogs: { take: 20, orderBy: { createdAt: 'desc' } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto, userId?: string) {
    const product = await this.prisma.product.create({
      data: {
        ...dto,
        price: new Prisma.Decimal(dto.price),
        cost: dto.cost != null ? new Prisma.Decimal(dto.cost) : undefined,
      },
    });
    await this.audit.log({
      userId,
      action: 'PRODUCT_CREATED',
      entity: 'Product',
      entityId: product.id,
    });
    this.events.inventoryUpdated(product);
    await this.checkLowStock(product, userId);
    void this.events.broadcastDashboardMetrics();
    return product;
  }

  async update(id: string, dto: UpdateProductDto, userId?: string) {
    const data: Prisma.ProductUpdateInput = { ...dto };
    if (dto.price != null) data.price = new Prisma.Decimal(dto.price);
    if (dto.cost != null) data.cost = new Prisma.Decimal(dto.cost);
    const product = await this.prisma.product.update({ where: { id }, data });
    await this.audit.log({
      userId,
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entityId: id,
    });
    this.events.inventoryUpdated(product);
    await this.checkLowStock(product, userId);
    void this.events.broadcastDashboardMetrics();
    return product;
  }

  async remove(id: string, userId?: string) {
    const product = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log({
      userId,
      action: 'PRODUCT_DEACTIVATED',
      entity: 'Product',
      entityId: id,
    });
    this.events.inventoryUpdated(product);
    return { success: true };
  }

  async adjustStock(id: string, dto: AdjustStockDto, userId?: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const newStock = product.stock + dto.change;
    if (newStock < 0) throw new BadRequestException('Insufficient stock');

    const updated = await this.prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: { stock: newStock },
      });
      await tx.inventoryLog.create({
        data: {
          productId: id,
          change: dto.change,
          reason: dto.reason,
          previousStock: product.stock,
          newStock,
          userId,
        },
      });
      return p;
    });

    await this.audit.log({
      userId,
      action: 'INVENTORY_ADJUSTED',
      entity: 'Product',
      entityId: id,
      details: { change: dto.change, reason: dto.reason },
    });

    this.events.inventoryUpdated(updated);
    await this.checkLowStock(updated, userId);
    void this.events.broadcastDashboardMetrics();
    return updated;
  }

  private async checkLowStock(
    product: { id: string; name: string; stock: number; lowStockThreshold: number },
    userId?: string,
  ) {
    if (product.stock > product.lowStockThreshold) return;

    const payload = {
      productId: product.id,
      name: product.name,
      stock: product.stock,
      threshold: product.lowStockThreshold,
    };
    this.events.lowStockAlert(payload);

    const notification = await this.notifications.createSystem({
      title: 'Low stock alert',
      message: `${product.name} is low (${product.stock} left)`,
      type: 'LOW_STOCK' as const,
      metadata: payload,
    });
    this.events.notificationCreated(notification);
  }
}
