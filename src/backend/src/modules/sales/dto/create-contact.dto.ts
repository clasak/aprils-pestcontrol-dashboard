import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { ContactType, ContactStatus } from '../entities/contact.entity';

export class CreateContactDto {
  @ApiProperty({ description: 'Company ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ description: 'Middle name', example: 'Michael' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  middleName?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'john.doe@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Primary phone number', example: '+1-555-123-4567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Mobile phone number', example: '+1-555-987-6543' })
  @IsString()
  @IsOptional()
  mobilePhone?: string;

  @ApiPropertyOptional({ description: 'Work phone number', example: '+1-555-111-2222' })
  @IsString()
  @IsOptional()
  workPhone?: string;

  @ApiPropertyOptional({ description: 'Job title', example: 'Facility Manager' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: 'Department', example: 'Operations' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    description: 'Contact type',
    enum: ContactType,
    example: ContactType.RESIDENTIAL,
  })
  @IsEnum(ContactType)
  @IsOptional()
  type?: ContactType;

  @ApiPropertyOptional({
    description: 'Contact status',
    enum: ContactStatus,
    example: ContactStatus.ACTIVE,
  })
  @IsEnum(ContactStatus)
  @IsOptional()
  status?: ContactStatus;

  @ApiPropertyOptional({ description: 'Address line 1', example: '123 Main St' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Address line 2', example: 'Apt 4B' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'City', example: 'San Francisco' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'State', example: 'CA' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code', example: '94102' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'USA' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Property type', example: 'single_family' })
  @IsString()
  @IsOptional()
  propertyType?: string;

  @ApiPropertyOptional({ description: 'Property size in square feet', example: 2500 })
  @IsNumber()
  @IsOptional()
  propertySizeSqft?: number;

  @ApiPropertyOptional({ description: 'Lot size in acres', example: 0.25 })
  @IsNumber()
  @IsOptional()
  lotSizeAcres?: number;

  @ApiPropertyOptional({ description: 'Year built', example: 2005 })
  @IsNumber()
  @IsOptional()
  yearBuilt?: number;

  @ApiPropertyOptional({ description: 'Company name (for commercial)', example: 'ABC Corporation' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  companyName?: string;

  @ApiPropertyOptional({ description: 'Industry', example: 'Restaurant' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ description: 'Preferred contact method', example: 'email' })
  @IsString()
  @IsOptional()
  preferredContactMethod?: string;

  @ApiPropertyOptional({ description: 'Best time to contact', example: 'Weekdays 9-5' })
  @IsString()
  @IsOptional()
  bestContactTime?: string;

  @ApiPropertyOptional({ description: 'Notes', example: 'Prefers email communication' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Lead source', example: 'Google Ads' })
  @IsString()
  @IsOptional()
  leadSource?: string;

  @ApiPropertyOptional({ description: 'Referral source', example: 'John Smith' })
  @IsString()
  @IsOptional()
  referralSource?: string;

  @ApiPropertyOptional({ description: 'Tags', example: ['vip', 'commercial'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Custom fields (flexible JSON)', example: { pest_history: 'ants' } })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Metadata', example: { source_campaign: 'summer2024' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
