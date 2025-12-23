import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Contact } from './contact.entity';
import { Deal } from './deal.entity';

export enum QuoteStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  REVISED = 'revised',
}

export enum ServiceFrequency {
  ONE_TIME = 'one_time',
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly',
  MONTHLY = 'monthly',
  BI_MONTHLY = 'bi_monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  CUSTOM = 'custom',
}

@Entity({ schema: 'public', name: 'quotes' })
@Index(['status'])
@Index(['contact_id'])
@Index(['deal_id'])
@Index(['org_id'])
@Index(['quote_number'])
@Index(['valid_until'])
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'org_id' })
  orgId: string;

  @Column({ name: 'quote_number', type: 'varchar', length: 50 })
  quoteNumber: string;

  @Column({ type: 'integer', default: 1 })
  version: number;

  // Relationships
  @Column('uuid', { name: 'deal_id', nullable: true })
  dealId?: string;

  @ManyToOne(() => Deal, { nullable: true })
  @JoinColumn({ name: 'deal_id' })
  deal?: Deal;

  @Column('uuid', { name: 'contact_id' })
  contactId: string;

  @ManyToOne(() => Contact, { eager: true })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column('uuid', { name: 'sales_company_id', nullable: true })
  salesCompanyId?: string;

  // Quote Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Status
  @Column({
    type: 'enum',
    enum: QuoteStatus,
    default: QuoteStatus.DRAFT,
  })
  status: QuoteStatus;

  @Column({ name: 'status_changed_at', type: 'timestamptz', nullable: true })
  statusChangedAt?: Date;

  // Validity
  @Column({ name: 'valid_from', type: 'date', nullable: true })
  validFrom?: Date;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  validUntil?: Date;

  // Service Details
  @Column({ name: 'service_address_line1', type: 'varchar', length: 255, nullable: true })
  serviceAddressLine1?: string;

  @Column({ name: 'service_address_line2', type: 'varchar', length: 255, nullable: true })
  serviceAddressLine2?: string;

  @Column({ name: 'service_city', type: 'varchar', length: 100, nullable: true })
  serviceCity?: string;

  @Column({ name: 'service_state', type: 'varchar', length: 50, nullable: true })
  serviceState?: string;

  @Column({ name: 'service_postal_code', type: 'varchar', length: 20, nullable: true })
  servicePostalCode?: string;

  @Column({ name: 'service_frequency', type: 'enum', enum: ServiceFrequency, nullable: true })
  serviceFrequency?: ServiceFrequency;

  @Column({ name: 'contract_length_months', type: 'integer', nullable: true })
  contractLengthMonths?: number;

  @Column({ name: 'estimated_start_date', type: 'date', nullable: true })
  estimatedStartDate?: Date;

  // Line Items (stored as JSONB for flexibility)
  @Column({ name: 'line_items', type: 'jsonb', default: [] })
  lineItems: QuoteLineItem[];

  // Pricing Summary (stored in cents)
  @Column({ type: 'integer', default: 0 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'integer', default: 0 })
  discountAmount: number;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ name: 'discount_type', type: 'varchar', length: 20, default: 'percentage' })
  discountType: 'percentage' | 'fixed';

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ name: 'tax_amount', type: 'integer', default: 0 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'integer', default: 0 })
  totalAmount: number;

  // Recurring Pricing
  @Column({ name: 'monthly_amount', type: 'integer', nullable: true })
  monthlyAmount?: number;

  @Column({ name: 'annual_amount', type: 'integer', nullable: true })
  annualAmount?: number;

  @Column({ name: 'setup_fee', type: 'integer', default: 0 })
  setupFee: number;

  // Currency
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Terms
  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  termsAndConditions?: string;

  @Column({ name: 'payment_terms', type: 'varchar', length: 50, default: 'NET30' })
  paymentTerms: string;

  @Column({ name: 'warranty_terms', type: 'text', nullable: true })
  warrantyTerms?: string;

  // Approval
  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  // Signature
  @Column({ name: 'signature_required', type: 'boolean', default: true })
  signatureRequired: boolean;

  @Column({ name: 'signed_at', type: 'timestamptz', nullable: true })
  signedAt?: Date;

  @Column({ name: 'signed_by_name', type: 'varchar', length: 200, nullable: true })
  signedByName?: string;

  @Column({ name: 'signed_by_email', type: 'varchar', length: 255, nullable: true })
  signedByEmail?: string;

  @Column({ name: 'signature_ip', type: 'varchar', length: 45, nullable: true })
  signatureIp?: string;

  @Column({ name: 'signature_data', type: 'text', nullable: true })
  signatureData?: string;

  // Assignment
  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId?: string;

  @Column({ name: 'prepared_by', type: 'uuid', nullable: true })
  preparedBy?: string;

  // Email Tracking
  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt?: Date;

  @Column({ name: 'sent_to_email', type: 'varchar', length: 255, nullable: true })
  sentToEmail?: string;

  @Column({ name: 'viewed_at', type: 'timestamptz', nullable: true })
  viewedAt?: Date;

  @Column({ name: 'viewed_count', type: 'integer', default: 0 })
  viewedCount: number;

  // Revision/Versioning
  @Column({ name: 'previous_version_id', type: 'uuid', nullable: true })
  previousVersionId?: string;

  @Column({ name: 'revision_notes', type: 'text', nullable: true })
  revisionNotes?: string;

  // PDF
  @Column({ name: 'pdf_url', type: 'varchar', length: 500, nullable: true })
  pdfUrl?: string;

  @Column({ name: 'pdf_generated_at', type: 'timestamptz', nullable: true })
  pdfGeneratedAt?: Date;

  // Notes
  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes?: string;

  // Tags
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  // Custom Fields
  @Column({ name: 'custom_fields', type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', default: {}, nullable: true })
  metadata?: Record<string, any>;

  // Timestamps
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;
}

// Line item interface for the JSONB column
export interface QuoteLineItem {
  id: string;
  lineNumber: number;
  serviceTypeId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number; // in cents
  unit: string;
  discountAmount?: number;
  discountPercent?: number;
  subtotal: number; // quantity * unitPrice
  totalAmount: number; // after discounts
  isTaxable: boolean;
  taxRate?: number;
  taxAmount?: number;
  frequency?: ServiceFrequency;
  isOptional: boolean;
  isSelected: boolean;
}

