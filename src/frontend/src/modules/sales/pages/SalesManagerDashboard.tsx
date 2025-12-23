/**
 * Sales Manager Dashboard
 * 
 * Overview dashboard for sales managers showing team performance,
 * pipeline health, and key alerts requiring attention.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Alert,
  AlertTitle,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { opportunitiesService } from '../../../services/opportunities.service';
import { leadsService } from '../../../services/leads.service';
import { activitiesService } from '../../../services/activities.service';
import type { Opportunity, Lead } from '../../../lib/database.types';
import { useAuth } from '../../../contexts/AuthContext';

// Stage colors for charts
const STAGE_COLORS = {
  lead: '#90caf9',
  qualified: '#4fc3f7',
  quote_sent: '#4db6ac',
  negotiation: '#ffb74d',
  verbal_commitment: '#81c784',
  closed_won: '#66bb6a',
  closed_lost: '#ef5350',
};

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  quote_sent: 'Quote Sent',
  negotiation: 'Negotiation',
  verbal_commitment: 'Verbal Commit',
};

interface DashboardStats {
  pipelineValue: number;
  weightedPipeline: number;
  pipelineCoverage: number;
  winRate: number;
  avgDealSize: number;
  openOpportunities: number;
  closedWonThisMonth: number;
  closedLostThisMonth: number;
}

const SalesManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isManager, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [stalledOpportunities, setStalledOpportunities] = useState<Opportunity[]>([]);
  const [noNextStepOpportunities, setNoNextStepOpportunities] = useState<Opportunity[]>([]);
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);

  const loadDashboardData = async () => {
    setError(null);
    
    try {
      // Load statistics
      const [oppStats, leadStats, activityStats, stalledOpps, noNextStep, pipeline] = await Promise.all([
        opportunitiesService.getStatistics(),
        leadsService.getStatistics(),
        activitiesService.getStatistics(),
        opportunitiesService.getStalled(7),
        opportunitiesService.getWithoutNextStep(),
        opportunitiesService.getPipelineSummary(),
      ]);

      // Calculate dashboard stats
      setStats({
        pipelineValue: oppStats.totalValue,
        weightedPipeline: oppStats.weightedValue,
        pipelineCoverage: oppStats.weightedValue / 100000 * 100, // Assuming $100k quota
        winRate: oppStats.winRate,
        avgDealSize: oppStats.avgDealSize,
        openOpportunities: oppStats.totalOpen,
        closedWonThisMonth: oppStats.wonThisMonth,
        closedLostThisMonth: oppStats.lostThisMonth,
      });

      // Format pipeline data for chart
      setPipelineData(
        pipeline.map((stage) => ({
          name: STAGE_LABELS[stage.stage] || stage.stage,
          value: stage.totalValue,
          weighted: stage.weightedValue,
          count: stage.count,
        }))
      );

      setStalledOpportunities(stalledOpps.slice(0, 5));
      setNoNextStepOpportunities(noNextStep.slice(0, 5));

      // Load hot leads (high score, not yet converted)
      const leads = await leadsService.getAll({ minScore: 70, limit: 5 });
      setHotLeads(leads.data);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to load dashboard data. Please try again.');
      // Set empty defaults so page still renders
      setStats({
        pipelineValue: 0,
        weightedPipeline: 0,
        pipelineCoverage: 0,
        winRate: 0,
        avgDealSize: 0,
        openOpportunities: 0,
        closedWonThisMonth: 0,
        closedLostThisMonth: 0,
      });
      setPipelineData([]);
      setStalledOpportunities([]);
      setNoNextStepOpportunities([]);
      setHotLeads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const alertCount = stalledOpportunities.length + noNextStepOpportunities.length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Sales Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {alertCount > 0 && (
            <Chip
              icon={<WarningAmberIcon />}
              label={`${alertCount} items need attention`}
              color="warning"
            />
          )}
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Pipeline Value
              </Typography>
              <Typography variant="h4" fontWeight={600} color="primary">
                {formatCurrency(stats?.pipelineValue || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.openOpportunities || 0} open opportunities
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Weighted Pipeline
              </Typography>
              <Typography variant="h4" fontWeight={600} color="info.main">
                {formatCurrency(stats?.weightedPipeline || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Probability-adjusted value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Win Rate
              </Typography>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {stats?.winRate || 0}%
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip label={`${stats?.closedWonThisMonth || 0} won`} size="small" color="success" />
                <Chip label={`${stats?.closedLostThisMonth || 0} lost`} size="small" color="error" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Avg Deal Size
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {formatCurrency(stats?.avgDealSize || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Alerts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Pipeline Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Pipeline by Stage" />
            <CardContent sx={{ height: 300 }}>
              {pipelineData.length === 0 || pipelineData.every(d => d.value === 0) ? (
                <Box 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'text.secondary',
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body1">No pipeline data yet</Typography>
                  <Typography variant="body2">
                    Create opportunities to see the pipeline chart
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <RechartsTooltip
                      formatter={(value: number) => [formatCurrency(value), 'Value']}
                    />
                    <Bar dataKey="value" fill="#1976d2" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Alerts" 
              action={
                alertCount > 0 && (
                  <Chip 
                    label={alertCount} 
                    size="small" 
                    color="error" 
                  />
                )
              }
            />
            <CardContent sx={{ p: 0 }}>
              {noNextStepOpportunities.length > 0 && (
                <Alert 
                  severity="error" 
                  icon={<ErrorOutlineIcon />}
                  sx={{ borderRadius: 0 }}
                >
                  <AlertTitle>Missing Next Steps</AlertTitle>
                  {noNextStepOpportunities.length} opportunities have no next step defined
                  <Button 
                    size="small" 
                    sx={{ mt: 1 }}
                    onClick={() => navigate('/sales/opportunities?filter=no-next-step')}
                  >
                    View All
                  </Button>
                </Alert>
              )}
              
              {stalledOpportunities.length > 0 && (
                <Alert 
                  severity="warning" 
                  icon={<WarningAmberIcon />}
                  sx={{ borderRadius: 0 }}
                >
                  <AlertTitle>Stalled Deals</AlertTitle>
                  {stalledOpportunities.length} opportunities with no activity in 7+ days
                  <Button 
                    size="small" 
                    sx={{ mt: 1 }}
                    onClick={() => navigate('/sales/opportunities?filter=stalled')}
                  >
                    View All
                  </Button>
                </Alert>
              )}

              {alertCount === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    All clear! No critical alerts.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lists Row */}
      <Grid container spacing={3}>
        {/* Stalled Opportunities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Stalled Opportunities" 
              subheader="No activity in 7+ days"
              action={
                <Button size="small" onClick={() => navigate('/sales/opportunities?filter=stalled')}>
                  View All
                </Button>
              }
            />
            <Divider />
            {stalledOpportunities.length === 0 ? (
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No stalled opportunities. Great job!
                </Typography>
              </CardContent>
            ) : (
              <List>
                {stalledOpportunities.map((opp) => (
                  <ListItem 
                    key={opp.id}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/sales/opportunities/${opp.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.light' }}>
                        <WarningAmberIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={opp.name}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="caption" component="span">
                            {formatCurrency(opp.amount)}
                          </Typography>
                          <Chip 
                            label={STAGE_LABELS[opp.stage] || opp.stage} 
                            size="small" 
                            sx={{ height: 18 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Card>
        </Grid>

        {/* Hot Leads */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Hot Leads" 
              subheader="High-scoring leads ready for conversion"
              action={
                <Button size="small" onClick={() => navigate('/sales/leads?sort=score')}>
                  View All
                </Button>
              }
            />
            <Divider />
            {hotLeads.length === 0 ? (
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No high-scoring leads at the moment.
                </Typography>
              </CardContent>
            ) : (
              <List>
                {hotLeads.map((lead) => (
                  <ListItem 
                    key={lead.id}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/sales/leads/${lead.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.light' }}>
                        <TrendingUpIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${lead.first_name} ${lead.last_name}`}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="caption" component="span">
                            {lead.company_name}
                          </Typography>
                          <Chip 
                            label={`Score: ${lead.lead_score}`} 
                            size="small" 
                            color="success"
                            sx={{ height: 18 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesManagerDashboard;
