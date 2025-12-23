/**
 * Storage Service
 * 
 * Provides functions for interacting with Supabase Storage
 * including file uploads, downloads, and URL generation.
 */

import { supabase } from './supabase';

// Storage buckets
export const STORAGE_BUCKETS = {
  ATTACHMENTS: 'attachments',
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

// Entity types for folder organization
export const ENTITY_TYPES = {
  LEADS: 'leads',
  CONTACTS: 'contacts',
  ACCOUNTS: 'accounts',
  OPPORTUNITIES: 'opportunities',
  QUOTES: 'quotes',
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

interface UploadOptions {
  bucket: StorageBucket;
  orgId: string;
  entityType?: EntityType;
  entityId?: string;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  error?: string;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  path: string;
  bucket: StorageBucket;
}

/**
 * Generate a storage path based on organization and entity
 */
export function generateStoragePath(
  orgId: string,
  entityType?: EntityType,
  entityId?: string,
  fileName?: string
): string {
  const parts = [orgId];
  
  if (entityType) {
    parts.push(entityType);
  }
  
  if (entityId) {
    parts.push(entityId);
  }
  
  if (fileName) {
    // Sanitize filename
    const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Add timestamp to prevent conflicts
    const timestamp = Date.now();
    const ext = sanitized.split('.').pop();
    const baseName = sanitized.replace(`.${ext}`, '');
    parts.push(`${baseName}_${timestamp}.${ext}`);
  }
  
  return parts.join('/');
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const { bucket, orgId, entityType, entityId, onProgress } = options;
  
  try {
    // Generate the storage path
    const path = generateStoragePath(orgId, entityType, entityId, file.name);
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Get the public URL for public buckets
    let publicUrl: string | undefined;
    if (bucket === STORAGE_BUCKETS.AVATARS) {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      publicUrl = urlData.publicUrl;
    }
    
    return {
      success: true,
      path: data.path,
      publicUrl,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Upload failed' };
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions
): Promise<UploadResult[]> {
  return Promise.all(files.map(file => uploadFile(file, options)));
}

/**
 * Download a file from storage
 */
export async function downloadFile(
  bucket: StorageBucket,
  path: string
): Promise<Blob | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);
  
  if (error) {
    console.error('Download error:', error.message);
    return null;
  }
  
  return data;
}

/**
 * Get a signed URL for a private file
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  
  if (error) {
    console.error('Signed URL error:', error.message);
    return null;
  }
  
  return data.signedUrl;
}

/**
 * Get multiple signed URLs
 */
export async function getSignedUrls(
  bucket: StorageBucket,
  paths: string[],
  expiresIn: number = 3600
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, expiresIn);
  
  if (error || !data) {
    console.error('Signed URLs error:', error?.message);
    return urlMap;
  }
  
  data.forEach((item, index) => {
    if (item.signedUrl) {
      urlMap.set(paths[index], item.signedUrl);
    }
  });
  
  return urlMap;
}

/**
 * Get public URL for files in public buckets
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) {
    console.error('Delete error:', error.message);
    return false;
  }
  
  return true;
}

/**
 * Delete multiple files
 */
export async function deleteFiles(
  bucket: StorageBucket,
  paths: string[]
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);
  
  if (error) {
    console.error('Delete error:', error.message);
    return false;
  }
  
  return true;
}

/**
 * List files in a directory
 */
export async function listFiles(
  bucket: StorageBucket,
  path: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
  }
): Promise<FileInfo[]> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path, {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      sortBy: options?.sortBy || { column: 'created_at', order: 'desc' },
    });
  
  if (error || !data) {
    console.error('List error:', error?.message);
    return [];
  }
  
  return data
    .filter(item => item.name !== '.emptyFolderPlaceholder')
    .map(item => ({
      name: item.name,
      size: item.metadata?.size || 0,
      type: item.metadata?.mimetype || 'application/octet-stream',
      lastModified: new Date(item.updated_at || item.created_at),
      path: `${path}/${item.name}`,
      bucket,
    }));
}

/**
 * Move a file to a new location
 */
export async function moveFile(
  bucket: StorageBucket,
  fromPath: string,
  toPath: string
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .move(fromPath, toPath);
  
  if (error) {
    console.error('Move error:', error.message);
    return false;
  }
  
  return true;
}

/**
 * Copy a file to a new location
 */
export async function copyFile(
  bucket: StorageBucket,
  fromPath: string,
  toPath: string
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .copy(fromPath, toPath);
  
  if (error) {
    console.error('Copy error:', error.message);
    return false;
  }
  
  return true;
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<UploadResult> {
  // Delete existing avatar first
  const existingFiles = await listFiles(STORAGE_BUCKETS.AVATARS, userId);
  if (existingFiles.length > 0) {
    await deleteFiles(STORAGE_BUCKETS.AVATARS, existingFiles.map(f => f.path));
  }
  
  const path = `${userId}/${file.name}`;
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .getPublicUrl(data.path);
  
  return {
    success: true,
    path: data.path,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      // Wildcard type like 'image/*'
      const category = type.replace('/*', '');
      return file.type.startsWith(category);
    }
    return file.type === type;
  });
}

/**
 * Get allowed file types for a bucket
 */
export function getAllowedTypes(bucket: StorageBucket): string[] {
  switch (bucket) {
    case STORAGE_BUCKETS.AVATARS:
      return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    case STORAGE_BUCKETS.ATTACHMENTS:
      return [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
      ];
    case STORAGE_BUCKETS.DOCUMENTS:
      return [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'text/plain',
      ];
    default:
      return [];
  }
}

/**
 * Get max file size for a bucket (in bytes)
 */
export function getMaxFileSize(bucket: StorageBucket): number {
  switch (bucket) {
    case STORAGE_BUCKETS.AVATARS:
      return 5 * 1024 * 1024; // 5MB
    case STORAGE_BUCKETS.ATTACHMENTS:
      return 50 * 1024 * 1024; // 50MB
    case STORAGE_BUCKETS.DOCUMENTS:
      return 100 * 1024 * 1024; // 100MB
    default:
      return 10 * 1024 * 1024; // 10MB default
  }
}

