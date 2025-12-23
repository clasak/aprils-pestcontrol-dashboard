import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

/**
 * Base entity class that provides common fields for all entities
 * Includes:
 * - UUID primary key
 * - Timestamps (created_at, updated_at)
 * - Soft delete support (deleted_at)
 * - Metadata (created_by, updated_by)
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'deleted_at',
  })
  deletedAt?: Date;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'created_by',
  })
  createdBy?: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'updated_by',
  })
  updatedBy?: string;

  // Lifecycle hooks
  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }
}

/**
 * Base entity with tenant/organization isolation
 * Use this for multi-tenant tables
 */
export abstract class TenantBaseEntity extends BaseEntity {
  @Column({
    type: 'uuid',
    name: 'organization_id',
  })
  organizationId: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'branch_id',
  })
  branchId?: string;
}

/**
 * Interface for entities that support versioning
 */
export interface VersionedEntity {
  version: number;
}

/**
 * Interface for entities that track geographic location
 */
export interface GeocodedEntity {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}
