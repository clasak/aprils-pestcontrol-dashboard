/**
 * Auth Guard Component
 * 
 * Protects routes from unauthorized access.
 * Redirects to login if user is not authenticated.
 * Optionally checks for required roles.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * Loading screen while checking auth
 */
const LoadingScreen: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}
  >
    <CircularProgress size={48} />
    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
      Loading...
    </Typography>
  </Box>
);

/**
 * Unauthorized screen when user doesn't have required role
 */
const UnauthorizedScreen: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default',
      textAlign: 'center',
      p: 3,
    }}
  >
    <Typography variant="h4" color="error" gutterBottom>
      Access Denied
    </Typography>
    <Typography variant="body1" color="text.secondary">
      You don't have permission to access this page.
    </Typography>
  </Box>
);

/**
 * Auth Guard - Protects routes requiring authentication
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRoles,
  redirectTo = '/auth/login',
}) => {
  const { user, profile, loading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return <LoadingScreen />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => hasRole(role));
    
    if (!hasRequiredRole) {
      return <UnauthorizedScreen />;
    }
  }

  return <>{children}</>;
};

/**
 * Guest Guard - Only allows non-authenticated users
 * Redirects authenticated users to dashboard
 */
export const GuestGuard: React.FC<{ children: React.ReactNode; redirectTo?: string }> = ({
  children,
  redirectTo = '/',
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * Role Guard - Requires specific role(s)
 */
export const RoleGuard: React.FC<{
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}> = ({ children, roles, fallback }) => {
  const { hasRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  const hasRequiredRole = roles.some((role) => hasRole(role));

  if (!hasRequiredRole) {
    return <>{fallback || <UnauthorizedScreen />}</>;
  }

  return <>{children}</>;
};

/**
 * Admin Guard - Only allows admin users
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard roles={['admin']}>{children}</RoleGuard>
);

/**
 * Manager Guard - Allows admin and manager users
 */
export const ManagerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard roles={['admin', 'manager']}>{children}</RoleGuard>
);

export default AuthGuard;

