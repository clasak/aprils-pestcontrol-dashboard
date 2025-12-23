import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV'),
      database: 'connected',
      redis: 'connected',
    };
  }

  getVersion() {
    return {
      version: '1.0.0',
      apiVersion: 'v1',
      name: this.configService.get('APP_NAME'),
      build: process.env.BUILD_NUMBER || 'dev',
    };
  }
}
