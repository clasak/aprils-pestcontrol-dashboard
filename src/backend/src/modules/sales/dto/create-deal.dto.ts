import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  IsDateString,
  IsUUID,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import {
  DealStatus,
  DealStage,
  ServiceFrequency,
} from '../entities/deal.entity';

export class CreateDealDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  orgId: string;

  @ApiProperty({ description: 'Contact ID' })
  @IsUUID()
  contactId: string;

  @ApiPropertyOptional({ description: 'Lead ID (if converted from lead)' })
  @IsUUID()
  @IsOptional()
  leadId?: string;

  @ApiProperty({ description: 'Deal title', example: 'Quarterly pest control service' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Deal status', enum: DealStatus })
  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;

  @ApiPropertyOptional({ description: 'Deal stage', enum: DealStage })
  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage;

  @ApiProperty({ description: 'Deal value in cents', example: 75000 })
  @IsNumber()
  @Min(0)
  dealValueCents: number;

  @ApiPropertyOptional({ description: 'Recurring revenue in cents', example: 15000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  recurringRevenueCents?: number;

  @ApiPropertyOptional({ description: 'Service frequency', enum: ServiceFrequency })
  @IsEnum(ServiceFrequency)
  @IsOptional()
  serviceFrequency?: ServiceFrequency;

  @ApiPropertyOptional({ description: 'Contract length in months', example: 12 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  contractLengthMonths?: number;

  @ApiPropertyOptional({ description: 'Win probability (0-100)', example: 75 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  winProbability?: number;

  @ApiPropertyOptional({ description: 'Expected close date', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Sales rep ID' })
  @IsUUID()
  @IsOptional()
  salesRepId?: string;

  @ApiPropertyOptional({ description: 'Service type' })
  @IsString()
  @IsOptional()
  serviceType?: string;

  @ApiPropertyOptional({ description: 'Pest types', example: ['ants', 'termites'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pestTypes?: string[];

  @ApiPropertyOptional({ description: 'Property type' })
  @IsString()
  @IsOptional()
  propertyType?: string;

  @ApiPropertyOptional({ description: 'Property size in sq ft' })
  @IsNumber()
  @IsOptional()
  propertySizeSqft?: number;

  @ApiPropertyOptional({ description: 'Service address line 1' })
  @IsString()
  @IsOptional()
  serviceAddressLine1?: string;

  @ApiPropertyOptional({ description: 'Service address line 2' })
  @IsString()
  @IsOptional()
  serviceAddressLine2?: string;

  @ApiPropertyOptional({ description: 'Service city' })
  @IsString()
  @IsOptional()
  serviceCity?: string;

  @ApiPropertyOptional({ description: 'Service state' })
  @IsString()
  @IsOptional()
  serviceState?: string;

  @ApiPropertyOptional({ description: 'Service postal code' })
  @IsString()
  @IsOptional()
  servicePostalCode?: string;

  @ApiPropertyOptional({ description: 'Competitors', example: ['CompanyA', 'CompanyB'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  competitors?: string[];

  @ApiPropertyOptional({ description: 'Competitive advantage' })
  @IsString()
  @IsOptional()
  competitiveAdvantage?: string;

  @ApiPropertyOptional({ description: 'Current provider' })
  @IsString()
  @IsOptional()
  currentProvider?: string;

  @ApiPropertyOptional({ description: 'Next follow-up date' })
  @IsDateString()
  @IsOptional()
  nextFollowUpDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags', example: ['high-value', 'commercial'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Custom fields (JSON)' })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Metadata (JSON)' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
