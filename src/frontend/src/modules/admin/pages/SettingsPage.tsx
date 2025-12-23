import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  IconButton,
  useTheme,
  alpha,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Palette as PaletteIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  CheckCircle as CheckCircleIcon,
  Smartphone as SmartphoneIcon,
  Computer as ComputerIcon,
  BusinessCenter as BusinessCenterIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useThemeMode } from '@shared/theme/ThemeContext';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  appointmentReminders: boolean;
  leadAlerts: boolean;
  paymentAlerts: boolean;
}

interface DisplaySettings {
  compactMode: boolean;
  showAnimations: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

const SettingsPage = () => {
  const theme = useTheme();
  const { mode, setMode } = useThemeMode();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    dailyDigest: true,
    weeklyReport: true,
    appointmentReminders: true,
    leadAlerts: true,
    paymentAlerts: true,
  });

  // Display settings
  const [display, setDisplay] = useState<DisplaySettings>({
    compactMode: false,
    showAnimations: true,
    autoRefresh: true,
    refreshInterval: 30,
  });

  // Regional settings
  const [timezone, setTimezone] = useState('America/New_York');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [currency, setCurrency] = useState('USD');

  const handleThemeChange = (_event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode === 'light' || newMode === 'dark') {
      setMode(newMode);
      showSnackbar(`Theme changed to ${newMode} mode`);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDisplayChange = (key: keyof DisplaySettings) => {
    setDisplay((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    localStorage.setItem('notification-settings', JSON.stringify(notifications));
    localStorage.setItem('display-settings', JSON.stringify(display));
    localStorage.setItem('regional-settings', JSON.stringify({ timezone, dateFormat, currency }));
    showSnackbar('Settings saved successfully');
  };

  const handleResetSettings = () => {
    setNotifications({
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      dailyDigest: true,
      weeklyReport: true,
      appointmentReminders: true,
      leadAlerts: true,
      paymentAlerts: true,
    });
    setDisplay({
      compactMode: false,
      showAnimations: true,
      autoRefresh: true,
      refreshInterval: 30,
    });
    setTimezone('America/New_York');
    setDateFormat('MM/DD/YYYY');
    setCurrency('USD');
    showSnackbar('Settings reset to defaults');
  };

  const SettingCard = ({ 
    title, 
    description, 
    icon, 
    children 
  }: { 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
  }) => (
    <Card 
      elevation={0} 
      sx={{ 
        border: 1, 
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your dashboard experience and manage your preferences
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'flex-end',
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={handleResetSettings}
        >
          Reset to Defaults
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save Changes
        </Button>
      </Paper>

      <Grid container spacing={3}>
        {/* Appearance Settings */}
        <Grid item xs={12} lg={6}>
          <SettingCard
            title="Appearance"
            description="Customize the look and feel of your dashboard"
            icon={<PaletteIcon />}
          >
            {/* Theme Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Theme Mode
              </Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleThemeChange}
                aria-label="theme mode"
                fullWidth
                sx={{ mt: 1 }}
              >
                <ToggleButton 
                  value="light" 
                  aria-label="light mode"
                  sx={{
                    py: 2,
                    gap: 1,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                      },
                    },
                  }}
                >
                  <LightModeIcon />
                  <Typography variant="body2" fontWeight={500}>Light</Typography>
                  {mode === 'light' && <CheckCircleIcon fontSize="small" color="primary" />}
                </ToggleButton>
                <ToggleButton 
                  value="dark" 
                  aria-label="dark mode"
                  sx={{
                    py: 2,
                    gap: 1,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                      },
                    },
                  }}
                >
                  <DarkModeIcon />
                  <Typography variant="body2" fontWeight={500}>Dark</Typography>
                  {mode === 'dark' && <CheckCircleIcon fontSize="small" color="primary" />}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Display Options */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
              Display Options
            </Typography>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ComputerIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Compact Mode"
                  secondary="Reduce spacing for more content on screen"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={display.compactMode}
                    onChange={() => handleDisplayChange('compactMode')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PaletteIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Animations"
                  secondary="Enable smooth transitions and effects"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={display.showAnimations}
                    onChange={() => handleDisplayChange('showAnimations')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </SettingCard>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} lg={6}>
          <SettingCard
            title="Notifications"
            description="Choose how you want to be notified"
            icon={<NotificationsIcon />}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Notification Channels
            </Typography>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <EmailIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive updates via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notifications.emailNotifications}
                    onChange={() => handleNotificationChange('emailNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ComputerIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Push Notifications"
                  secondary="Browser push notifications"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notifications.pushNotifications}
                    onChange={() => handleNotificationChange('pushNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <SmartphoneIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="SMS Notifications"
                  secondary="Text message alerts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notifications.smsNotifications}
                    onChange={() => handleNotificationChange('smsNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Alert Types
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip
                icon={<BusinessCenterIcon />}
                label="Lead Alerts"
                color={notifications.leadAlerts ? 'primary' : 'default'}
                onClick={() => handleNotificationChange('leadAlerts')}
                variant={notifications.leadAlerts ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<AccessTimeIcon />}
                label="Appointments"
                color={notifications.appointmentReminders ? 'primary' : 'default'}
                onClick={() => handleNotificationChange('appointmentReminders')}
                variant={notifications.appointmentReminders ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<StorageIcon />}
                label="Payments"
                color={notifications.paymentAlerts ? 'primary' : 'default'}
                onClick={() => handleNotificationChange('paymentAlerts')}
                variant={notifications.paymentAlerts ? 'filled' : 'outlined'}
              />
            </Box>
          </SettingCard>
        </Grid>

        {/* Regional Settings */}
        <Grid item xs={12} lg={6}>
          <SettingCard
            title="Regional Settings"
            description="Set your timezone and format preferences"
            icon={<LanguageIcon />}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={timezone}
                    label="Timezone"
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                    <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                    <MenuItem value="America/Anchorage">Alaska Time (AKT)</MenuItem>
                    <MenuItem value="Pacific/Honolulu">Hawaii Time (HT)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={dateFormat}
                    label="Date Format"
                    onChange={(e) => setDateFormat(e.target.value)}
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={currency}
                    label="Currency"
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="CAD">CAD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>

        {/* Data & Storage Settings */}
        <Grid item xs={12} lg={6}>
          <SettingCard
            title="Data & Refresh"
            description="Configure data refresh and caching preferences"
            icon={<StorageIcon />}
          >
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AccessTimeIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Auto-Refresh Data"
                  secondary="Automatically refresh dashboard data"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={display.autoRefresh}
                    onChange={() => handleDisplayChange('autoRefresh')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            {display.autoRefresh && (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Refresh Interval</InputLabel>
                  <Select
                    value={display.refreshInterval}
                    label="Refresh Interval"
                    onChange={(e) => setDisplay({ ...display, refreshInterval: Number(e.target.value) })}
                  >
                    <MenuItem value={15}>Every 15 seconds</MenuItem>
                    <MenuItem value={30}>Every 30 seconds</MenuItem>
                    <MenuItem value={60}>Every minute</MenuItem>
                    <MenuItem value={300}>Every 5 minutes</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Reports
            </Typography>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <EmailIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Daily Digest"
                  secondary="Receive daily summary email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notifications.dailyDigest}
                    onChange={() => handleNotificationChange('dailyDigest')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <StorageIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Weekly Report"
                  secondary="Receive weekly analytics report"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notifications.weeklyReport}
                    onChange={() => handleNotificationChange('weeklyReport')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </SettingCard>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <SettingCard
            title="Security"
            description="Manage your account security settings"
            icon={<SecurityIcon />}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Change Password
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    size="small"
                    label="Current Password"
                    type="password"
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="New Password"
                    type="password"
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                  />
                  <Button variant="contained" sx={{ alignSelf: 'flex-start' }}>
                    Update Password
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Two-Factor Authentication
                </Typography>
                <Alert 
                  severity="info" 
                  sx={{ mb: 2 }}
                  icon={<SecurityIcon />}
                >
                  Protect your account with an extra layer of security
                </Alert>
                <Button variant="outlined" startIcon={<SecurityIcon />}>
                  Enable 2FA
                </Button>

                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                  Active Sessions
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ComputerIcon color="primary" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        Current Session
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Chrome on macOS • Last active: Just now
                      </Typography>
                    </Box>
                    <Chip label="Active" color="success" size="small" />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>
      </Grid>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
