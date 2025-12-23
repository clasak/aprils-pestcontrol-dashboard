-- Storage Setup Migration
-- Creates storage buckets and RLS policies for file attachments

-- Create storage buckets
-- Note: This is done via config.toml for local development
-- For production, use the Dashboard or this SQL

-- Create the attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false,  -- Private bucket (requires RLS)
  52428800,  -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/csv']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create the avatars bucket (public for profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- Public bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create the documents bucket for quotes, contracts, etc.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,  -- Private bucket
  104857600,  -- 100MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- RLS POLICIES FOR STORAGE
-- ============================================

-- Note: Storage uses org_id in the folder path structure
-- Pattern: {org_id}/{entity_type}/{entity_id}/{filename}
-- Example: abc123/opportunities/opp456/proposal.pdf

-- ============================================
-- ATTACHMENTS BUCKET POLICIES
-- ============================================

-- Allow users to view attachments in their organization
DROP POLICY IF EXISTS "Users can view org attachments" ON storage.objects;
CREATE POLICY "Users can view org attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments' AND
  (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text
);

-- Allow users to upload attachments to their organization
DROP POLICY IF EXISTS "Users can upload org attachments" ON storage.objects;
CREATE POLICY "Users can upload org attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attachments' AND
  (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text
);

-- Allow users to update their own uploads (admins can update any)
DROP POLICY IF EXISTS "Users can update org attachments" ON storage.objects;
CREATE POLICY "Users can update org attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'attachments' AND
  (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text AND
  (owner_id = auth.uid()::text OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
)
WITH CHECK (
  bucket_id = 'attachments' AND
  (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text
);

-- Allow admins/managers to delete attachments, users can delete their own
DROP POLICY IF EXISTS "Users can delete org attachments" ON storage.objects;
CREATE POLICY "Users can delete org attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments' AND
  (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text AND
  (owner_id = auth.uid()::text OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

-- ============================================
-- AVATARS BUCKET POLICIES
-- ============================================

-- Anyone can view avatars (public bucket, but we need SELECT policy)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- DOCUMENTS BUCKET POLICIES
-- ============================================

-- Users can view documents in their organization
DROP POLICY IF EXISTS "Users can view org documents" ON storage.objects;
CREATE POLICY "Users can view org documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text
);

-- Users can upload documents to their organization
DROP POLICY IF EXISTS "Users can upload org documents" ON storage.objects;
CREATE POLICY "Users can upload org documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text
);

-- Only admins/managers can update documents
DROP POLICY IF EXISTS "Admins can update org documents" ON storage.objects;
CREATE POLICY "Admins can update org documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR owner_id = auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text
);

-- Only admins can delete documents
DROP POLICY IF EXISTS "Admins can delete org documents" ON storage.objects;
CREATE POLICY "Admins can delete org documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text AND
  (has_role(auth.uid(), 'admin') OR owner_id = auth.uid()::text)
);

-- ============================================
-- UPDATE ATTACHMENTS TABLE TO REFERENCE STORAGE
-- ============================================

-- Add storage_path column to attachments table if it doesn't exist
ALTER TABLE attachments
ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'attachments',
ADD COLUMN IF NOT EXISTS storage_object_id UUID;

-- Create an index on storage_object_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_attachments_storage_object_id 
ON attachments(storage_object_id);

-- ============================================
-- HELPER FUNCTION TO GET SIGNED URL
-- ============================================

-- Note: Signed URLs are generated via the Supabase client
-- This is just documentation of the expected pattern

COMMENT ON TABLE storage.objects IS 'Storage objects. Use Supabase client to generate signed URLs for private bucket access.';

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON POLICY "Users can view org attachments" ON storage.objects IS 
'Allows authenticated users to view attachments belonging to their organization';

COMMENT ON POLICY "Users can upload org attachments" ON storage.objects IS 
'Allows authenticated users to upload attachments to their organization folder';

COMMENT ON POLICY "Users can delete org attachments" ON storage.objects IS 
'Allows users to delete their own attachments, admins/managers can delete any';

