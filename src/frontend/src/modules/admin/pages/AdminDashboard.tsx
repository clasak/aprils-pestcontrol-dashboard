import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  People as PeopleIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  CloudDone as CloudDoneIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
  PersonAdd as PersonAddIcon,
  Backup as BackupIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  VpnKey as VpnKeyIcon,
  AdminPanelSettings as AdminIcon,
  ArrowForward as ArrowIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Login as LoginIcon,
  PersonOff as PersonOffIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Computer as ComputerIcon,
  CloudSync as CloudSyncIcon,
} from '@mui/icons-material';

// Mock data for demonstration
const systemStats = {
  totalUsers: 45,
  activeUsers: 38,
  inactiveUsers: 7,
  totalRoles: 8,
  activeSessions: 23,
  storageUsed: 12.4, // GB
  storageTotal: 50, // GB
  apiRequests24h: 15847,
  avgResponseTime: 124, // ms
};

const recentActivity = [
  {
    id: 1,
    user: 'Sarah Johnson',
    action: 'logged in',
    target: null,
    timestamp: '2 minutes ago',
    icon: <LoginIcon fontSize="small" />,
    type: 'login',
  },
  {
    id: 2,
    user: 'Mike Davis',
    action: 'updated user',
    target: 'John Smith',
    timestamp: '15 minutes ago',
    icon: <EditIcon fontSize="small" />,
    type: 'edit',
  },
  {
    id: 3,
    user: 'System',
    action: 'backup completed',
    target: 'Daily Backup',
    timestamp: '1 hour ago',
    icon: <BackupIcon fontSize="small" />,
    type: 'system',
  },
  {
    id: 4,
    user: 'Admin',
    action: 'created role',
    target: 'Field Supervisor',
    timestamp: '3 hours ago',
    icon: <AddIcon fontSize="small" />,
    type: 'create',
  },
  {
    id: 5,
    user: 'System',
    action: 'deactivated user',
    target: 'Old Account',
    timestamp: '5 hours ago',
    icon: <PersonOffIcon fontSize="small" />,
    type: 'warning',
  },
];

