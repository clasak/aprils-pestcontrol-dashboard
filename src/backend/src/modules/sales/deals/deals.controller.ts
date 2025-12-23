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
import { DealsService } from './deals.service';
import { CreateDealDto } from '../dto/create-deal.dto';
import { UpdateDealDto } from '../dto/update-deal.dto';
import { DealStage } from '../entities/deal.entity';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';

@ApiTags('deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales/deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all deals with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated deals' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('stage') stage?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('salesRepId') salesRepId?: string,
    @Query('minValue') minValue?: number,
    @Query('maxValue') maxValue?: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @CurrentUser() user?: any,
  ) {
    return this.dealsService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
      stage,
      assignedTo,
      salesRepId,
      minValue: minValue ? Number(minValue) : undefined,
      maxValue: maxValue ? Number(maxValue) : undefined,
      fromDate,
      toDate,
      companyId: user?.companyId,
    });
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get pipeline view grouped by stage' })
  @ApiResponse({ status: 200, description: 'Returns pipeline view' })
  async getPipeline(@CurrentUser() user?: any) {
    return this.dealsService.getPipelineView(user?.companyId);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get sales forecast' })
  @ApiResponse({ status: 200, description: 'Returns sales forecast' })
  async getForecast(@CurrentUser() user?: any) {
    return this.dealsService.getForecast(user?.companyId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get deal statistics and metrics' })
  @ApiResponse({ status: 200, description: 'Returns deal statistics' })
  async getStatistics(@CurrentUser() user?: any) {
    return this.dealsService.getStatistics(user?.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deal by ID' })
  @ApiResponse({ status: 200, description: 'Returns deal details' })
  @ApiResponse({ status: 404, description: 'Deal not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: any,
  ) {
    return this.dealsService.findOne(id, user?.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new deal' })
  @ApiResponse({ status: 201, description: 'Deal created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDealDto: CreateDealDto,
    @CurrentUser() user?: any,
  ) {
    return this.dealsService.create(createDealDto, user?.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update deal' })
  @ApiResponse({ status: 200, description: 'Deal updated successfully' })
  @ApiResponse({ status: 404, description: 'Deal not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDealDto: UpdateDealDto,
    @CurrentUser() user?: any,
  ) {
    return this.dealsService.update(id, updateDealDto, user?.id, user?.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete deal' })
  @ApiResponse({ status: 200, description: 'Deal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Deal not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: any,
  ) {
    return this.dealsService.remove(id, user?.companyId);
  }

  @Post(':id/move-stage')
  @ApiOperation({ summary: 'Move deal to a different stage' })
  @ApiResponse({ status: 200, description: 'Deal moved successfully' })
  async moveToStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('stage') stage: DealStage,
    @CurrentUser() user?: any,
  ) {
    return this.dealsService.moveToStage(id, stage, user?.id, user?.companyId);
  }

  @Post(':id/mark-won')
  @ApiOperation({ summary: 'Mark deal as won' })
  @ApiResponse({ status: 200, description: 'Deal marked as won' })
  async markWon(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('wonReason') wonReason?: string,
    @CurrentUser() user?: any,
  ) {
    return this.dealsService.markAsWon(id, wonReason, user?.id, user?.companyId);
  }

  @Post(':id/mark-lost')
  @ApiOperation({ summary: 'Mark deal as lost' })
  @ApiResponse({ status: 200, description: 'Deal marked as lost' })
  async markLost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('lostReason') lostReason: string,
    @Body('lostToCompetitor') lostToCompetitor?: string,
    @CurrentUser() user?: any,
  ) {
    return this.dealsService.markAsLost(
      id,
      lostReason,
      lostToCompetitor,
      user?.id,
      user?.companyId,
    );
  }
}
