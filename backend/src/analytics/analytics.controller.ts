import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('dashboard')
  dashboard() {
    return this.analytics.getDashboardMetrics();
  }

  @Get('daily-sales')
  dailySales(@Query('days') days?: string) {
    return this.analytics.getDailySales(parseInt(days || '7', 10));
  }

  @Get('top-products')
  topProducts(@Query('limit') limit?: string) {
    return this.analytics.getTopProducts(parseInt(limit || '5', 10));
  }
}
