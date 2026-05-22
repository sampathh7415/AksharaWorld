import { Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [forwardRef(() => AnalyticsModule)],
  providers: [EventsGateway, EventsService],
  exports: [EventsService, EventsGateway],
})
export class EventsModule {}
