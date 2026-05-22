import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let settings = await this.prisma.businessSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.businessSettings.create({ data: {} });
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto) {
    const existing = await this.get();
    const data: Prisma.BusinessSettingsUpdateInput = { ...dto };
    if (dto.taxRate != null) data.taxRate = new Prisma.Decimal(dto.taxRate);
    return this.prisma.businessSettings.update({
      where: { id: existing.id },
      data,
    });
  }
}
