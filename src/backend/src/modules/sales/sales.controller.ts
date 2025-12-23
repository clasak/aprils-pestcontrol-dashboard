import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sales records' })
  @ApiResponse({ status: 200, description: 'Returns all sales records' })
  findAll(@Query() query: any) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales record by ID' })
  @ApiResponse({ status: 200, description: 'Returns sales record' })
  @ApiResponse({ status: 404, description: 'Sales record not found' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new sales record' })
  @ApiResponse({ status: 201, description: 'Sales record created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() createDto: any) {
    return this.salesService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sales record' })
  @ApiResponse({ status: 200, description: 'Sales record updated successfully' })
  @ApiResponse({ status: 404, description: 'Sales record not found' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.salesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sales record' })
  @ApiResponse({ status: 200, description: 'Sales record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sales record not found' })
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}
