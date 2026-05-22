import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  async findAll(userId?: string, unreadOnly?: boolean) {
    const where: Prisma.NotificationWhereInput = {};
    if (userId) where.OR = [{ userId }, { userId: null }];
    if (unreadOnly) where.isRead = false;
    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markAsRead(id: string, userId?: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllRead(userId?: string) {
    const where: Prisma.NotificationWhereInput = { isRead: false };
    if (userId) where.OR = [{ userId }, { userId: null }];
    await this.prisma.notification.updateMany({ where, data: { isRead: true } });
    return { success: true };
  }

  async create(dto: CreateNotificationDto, actorId?: string) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type ?? NotificationType.INFO,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
    });
    this.events.notificationCreated(notification);
    return notification;
  }

  async createSystem(data: {
    title: string;
    message: string;
    type?: keyof typeof NotificationType | string;
    metadata?: Record<string, unknown>;
    userId?: string;
  }) {
    const type =
      (NotificationType[data.type as keyof typeof NotificationType] as NotificationType) ??
      NotificationType.INFO;
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }
}
