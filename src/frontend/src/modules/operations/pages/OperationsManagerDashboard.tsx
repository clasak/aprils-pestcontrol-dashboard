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
  Avatar,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon,
  Phone as PhoneIcon,
  Groups as GroupsIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as ClockIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  LocalShipping as TruckIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  operationsTeam,
  getOperationsSummary,
  generateTechnicianPerformance,
  getTodaysJobs,
  ServiceJob,
  TechnicianPerformance,
} from '../mocks/mockOperationsData';

export const OperationsManagerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReturnType<typeof getOperationsSummary> | null>(null);
  const [techPerformance, setTechPerformance] = useState<TechnicianPerformance[]>([]);
  const [todaysJobs, setTodaysJobs] = useState<ServiceJob[]>([]);

  const manager = operationsTeam.find(t => t.role === 'operations_manager');

  const fetchData = () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(getOperationsSummary());
      setTechPerformance(generateTechnicianPerformance());
      setTodaysJobs(getTodaysJobs());
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return `$${(value / 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'en_route': return 'info';
      case 'scheduled': return 'default';
      default: return 'default';
    }
  };

  const getTechnicianStatus = (techId: string) => {
    const techJobs = todaysJobs.filter(j => j.technicianId === techId);
    const inProgress = techJobs.find(j => j.status === 'in_progress');
    const enRoute = techJobs.find(j => j.status === 'en_route');
    
    if (inProgress) return { status: 'On Job', color: 'warning', job: inProgress };
    if (enRoute) return { status: 'En Route', color: 'info', job: enRoute };
    
    const completed = techJobs.filter(j => j.status === 'completed').length;
    const scheduled = techJobs.filter(j => j.status === 'scheduled').length;
    
    if (scheduled > 0) return { status: `${completed}/${techJobs.length} Complete`, color: 'default', job: null };
    if (completed === techJobs.length && completed > 0) return { status: 'All Complete', color: 'success', job: null };
    
    return { status: 'Available', color: 'default', job: null };
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Operations Manager Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {manager?.firstName}! Here's your team's status for today
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary KPIs */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                      Active Technicians
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      {summary.activeTechnicians}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      of {summary.totalTechnicians} total
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <GroupsIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                      Jobs Completed
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      {summary.jobsCompleted}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      of {summary.todaysJobsTotal} scheduled
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <CheckCircleIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                      In Progress
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      {summary.jobsInProgress}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {summary.jobsScheduled} scheduled
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <BuildIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                      Today's Revenue
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      {formatCurrency(summary.totalRevenueToday)}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {summary.avgRating} ★ avg rating
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <TrendingUpIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Today's Progress Bar */}
      {summary && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Today's Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round((summary.jobsCompleted / summary.todaysJobsTotal) * 100)}% Complete
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(summary.jobsCompleted / summary.todaysJobsTotal) * 100}
            sx={{ height: 12, borderRadius: 1, mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                <Typography variant="h5" color="success.main">{summary.jobsCompleted}</Typography>
                <Typography variant="caption" color="text.secondary">Completed</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.50', borderRadius: 1 }}>
                <Typography variant="h5" color="warning.main">{summary.jobsInProgress}</Typography>
                <Typography variant="caption" color="text.secondary">In Progress</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="h5" color="text.secondary">{summary.jobsScheduled}</Typography>
                <Typography variant="caption" color="text.secondary">Scheduled</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Technician Status - Real-time */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Technician Status
              </Typography>
              <Chip 
                icon={<GroupsIcon />} 
                label="Real-time" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            <List disablePadding>
              {operationsTeam
                .filter(t => t.role !== 'operations_manager')
                .map((tech, index) => {
                  const status = getTechnicianStatus(tech.id);
                  const techJobs = todaysJobs.filter(j => j.technicianId === tech.id);
                  const completed = techJobs.filter(j => j.status === 'completed').length;

                  return (
                    <React.Fragment key={tech.id}>
                      <ListItem sx={{ px: 1, py: 1.5 }}>
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              tech.status === 'active' ? (
                                <Box 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    bgcolor: status.color === 'warning' ? 'warning.main' : 
                                      status.color === 'info' ? 'info.main' : 
                                      status.color === 'success' ? 'success.main' : 'grey.400',
                                    borderRadius: '50%',
                                    border: '2px solid white',
                                  }} 
                                />
                              ) : null
                            }
                          >
                            <Avatar sx={{ bgcolor: tech.status === 'active' ? 'primary.main' : 'grey.400' }}>
                              {tech.firstName.charAt(0)}{tech.lastName.charAt(0)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight={500}>
                                {tech.firstName} {tech.lastName}
                              </Typography>
                              {tech.role === 'lead_technician' && (
                                <Chip label="Lead" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {tech.territory} • {completed}/{techJobs.length} jobs
                              </Typography>
                              {status.job && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Current: {status.job.customerName}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={tech.status === 'on_leave' ? 'On Leave' : status.status}
                            size="small"
                            color={tech.status === 'on_leave' ? 'error' : status.color as any}
                            sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                          />
                          <Tooltip title="Call">
                            <IconButton size="small" color="primary" href={`tel:${tech.phone}`}>
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItem>
                      {index < operationsTeam.filter(t => t.role !== 'operations_manager').length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
            </List>
          </Paper>
        </Grid>

        {/* Upcoming Jobs */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Jobs (Next 2 Hours)
            </Typography>
            <List disablePadding>
              {todaysJobs
                .filter(j => j.status === 'scheduled' || j.status === 'en_route')
                .slice(0, 6)
                .map((job, index) => {
                  const tech = operationsTeam.find(t => t.id === job.technicianId);
                  return (
                    <React.Fragment key={job.id}>
                      <ListItem sx={{ px: 1, py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: job.priority === 'high' ? 'error.light' : 'grey.200' }}>
                            <ScheduleIcon color={job.priority === 'high' ? 'error' : 'action'} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={500}>
                                {job.customerName}
                              </Typography>
                              {job.priority === 'high' && (
                                <Chip label="High Priority" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {job.scheduledTime} • {job.serviceType} • {tech?.firstName} {tech?.lastName}
                            </Typography>
                          }
                        />
                        <Chip 
                          label={job.status.replace('_', ' ')}
                          size="small"
                          color={getStatusColor(job.status) as any}
                          sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                        />
                      </ListItem>
                      {index < 5 && <Divider />}
                    </React.Fragment>
                  );
                })}
            </List>
          </Paper>
        </Grid>

        {/* Technician Performance Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Technician Performance (This Month)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track your team's productivity and quality metrics
                </Typography>
              </Box>
              {summary?.topPerformer && (
                <Chip 
                  icon={<StarIcon sx={{ color: '#FFD700 !important' }} />}
                  label={`Top Performer: ${summary.topPerformer.firstName} ${summary.topPerformer.lastName}`}
                  sx={{ 
                    bgcolor: 'rgba(255, 215, 0, 0.1)', 
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    fontWeight: 500,
                  }}
                />
              )}
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Technician</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Territory</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Jobs Done</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Avg Time</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>On-Time</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Rating</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Callback %</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {techPerformance.map((perf, index) => (
                    <TableRow 
                      key={perf.technician.id}
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        bgcolor: index === 0 ? 'rgba(255, 215, 0, 0.05)' : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar 
                            sx={{ 
                              width: 36, 
                              height: 36,
                              bgcolor: index === 0 ? '#FFD700' : 'primary.main',
                              color: index === 0 ? '#000' : '#fff',
                            }}
                          >
                            {perf.technician.firstName.charAt(0)}{perf.technician.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {perf.technician.firstName} {perf.technician.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {perf.technician.role.replace('_', ' ')}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{perf.technician.territory || '—'}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={500}>
                          {perf.jobsCompleted}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {perf.avgJobDuration} min
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small"
                          label={`${perf.onTimeRate}%`}
                          color={perf.onTimeRate >= 95 ? 'success' : perf.onTimeRate >= 85 ? 'warning' : 'error'}
                          sx={{ fontWeight: 500, minWidth: 55 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />
                          <Typography variant="body2" fontWeight={500}>
                            {perf.avgRating}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          color={perf.callbackRate <= 2 ? 'success.main' : perf.callbackRate <= 5 ? 'warning.main' : 'error.main'}
                          fontWeight={500}
                        >
                          {perf.callbackRate}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500} color="success.main">
                          {formatCurrency(perf.revenue)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Team Stats */}
        {summary && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Team Performance Summary
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="success.dark">
                      {summary.avgCompletionRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Completion Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                    <ClockIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="info.dark">
                      {summary.avgOnTimeRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg On-Time Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                    <StarIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="warning.dark">
                      {summary.avgRating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Customer Rating
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <TruckIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="primary.dark">
                      {summary.todaysJobsTotal}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Jobs Today
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default OperationsManagerDashboard;

