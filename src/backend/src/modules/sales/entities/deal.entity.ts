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

export enum DealStatus {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
  CANCELLED = 'cancelled',
}

export enum DealStage {
  LEAD = 'lead',
  INSPECTION_SCHEDULED = 'inspection_scheduled',
  INSPECTION_COMPLETED = 'inspection_completed',
  QUOTE_SENT = 'quote_sent',
  NEGOTIATION = 'negotiation',
  VERBAL_COMMITMENT = 'verbal_commitment',
  CONTRACT_SENT = 'contract_sent',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
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

@Entity({ schema: 'sales', name: 'deals' })
@Index(['status'])
@Index(['stage'])
@Index(['assigned_to'])
@Index(['expected_close_date'])
@Index(['company_id'])
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'company_id' })
  companyId: string;

  @Column('uuid', { name: 'contact_id' })
  contactId: string;

  @ManyToOne(() => Contact, { eager: true })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column('uuid', { name: 'lead_id', nullable: true })
  leadId?: string;

  // Deal Information
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: DealStatus,
    default: DealStatus.OPEN,
  })
  status: DealStatus;

  @Column({
    type: 'enum',
    enum: DealStage,
    default: DealStage.LEAD,
  })
  stage: DealStage;

  // Financial Information
  @Column({ name: 'deal_value_cents', type: 'integer', default: 0 })
  dealValueCents: number;

  @Column({ name: 'recurring_revenue_cents', type: 'integer', nullable: true })
  recurringRevenueCents?: number;

  @Column({ name: 'service_frequency', type: 'enum', enum: ServiceFrequency, nullable: true })
  serviceFrequency?: ServiceFrequency;

  @Column({ name: 'contract_length_months', type: 'integer', nullable: true })
  contractLengthMonths?: number;

  @Column({ name: 'lifetime_value_cents', type: 'integer', nullable: true })
  lifetimeValueCents?: number;

  // Probability & Forecasting
  @Column({ name: 'win_probability', type: 'decimal', precision: 5, scale: 2, default: 0 })
  winProbability: number;

  @Column({ name: 'weighted_value_cents', type: 'integer', default: 0 })
  weightedValueCents: number;

  @Column({ name: 'expected_close_date', type: 'date', nullable: true })
  expectedCloseDate?: Date;

  @Column({ name: 'actual_close_date', type: 'date', nullable: true })
  actualCloseDate?: Date;

  // Assignment & Ownership
  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo?: string;

  @Column({ name: 'sales_rep_id', type: 'uuid', nullable: true })
  salesRepId?: string;

  @Column({ name: 'sales_team_id', type: 'uuid', nullable: true })
  salesTeamId?: string;

  // Service Details
  @Column({ name: 'service_type', type: 'varchar', length: 100, nullable: true })
  serviceType?: string;

  @Column({ name: 'pest_types', type: 'simple-array', nullable: true })
  pestTypes?: string[];

  @Column({ name: 'property_type', type: 'varchar', length: 50, nullable: true })
  propertyType?: string;

  @Column({ name: 'property_size_sqft', type: 'integer', nullable: true })
  propertySizeSqft?: number;

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

  // Competition & Market
  @Column({ name: 'competitors', type: 'simple-array', nullable: true })
  competitors?: string[];

  @Column({ name: 'competitive_advantage', type: 'text', nullable: true })
  competitiveAdvantage?: string;

  @Column({ name: 'current_provider', type: 'varchar', length: 255, nullable: true })
  currentProvider?: string;

  // Quote Information
  @Column({ name: 'quote_id', type: 'uuid', nullable: true })
  quoteId?: string;

  @Column({ name: 'quote_sent_at', type: 'timestamptz', nullable: true })
  quoteSentAt?: Date;

  @Column({ name: 'quote_viewed_at', type: 'timestamptz', nullable: true })
  quoteViewedAt?: Date;

  @Column({ name: 'quote_accepted_at', type: 'timestamptz', nullable: true })
  quoteAcceptedAt?: Date;

  // Activity Tracking
  @Column({ name: 'last_activity_date', type: 'timestamptz', nullable: true })
  lastActivityDate?: Date;

  @Column({ name: 'next_follow_up_date', type: 'timestamptz', nullable: true })
  nextFollowUpDate?: Date;

  @Column({ name: 'days_in_pipeline', type: 'integer', default: 0 })
  daysInPipeline: number;

  @Column({ name: 'stage_duration_days', type: 'integer', default: 0 })
  stageDurationDays: number;

  // Loss/Win Tracking
  @Column({ name: 'won_reason', type: 'varchar', length: 255, nullable: true })
  wonReason?: string;

  @Column({ name: 'lost_reason', type: 'varchar', length: 255, nullable: true })
  lostReason?: string;

  @Column({ name: 'lost_to_competitor', type: 'varchar', length: 255, nullable: true })
  lostToCompetitor?: string;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ name: 'custom_fields', type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', default: {}, nullable: true })
  metadata?: Record<string, any>;

  // Stage History
  @Column({ name: 'stage_history', type: 'jsonb', default: [] })
  stageHistory: Array<{
    stage: string;
    enteredAt: Date;
    exitedAt?: Date;
    durationDays?: number;
  }>;

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
