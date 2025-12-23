import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  IsBoolean,
  IsDateString,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import {
  LeadStatus,
  LeadSourceCategory,
  LeadPriority,
} from '../entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  orgId: string;

  @ApiProperty({ description: 'Contact ID' })
  @IsUUID()
  contactId: string;

  @ApiProperty({ description: 'Lead title', example: 'Ant infestation at 123 Main St' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Lead status', enum: LeadStatus })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Lead priority', enum: LeadPriority })
  @IsEnum(LeadPriority)
  @IsOptional()
  priority?: LeadPriority;

  @ApiProperty({ description: 'Lead source', example: 'Google Ads' })
  @IsString()
  leadSource: string;

  @ApiPropertyOptional({ description: 'Lead source category', enum: LeadSourceCategory })
  @IsEnum(LeadSourceCategory)
  @IsOptional()
  leadSourceCategory?: LeadSourceCategory;

  @ApiPropertyOptional({ description: 'Campaign ID' })
  @IsString()
  @IsOptional()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Referral source name' })
  @IsString()
  @IsOptional()
  referralSource?: string;

  @ApiPropertyOptional({ description: 'Lead score (0-100)', example: 75 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  leadScore?: number;

  @ApiPropertyOptional({ description: 'Score factors (JSON)' })
  @IsObject()
  @IsOptional()
  scoreFactors?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Service type requested' })
  @IsString()
  @IsOptional()
  serviceType?: string;

  @ApiPropertyOptional({ description: 'Types of pests', example: ['ants', 'roaches'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pestTypes?: string[];

  @ApiPropertyOptional({ description: 'Severity level', example: 'high' })
  @IsString()
  @IsOptional()
  severityLevel?: string;

  @ApiPropertyOptional({ description: 'Property type' })
  @IsString()
  @IsOptional()
  propertyType?: string;

  @ApiPropertyOptional({ description: 'Property size in sq ft' })
  @IsNumber()
  @IsOptional()
  propertySizeSqft?: number;

  @ApiPropertyOptional({ description: 'Estimated value in cents', example: 50000 })
  @IsNumber()
  @IsOptional()
  estimatedValueCents?: number;

  @ApiPropertyOptional({ description: 'Expected close date', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ description: 'Urgency level' })
  @IsString()
  @IsOptional()
  urgency?: string;

  @ApiPropertyOptional({ description: 'Next follow-up date' })
  @IsDateString()
  @IsOptional()
  nextFollowUpDate?: string;

  @ApiPropertyOptional({ description: 'Is the lead qualified?' })
  @IsBoolean()
  @IsOptional()
  isQualified?: boolean;

  @ApiPropertyOptional({ description: 'Qualification notes' })
  @IsString()
  @IsOptional()
  qualificationNotes?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags', example: ['urgent', 'commercial'] })
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
