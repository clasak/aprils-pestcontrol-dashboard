/**
 * Account Executive Dashboard
 * 
 * Personal dashboard for sales reps showing their pipeline,
 * tasks due, and performance metrics.
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
  ListItemSecondaryAction,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PhoneIcon from '@mui/icons-material/Phone';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';
import { opportunitiesService } from '../../../services/opportunities.service';
import { activitiesService } from '../../../services/activities.service';
import { leadsService } from '../../../services/leads.service';
import { useAuth } from '../../../contexts/AuthContext';
import { useUser } from '../../../hooks/useUser';
import type { Opportunity, Activity, Lead } from '../../../lib/database.types';

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  quote_sent: 'Quote Sent',
  negotiation: 'Negotiation',
  verbal_commitment: 'Verbal Commit',
};

interface PersonalStats {
  pipelineValue: number;
  weightedPipeline: number;
  openOpportunities: number;
  wonThisMonth: number;
  wonValueThisMonth: number;
  winRate: number;
  tasksOverdue: number;
  tasksDueToday: number;
  leadsDueFollowUp: number;
}

const AccountExecutiveDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Activity[]>([]);
  const [opportunitiesNoNextStep, setOpportunitiesNoNextStep] = useState<Opportunity[]>([]);
  const [myLeads, setMyLeads] = useState<Lead[]>([]);

  const loadDashboardData = async () => {
    if (!profile?.id) return;

    try {
      const userId = profile.id;

      // Load personal statistics
      const [oppStats, activityStats, pipeline, noNextStep, overdueTasks, dueTodayTasks] = await Promise.all([
        opportunitiesService.getStatistics(userId),
        activitiesService.getStatistics(userId),
        opportunitiesService.getPipelineSummary(userId),
        opportunitiesService.getWithoutNextStep(userId),
        activitiesService.getOverdue(userId),
        activitiesService.getDueToday(userId),
      ]);

      // Get leads requiring follow-up
      const leads = await leadsService.getRequiringFollowUp(userId);

      setStats({
        pipelineValue: oppStats.totalValue,
        weightedPipeline: oppStats.weightedValue,
        openOpportunities: oppStats.totalOpen,
        wonThisMonth: oppStats.wonThisMonth,
        wonValueThisMonth: oppStats.wonValueThisMonth,
        winRate: oppStats.winRate,
        tasksOverdue: activityStats.overdue,
        tasksDueToday: activityStats.dueToday,
        leadsDueFollowUp: leads.length,
      });

      // Format pipeline for chart
      setPipelineData(
        pipeline.map((stage) => ({
          name: STAGE_LABELS[stage.stage] || stage.stage,
          value: stage.totalValue,
          count: stage.count,
        }))
      );

      setOpportunitiesNoNextStep(noNextStep.slice(0, 5));
      setUpcomingTasks([...overdueTasks, ...dueTodayTasks].slice(0, 5));
      setMyLeads(leads.slice(0, 5));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [profile?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await activitiesService.complete(taskId);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
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
        </Grid>
      </Box>
    );
  }

  const urgentItemsCount = (stats?.tasksOverdue || 0) + opportunitiesNoNextStep.length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            My Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {user?.firstName}!
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {urgentItemsCount > 0 && (
            <Chip
              icon={<ErrorOutlineIcon />}
              label={`${urgentItemsCount} urgent items`}
              color="error"
            />
          )}
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Urgent Alerts */}
      {urgentItemsCount > 0 && (
        <Box sx={{ mb: 3 }}>
          {(stats?.tasksOverdue || 0) > 0 && (
            <Alert severity="error" sx={{ mb: 1 }}>
              <AlertTitle>Overdue Tasks</AlertTitle>
              You have {stats?.tasksOverdue} overdue tasks that need immediate attention.
            </Alert>
          )}
          {opportunitiesNoNextStep.length > 0 && (
            <Alert severity="warning">
              <AlertTitle>Missing Next Steps</AlertTitle>
              {opportunitiesNoNextStep.length} of your opportunities don't have a next step. 
              Set next steps to keep deals moving.
            </Alert>
          )}
        </Box>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                My Pipeline
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {formatCurrency(stats?.pipelineValue || 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {stats?.openOpportunities || 0} opportunities
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
                Expected value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Won This Month
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {formatCurrency(stats?.wonValueThisMonth || 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {stats?.wonThisMonth || 0} deals closed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Today's Tasks
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight={600}
                color={(stats?.tasksOverdue || 0) > 0 ? 'error.main' : 'text.primary'}
              >
                {(stats?.tasksDueToday || 0) + (stats?.tasksOverdue || 0)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(stats?.tasksOverdue || 0) > 0 && (
                  <Chip 
                    label={`${stats?.tasksOverdue} overdue`} 
                    size="small" 
                    color="error" 
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Pipeline Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="My Pipeline by Stage" />
            <CardContent sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip
                    formatter={(value: number) => [formatCurrency(value), 'Value']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#1976d2" 
                    fill="#1976d2" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tasks Due */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Tasks Due" 
              action={
                <Button size="small" onClick={() => navigate('/sales/activities')}>
                  View All
                </Button>
              }
            />
            <Divider />
            {upcomingTasks.length === 0 ? (
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  All caught up! No tasks due.
                </Typography>
              </CardContent>
            ) : (
              <List dense>
                {upcomingTasks.map((task) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                  return (
                    <ListItem key={task.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: isOverdue ? 'error.light' : 'warning.light',
                          width: 32,
                          height: 32,
                        }}>
                          {isOverdue ? <ErrorOutlineIcon fontSize="small" /> : <ScheduleIcon fontSize="small" />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.subject}
                        secondary={
                          task.due_date && (
                            <Typography 
                              variant="caption" 
                              color={isOverdue ? 'error' : 'text.secondary'}
                            >
                              {isOverdue 
                                ? `Overdue by ${formatDistanceToNow(new Date(task.due_date))}`
                                : isToday(new Date(task.due_date))
                                  ? 'Due today'
                                  : isTomorrow(new Date(task.due_date))
                                    ? 'Due tomorrow'
                                    : `Due ${format(new Date(task.due_date), 'MMM d')}`
                              }
                            </Typography>
                          )
                        }
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          noWrap: true,
                          sx: { maxWidth: 150 }
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCompleteTask(task.id)}
                          title="Mark complete"
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Card>
        </Grid>

        {/* Opportunities Without Next Step */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Need Next Steps" 
              subheader="Set a next step to keep deals moving"
              action={
                <Button 
                  size="small" 
                  onClick={() => navigate('/sales/opportunities?filter=no-next-step')}
                >
                  View All
                </Button>
              }
            />
            <Divider />
            {opportunitiesNoNextStep.length === 0 ? (
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  All opportunities have next steps. Great job!
                </Typography>
              </CardContent>
            ) : (
              <List>
                {opportunitiesNoNextStep.map((opp) => (
                  <ListItem 
                    key={opp.id}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/sales/opportunities/${opp.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.light' }}>
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

        {/* Leads Requiring Follow-up */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Leads to Follow Up" 
              subheader="Past their follow-up date"
              action={
                <Button size="small" onClick={() => navigate('/sales/leads')}>
                  View All
                </Button>
              }
            />
            <Divider />
            {myLeads.length === 0 ? (
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No leads requiring follow-up.
                </Typography>
              </CardContent>
            ) : (
              <List>
                {myLeads.map((lead) => (
                  <ListItem 
                    key={lead.id}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/sales/leads/${lead.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.light' }}>
                        <PhoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${lead.first_name} ${lead.last_name}`}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {lead.company_name}
                          {lead.next_follow_up_date && (
                            <> • Follow up was {formatDistanceToNow(new Date(lead.next_follow_up_date))} ago</>
                          )}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={`Score: ${lead.lead_score}`} 
                        size="small"
                        color={lead.lead_score >= 70 ? 'success' : lead.lead_score >= 40 ? 'warning' : 'default'}
                      />
                    </ListItemSecondaryAction>
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

export default AccountExecutiveDashboard;
