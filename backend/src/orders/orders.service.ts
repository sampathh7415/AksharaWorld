import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EventsService } from '../events/events.service';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private events: EventsService,
    private products: ProductsService,
    private notifications: NotificationsService,
  ) {}

  async findAll(filters: {
    search?: string;
    status?: OrderStatus;
    customerId?: string;
  }) {
    const where: Prisma.OrderWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { customer: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(dto: CreateOrderDto, userId?: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    let subtotal = new Prisma.Decimal(0);
    const itemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || !product.isActive) {
        throw new BadRequestException(`Product ${item.productId} not available`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }
      const unitPrice = new Prisma.Decimal(item.unitPrice ?? Number(product.price));
      const lineTotal = unitPrice.mul(item.quantity);
      subtotal = subtotal.add(lineTotal);
      itemsData.push({
        product: { connect: { id: product.id } },
        quantity: item.quantity,
        unitPrice,
        total: lineTotal,
      });
    }

    const settings = await this.prisma.businessSettings.findFirst();
    const taxRate = settings?.taxRate ?? new Prisma.Decimal(0);
    const tax = subtotal.mul(taxRate);
    const total = subtotal.add(tax);

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new BadRequestException(`Product ${item.productId} not found`);
        const newStock = product.stock - item.quantity;
        if (newStock < 0) throw new BadRequestException(`Insufficient stock for ${product.name}`);
        await tx.product.update({ where: { id: item.productId }, data: { stock: newStock } });
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: `Order ${orderNumber}`,
            previousStock: product.stock,
            newStock,
            userId,
          },
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          customerId: dto.customerId,
          status: OrderStatus.PENDING,
          subtotal,
          tax,
          total,
          notes: dto.notes,
          createdById: userId,
          items: { create: itemsData },
        },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      });
    });

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (product) {
        this.events.inventoryUpdated(product);
        if (product.stock <= product.lowStockThreshold) {
          this.events.lowStockAlert({
            productId: product.id,
            name: product.name,
            stock: product.stock,
            threshold: product.lowStockThreshold,
          });
        }
      }
    }

    await this.audit.log({
      userId,
      action: 'ORDER_CREATED',
      entity: 'Order',
      entityId: order.id,
    });

    const notification = await this.notifications.createSystem({
      title: 'New order',
      message: `Order ${order.orderNumber} created — $${Number(order.total).toFixed(2)}`,
      type: 'ORDER',
      metadata: { orderId: order.id },
    });

    this.events.orderCreated(order);
    this.events.notificationCreated(notification);
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, userId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    if (dto.status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      const full = await this.findOne(id);
      for (const item of full.items) {
        await this.products.adjustStock(
          item.productId,
          { change: item.quantity, reason: `Cancelled order ${order.orderNumber}` },
          userId,
        );
      }
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true,
      },
    });

    await this.audit.log({
      userId,
      action: 'ORDER_STATUS_UPDATED',
      entity: 'Order',
      entityId: id,
      details: { status: dto.status },
    });

    this.events.orderUpdated(updated);
    return updated;
  }

  async cancel(id: string, userId?: string) {
    return this.updateStatus(id, { status: OrderStatus.CANCELLED }, userId);
  }
}
