import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@modules/auth/context/AuthContext';

// Import role-specific dashboards
import MainDashboard from './MainDashboard';
import SalesManagerDashboard from '@modules/sales/pages/SalesManagerDashboard';
import AccountExecutiveDashboard from '@modules/sales/pages/AccountExecutiveDashboard';
import OperationsManagerDashboard from '@modules/operations/pages/OperationsManagerDashboard';
import TechnicianDashboard from '@modules/operations/pages/TechnicianDashboard';

// User roles enum
export type UserRole = 
  | 'admin'
  | 'executive'
  | 'sales_manager'
  | 'account_executive'
  | 'sales_rep'
  | 'operations_manager'
  | 'technician'
  | 'customer_service'
  | 'finance'
  | 'hr'
  | 'marketing';

// Role to dashboard mapping
const getDashboardForRole = (role: string): React.ComponentType => {
  switch (role) {
    // Sales team dashboards
    case 'sales_manager':
      return SalesManagerDashboard;
    case 'account_executive':
    case 'sales_rep':
      return AccountExecutiveDashboard;
    
    // Operations team dashboards
    case 'operations_manager':
      return OperationsManagerDashboard;
    case 'technician':
      return TechnicianDashboard;
    
    // Admin and executives see the full overview
    case 'admin':
    case 'executive':
    default:
      return MainDashboard;
  }
};

// DEV MODE: Mock user for development
// In production, this comes from the auth context
const DEV_USERS: Record<string, { role: string; name: string }> = {
  'april': { role: 'sales_manager', name: 'April Shane' },
  'marcus': { role: 'account_executive', name: 'Marcus Rodriguez' },
  'sarah': { role: 'account_executive', name: 'Sarah Chen' },
  'tech1': { role: 'technician', name: 'Mike Johnson' },
  'tech2': { role: 'technician', name: 'Robert Garcia' },
  'ops_manager': { role: 'operations_manager', name: 'Tom Wilson' },
  'admin': { role: 'admin', name: 'System Admin' },
};

export const RoleBasedHome: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [devUser, setDevUser] = useState<string | null>(null);

  // DEV MODE: Check for dev user override
  useEffect(() => {
    const savedDevUser = localStorage.getItem('dev_user_role');
    if (savedDevUser && DEV_USERS[savedDevUser]) {
      setDevUser(savedDevUser);
    }
  }, []);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  // Determine the user's role
  // In DEV MODE, we can override with localStorage
  let currentRole = 'admin'; // Default role
  let userName = 'User';

  if (devUser && DEV_USERS[devUser]) {
    currentRole = DEV_USERS[devUser].role;
    userName = DEV_USERS[devUser].name;
  } else if (user?.role) {
    currentRole = user.role;
    userName = `${user.firstName} ${user.lastName}`;
  }

  // Get the appropriate dashboard component
  const DashboardComponent = getDashboardForRole(currentRole);

  return <DashboardComponent />;
};

// Export helper to switch dev users (for testing)
export const setDevUserRole = (userKey: string) => {
  if (DEV_USERS[userKey]) {
    localStorage.setItem('dev_user_role', userKey);
    window.location.reload();
  }
};

export const clearDevUserRole = () => {
  localStorage.removeItem('dev_user_role');
  window.location.reload();
};

export const getAvailableDevUsers = () => DEV_USERS;

export default RoleBasedHome;

