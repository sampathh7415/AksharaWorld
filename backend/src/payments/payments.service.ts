import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Prisma, PaymentProvider } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EventsService } from '../events/events.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private events: EventsService,
    private notifications: NotificationsService,
  ) {}

  async findAll(filters?: { status?: PaymentStatus; orderId?: string }) {
    const where: Prisma.PaymentWhereInput = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.orderId) where.orderId = filters.orderId;
    return this.prisma.payment.findMany({
      where,
      include: { order: true, customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: true, customer: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async create(dto: CreatePaymentDto, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { customer: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        customerId: order.customerId,
        amount: new Prisma.Decimal(dto.amount),
        currency: dto.currency ?? 'USD',
        status: dto.status ?? PaymentStatus.PENDING,
        provider: dto.provider ?? PaymentProvider.MANUAL,
        providerRef: dto.providerRef,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
      include: { order: true, customer: true },
    });

    await this.audit.log({
      userId,
      action: 'PAYMENT_CREATED',
      entity: 'Payment',
      entityId: payment.id,
    });

    this.events.paymentUpdated(payment);
    const notification = await this.notifications.createSystem({
      title: 'Payment recorded',
      message: `Payment of $${Number(payment.amount).toFixed(2)} for order ${order.orderNumber}`,
      type: 'PAYMENT',
      metadata: { paymentId: payment.id },
    });
    this.events.notificationCreated(notification);
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto, userId?: string) {
    const data: Prisma.PaymentUpdateInput = { ...dto };
    if (dto.amount != null) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.refundAmount != null) data.refundAmount = new Prisma.Decimal(dto.refundAmount);

    const payment = await this.prisma.payment.update({
      where: { id },
      data,
      include: { order: true, customer: true },
    });

    await this.audit.log({
      userId,
      action: 'PAYMENT_UPDATED',
      entity: 'Payment',
      entityId: id,
      details: { status: dto.status, refundStatus: dto.refundStatus },
    });

    this.events.paymentUpdated(payment);
    return payment;
  }
}
