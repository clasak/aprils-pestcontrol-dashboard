/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for use throughout the application.
 * The client handles authentication, database queries, and real-time subscriptions.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Log warning if using placeholder values (development only)
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('⚠️ Missing VITE_SUPABASE_URL - using placeholder for development');
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Missing VITE_SUPABASE_ANON_KEY - using placeholder for development');
}

/**
 * Supabase client instance
 * 
 * Features:
 * - Automatic token refresh
 * - Persistent sessions in localStorage
 * - Type-safe database queries via Database type
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'aprils-pest-control-dashboard',
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

export default supabase;

