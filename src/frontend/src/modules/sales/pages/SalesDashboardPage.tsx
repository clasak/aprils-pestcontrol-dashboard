import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { contactsApi } from '../services/contacts.api';
import { leadsApi } from '../services/leads.api';
import { dealsApi } from '../services/deals.api';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary.main',
  trend,
}) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon
                  fontSize="small"
                  color={trend >= 0 ? 'success' : 'error'}
                  sx={{ mr: 0.5 }}
                />
                <Typography
                  variant="caption"
                  color={trend >= 0 ? 'success.main' : 'error.main'}
                >
                  {trend >= 0 ? '+' : ''}
                  {trend}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export const SalesDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactStats, setContactStats] = useState<any>(null);
  const [leadStats, setLeadStats] = useState<any>(null);
  const [dealStats, setDealStats] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contactsRes, leadsRes, dealsRes, forecastRes] = await Promise.all([
          contactsApi.getStatistics().catch(() => null),
          leadsApi.getStatistics().catch(() => null),
          dealsApi.getStatistics().catch(() => null),
          dealsApi.getForecast().catch(() => null),
        ]);

        if (contactsRes) setContactStats(contactsRes.data);
        if (leadsRes) setLeadStats(leadsRes.data);
        if (dealsRes) setDealStats(dealsRes.data);
        if (forecastRes) setForecast(forecastRes.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sales Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your sales performance and pipeline
        </Typography>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Contacts"
            value={contactStats?.total || 0}
            subtitle={`${contactStats?.active || 0} active`}
            icon={<PeopleIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Leads"
            value={leadStats?.total || 0}
            subtitle={`${leadStats?.qualified || 0} qualified`}
            icon={<StarIcon />}
            color="warning.main"
            trend={15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Open Deals"
            value={dealStats?.open || 0}
            subtitle={`${dealStats?.winRate || 0}% win rate`}
            icon={<AssessmentIcon />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Pipeline"
            value={formatCurrency(dealStats?.totalValue || 0)}
            subtitle={`Avg: ${formatCurrency(dealStats?.avgDealSize || 0)}`}
            icon={<MoneyIcon />}
            color="success.main"
            trend={8}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Lead Conversion Funnel */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead Conversion Funnel
            </Typography>
            {leadStats && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">New Leads</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {leadStats.byStatus?.new || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Contacted</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {leadStats.byStatus?.contacted || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      leadStats.total > 0
                        ? ((leadStats.byStatus?.contacted || 0) / leadStats.total) * 100
                        : 0
                    }
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Qualified</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {leadStats.qualified || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      leadStats.total > 0
                        ? ((leadStats.qualified || 0) / leadStats.total) * 100
                        : 0
                    }
                    color="warning"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Converted to Deals</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {leadStats.converted || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      leadStats.total > 0
                        ? ((leadStats.converted || 0) / leadStats.total) * 100
                        : 0
                    }
                    color="success"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Conversion Rate
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {leadStats.conversionRate || 0}%
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sales Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Performance
            </Typography>
            {dealStats && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                      <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h3" color="success.dark">
                        {dealStats.won || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Deals Won
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                      <ScheduleIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h3" color="error.dark">
                        {dealStats.lost || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Deals Lost
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Win Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={dealStats.winRate || 0}
                      sx={{ flexGrow: 1, height: 10, borderRadius: 1 }}
                      color="success"
                    />
                    <Typography variant="h6" color="success.main">
                      {dealStats.winRate || 0}%
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Average Deal Size
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(dealStats.avgDealSize || 0)}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Lead Score Average
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5">{leadStats?.averageScore || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      / 100
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Contact Types Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Distribution
            </Typography>
            {contactStats && (
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <PeopleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Residential"
                    secondary={`${contactStats.byType?.residential || 0} contacts`}
                  />
                  <Chip label={`${Math.round(((contactStats.byType?.residential || 0) / (contactStats.total || 1)) * 100)}%`} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <PeopleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Commercial"
                    secondary={`${contactStats.byType?.commercial || 0} contacts`}
                  />
                  <Chip label={`${Math.round(((contactStats.byType?.commercial || 0) / (contactStats.total || 1)) * 100)}%`} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <PeopleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Property Managers"
                    secondary={`${contactStats.byType?.propertyManager || 0} contacts`}
                  />
                  <Chip label={`${Math.round(((contactStats.byType?.propertyManager || 0) / (contactStats.total || 1)) * 100)}%`} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <PeopleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Referral Partners"
                    secondary={`${contactStats.byType?.referralPartner || 0} contacts`}
                  />
                  <Chip label={`${Math.round(((contactStats.byType?.referralPartner || 0) / (contactStats.total || 1)) * 100)}%`} />
                </ListItem>
              </List>
            )}
          </Paper>
        </Grid>

        {/* Revenue Forecast */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Forecast
            </Typography>
            {forecast && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Pipeline
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(forecast.summary?.totalValue || 0)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Weighted Forecast
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(forecast.summary?.weightedValue || 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Based on win probability
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Expected Close This Quarter
                </Typography>
                <Typography variant="h5">
                  {forecast.summary?.totalDeals || 0} deals
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesDashboardPage;

