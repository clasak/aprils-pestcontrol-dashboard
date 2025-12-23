/**
 * useAuth Hook
 * 
 * Re-exports the useAuth hook from AuthContext for convenience.
 * Also provides additional auth-related utilities.
 */

export { useAuth } from '../contexts/AuthContext';
export type { 
  AuthContextType, 
  UserProfile, 
  SignUpData, 
  SignInData 
} from '../contexts/AuthContext';

import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to check if user has any of the specified roles
 */
export const useHasAnyRole = (roles: string[]): boolean => {
  const { profile } = useAuth();
  return roles.some(role => profile?.roles?.includes(role));
};

/**
 * Hook to check if user has all of the specified roles
 */
export const useHasAllRoles = (roles: string[]): boolean => {
  const { profile } = useAuth();
  return roles.every(role => profile?.roles?.includes(role));
};

/**
 * Hook to get the current user's organization ID
 */
export const useOrgId = (): string | null => {
  const { profile } = useAuth();
  return profile?.org_id ?? null;
};

/**
 * Hook to get the current user's ID
 */
export const useUserId = (): string | null => {
  const { profile } = useAuth();
  return profile?.id ?? null;
};

/**
 * Hook to get the current user's full name
 */
export const useFullName = (): string => {
  const { profile } = useAuth();
  if (!profile) return '';
  return `${profile.first_name} ${profile.last_name}`.trim();
};

/**
 * Hook for auth guards - redirects unauthenticated users
 */
export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  
  return {
    isAuthenticated: !!user,
    loading,
  };
};

/**
 * Hook for role-based guards
 */
export const useRequireRole = (roles: string[]) => {
  const { user, profile, loading } = useAuth();
  
  const hasRequiredRole = useCallback(() => {
    if (!profile?.roles) return false;
    return roles.some(role => profile.roles.includes(role));
  }, [profile, roles]);

  return {
    isAuthenticated: !!user,
    hasAccess: hasRequiredRole(),
    loading,
  };
};

