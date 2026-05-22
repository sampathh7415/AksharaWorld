import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: Prisma.InputJsonValue;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }
}
