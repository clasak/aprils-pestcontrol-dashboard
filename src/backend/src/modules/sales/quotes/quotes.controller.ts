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
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  SendQuoteDto,
  AcceptQuoteDto,
  RejectQuoteDto,
  QuoteQueryDto,
} from '../dto/create-quote.dto';

@ApiTags('quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales/quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quote' })
  @ApiResponse({ status: 201, description: 'Quote created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async create(@Body() createDto: CreateQuoteDto, @Req() req: any) {
    const companyId = req.user?.companyId || 'default-company-id'; // TODO: Get from auth
    const userId = req.user?.id;
    const quote = await this.quotesService.create(companyId, createDto, userId);
    return {
      success: true,
      data: quote,
      message: 'Quote created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotes with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Returns quotes list' })
  async findAll(@Query() query: QuoteQueryDto, @Req() req: any) {
    const companyId = req.user?.companyId || 'default-company-id';
    const result = await this.quotesService.findAll(companyId, query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get quote statistics' })
  @ApiResponse({ status: 200, description: 'Returns quote statistics' })
  async getStatistics(@Req() req: any) {
    const companyId = req.user?.companyId || 'default-company-id';
    const stats = await this.quotesService.getStatistics(companyId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quote by ID' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({ status: 200, description: 'Returns the quote' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.companyId || 'default-company-id';
    const quote = await this.quotesService.findOne(companyId, id);
    return {
      success: true,
      data: quote,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({ status: 200, description: 'Quote updated successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateQuoteDto,
    @Query('createVersion') createVersion: string,
    @Req() req: any,
  ) {
    const companyId = req.user?.companyId || 'default-company-id';
    const userId = req.user?.id;
    const shouldCreateVersion = createVersion === 'true';
    const quote = await this.quotesService.update(companyId, id, updateDto, userId, shouldCreateVersion);
    return {
      success: true,
      data: quote,
      message: shouldCreateVersion ? 'New quote version created' : 'Quote updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({ status: 200, description: 'Quote deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.companyId || 'default-company-id';
    await this.quotesService.remove(companyId, id);
    return {
      success: true,
      message: 'Quote deleted successfully',
    };
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone a quote' })
  @ApiParam({ name: 'id', description: 'Quote ID to clone' })
  @ApiResponse({ status: 201, description: 'Quote cloned successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async clone(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.companyId || 'default-company-id';
    const userId = req.user?.id;
    const quote = await this.quotesService.clone(companyId, id, userId);
    return {
      success: true,
      data: quote,
      message: 'Quote cloned successfully',
    };
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send a quote via email' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({ status: 200, description: 'Quote sent successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async sendQuote(
    @Param('id') id: string,
    @Body() sendDto: SendQuoteDto,
    @Req() req: any,
  ) {
    const companyId = req.user?.companyId || 'default-company-id';
    const userId = req.user?.id;
    const quote = await this.quotesService.sendQuote(companyId, id, sendDto, userId);
    return {
      success: true,
      data: quote,
      message: 'Quote sent successfully',
    };
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a quote view (called when customer views the quote)' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({ status: 200, description: 'View recorded' })
  async recordView(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.companyId || 'default-company-id';
    const ip = req.ip || req.connection?.remoteAddress;
    const quote = await this.quotesService.recordView(companyId, id, ip);
    return {
      success: true,
      data: quote,
    };
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a quote (customer acceptance)' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({ status: 200, description: 'Quote accepted successfully' })
  @ApiResponse({ status: 400, description: 'Quote cannot be accepted' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async accept(
    @Param('id') id: string,
    @Body() acceptDto: AcceptQuoteDto,
    @Req() req: any,
  ) {
    const companyId = req.user?.companyId || 'default-company-id';
    const ip = req.ip || req.connection?.remoteAddress;
    const quote = await this.quotesService.accept(companyId, id, acceptDto, ip);
    return {
      success: true,
      data: quote,
      message: 'Quote accepted successfully',
    };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({ status: 200, description: 'Quote rejected' })
  @ApiResponse({ status: 400, description: 'Quote cannot be rejected' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectQuoteDto,
    @Req() req: any,
  ) {
    const companyId = req.user?.companyId || 'default-company-id';
    const quote = await this.quotesService.reject(companyId, id, rejectDto);
    return {
      success: true,
      data: quote,
      message: 'Quote rejected',
    };
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get version history for a quote' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({ status: 200, description: 'Returns version history' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async getVersionHistory(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.companyId || 'default-company-id';
    const versions = await this.quotesService.getVersionHistory(companyId, id);
    return {
      success: true,
      data: versions,
    };
  }
}

