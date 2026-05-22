import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from '../analytics/analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('metrics')
@ApiBearerAuth()
@Controller('metrics')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class MetricsController {
  constructor(private analytics: AnalyticsService) {}

  @Get()
  async getMetrics() {
    const [dashboard, dailySales, topProducts] = await Promise.all([
      this.analytics.getDashboardMetrics(),
      this.analytics.getDailySales(30),
      this.analytics.getTopProducts(10),
    ]);
    return { dashboard, dailySales, topProducts };
  }
}
