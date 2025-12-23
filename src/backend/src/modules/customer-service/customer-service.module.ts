import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerServiceController } from './customer-service.controller';
import { CustomerServiceService } from './customer-service.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [CustomerServiceController],
  providers: [CustomerServiceService],
  exports: [CustomerServiceService],
})
export class CustomerServiceModule {}
