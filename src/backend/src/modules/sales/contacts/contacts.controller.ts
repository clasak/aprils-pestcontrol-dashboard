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
import { ContactsService } from './contacts.service';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';

@ApiTags('contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all contacts with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated contacts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: String })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('tags') tags?: string,
    @CurrentUser() user?: any,
  ) {
    return this.contactsService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
      type,
      status,
      tags,
      companyId: user?.companyId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiResponse({ status: 200, description: 'Returns contact details' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: any,
  ) {
    return this.contactsService.findOne(id, user?.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new contact' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createContactDto: CreateContactDto,
    @CurrentUser() user?: any,
  ) {
    return this.contactsService.create(createContactDto, user?.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contact' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
    @CurrentUser() user?: any,
  ) {
    return this.contactsService.update(id, updateContactDto, user?.id, user?.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete contact' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: any,
  ) {
    return this.contactsService.remove(id, user?.companyId);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted contact' })
  @ApiResponse({ status: 200, description: 'Contact restored successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: any,
  ) {
    return this.contactsService.restore(id, user?.companyId);
  }

  @Get('search/autocomplete')
  @ApiOperation({ summary: 'Autocomplete search for contacts' })
  @ApiResponse({ status: 200, description: 'Returns matching contacts' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async autocomplete(
    @Query('q') query: string,
    @CurrentUser() user?: any,
  ) {
    return this.contactsService.autocomplete(query, user?.companyId);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export contacts to CSV' })
  @ApiResponse({ status: 200, description: 'Returns CSV file' })
  async exportCsv(@CurrentUser() user?: any) {
    return this.contactsService.exportToCsv(user?.companyId);
  }
}
