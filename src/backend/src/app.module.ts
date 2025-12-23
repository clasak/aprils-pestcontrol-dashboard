import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Configuration
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import awsConfig from './config/aws.config';
import redisConfig from './config/redis.config';

// Shared modules
import { DatabaseModule } from './shared/database/database.module';
import { AuthModule } from './shared/auth/auth.module';
import { EventsModule } from './shared/events/events.module';
import { EmailModule } from './shared/email/email.module';

// Department modules
import { SalesModule } from './modules/sales/sales.module';
import { OperationsModule } from './modules/operations/operations.module';
import { HrModule } from './modules/hr/hr.module';
import { FinanceModule } from './modules/finance/finance.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { CustomerServiceModule } from './modules/customer-service/customer-service.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { AdminModule } from './modules/admin/admin.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';

// Health check
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, awsConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging', false),
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsRun: false,
      }),
    }),

    // Redis & Bull Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.db', 0),
        },
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('RATE_LIMIT_TTL', 60),
        limit: configService.get('RATE_LIMIT_MAX', 100),
      }),
    }),

    // Task scheduling
    ScheduleModule.forRoot(),

    // Event emitter for cross-module communication
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
    }),

    // Shared modules
    DatabaseModule,
    AuthModule,
    EventsModule,
    EmailModule,

    // Department modules
    SalesModule,
    OperationsModule,
    HrModule,
    FinanceModule,
    MarketingModule,
    CustomerServiceModule,
    InventoryModule,
    ComplianceModule,
    AdminModule,
    DashboardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
