import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Avatar,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp as SalesIcon,
  Build as OperationsIcon,
  Support as CustomerServiceIcon,
  AccountBalance as FinanceIcon,
  People as HRIcon,
  Inventory as InventoryIcon,
  Campaign as MarketingIcon,
  Gavel as ComplianceIcon,
  Settings as AdminIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

const MainDashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      name: 'Sales CRM',
      path: '/sales',
      color: '#1976d2',
      description: 'Leads, Pipeline, Quotes & Contacts',
      icon: <SalesIcon sx={{ fontSize: 40 }} />,
      stats: { leads: 'Active', pipeline: 'View' },
    },
    {
      name: 'Operations',
      path: '/operations',
      color: '#2e7d32',
      description: 'Scheduling & dispatch',
      icon: <OperationsIcon sx={{ fontSize: 40 }} />,
      stats: { today: 47, completed: 32 },
    },
    {
      name: 'Customer Service',
      path: '/customer-service',
      color: '#ed6c02',
      description: 'Support & tickets',
      icon: <CustomerServiceIcon sx={{ fontSize: 40 }} />,
      stats: { open: 12, urgent: 3 },
    },
    {
      name: 'Finance',
      path: '/finance',
      color: '#9c27b0',
      description: 'Billing & payments',
      icon: <FinanceIcon sx={{ fontSize: 40 }} />,
      stats: { pending: '$12.5K', overdue: 8 },
    },
    {
      name: 'HR',
      path: '/hr',
      color: '#d32f2f',
      description: 'Team management',
      icon: <HRIcon sx={{ fontSize: 40 }} />,
      stats: { employees: 45, onLeave: 2 },
    },
    {
      name: 'Inventory',
      path: '/inventory',
      color: '#0288d1',
      description: 'Stock & supplies',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      stats: { lowStock: 5, orders: 3 },
    },
    {
      name: 'Marketing',
      path: '/marketing',
      color: '#f57c00',
      description: 'Campaigns & analytics',
      icon: <MarketingIcon sx={{ fontSize: 40 }} />,
      stats: { campaigns: 4, leads: 89 },
    },
    {
      name: 'Compliance',
      path: '/compliance',
      color: '#5d4037',
      description: 'Regulatory & safety',
      icon: <ComplianceIcon sx={{ fontSize: 40 }} />,
      stats: { pending: 7, expiring: 2 },
    },
    {
      name: 'Admin',
      path: '/admin',
      color: '#616161',
      description: 'System settings',
      icon: <AdminIcon sx={{ fontSize: 40 }} />,
      stats: { users: 45, roles: 8 },
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to CompassIQ CRM Platform. Click on Sales CRM to access Leads, Pipeline, Quotes, and Contacts.
        </Typography>
      </Box>

      {/* Module Cards Grid */}
      <Grid container spacing={3}>
        {modules.map((module) => (
          <Grid item xs={12} sm={6} md={4} key={module.name}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 8,
                  '& .arrow-icon': {
                    transform: 'translateX(4px)',
                  },
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  backgroundColor: module.color,
                },
              }}
              onClick={() => navigate(module.path)}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Icon and Title */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: `${module.color}15`,
                      color: module.color,
                      width: 64,
                      height: 64,
                    }}
                  >
                    {module.icon}
                  </Avatar>
                  <ArrowIcon
                    className="arrow-icon"
                    sx={{
                      color: 'text.secondary',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </Box>

                {/* Module Name */}
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {module.name}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, minHeight: 40 }}
                >
                  {module.description}
                </Typography>

                {/* Stats */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  {Object.entries(module.stats).map(([key, value]) => (
                    <Chip
                      key={key}
                      label={`${key}: ${value}`}
                      size="small"
                      sx={{
                        backgroundColor: 'grey.100',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          System Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                  Total Revenue (MTD)
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  $127,450
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  ↑ 12.5% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                  Active Customers
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  1,234
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  ↑ 5.2% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                  Services Today
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  47
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  32 completed, 15 remaining
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default MainDashboard;
