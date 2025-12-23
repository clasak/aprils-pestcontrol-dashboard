import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsDateString,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteStatus, ServiceFrequency } from '../entities/quote.entity';

export class QuoteLineItemDto {
  @ApiProperty({ description: 'Unique identifier for the line item' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Line number in the quote' })
  @IsNumber()
  @Min(1)
  lineNumber: number;

  @ApiPropertyOptional({ description: 'Reference to service type' })
  @IsOptional()
  @IsUUID()
  serviceTypeId?: string;

  @ApiProperty({ description: 'Name of the service/item' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Description of the service/item' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: 'Unit price in cents' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Unit of measure', default: 'each' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Discount amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiProperty({ description: 'Subtotal (quantity * unitPrice) in cents' })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ description: 'Total after discounts in cents' })
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional({ description: 'Whether item is taxable', default: true })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @ApiPropertyOptional({ description: 'Tax rate for this item' })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Tax amount in cents' })
  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Service frequency', enum: ServiceFrequency })
  @IsOptional()
  @IsEnum(ServiceFrequency)
  frequency?: ServiceFrequency;

  @ApiPropertyOptional({ description: 'Whether this item is optional', default: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @ApiPropertyOptional({ description: 'Whether this item is selected', default: true })
  @IsOptional()
  @IsBoolean()
  isSelected?: boolean;
}

export class CreateQuoteDto {
  @ApiPropertyOptional({ description: 'Quote number (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  quoteNumber?: string;

  @ApiPropertyOptional({ description: 'Deal ID this quote is associated with' })
  @IsOptional()
  @IsUUID()
  dealId?: string;

  @ApiProperty({ description: 'Contact ID for the quote recipient' })
  @IsUUID()
  contactId: string;

  @ApiPropertyOptional({ description: 'Quote name/title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Quote description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Quote status', enum: QuoteStatus })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @ApiPropertyOptional({ description: 'Valid from date' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Valid until date' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  // Service Address
  @ApiPropertyOptional({ description: 'Service address line 1' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  serviceAddressLine1?: string;

  @ApiPropertyOptional({ description: 'Service address line 2' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  serviceAddressLine2?: string;

  @ApiPropertyOptional({ description: 'Service city' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serviceCity?: string;

  @ApiPropertyOptional({ description: 'Service state' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  serviceState?: string;

  @ApiPropertyOptional({ description: 'Service postal code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  servicePostalCode?: string;

  @ApiPropertyOptional({ description: 'Service frequency', enum: ServiceFrequency })
  @IsOptional()
  @IsEnum(ServiceFrequency)
  serviceFrequency?: ServiceFrequency;

  @ApiPropertyOptional({ description: 'Contract length in months' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  contractLengthMonths?: number;

  @ApiPropertyOptional({ description: 'Estimated start date' })
  @IsOptional()
  @IsDateString()
  estimatedStartDate?: string;

  // Line Items
  @ApiProperty({ description: 'Line items', type: [QuoteLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineItemDto)
  lineItems: QuoteLineItemDto[];

  // Pricing
  @ApiProperty({ description: 'Subtotal in cents' })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ description: 'Discount amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount type', enum: ['percentage', 'fixed'] })
  @IsOptional()
  @IsString()
  discountType?: 'percentage' | 'fixed';

  @ApiPropertyOptional({ description: 'Tax rate percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Tax amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ description: 'Total amount in cents' })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ description: 'Monthly recurring amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyAmount?: number;

  @ApiPropertyOptional({ description: 'Annual amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualAmount?: number;

  @ApiPropertyOptional({ description: 'Setup fee in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  setupFee?: number;

  // Terms
  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Payment terms' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Warranty terms' })
  @IsOptional()
  @IsString()
  warrantyTerms?: string;

  // Notes
  @ApiPropertyOptional({ description: 'Internal notes (not visible to customer)' })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ description: 'Customer-facing notes' })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  // Tags
  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Custom Fields
  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateQuoteDto {
  @ApiPropertyOptional({ description: 'Deal ID this quote is associated with' })
  @IsOptional()
  @IsUUID()
  dealId?: string;

  @ApiPropertyOptional({ description: 'Contact ID for the quote recipient' })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Quote name/title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Quote description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Quote status', enum: QuoteStatus })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @ApiPropertyOptional({ description: 'Valid from date' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Valid until date' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  // Service Address
  @ApiPropertyOptional({ description: 'Service address line 1' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  serviceAddressLine1?: string;

  @ApiPropertyOptional({ description: 'Service address line 2' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  serviceAddressLine2?: string;

  @ApiPropertyOptional({ description: 'Service city' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serviceCity?: string;

  @ApiPropertyOptional({ description: 'Service state' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  serviceState?: string;

  @ApiPropertyOptional({ description: 'Service postal code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  servicePostalCode?: string;

  @ApiPropertyOptional({ description: 'Service frequency', enum: ServiceFrequency })
  @IsOptional()
  @IsEnum(ServiceFrequency)
  serviceFrequency?: ServiceFrequency;

  @ApiPropertyOptional({ description: 'Contract length in months' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  contractLengthMonths?: number;

  @ApiPropertyOptional({ description: 'Estimated start date' })
  @IsOptional()
  @IsDateString()
  estimatedStartDate?: string;

  // Line Items
  @ApiPropertyOptional({ description: 'Line items', type: [QuoteLineItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineItemDto)
  lineItems?: QuoteLineItemDto[];

  // Pricing
  @ApiPropertyOptional({ description: 'Subtotal in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @ApiPropertyOptional({ description: 'Discount amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount type', enum: ['percentage', 'fixed'] })
  @IsOptional()
  @IsString()
  discountType?: 'percentage' | 'fixed';

  @ApiPropertyOptional({ description: 'Tax rate percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Tax amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Total amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiPropertyOptional({ description: 'Monthly recurring amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyAmount?: number;

  @ApiPropertyOptional({ description: 'Annual amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualAmount?: number;

  @ApiPropertyOptional({ description: 'Setup fee in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  setupFee?: number;

  // Terms
  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Payment terms' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Warranty terms' })
  @IsOptional()
  @IsString()
  warrantyTerms?: string;

  // Notes
  @ApiPropertyOptional({ description: 'Internal notes (not visible to customer)' })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ description: 'Customer-facing notes' })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  // Tags
  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Custom Fields
  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  // Revision notes (for versioning)
  @ApiPropertyOptional({ description: 'Notes about this revision' })
  @IsOptional()
  @IsString()
  revisionNotes?: string;
}

export class SendQuoteDto {
  @ApiProperty({ description: 'Email address to send the quote to' })
  @IsString()
  recipientEmail: string;

  @ApiPropertyOptional({ description: 'CC email addresses' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ccEmails?: string[];

  @ApiPropertyOptional({ description: 'Custom email subject' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @ApiPropertyOptional({ description: 'Custom email message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Include PDF attachment', default: true })
  @IsOptional()
  @IsBoolean()
  includePdf?: boolean;
}

export class AcceptQuoteDto {
  @ApiProperty({ description: 'Name of the person accepting' })
  @IsString()
  @MaxLength(200)
  signedByName: string;

  @ApiProperty({ description: 'Email of the person accepting' })
  @IsString()
  @MaxLength(255)
  signedByEmail: string;

  @ApiPropertyOptional({ description: 'Signature data (base64)' })
  @IsOptional()
  @IsString()
  signatureData?: string;
}

export class RejectQuoteDto {
  @ApiPropertyOptional({ description: 'Reason for rejection' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class QuoteQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: QuoteStatus })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @ApiPropertyOptional({ description: 'Filter by contact ID' })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Filter by deal ID' })
  @IsOptional()
  @IsUUID()
  dealId?: string;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

