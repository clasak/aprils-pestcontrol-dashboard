import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:8080');
  app.enableCors({
    origin: corsOrigins.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger API Documentation
  if (configService.get<boolean>('ENABLE_API_DOCS', true)) {
    const config = new DocumentBuilder()
      .setTitle("April's Pest Control CRM API")
      .setDescription('Comprehensive API documentation for all-in-one pest control management platform. Powered by CompassIQ.')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication & Authorization')
      .addTag('sales', 'Sales & Lead Management')
      .addTag('operations', 'Operations & Service Delivery')
      .addTag('hr', 'Human Resources')
      .addTag('finance', 'Finance & Accounting')
      .addTag('marketing', 'Marketing & Campaigns')
      .addTag('customer-service', 'Customer Service')
      .addTag('inventory', 'Inventory Management')
      .addTag('compliance', 'Compliance & Safety')
      .addTag('admin', 'Admin & Settings')
      .addTag('dashboards', 'Dashboards & Analytics')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    console.log(`[Swagger] API Documentation available at http://localhost:${port}/api/docs`);
  }

  await app.listen(port);

  console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   April's Pest Control CRM - Backend API                 ║
    ║                                                           ║
    ║   Environment: ${nodeEnv.padEnd(39)}║
    ║   Port:        ${port.toString().padEnd(39)}║
    ║   API URL:     http://localhost:${port}/api/v1${' '.repeat(15)}║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
