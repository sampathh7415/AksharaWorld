import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EventsService } from '../events/events.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private events: EventsService,
  ) {}

  async findAll(search?: string) {
    const where: Prisma.CustomerWhereInput = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { orders: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(dto: CreateCustomerDto, userId?: string) {
    const customer = await this.prisma.customer.create({ data: dto });
    await this.audit.log({
      userId,
      action: 'CUSTOMER_CREATED',
      entity: 'Customer',
      entityId: customer.id,
    });
    void this.events.broadcastDashboardMetrics();
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto, userId?: string) {
    const customer = await this.prisma.customer.update({ where: { id }, data: dto });
    await this.audit.log({
      userId,
      action: 'CUSTOMER_UPDATED',
      entity: 'Customer',
      entityId: id,
    });
    void this.events.broadcastDashboardMetrics();
    return customer;
  }

  async remove(id: string, userId?: string) {
    await this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log({
      userId,
      action: 'CUSTOMER_DEACTIVATED',
      entity: 'Customer',
      entityId: id,
    });
    void this.events.broadcastDashboardMetrics();
    return { success: true };
  }
}
