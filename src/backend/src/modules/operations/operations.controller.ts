import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OperationsService } from './operations.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';

@ApiTags('operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get()
  findAll() {
    return this.operationsService.findAll();
  }
}
