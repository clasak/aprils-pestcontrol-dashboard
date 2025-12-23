/**
 * Auth Context Provider
 * 
 * Provides authentication state and methods throughout the application
 * using Supabase Auth.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Types
export interface UserProfile {
  id: string;
  org_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  status: string;
  roles: string[];
  org_name: string;
  org_settings: Record<string, any>;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  orgId?: string; // If joining existing org
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: AuthError | Error | null;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
  isAE: boolean;
  hasRole: (role: string) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | Error | null>(null);

  // Fetch user profile from database
  const fetchProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_current_user_profile');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setProfile(data[0] as UserProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign up
  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            company_name: data.companyName,
            org_id: data.orgId,
          },
        },
      });

      if (authError) {
        setError(authError);
        return { success: false, error: authError.message };
      }

      return { success: true };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { success: false, error: error.message };
    }
  };

  // Sign in
  const signIn = async (data: SignInData): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError(authError);
        return { success: false, error: authError.message };
      }

      return { success: true };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await supabase.auth.signOut();
      setProfile(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { success: false, error: error.message };
    }
  };

  // Update password
  const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { success: false, error: error.message };
    }
  };

  // Refresh profile
  const refreshProfile = async (): Promise<void> => {
    await fetchProfile();
  };

  // Role checks
  const hasRole = (role: string): boolean => {
    return profile?.roles?.includes(role) ?? false;
  };

  const isAdmin = hasRole('admin');
  const isManager = hasRole('manager');
  const isAE = hasRole('ae');

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
    isAdmin,
    isManager,
    isAE,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

