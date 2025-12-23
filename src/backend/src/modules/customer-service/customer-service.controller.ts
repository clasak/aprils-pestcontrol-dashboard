import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerServiceService } from './customer-service.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';

@ApiTags('customer-service')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customer-service')
export class CustomerServiceController {
  constructor(private readonly customerServiceService: CustomerServiceService) {}

  @Get()
  findAll() {
    return this.customerServiceService.findAll();
  }
}
