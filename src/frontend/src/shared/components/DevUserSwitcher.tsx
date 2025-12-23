import React, { useState } from 'react';
import {
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Avatar,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Close as CloseIcon,
  TrendingUp as SalesIcon,
  Build as TechIcon,
  SupervisorAccount as ManagerIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

// Dev users available for testing
const DEV_USERS = {
  admin: { 
    role: 'admin', 
    name: 'System Admin', 
    description: 'Full system access - sees main dashboard',
    color: '#616161',
    icon: <AdminIcon />,
  },
  april: { 
    role: 'sales_manager', 
    name: 'April Shane', 
    description: 'Sales Manager - sees team performance',
    color: '#1976d2',
    icon: <ManagerIcon />,
  },
  marcus: { 
    role: 'account_executive', 
    name: 'Marcus Rodriguez', 
    description: 'Account Executive - sees personal performance',
    color: '#1976d2',
    icon: <SalesIcon />,
  },
  sarah: { 
    role: 'account_executive', 
    name: 'Sarah Chen', 
    description: 'Account Executive - sees personal performance',
    color: '#1976d2',
    icon: <SalesIcon />,
  },
  ops_manager: { 
    role: 'operations_manager', 
    name: 'Tom Wilson', 
    description: 'Operations Manager - sees all technicians',
    color: '#2e7d32',
    icon: <ManagerIcon />,
  },
  tech1: { 
    role: 'technician', 
    name: 'Mike Johnson', 
    description: 'Technician - sees own jobs only',
    color: '#2e7d32',
    icon: <TechIcon />,
  },
  tech2: { 
    role: 'technician', 
    name: 'Robert Garcia', 
    description: 'Technician - sees own jobs only',
    color: '#2e7d32',
    icon: <TechIcon />,
  },
};

export const DevUserSwitcher: React.FC = () => {
  const [open, setOpen] = useState(false);
  const currentDevUser = localStorage.getItem('dev_user_role') || 'admin';
  const currentUser = DEV_USERS[currentDevUser as keyof typeof DEV_USERS] || DEV_USERS.admin;

  const handleUserSelect = (userKey: string) => {
    if (userKey === 'clear') {
      localStorage.removeItem('dev_user_role');
    } else {
      localStorage.setItem('dev_user_role', userKey);
    }
    setOpen(false);
    window.location.reload();
  };

  // Only show in development mode
  const isDev = import.meta.env.DEV || localStorage.getItem('auth_token') === 'dev_mock_token';
  
  if (!isDev) return null;

  return (
    <>
      {/* Floating button to open switcher */}
      <Tooltip title="Switch User Role (Dev Mode)" placement="left">
        <Box
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1500,
            cursor: 'pointer',
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: currentUser.color,
              boxShadow: 4,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            {currentUser.icon}
          </Avatar>
          <Chip
            label="DEV"
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: 'error.main',
              color: 'white',
              fontSize: '0.65rem',
              height: 20,
            }}
          />
        </Box>
      </Tooltip>

      {/* User selection dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                Switch User Role
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Development mode - test different dashboard views
              </Typography>
            </Box>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="overline" color="text.secondary">
              Current User
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Avatar sx={{ bgcolor: currentUser.color }}>
                {currentUser.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={500}>
                  {currentUser.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentUser.role.replace('_', ' ')}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Divider />
          
          {/* Sales Team */}
          <Box sx={{ px: 2, pt: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Sales Team
            </Typography>
          </Box>
          <List disablePadding>
            {Object.entries(DEV_USERS)
              .filter(([_, user]) => ['sales_manager', 'account_executive'].includes(user.role))
              .map(([key, user]) => (
                <ListItem key={key} disablePadding>
                  <ListItemButton 
                    onClick={() => handleUserSelect(key)}
                    selected={currentDevUser === key}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: user.color }}>
                        {user.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.description}
                      primaryTypographyProps={{ fontWeight: currentDevUser === key ? 600 : 400 }}
                    />
                    {currentDevUser === key && (
                      <Chip label="Active" size="small" color="primary" />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
          </List>

          <Divider sx={{ my: 1 }} />

          {/* Operations Team */}
          <Box sx={{ px: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Operations Team
            </Typography>
          </Box>
          <List disablePadding>
            {Object.entries(DEV_USERS)
              .filter(([_, user]) => ['operations_manager', 'technician'].includes(user.role))
              .map(([key, user]) => (
                <ListItem key={key} disablePadding>
                  <ListItemButton 
                    onClick={() => handleUserSelect(key)}
                    selected={currentDevUser === key}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: user.color }}>
                        {user.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.description}
                      primaryTypographyProps={{ fontWeight: currentDevUser === key ? 600 : 400 }}
                    />
                    {currentDevUser === key && (
                      <Chip label="Active" size="small" color="primary" />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
          </List>

          <Divider sx={{ my: 1 }} />

          {/* Admin */}
          <Box sx={{ px: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Administration
            </Typography>
          </Box>
          <List disablePadding>
            {Object.entries(DEV_USERS)
              .filter(([_, user]) => user.role === 'admin')
              .map(([key, user]) => (
                <ListItem key={key} disablePadding>
                  <ListItemButton 
                    onClick={() => handleUserSelect(key)}
                    selected={currentDevUser === key}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: user.color }}>
                        {user.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.description}
                      primaryTypographyProps={{ fontWeight: currentDevUser === key ? 600 : 400 }}
                    />
                    {currentDevUser === key && (
                      <Chip label="Active" size="small" color="primary" />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DevUserSwitcher;

