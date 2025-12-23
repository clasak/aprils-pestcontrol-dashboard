/**
 * Library exports
 */

export { supabase, getCurrentUserId, getSession, isAuthenticated, onAuthStateChange } from './supabase';
export type { Database } from './database.types';
export type {
  Organization,
  User,
  Role,
  Account,
  Contact,
  Lead,
  Opportunity,
  Activity,
  Note,
  Attachment,
  Notification,
  ForecastSnapshot,
  OrganizationInsert,
  UserInsert,
  AccountInsert,
  ContactInsert,
  LeadInsert,
  OpportunityInsert,
  ActivityInsert,
  OrganizationUpdate,
  UserUpdate,
  AccountUpdate,
  ContactUpdate,
  LeadUpdate,
  OpportunityUpdate,
  ActivityUpdate,
  OpportunityStage,
  OpportunityStatus,
  LeadStatus,
  ActivityType,
  ForecastCategory,
} from './database.types';

// Storage exports
export {
  uploadFile,
  uploadFiles,
  downloadFile,
  getSignedUrl,
  getSignedUrls,
  getPublicUrl,
  deleteFile,
  deleteFiles,
  listFiles,
  moveFile,
  copyFile,
  uploadAvatar,
  formatFileSize,
  isAllowedFileType,
  getAllowedTypes,
  getMaxFileSize,
  generateStoragePath,
  STORAGE_BUCKETS,
  ENTITY_TYPES,
} from './storage';
export type { StorageBucket, EntityType } from './storage';

