import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [AnalyticsModule],
  controllers: [MetricsController],
})
export class MetricsModule {}
