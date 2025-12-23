/**
 * Supabase Client Configuration
 * 
 * CompassIQ - Hybrid Architecture
 * This file initializes the Supabase client for use throughout the application.
 * The client handles authentication, database queries, real-time subscriptions, and storage.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables with fallbacks for local Supabase development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Log configuration status in development
if (import.meta.env.DEV) {
  const isLocalSupabase = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');
  console.log(`🔌 Supabase: ${isLocalSupabase ? 'Local' : 'Cloud'} (${supabaseUrl})`);
}

/**
 * Supabase client instance
 * 
 * CompassIQ Hybrid Architecture Features:
 * - Automatic token refresh for seamless sessions
 * - Persistent sessions in localStorage
 * - Real-time subscriptions for live dashboard updates
 * - Type-safe database queries via Database type
 * - Multi-tenant support via RLS policies
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-application-name': 'compassiq-dashboard',
    },
  },
});

/**
 * Get the current authenticated user's ID
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
};

/**
 * Get the current session
 */
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return session !== null;
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Get the current user's organization ID
 * This is stored in the user's app_metadata after login
 */
export const getCurrentOrgId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.app_metadata?.org_id ?? null;
};

/**
 * Get the current user's role
 */
export const getCurrentUserRole = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.app_metadata?.role ?? null;
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string) => {
  return supabase.auth.signUp({ email, password });
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  return supabase.auth.signOut();
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string) => {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
};

/**
 * Subscribe to real-time changes on a table
 * Automatically filters by org_id via RLS
 */
export const subscribeToTable = <T>(
  tableName: string,
  callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: T | null; old: T | null }) => void,
  filter?: string
) => {
  let channel = supabase
    .channel(`${tableName}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
        filter: filter,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as T | null,
          old: payload.old as T | null,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Storage bucket helpers
 */
export const storage = {
  logos: supabase.storage.from('logos'),
  attachments: supabase.storage.from('attachments'),
  avatars: supabase.storage.from('avatars'),
};

/**
 * Upload a file to a storage bucket
 */
export const uploadFile = async (
  bucket: 'logos' | 'attachments' | 'avatars',
  path: string,
  file: File
) => {
  return supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
};

/**
 * Get a public URL for a file
 */
export const getPublicUrl = (bucket: 'logos' | 'avatars', path: string) => {
  return supabase.storage.from(bucket).getPublicUrl(path);
};

/**
 * Get a signed URL for private files (attachments)
 */
export const getSignedUrl = async (path: string, expiresIn = 3600) => {
  return supabase.storage.from('attachments').createSignedUrl(path, expiresIn);
};

export default supabase;