const systemAlerts = [
  {
    id: 1,
    severity: 'warning',
    title: 'Storage usage at 75%',
    message: 'Consider cleaning up old backups or upgrading storage.',
    timestamp: '2 hours ago',
  },
  {
    id: 2,
    severity: 'info',
    title: 'System update available',
    message: 'Version 2.4.1 is available with security patches.',
    timestamp: '1 day ago',
  },
  {
    id: 3,
    severity: 'success',
    title: 'SSL certificate renewed',
    message: 'Certificate valid until Dec 2026.',
    timestamp: '3 days ago',
  },
];

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or deactivate user accounts',
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      path: '/admin/users',
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: <SettingsIcon />,
      color: theme.palette.secondary.main,
      path: '/admin/settings',
    },
    {
      title: 'Security',
      description: 'Manage roles and permissions',
      icon: <SecurityIcon />,
      color: theme.palette.warning.main,
      path: '/admin/users',
    },
    {
      title: 'Backups',
      description: 'View and manage system backups',
      icon: <BackupIcon />,
      color: theme.palette.info.main,
      path: '/admin/settings',
    },
  ];

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'success':
        return <CheckCircleIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'success.main';
      case 'edit':
        return 'info.main';
      case 'create':
        return 'primary.main';
      case 'warning':
        return 'warning.main';
      case 'system':
        return 'secondary.main';
      default:
        return 'text.secondary';
    }
  };

  const storagePercentage = (systemStats.storageUsed / systemStats.storageTotal) * 100;

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            System administration, user management, and settings
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/admin/users')}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* System Health Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          border: 1,
          borderColor: 'success.main',
          bgcolor: alpha(theme.palette.success.main, 0.04),
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'success.main',
            width: 56,
            height: 56,
          }}
        >
          <CloudDoneIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600} color="success.main">
            All Systems Operational
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last checked: Just now • Uptime: 99.98% (30 days)
          </Typography>
        </Box>
        <Chip
          icon={<CheckCircleIcon />}
          label="Healthy"
          color="success"
          variant="filled"
        />
      </Paper>

      <Grid container spacing={3}>
        {/* System Stats */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            System Overview
          </Typography>
          <Grid container spacing={2}>
            {/* Users Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        width: 40,
                        height: 40,
                      }}
                    >
                      <PeopleIcon />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight={700}>
                    {systemStats.totalUsers}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      size="small"
                      label={`${systemStats.activeUsers} active`}
                      sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}
                    />
                    <Chip
                      size="small"
                      label={`${systemStats.inactiveUsers} inactive`}
                      sx={{ bgcolor: 'grey.100' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Sessions Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: 'success.main',
                        width: 40,
                        height: 40,
                      }}
                    >
                      <ComputerIcon />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      Active Sessions
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight={700}>
                    {systemStats.activeSessions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Users online now
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* API Requests Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: 'info.main',
                        width: 40,
                        height: 40,
                      }}
                    >
                      <CloudSyncIcon />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      API Requests
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight={700}>
                    {(systemStats.apiRequests24h / 1000).toFixed(1)}K
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Last 24 hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Response Time Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        color: 'warning.main',
                        width: 40,
                        height: 40,
                      }}
                    >
                      <SpeedIcon />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight={700}>
                    {systemStats.avgResponseTime}
                    <Typography component="span" variant="body1" color="text.secondary">
                      ms
                    </Typography>
                  </Typography>
                  <Chip
                    size="small"
                    icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                    label="Excellent"
                    color="success"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Storage Usage */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: 'secondary.main',
                        }}
                      >
                        <StorageIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Storage Usage
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {systemStats.storageUsed} GB of {systemStats.storageTotal} GB used
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h5" fontWeight={600} color={storagePercentage > 80 ? 'warning.main' : 'text.primary'}>
                      {storagePercentage.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={storagePercentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: storagePercentage > 80 ? 'warning.main' : 'primary.main',
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action) => (
              <Grid item xs={6} key={action.title}>
                <Card
                  elevation={0}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: action.color,
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(action.color, 0.1),
                        color: action.color,
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 1.5,
                      }}
                    >
                      {action.icon}
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {action.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>
                    Recent Activity
                  </Typography>
                </Box>
                <Button size="small" endIcon={<ArrowIcon />}>
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {recentActivity.map((activity, index) => (
                  <ListItem
                    key={activity.id}
                    disableGutters
                    sx={{
                      py: 1.5,
                      borderBottom: index < recentActivity.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.grey[500], 0.1),
                          color: getActivityColor(activity.type),
                          width: 32,
                          height: 32,
                        }}
                      >
                        {activity.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          <Typography component="span" fontWeight={600}>
                            {activity.user}
                          </Typography>{' '}
                          {activity.action}
                          {activity.target && (
                            <>
                              {' '}
                              <Typography component="span" fontWeight={500} color="primary.main">
                                {activity.target}
                              </Typography>
                            </>
                          )}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {activity.timestamp}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Alerts */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>
                    System Alerts
                  </Typography>
                </Box>
                <Chip label={`${systemAlerts.length} alerts`} size="small" />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {systemAlerts.map((alert, index) => (
                  <ListItem
                    key={alert.id}
                    disableGutters
                    sx={{
                      py: 1.5,
                      borderBottom: index < systemAlerts.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      alignItems: 'flex-start',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette[getAlertColor(alert.severity)].main, 0.1),
                          color: `${getAlertColor(alert.severity)}.main`,
                          width: 32,
                          height: 32,
                        }}
                      >
                        {getAlertIcon(alert.severity)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600}>
                          {alert.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {alert.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alert.timestamp}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={alert.severity}
                        size="small"
                        color={getAlertColor(alert.severity) as any}
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* User Roles Overview */}
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VpnKeyIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>
                    User Roles & Permissions
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Roles
                </Button>
              </Box>
              <Grid container spacing={2}>
                {[
                  { name: 'Administrator', count: 3, color: theme.palette.error.main, permissions: 'Full access to all features' },
                  { name: 'Manager', count: 8, color: theme.palette.warning.main, permissions: 'Department-level access' },
                  { name: 'Technician', count: 24, color: theme.palette.primary.main, permissions: 'Operations & field access' },
                  { name: 'Sales Rep', count: 7, color: theme.palette.success.main, permissions: 'CRM & sales access' },
                  { name: 'Viewer', count: 3, color: theme.palette.grey[500], permissions: 'Read-only access' },
                ].map((role) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={role.name}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: role.color,
                          bgcolor: alpha(role.color, 0.04),
                        },
                      }}
                      onClick={() => navigate('/admin/users')}
                    >
                      <Avatar
                        sx={{
                          bgcolor: alpha(role.color, 0.1),
                          color: role.color,
                          mx: 'auto',
                          mb: 1,
                        }}
                      >
                        <AdminIcon />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {role.name}
                      </Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ my: 0.5 }}>
                        {role.count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {role.permissions}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CSS for refresh animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default AdminDashboard;
