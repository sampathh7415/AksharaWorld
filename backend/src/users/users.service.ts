import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(search?: string, role?: UserRole) {
    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto, actorId: string) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
    await this.audit.log({
      userId: actorId,
      action: 'USER_CREATED',
      entity: 'User',
      entityId: user.id,
    });
    return user;
  }

  async update(id: string, dto: UpdateUserDto, actorId: string) {
    const data: Prisma.UserUpdateInput = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
      delete (dto as { password?: string }).password;
    }
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
    await this.audit.log({
      userId: actorId,
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: id,
    });
    return user;
  }

  async remove(id: string, actorId: string, actorRole: UserRole) {
    if (id === actorId) throw new ForbiddenException('Cannot delete yourself');
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log({
      userId: actorId,
      action: 'USER_DEACTIVATED',
      entity: 'User',
      entityId: id,
    });
    return { success: true };
  }
}
