/**
 * useUser Hook
 * 
 * Provides easy access to the current user's profile and organization data.
 */

import { useMemo } from 'react';
import { useAuth, UserProfile } from '../contexts/AuthContext';

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  phone: string | null;
  avatarUrl: string | null;
  roles: string[];
  isAdmin: boolean;
  isManager: boolean;
  isAE: boolean;
}

export interface CurrentOrg {
  id: string;
  name: string;
  settings: Record<string, any>;
}

/**
 * Hook to get the current user's profile in a formatted structure
 */
export const useUser = (): CurrentUser | null => {
  const { profile } = useAuth();

  return useMemo(() => {
    if (!profile) return null;

    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    return {
      id: profile.id,
      email: profile.email,
      firstName,
      lastName,
      fullName,
      initials,
      phone: profile.phone,
      avatarUrl: profile.avatar_url,
      roles: profile.roles || [],
      isAdmin: profile.roles?.includes('admin') ?? false,
      isManager: profile.roles?.includes('manager') ?? false,
      isAE: profile.roles?.includes('ae') ?? false,
    };
  }, [profile]);
};

/**
 * Hook to get the current organization
 */
export const useOrganization = (): CurrentOrg | null => {
  const { profile } = useAuth();

  return useMemo(() => {
    if (!profile) return null;

    return {
      id: profile.org_id,
      name: profile.org_name,
      settings: profile.org_settings || {},
    };
  }, [profile]);
};

/**
 * Hook to check if user can perform an action based on role
 */
export const useCanPerform = () => {
  const user = useUser();

  return useMemo(() => ({
    // CRM actions
    viewAllRecords: user?.isAdmin || user?.isManager,
    editAllRecords: user?.isAdmin || user?.isManager,
    deleteRecords: user?.isAdmin || user?.isManager,
    assignLeads: user?.isAdmin || user?.isManager,
    
    // Dashboard access
    viewExecutiveDashboard: user?.isAdmin,
    viewTeamDashboard: user?.isAdmin || user?.isManager,
    viewPersonalDashboard: true,
    
    // Admin actions
    manageUsers: user?.isAdmin,
    manageRoles: user?.isAdmin,
    configureSettings: user?.isAdmin,
    configurePipeline: user?.isAdmin || user?.isManager,
    exportData: user?.isAdmin || user?.isManager,
  }), [user]);
};

/**
 * Hook to check ownership of a record
 */
export const useIsRecordOwner = (ownerId: string | undefined): boolean => {
  const user = useUser();
  if (!user || !ownerId) return false;
  return user.id === ownerId;
};

/**
 * Hook to check if user can edit a specific record
 */
export const useCanEditRecord = (ownerId: string | undefined): boolean => {
  const user = useUser();
  const isOwner = useIsRecordOwner(ownerId);
  
  if (!user) return false;
  
  // Admins and managers can edit any record
  if (user.isAdmin || user.isManager) return true;
  
  // AEs can only edit their own records
  return isOwner;
};

export default useUser;

