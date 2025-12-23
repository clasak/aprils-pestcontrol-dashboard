/**
 * Quote Analytics Dashboard
 * 
 * Comprehensive analytics for quote management:
 * - Quote conversion metrics
 * - Pipeline value tracking
 * - Win/loss analysis
 * - Follow-up automation status
 * - Response time metrics
 * - Revenue forecasting
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Chip,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimelineIcon from '@mui/icons-material/Timeline';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

import { formatCurrency } from '../services/pricing.service';

interface QuoteAnalyticsDashboardProps {
  onQuoteClick?: (quoteId: string) => void;
  onFollowUpClick?: (quoteId: string) => void;
}

interface QuoteMetrics {
  totalQuotes: number;
  totalQuotesChange: number;
  totalValue: number;
  totalValueChange: number;
  conversionRate: number;
  conversionRateChange: number;
  avgResponseTime: number;
  avgResponseTimeChange: number;
  avgDealSize: number;
  avgDealSizeChange: number;
  pendingQuotes: number;
  expiringQuotes: number;
}

interface QuoteActivity {
  id: string;
  quoteNumber: string;
  customerName: string;
  action: 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'follow_up_due' | 'reminder_sent';
  timestamp: string;
  value: number;
}

interface SalesRepPerformance {
  id: string;
  name: string;
  avatar?: string;
  quotesCreated: number;
  quotesWon: number;
  totalValue: number;
  conversionRate: number;
  avgResponseHours: number;
}

interface FollowUpTask {
  id: string;
  quoteId: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'overdue' | 'due_today' | 'upcoming' | 'scheduled';
  dueDate: string;
  daysSinceLastContact: number;
  quoteValue: number;
  notes?: string;
  automationEnabled: boolean;
}

// Mock data generation
const generateMetrics = (): QuoteMetrics => ({
  totalQuotes: 156,
  totalQuotesChange: 12,
  totalValue: 48750000,
  totalValueChange: 8,
  conversionRate: 38.5,
  conversionRateChange: 3.2,
  avgResponseTime: 4.2,
  avgResponseTimeChange: -1.5,
  avgDealSize: 312500,
  avgDealSizeChange: 5,
  pendingQuotes: 42,
  expiringQuotes: 7,
});

const generateActivities = (): QuoteActivity[] => [
  { id: 'a1', quoteNumber: 'Q-2024-0156', customerName: 'John Smith', action: 'accepted', timestamp: '10 minutes ago', value: 125000 },
  { id: 'a2', quoteNumber: 'Q-2024-0155', customerName: 'ABC Restaurant', action: 'viewed', timestamp: '25 minutes ago', value: 450000 },
  { id: 'a3', quoteNumber: 'Q-2024-0154', customerName: 'Maria Garcia', action: 'sent', timestamp: '1 hour ago', value: 87500 },
  { id: 'a4', quoteNumber: 'Q-2024-0153', customerName: 'Tech Office Park', action: 'follow_up_due', timestamp: '2 hours ago', value: 225000 },
  { id: 'a5', quoteNumber: 'Q-2024-0152', customerName: 'Sarah Johnson', action: 'rejected', timestamp: '3 hours ago', value: 95000 },
  { id: 'a6', quoteNumber: 'Q-2024-0151', customerName: 'Mike Williams', action: 'reminder_sent', timestamp: '4 hours ago', value: 175000 },
  { id: 'a7', quoteNumber: 'Q-2024-0150', customerName: 'Sunset Apartments', action: 'expired', timestamp: '5 hours ago', value: 315000 },
  { id: 'a8', quoteNumber: 'Q-2024-0149', customerName: 'Dr. Emily Chen', action: 'accepted', timestamp: 'Yesterday', value: 285000 },
];

const generateSalesReps = (): SalesRepPerformance[] => [
  { id: 's1', name: 'Alex Thompson', quotesCreated: 45, quotesWon: 22, totalValue: 6875000, conversionRate: 48.9, avgResponseHours: 2.4 },
  { id: 's2', name: 'Jordan Martinez', quotesCreated: 38, quotesWon: 16, totalValue: 5125000, conversionRate: 42.1, avgResponseHours: 3.8 },
  { id: 's3', name: 'Casey Johnson', quotesCreated: 42, quotesWon: 14, totalValue: 4250000, conversionRate: 33.3, avgResponseHours: 5.2 },
  { id: 's4', name: 'Riley Davis', quotesCreated: 31, quotesWon: 10, totalValue: 3500000, conversionRate: 32.3, avgResponseHours: 6.1 },
];

const generateFollowUps = (): FollowUpTask[] => [
  {
    id: 'f1',
    quoteId: 'q153',
    quoteNumber: 'Q-2024-0153',
    customerName: 'Tech Office Park',
    customerEmail: 'facilities@techpark.com',
    customerPhone: '(555) 123-4567',
    status: 'overdue',
    dueDate: '2024-12-21',
    daysSinceLastContact: 5,
    quoteValue: 225000,
    notes: 'Commercial account - large potential',
    automationEnabled: true,
  },
  {
    id: 'f2',
    quoteId: 'q148',
    quoteNumber: 'Q-2024-0148',
    customerName: 'Linda Peterson',
    customerEmail: 'linda.p@email.com',
    customerPhone: '(555) 234-5678',
    status: 'overdue',
    dueDate: '2024-12-20',
    daysSinceLastContact: 7,
    quoteValue: 125000,
    automationEnabled: false,
  },
  {
    id: 'f3',
    quoteId: 'q151',
    quoteNumber: 'Q-2024-0151',
    customerName: 'Mike Williams',
    customerEmail: 'mike.w@email.com',
    customerPhone: '(555) 345-6789',
    status: 'due_today',
    dueDate: '2024-12-23',
    daysSinceLastContact: 3,
    quoteValue: 175000,
    automationEnabled: true,
  },
  {
    id: 'f4',
    quoteId: 'q147',
    quoteNumber: 'Q-2024-0147',
    customerName: 'Riverside HOA',
    customerEmail: 'manager@riversidehoa.com',
    customerPhone: '(555) 456-7890',
    status: 'upcoming',
    dueDate: '2024-12-25',
    daysSinceLastContact: 2,
    quoteValue: 485000,
    notes: 'Multiple properties - waiting for board approval',
    automationEnabled: true,
  },
  {
    id: 'f5',
    quoteId: 'q146',
    quoteNumber: 'Q-2024-0146',
    customerName: 'Chef\'s Kitchen Restaurant',
    customerEmail: 'owner@chefskitchen.com',
    customerPhone: '(555) 567-8901',
    status: 'scheduled',
    dueDate: '2024-12-27',
    daysSinceLastContact: 1,
    quoteValue: 325000,
    notes: 'Scheduled call with owner',
    automationEnabled: false,
  },
];

// Quote status breakdown for chart
const QUOTE_STATUS_DATA = [
  { status: 'Draft', count: 15, color: '#9e9e9e', value: 4875000 },
  { status: 'Sent', count: 28, color: '#2196f3', value: 8750000 },
  { status: 'Viewed', count: 22, color: '#ff9800', value: 6875000 },
  { status: 'Accepted', count: 58, color: '#4caf50', value: 18125000 },
  { status: 'Rejected', count: 18, color: '#f44336', value: 5625000 },
  { status: 'Expired', count: 15, color: '#607d8b', value: 4500000 },
];

// Win/Loss reasons
const WIN_REASONS = [
  { reason: 'Competitive Pricing', count: 28, percentage: 48 },
  { reason: 'Service Quality Reputation', count: 18, percentage: 31 },
  { reason: 'Quick Response Time', count: 7, percentage: 12 },
  { reason: 'Package Options', count: 5, percentage: 9 },
];

const LOSS_REASONS = [
  { reason: 'Price Too High', count: 8, percentage: 44 },
  { reason: 'Competitor Selected', count: 5, percentage: 28 },
  { reason: 'No Response', count: 3, percentage: 17 },
  { reason: 'Timing', count: 2, percentage: 11 },
];

const QuoteAnalyticsDashboard = ({
  onQuoteClick,
  onFollowUpClick,
}: QuoteAnalyticsDashboardProps) => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const [activeTab, setActiveTab] = useState(0);
  
  const metrics = useMemo(() => generateMetrics(), [dateRange]);
  const activities = useMemo(() => generateActivities(), []);
  const salesReps = useMemo(() => generateSalesReps(), [dateRange]);
  const followUps = useMemo(() => generateFollowUps(), []);

  const overdueFollowUps = followUps.filter(f => f.status === 'overdue');
  const todayFollowUps = followUps.filter(f => f.status === 'due_today');

  const MetricCard = ({
    title,
    value,
    change,
    icon,
    color,
    format = 'number',
    suffix = '',
  }: {
    title: string;
    value: number;
    change: number;
    icon: React.ReactNode;
    color: string;
    format?: 'number' | 'currency' | 'percentage' | 'time';
    suffix?: string;
  }) => {
    const formatValue = () => {
      switch (format) {
        case 'currency':
          return formatCurrency(value);
        case 'percentage':
          return `${value.toFixed(1)}%`;
        case 'time':
          return `${value.toFixed(1)} hrs${suffix}`;
        default:
          return value.toLocaleString() + suffix;
      }
    };

    return (
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
                {formatValue()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {change > 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{ color: change > 0 ? 'success.main' : 'error.main' }}
                >
                  {Math.abs(change)}% vs last period
                </Typography>
              </Box>
            </Box>
            <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 48, height: 48 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const getActivityIcon = (action: QuoteActivity['action']) => {
    const iconMap = {
      sent: <EmailIcon sx={{ color: 'info.main' }} />,
      viewed: <DescriptionIcon sx={{ color: 'warning.main' }} />,
      accepted: <CheckCircleIcon sx={{ color: 'success.main' }} />,
      rejected: <CancelIcon sx={{ color: 'error.main' }} />,
      expired: <AccessTimeIcon sx={{ color: 'text.disabled' }} />,
      follow_up_due: <NotificationsActiveIcon sx={{ color: 'warning.main' }} />,
      reminder_sent: <EmailIcon sx={{ color: 'secondary.main' }} />,
    };
    return iconMap[action];
  };

  const getActivityLabel = (action: QuoteActivity['action']) => {
    const labelMap = {
      sent: 'Quote Sent',
      viewed: 'Quote Viewed',
      accepted: 'Quote Accepted',
      rejected: 'Quote Rejected',
      expired: 'Quote Expired',
      follow_up_due: 'Follow-up Due',
      reminder_sent: 'Reminder Sent',
    };
    return labelMap[action];
  };

  const getFollowUpStatusChip = (status: FollowUpTask['status']) => {
    const config = {
      overdue: { color: 'error' as const, label: 'Overdue' },
      due_today: { color: 'warning' as const, label: 'Due Today' },
      upcoming: { color: 'info' as const, label: 'Upcoming' },
      scheduled: { color: 'success' as const, label: 'Scheduled' },
    };
    return <Chip size="small" color={config[status].color} label={config[status].label} />;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Quote Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track quote performance, conversions, and follow-up activities
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            >
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="12m">Last 12 Months</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Alerts */}
      {(overdueFollowUps.length > 0 || todayFollowUps.length > 0) && (
        <Box sx={{ mb: 3 }}>
          {overdueFollowUps.length > 0 && (
            <Alert
              severity="error"
              icon={<WarningAmberIcon />}
              sx={{ mb: 1 }}
              action={
                <Button color="inherit" size="small" onClick={() => setActiveTab(2)}>
                  View All
                </Button>
              }
            >
              <strong>{overdueFollowUps.length} overdue follow-up{overdueFollowUps.length !== 1 ? 's' : ''}</strong> requiring immediate attention.
              Total value: {formatCurrency(overdueFollowUps.reduce((sum, f) => sum + f.quoteValue, 0))}
            </Alert>
          )}
          {todayFollowUps.length > 0 && (
            <Alert
              severity="warning"
              icon={<NotificationsActiveIcon />}
              action={
                <Button color="inherit" size="small" onClick={() => setActiveTab(2)}>
                  View All
                </Button>
              }
            >
              <strong>{todayFollowUps.length} follow-up{todayFollowUps.length !== 1 ? 's' : ''} due today.</strong>
              Total value: {formatCurrency(todayFollowUps.reduce((sum, f) => sum + f.quoteValue, 0))}
            </Alert>
          )}
        </Box>
      )}

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Quotes"
            value={metrics.totalQuotes}
            change={metrics.totalQuotesChange}
            icon={<DescriptionIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Pipeline Value"
            value={metrics.totalValue}
            change={metrics.totalValueChange}
            icon={<AttachMoneyIcon />}
            color={theme.palette.success.main}
            format="currency"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversion Rate"
            value={metrics.conversionRate}
            change={metrics.conversionRateChange}
            icon={<TimelineIcon />}
            color={theme.palette.info.main}
            format="percentage"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Response Time"
            value={metrics.avgResponseTime}
            change={metrics.avgResponseTimeChange}
            icon={<SpeedIcon />}
            color={theme.palette.warning.main}
            format="time"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Overview" />
          <Tab label="Team Performance" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Follow-ups
                {overdueFollowUps.length > 0 && (
                  <Chip size="small" color="error" label={overdueFollowUps.length} sx={{ height: 20, fontSize: '0.7rem' }} />
                )}
              </Box>
            }
          />
          <Tab label="Win/Loss Analysis" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Quote Status Breakdown */}
          <Grid item xs={12} md={8}>
            <Card elevation={2}>
              <CardHeader
                title="Quote Status Distribution"
                subheader={`${metrics.totalQuotes} total quotes in selected period`}
              />
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  {QUOTE_STATUS_DATA.map((status) => (
                    <Chip
                      key={status.status}
                      label={`${status.status}: ${status.count}`}
                      sx={{ bgcolor: alpha(status.color, 0.1), color: status.color, fontWeight: 600 }}
                    />
                  ))}
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">% of Total</TableCell>
                        <TableCell>Distribution</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {QUOTE_STATUS_DATA.map((row) => (
                        <TableRow key={row.status}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: row.color }} />
                              {row.status}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{row.count}</TableCell>
                          <TableCell align="right">{formatCurrency(row.value)}</TableCell>
                          <TableCell align="right">
                            {((row.count / metrics.totalQuotes) * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell sx={{ width: 200 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(row.count / metrics.totalQuotes) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: alpha(row.color, 0.1),
                                '& .MuiLinearProgress-bar': { bgcolor: row.color },
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardHeader
                title="Recent Activity"
                action={
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <CardContent sx={{ p: 0 }}>
                <List dense>
                  {activities.map((activity) => (
                    <ListItem
                      key={activity.id}
                      button
                      onClick={() => onQuoteClick?.(activity.id)}
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'background.default', width: 36, height: 36 }}>
                          {getActivityIcon(activity.action)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={500}>
                            {activity.quoteNumber} - {activity.customerName}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {getActivityLabel(activity.action)} • {activity.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(activity.value)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Metrics Row */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Pending Quotes</Typography>
                <Typography variant="h3" fontWeight={700} color="warning.main">
                  {metrics.pendingQuotes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Awaiting response
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Expiring Soon</Typography>
                <Typography variant="h3" fontWeight={700} color="error.main">
                  {metrics.expiringQuotes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Within 7 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Avg Deal Size</Typography>
                <Typography variant="h3" fontWeight={700} color="success.main">
                  {formatCurrency(metrics.avgDealSize)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <TrendingUpIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                  {metrics.avgDealSizeChange}% vs last period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Monthly Revenue</Typography>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {formatCurrency(metrics.avgDealSize * 58 / 4)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  From closed quotes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Card elevation={2}>
          <CardHeader
            title="Sales Team Performance"
            subheader="Individual quote metrics for the selected period"
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sales Rep</TableCell>
                    <TableCell align="center">Quotes Created</TableCell>
                    <TableCell align="center">Quotes Won</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                    <TableCell align="center">Conversion Rate</TableCell>
                    <TableCell align="center">Avg Response (hrs)</TableCell>
                    <TableCell align="center">Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesReps.map((rep, index) => (
                    <TableRow key={rep.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: index === 0 ? 'primary.main' : 'grey.400' }}>
                            {rep.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{rep.name}</Typography>
                            {index === 0 && <Chip size="small" label="Top Performer" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{rep.quotesCreated}</TableCell>
                      <TableCell align="center">{rep.quotesWon}</TableCell>
                      <TableCell align="right">{formatCurrency(rep.totalValue)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`${rep.conversionRate.toFixed(1)}%`}
                          color={rep.conversionRate >= 40 ? 'success' : rep.conversionRate >= 30 ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          {rep.avgResponseHours <= 4 ? (
                            <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          )}
                          {rep.avgResponseHours.toFixed(1)}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((rep.conversionRate / 50) * 100, 100)}
                          sx={{
                            width: 100,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Follow-up Tasks */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardHeader
                title="Follow-up Queue"
                subheader={`${followUps.length} pending follow-ups • ${overdueFollowUps.length} overdue`}
                action={
                  <Button variant="outlined" size="small" startIcon={<NotificationsActiveIcon />}>
                    Configure Automation
                  </Button>
                }
              />
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Quote / Customer</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Days Since Contact</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell>Automation</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {followUps.map((task) => (
                        <TableRow
                          key={task.id}
                          sx={{
                            bgcolor: task.status === 'overdue' ? alpha(theme.palette.error.main, 0.05) : 'inherit',
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {task.quoteNumber}
                              </Typography>
                              <Typography variant="body2">
                                {task.customerName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {task.customerEmail} • {task.customerPhone}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{getFollowUpStatusChip(task.status)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              {task.dueDate}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="outlined"
                              color={task.daysSinceLastContact > 5 ? 'error' : task.daysSinceLastContact > 3 ? 'warning' : 'default'}
                              label={`${task.daysSinceLastContact} days`}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>{formatCurrency(task.quoteValue)}</Typography>
                          </TableCell>
                          <TableCell>
                            {task.automationEnabled ? (
                              <Chip size="small" color="success" variant="outlined" label="Enabled" icon={<CheckCircleIcon />} />
                            ) : (
                              <Chip size="small" variant="outlined" label="Manual" />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Send Email">
                                <IconButton size="small" onClick={() => onFollowUpClick?.(task.quoteId)}>
                                  <EmailIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Call">
                                <IconButton size="small">
                                  <PhoneIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Quote">
                                <IconButton size="small" onClick={() => onQuoteClick?.(task.quoteId)}>
                                  <DescriptionIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          {/* Win Reasons */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader
                title="Top Win Reasons"
                avatar={<Avatar sx={{ bgcolor: 'success.main' }}><ThumbUpIcon /></Avatar>}
                subheader={`Based on ${QUOTE_STATUS_DATA.find(s => s.status === 'Accepted')?.count || 0} won quotes`}
              />
              <CardContent>
                {WIN_REASONS.map((reason) => (
                  <Box key={reason.reason} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{reason.reason}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {reason.count} ({reason.percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={reason.percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: 'success.main' },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Loss Reasons */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader
                title="Top Loss Reasons"
                avatar={<Avatar sx={{ bgcolor: 'error.main' }}><ThumbDownIcon /></Avatar>}
                subheader={`Based on ${QUOTE_STATUS_DATA.find(s => s.status === 'Rejected')?.count || 0} lost quotes`}
              />
              <CardContent>
                {LOSS_REASONS.map((reason) => (
                  <Box key={reason.reason} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{reason.reason}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {reason.count} ({reason.percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={reason.percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: 'error.main' },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Insights */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardHeader title="Insights & Recommendations" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Alert severity="success" sx={{ height: '100%' }}>
                      <Typography variant="subtitle2" gutterBottom>Strong Performance</Typography>
                      <Typography variant="body2">
                        Your competitive pricing is your biggest win factor. Continue emphasizing value in proposals.
                      </Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Alert severity="warning" sx={{ height: '100%' }}>
                      <Typography variant="subtitle2" gutterBottom>Opportunity Area</Typography>
                      <Typography variant="body2">
                        44% of losses are due to pricing. Consider offering tiered packages to capture price-sensitive customers.
                      </Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Alert severity="info" sx={{ height: '100%' }}>
                      <Typography variant="subtitle2" gutterBottom>Follow-up Impact</Typography>
                      <Typography variant="body2">
                        Quotes with follow-up within 24hrs have 2.3x higher conversion rate. Set up automated reminders.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default QuoteAnalyticsDashboard;

