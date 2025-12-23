import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Collapse,
  Breadcrumbs,
  Link,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CampaignIcon from '@mui/icons-material/Campaign';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import InventoryIcon from '@mui/icons-material/Inventory';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ContactsIcon from '@mui/icons-material/Contacts';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import DescriptionIcon from '@mui/icons-material/Description';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import GroupsIcon from '@mui/icons-material/Groups';
import { useThemeMode } from '../theme/ThemeContext';
import { DevUserSwitcher } from '../components';

const DRAWER_WIDTH = 260;

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
  badge?: number;
}

const navigationItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  {
    name: 'Sales',
    path: '/sales',
    icon: <TrendingUpIcon />,
    badge: 5,
    children: [
      { name: 'Dashboard', path: '/sales', icon: <LeaderboardIcon /> },
      { name: 'Team Overview', path: '/sales/team', icon: <GroupsIcon /> },
      { name: 'My Dashboard', path: '/sales/my-dashboard', icon: <LeaderboardIcon /> },
      { name: 'Contacts', path: '/sales/contacts', icon: <ContactsIcon /> },
      { name: 'Leads', path: '/sales/leads', icon: <TrendingUpIcon /> },
      { name: 'Pipeline', path: '/sales/pipeline', icon: <ViewKanbanIcon /> },
      { name: 'Quotes', path: '/sales/quotes', icon: <DescriptionIcon /> },
    ],
  },
  {
    name: 'Operations',
    path: '/operations',
    icon: <BuildIcon />,
    children: [
      { name: 'Dashboard', path: '/operations', icon: <LeaderboardIcon /> },
      { name: 'Manager View', path: '/operations/manager', icon: <GroupsIcon /> },
      { name: 'Technician View', path: '/operations/technician', icon: <BuildIcon /> },
      { name: 'Schedule', path: '/operations/schedule', icon: <DashboardIcon /> },
      { name: 'Dispatch', path: '/operations/dispatch', icon: <DashboardIcon /> },
      { name: 'Routes', path: '/operations/routes', icon: <DashboardIcon /> },
    ],
  },
  { name: 'Customer Service', path: '/customer-service', icon: <SupportAgentIcon /> },
  { name: 'Finance', path: '/finance', icon: <AttachMoneyIcon /> },
  { name: 'HR', path: '/hr', icon: <PeopleIcon /> },
  { name: 'Inventory', path: '/inventory', icon: <InventoryIcon /> },
  { name: 'Marketing', path: '/marketing', icon: <CampaignIcon /> },
  { name: 'Compliance', path: '/compliance', icon: <VerifiedUserIcon /> },
  { name: 'Admin', path: '/admin', icon: <SettingsIcon /> },
];

// Helper to get breadcrumb path
const getBreadcrumbs = (pathname: string): Array<{ name: string; path: string }> => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: Array<{ name: string; path: string }> = [];
  
  let currentPath = '';
  for (const path of paths) {
    currentPath += `/${path}`;
    const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    breadcrumbs.push({ name, path: currentPath });
  }
  
  return breadcrumbs;
};

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Sales', 'Operations']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleTheme } = useThemeMode();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleExpandClick = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem('auth_token');
    navigate('/auth/login');
  };

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Box
          component="img"
          src="/compassiq-logo.png"
          alt="CompassIQ"
          sx={{
            height: 48,
            width: 'auto',
            objectFit: 'contain',
          }}
        />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            April's Pest Control
          </Typography>
          <Typography variant="caption" color="text.secondary">
            CRM Dashboard
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, py: 1, overflowY: 'auto' }}>
        {navigationItems.map((item) => (
          <Box key={item.name}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() =>
                  item.children
                    ? handleExpandClick(item.name)
                    : handleNavigation(item.path)
                }
                selected={isActive(item.path) && !item.children}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.name} />
                {item.badge && (
                  <Badge badgeContent={item.badge} color="error" sx={{ mr: 1 }} />
                )}
                {item.children &&
                  (expandedItems.includes(item.name) ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>

            {/* Sub-navigation */}
            {item.children && (
              <Collapse in={expandedItems.includes(item.name)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.path}
                      onClick={() => handleNavigation(child.path)}
                      selected={location.pathname === child.path}
                      sx={{
                        pl: 6,
                        mx: 1,
                        borderRadius: 1,
                        mb: 0.25,
                        '&.Mui-selected': {
                          bgcolor: 'action.selected',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>{child.icon}</ListItemIcon>
                      <ListItemText
                        primary={child.name}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>

      {/* User Section at Bottom */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main' }}>A</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={500} noWrap>
              April Shane
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              admin@pestcontrol.com
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ flex: 1, display: { xs: 'none', sm: 'flex' } }}
          >
            <Link
              underline="hover"
              color="inherit"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              Home
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={crumb.path}
                underline={index < breadcrumbs.length - 1 ? 'hover' : 'none'}
                color={index < breadcrumbs.length - 1 ? 'inherit' : 'text.primary'}
                sx={{ cursor: index < breadcrumbs.length - 1 ? 'pointer' : 'default' }}
                onClick={() =>
                  index < breadcrumbs.length - 1 && navigate(crumb.path)
                }
              >
                {crumb.name}
              </Link>
            ))}
          </Breadcrumbs>

          {/* Title for mobile */}
          <Typography
            variant="h6"
            noWrap
            sx={{ flex: 1, display: { xs: 'block', sm: 'none' }, color: 'text.primary' }}
          >
            {breadcrumbs.length > 0
              ? breadcrumbs[breadcrumbs.length - 1].name
              : 'Dashboard'}
          </Typography>

          {/* Actions */}
          <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            <IconButton 
              onClick={toggleTheme} 
              sx={{ 
                color: 'text.secondary',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'rotate(180deg)',
                },
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>A</Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: { minWidth: 200, mt: 1 },
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/admin/profile'); }}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/admin/settings'); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>

      {/* Dev User Switcher - Only visible in dev mode */}
      <DevUserSwitcher />
    </Box>
  );
};

export default MainLayout;
