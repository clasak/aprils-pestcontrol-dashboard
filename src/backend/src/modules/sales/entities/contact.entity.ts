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

export enum ContactType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  PROPERTY_MANAGER = 'property_manager',
  REFERRAL_PARTNER = 'referral_partner',
  VENDOR = 'vendor',
  OTHER = 'other',
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DO_NOT_CONTACT = 'do_not_contact',
}

@Entity({ schema: 'public', name: 'contacts' })
@Index(['email'])
@Index(['phone'])
@Index(['org_id'])
@Index(['type'])
@Index(['created_at'])
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'org_id' })
  orgId: string;

  // Personal Information
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 100, nullable: true })
  middleName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ name: 'mobile_phone', type: 'varchar', length: 50, nullable: true })
  mobilePhone?: string;

  @Column({ name: 'work_phone', type: 'varchar', length: 50, nullable: true })
  workPhone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department?: string;

  // Contact Type and Status
  @Column({
    type: 'enum',
    enum: ContactType,
    default: ContactType.RESIDENTIAL,
  })
  type: ContactType;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.ACTIVE,
  })
  status: ContactStatus;

  // Address
  @Column({ name: 'address_line1', type: 'varchar', length: 255, nullable: true })
  addressLine1?: string;

  @Column({ name: 'address_line2', type: 'varchar', length: 255, nullable: true })
  addressLine2?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state?: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: 'varchar', length: 100, default: 'USA' })
  country: string;

  // Property Information (for service properties)
  @Column({ name: 'property_type', type: 'varchar', length: 50, nullable: true })
  propertyType?: string;

  @Column({ name: 'property_size_sqft', type: 'integer', nullable: true })
  propertySizeSqft?: number;

  @Column({ name: 'lot_size_acres', type: 'decimal', precision: 10, scale: 2, nullable: true })
  lotSizeAcres?: number;

  @Column({ name: 'year_built', type: 'integer', nullable: true })
  yearBuilt?: number;

  // Business Information (for commercial contacts)
  @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
  companyName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry?: string;

  // Preferences
  @Column({ name: 'preferred_contact_method', type: 'varchar', length: 50, nullable: true })
  preferredContactMethod?: string;

  @Column({ name: 'best_contact_time', type: 'varchar', length: 100, nullable: true })
  bestContactTime?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Lead Source
  @Column({ name: 'lead_source', type: 'varchar', length: 100, nullable: true })
  leadSource?: string;

  @Column({ name: 'referral_source', type: 'varchar', length: 255, nullable: true })
  referralSource?: string;

  // Tags and Custom Fields
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ name: 'custom_fields', type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  // Metadata
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

  // Computed property
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
