import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { RequestLoggerMiddleware } from './request-logger.middleware';

@Global()
@Module({
  providers: [LoggerService, RequestLoggerMiddleware],
  exports: [LoggerService, RequestLoggerMiddleware],
})
export class LoggerModule {}
