import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Paper,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocalShipping as TruckIcon,
} from '@mui/icons-material';
import { KPICard, ChartCard, StatCard, ActivityItem } from '../../../shared/components';

const ExecutiveDashboard = () => {
  // Mock data - in production, this would come from API
  const kpiData = {
    mrr: {
      value: 127450,
      change: 12.5,
      trend: 'up' as const,
    },
    activeCustomers: {
      value: 1234,
      change: 5.2,
      trend: 'up' as const,
    },
    churnRate: {
      value: 2.1,
      change: -0.5,
      trend: 'down' as const,
    },
    avgRevenue: {
      value: 103,
      change: 3.1,
      trend: 'up' as const,
    },
  };

  const todayStats = {
    scheduledAppointments: 47,
    completedServices: 32,
    newLeads: 18,
    pendingQuotes: 23,
  };

  const recentActivities = [
    {
      id: 1,
      title: 'New lead converted to customer',
      description: 'John Smith - Residential Pest Control Package',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      user: { name: 'Sarah Johnson', avatar: '' },
      type: 'success' as const,
    },
    {
      id: 2,
      title: 'Service completed',
      description: 'Termite inspection at 123 Main St - Customer rated 5 stars',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      user: { name: 'Mike Rodriguez', avatar: '' },
      type: 'success' as const,
    },
    {
      id: 3,
      title: 'Payment received',
      description: '$450 payment for quarterly service plan',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      user: { name: 'Finance System', avatar: '' },
      type: 'info' as const,
    },
    {
      id: 4,
      title: 'Appointment rescheduled',
      description: 'Customer requested to move appointment to next week',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      user: { name: 'Lisa Chen', avatar: '' },
      type: 'warning' as const,
    },
    {
      id: 5,
      title: 'New lead captured',
      description: 'Website form submission - Commercial property inquiry',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      user: { name: 'Marketing System', avatar: '' },
      type: 'info' as const,
    },
  ];

  const topTechnicians = [
    { name: 'Mike Rodriguez', completedJobs: 156, rating: 4.9, revenue: 45200 },
    { name: 'Tom Anderson', completedJobs: 142, rating: 4.8, revenue: 41800 },
    { name: 'James Wilson', completedJobs: 138, rating: 4.7, revenue: 39600 },
    { name: 'David Brown', completedJobs: 129, rating: 4.8, revenue: 38100 },
  ];

  const urgentItems = [
    {
      id: 1,
      title: 'Low inventory alert',
      description: 'Termite treatment solution below minimum threshold',
      priority: 'high' as const,
    },
    {
      id: 2,
      title: 'Customer complaint',
      description: 'Missed appointment - requires immediate follow-up',
      priority: 'high' as const,
    },
    {
      id: 3,
      title: 'License renewal due',
      description: 'Pest control license expires in 15 days',
      priority: 'medium' as const,
    },
    {
      id: 4,
      title: 'Equipment maintenance',
      description: '3 vehicles due for scheduled maintenance',
      priority: 'medium' as const,
    },
  ];

  const serviceBreakdown = [
    { service: 'General Pest Control', count: 145, percentage: 42 },
    { service: 'Termite Treatment', count: 89, percentage: 26 },
    { service: 'Rodent Control', count: 67, percentage: 19 },
    { service: 'Bed Bug Treatment', count: 45, percentage: 13 },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
        Executive Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
          Real-time overview of business performance and key metrics
        </Typography>
      </Box>

      {/* KPI Cards Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Monthly Recurring Revenue"
            value={kpiData.mrr.value.toLocaleString()}
            prefix="$"
            change={kpiData.mrr.change}
            trend={kpiData.mrr.trend}
            icon={<MoneyIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Active Customers"
            value={kpiData.activeCustomers.value.toLocaleString()}
            change={kpiData.activeCustomers.change}
            trend={kpiData.activeCustomers.trend}
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Churn Rate"
            value={kpiData.churnRate.value}
            suffix="%"
            change={kpiData.churnRate.change}
            trend={kpiData.churnRate.trend}
            icon={<TrendingUpIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Avg Revenue/Customer"
            value={kpiData.avgRevenue.value}
            prefix="$"
            change={kpiData.avgRevenue.change}
            trend={kpiData.avgRevenue.trend}
            icon={<MoneyIcon />}
          />
        </Grid>
      </Grid>

      {/* Today's Stats Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Scheduled Today"
            value={todayStats.scheduledAppointments}
            icon={<ScheduleIcon />}
            iconColor="primary.main"
            iconBgColor="rgba(25, 118, 210, 0.1)"
            subtitle="appointments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Today"
            value={todayStats.completedServices}
            icon={<CheckCircleIcon />}
            iconColor="success.main"
            iconBgColor="rgba(76, 175, 80, 0.1)"
            subtitle="services"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Leads"
            value={todayStats.newLeads}
            icon={<EmailIcon />}
            iconColor="info.main"
            iconBgColor="rgba(33, 150, 243, 0.1)"
            subtitle="today"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Quotes"
            value={todayStats.pendingQuotes}
            icon={<AssignmentIcon />}
            iconColor="warning.main"
            iconBgColor="rgba(255, 152, 0, 0.1)"
            subtitle="awaiting approval"
          />
        </Grid>
      </Grid>

      {/* Charts and Data Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Service Breakdown */}
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Service Type Breakdown"
            subtitle="Current month distribution"
            height={400}
          >
            <Box sx={{ pt: 2 }}>
              {serviceBreakdown.map((item, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {item.service}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.count} ({item.percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor:
                          index === 0
                            ? 'primary.main'
                            : index === 1
                            ? 'success.main'
                            : index === 2
                            ? 'warning.main'
                            : 'info.main',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </ChartCard>
        </Grid>

        {/* Top Technicians */}
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Top Performing Technicians"
            subtitle="This month"
            height={400}
          >
            <List sx={{ pt: 1 }}>
              {topTechnicians.map((tech, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      gap: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40,
                        fontSize: '1rem',
                      }}
                    >
                      {tech.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {tech.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tech.completedJobs} jobs • ⭐ {tech.rating}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      ${tech.revenue.toLocaleString()}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Bottom Row - Recent Activity and Urgent Items */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Recent Activity
                </Typography>
                <Button size="small" color="primary">
                  View All
                </Button>
              </Box>
              <Box>
                {recentActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    title={activity.title}
                    description={activity.description}
                    timestamp={activity.timestamp}
                    user={activity.user}
                    type={activity.type}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Urgent Items */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                }}
              >
                <WarningIcon color="warning" />
                <Typography variant="h6" fontWeight={600}>
                  Urgent Items
      </Typography>
    </Box>
              <List sx={{ p: 0 }}>
                {urgentItems.map((item) => (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor:
                        item.priority === 'high'
                          ? 'error.lighter'
                          : 'warning.lighter',
                      border: '1px solid',
                      borderColor:
                        item.priority === 'high'
                          ? 'error.light'
                          : 'warning.light',
                      '&:last-child': { mb: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {item.title}
                      </Typography>
                      <Chip
                        label={item.priority}
                        size="small"
                        color={item.priority === 'high' ? 'error' : 'warning'}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Paper>
                ))}
              </List>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                startIcon={<AssignmentIcon />}
              >
                View All Tasks
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<PeopleIcon />}
                sx={{ py: 1.5 }}
              >
                Add New Customer
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ScheduleIcon />}
                sx={{ py: 1.5 }}
              >
                Schedule Service
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<PhoneIcon />}
                sx={{ py: 1.5 }}
              >
                Log Call
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<TruckIcon />}
                sx={{ py: 1.5 }}
              >
                Dispatch Technician
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default ExecutiveDashboard;
