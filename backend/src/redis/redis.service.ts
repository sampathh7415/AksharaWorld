import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;
  private readonly logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    const url = process.env.REDIS_URL;
    if (url) {
      try {
        this.client = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: true });
        this.client.connect().catch((err) => {
          this.logger.warn(`Redis unavailable: ${err.message}`, 'RedisService');
          this.client = null;
        });
      } catch (err) {
        this.logger.warn('Redis init failed — cache disabled', 'RedisService');
      }
    }
  }

  get isConnected(): boolean {
    return this.client?.status === 'ready';
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }
}
