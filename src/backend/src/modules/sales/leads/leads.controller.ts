import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all leads with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated leads' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('priority') priority?: string,
    @Query('minScore') minScore?: number,
    @Query('maxScore') maxScore?: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @CurrentUser() user?: any,
  ) {
    return this.leadsService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
      assignedTo,
      priority,
      minScore: minScore ? Number(minScore) : undefined,
      maxScore: maxScore ? Number(maxScore) : undefined,
      fromDate,
      toDate,
      companyId: user?.companyId,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get lead statistics and metrics' })
  @ApiResponse({ status: 200, description: 'Returns lead statistics' })
  async getStatistics(@CurrentUser() user?: any) {
    return this.leadsService.getLeadStatistics(user?.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({ status: 200, description: 'Returns lead details' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: any,
  ) {
    return this.leadsService.findOne(id, user?.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createLeadDto: CreateLeadDto,
    @CurrentUser() user?: any,
  ) {
    return this.leadsService.create(createLeadDto, user?.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @CurrentUser() user?: any,
  ) {
    return this.leadsService.update(id, updateLeadDto, user?.id, user?.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: any,
  ) {
    return this.leadsService.remove(id, user?.companyId);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign lead to user' })
  @ApiResponse({ status: 200, description: 'Lead assigned successfully' })
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('assignedTo') assignedTo: string,
    @CurrentUser() user?: any,
  ) {
    return this.leadsService.assignLead(id, assignedTo, user?.id, user?.companyId);
  }

  @Post(':id/qualify')
  @ApiOperation({ summary: 'Qualify or disqualify lead' })
  @ApiResponse({ status: 200, description: 'Lead qualification updated' })
  async qualify(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isQualified') isQualified: boolean,
    @Body('notes') notes?: string,
    @CurrentUser() user?: any,
  ) {
    return this.leadsService.qualifyLead(
      id,
      isQualified,
      notes,
      user?.id,
      user?.companyId,
    );
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert lead to deal' })
  @ApiResponse({ status: 200, description: 'Lead converted successfully' })
  async convert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('dealId') dealId: string,
    @CurrentUser() user?: any,
  ) {
    return this.leadsService.convertToDeal(id, dealId, user?.id, user?.companyId);
  }

  @Post(':id/mark-lost')
  @ApiOperation({ summary: 'Mark lead as lost' })
  @ApiResponse({ status: 200, description: 'Lead marked as lost' })
  async markLost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser() user?: any,
  ) {
    return this.leadsService.markAsLost(id, reason, user?.id, user?.companyId);
  }
}
