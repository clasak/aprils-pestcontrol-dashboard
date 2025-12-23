import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Contact } from './contact.entity';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  NURTURING = 'nurturing',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export enum LeadSourceCategory {
  ORGANIC = 'organic',
  PAID = 'paid',
  REFERRAL = 'referral',
  PARTNER = 'partner',
  DIRECT = 'direct',
  OTHER = 'other',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity({ schema: 'public', name: 'leads' })
@Index(['status'])
@Index(['assigned_to'])
@Index(['lead_score'])
@Index(['created_at'])
@Index(['org_id'])
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'org_id' })
  orgId: string;

  @Column('uuid', { name: 'contact_id' })
  contactId: string;

  @ManyToOne(() => Contact, { eager: true })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  // Lead Information
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({
    type: 'enum',
    enum: LeadPriority,
    default: LeadPriority.MEDIUM,
  })
  priority: LeadPriority;

  // Lead Source
  @Column({ name: 'lead_source', type: 'varchar', length: 100 })
  leadSource: string;

  @Column({
    name: 'lead_source_category',
    type: 'enum',
    enum: LeadSourceCategory,
    default: LeadSourceCategory.OTHER,
  })
  leadSourceCategory: LeadSourceCategory;

  @Column({ name: 'campaign_id', type: 'varchar', length: 100, nullable: true })
  campaignId?: string;

  @Column({ name: 'referral_source', type: 'varchar', length: 255, nullable: true })
  referralSource?: string;

  // Lead Scoring
  @Column({ name: 'lead_score', type: 'integer', default: 0 })
  leadScore: number;

  @Column({ name: 'score_factors', type: 'jsonb', default: {} })
  scoreFactors: Record<string, any>;

  // Assignment
  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo?: string;

  @Column({ name: 'assigned_at', type: 'timestamptz', nullable: true })
  assignedAt?: Date;

  // Service Details
  @Column({ name: 'service_type', type: 'varchar', length: 100, nullable: true })
  serviceType?: string;

  @Column({ name: 'pest_types', type: 'simple-array', nullable: true })
  pestTypes?: string[];

  @Column({ name: 'severity_level', type: 'varchar', length: 50, nullable: true })
  severityLevel?: string;

  @Column({ name: 'property_type', type: 'varchar', length: 50, nullable: true })
  propertyType?: string;

  @Column({ name: 'property_size_sqft', type: 'integer', nullable: true })
  propertySizeSqft?: number;

  // Budget and Timeline
  @Column({ name: 'estimated_value_cents', type: 'integer', nullable: true })
  estimatedValueCents?: number;

  @Column({ name: 'expected_close_date', type: 'date', nullable: true })
  expectedCloseDate?: Date;

  @Column({ name: 'urgency', type: 'varchar', length: 50, nullable: true })
  urgency?: string;

  // Contact History
  @Column({ name: 'first_contact_date', type: 'timestamptz', nullable: true })
  firstContactDate?: Date;

  @Column({ name: 'last_contact_date', type: 'timestamptz', nullable: true })
  lastContactDate?: Date;

  @Column({ name: 'contact_attempts', type: 'integer', default: 0 })
  contactAttempts: number;

  @Column({ name: 'next_follow_up_date', type: 'timestamptz', nullable: true })
  nextFollowUpDate?: Date;

  // Qualification
  @Column({ name: 'is_qualified', type: 'boolean', default: false })
  isQualified: boolean;

  @Column({ name: 'qualification_notes', type: 'text', nullable: true })
  qualificationNotes?: string;

  @Column({ name: 'disqualification_reason', type: 'varchar', length: 255, nullable: true })
  disqualificationReason?: string;

  // Conversion
  @Column({ name: 'converted_to_deal_id', type: 'uuid', nullable: true })
  convertedToDealId?: string;

  @Column({ name: 'converted_at', type: 'timestamptz', nullable: true })
  convertedAt?: Date;

  @Column({ name: 'lost_reason', type: 'varchar', length: 255, nullable: true })
  lostReason?: string;

  @Column({ name: 'lost_at', type: 'timestamptz', nullable: true })
  lostAt?: Date;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

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
