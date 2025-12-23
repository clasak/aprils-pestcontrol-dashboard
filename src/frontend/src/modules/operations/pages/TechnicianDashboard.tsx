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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon,
  Phone as PhoneIcon,
  Navigation as NavigationIcon,
  PlayArrow as StartIcon,
  Done as DoneIcon,
  AccessTime as ClockIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  BugReport as BugIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import {
  getCurrentTechnician,
  getTechnicianJobsForDate,
  generateTechnicianPerformance,
  ServiceJob,
  Technician,
  TechnicianPerformance,
} from '../mocks/mockOperationsData';

export const TechnicianDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [todaysJobs, setTodaysJobs] = useState<ServiceJob[]>([]);
  const [myPerformance, setMyPerformance] = useState<TechnicianPerformance | null>(null);
  const [currentJob, setCurrentJob] = useState<ServiceJob | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get current technician
        const tech = getCurrentTechnician();
        setTechnician(tech || null);

        if (tech) {
          // Get today's jobs
          const jobs = getTechnicianJobsForDate(tech.id, new Date());
          setTodaysJobs(jobs);

          // Find current job (in_progress or en_route)
          const inProgress = jobs.find(j => j.status === 'in_progress' || j.status === 'en_route');
          setCurrentJob(inProgress || null);

          // Get performance data
          const allPerformance = generateTechnicianPerformance();
          const myPerf = allPerformance.find(p => p.technician.id === tech.id);
          setMyPerformance(myPerf || null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'en_route': return 'info';
      case 'scheduled': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'in_progress': return <BuildIcon />;
      case 'en_route': return <CarIcon />;
      case 'scheduled': return <ScheduleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'error';
      case 'high': return 'warning';
      default: return 'default';
    }
  };

  const completedJobs = todaysJobs.filter(j => j.status === 'completed').length;
  const remainingJobs = todaysJobs.filter(j => !['completed', 'cancelled'].includes(j.status)).length;
  const totalJobs = todaysJobs.length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!technician) {
    return (
      <Alert severity="error">
        Unable to load technician information. Please contact your supervisor.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Avatar sx={{ width: 22, height: 22, bgcolor: 'success.main', border: '2px solid white' }}>
                <CheckCircleIcon sx={{ fontSize: 14 }} />
              </Avatar>
            }
          >
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
                fontWeight: 600,
              }}
            >
              {technician.firstName.charAt(0)}{technician.lastName.charAt(0)}
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="h4" component="h1">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {technician.firstName}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {technician.territory}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Today's Progress */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Today's Progress
          </Typography>
          <Chip 
            icon={<CheckCircleIcon />} 
            label={`${completedJobs}/${totalJobs} Jobs Complete`}
            color={completedJobs === totalJobs ? 'success' : 'default'}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0}
          sx={{ height: 12, borderRadius: 1, mb: 1 }}
          color={completedJobs === totalJobs ? 'success' : 'primary'}
        />
        <Typography variant="body2" color="text.secondary">
          {remainingJobs} jobs remaining today
        </Typography>
      </Paper>

      {/* Current Job Card */}
      {currentJob && (
        <Card 
          sx={{ 
            mb: 4, 
            border: '2px solid',
            borderColor: currentJob.status === 'in_progress' ? 'warning.main' : 'info.main',
            bgcolor: currentJob.status === 'in_progress' ? 'warning.50' : 'info.50',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Chip 
                  icon={getStatusIcon(currentJob.status)} 
                  label={currentJob.status === 'in_progress' ? 'In Progress' : 'En Route'}
                  color={currentJob.status === 'in_progress' ? 'warning' : 'info'}
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5" gutterBottom>
                  {currentJob.customerName}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {currentJob.serviceType}
                </Typography>
              </Box>
              {currentJob.priority === 'high' || currentJob.priority === 'emergency' ? (
                <Chip 
                  label={currentJob.priority.toUpperCase()} 
                  color="error" 
                  size="small"
                />
              ) : null}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocationIcon color="action" />
              <Typography variant="body2">
                {currentJob.address.line1}, {currentJob.address.city}, {currentJob.address.state} {currentJob.address.postalCode}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ClockIcon color="action" />
              <Typography variant="body2">
                Scheduled: {currentJob.scheduledTime} • Est. {currentJob.estimatedDuration} min
              </Typography>
            </Box>

            {currentJob.notes && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {currentJob.notes}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Tooltip title="Call Customer">
                <Button
                  variant="outlined"
                  startIcon={<PhoneIcon />}
                  href={`tel:${currentJob.customerPhone}`}
                >
                  Call
                </Button>
              </Tooltip>
              <Tooltip title="Get Directions">
                <Button
                  variant="outlined"
                  startIcon={<NavigationIcon />}
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${currentJob.address.line1}, ${currentJob.address.city}, ${currentJob.address.state}`
                  )}`}
                  target="_blank"
                >
                  Navigate
                </Button>
              </Tooltip>
              {currentJob.status === 'en_route' ? (
                <Button variant="contained" color="warning" startIcon={<StartIcon />}>
                  Start Job
                </Button>
              ) : (
                <Button variant="contained" color="success" startIcon={<DoneIcon />}>
                  Complete Job
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {myPerformance && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: 'success.light', mx: 'auto', mb: 1 }}>
                  <CheckCircleIcon color="success" />
                </Avatar>
                <Typography variant="h4" color="success.main">
                  {myPerformance.completionRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: 'info.light', mx: 'auto', mb: 1 }}>
                  <ClockIcon color="info" />
                </Avatar>
                <Typography variant="h4" color="info.main">
                  {myPerformance.onTimeRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  On-Time Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.light', mx: 'auto', mb: 1 }}>
                  <StarIcon color="warning" />
                </Avatar>
                <Typography variant="h4" color="warning.main">
                  {myPerformance.avgRating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Rating
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', mx: 'auto', mb: 1 }}>
                  <SpeedIcon color="primary" />
                </Avatar>
                <Typography variant="h4" color="primary.main">
                  {myPerformance.avgJobDuration}m
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Job Time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Today's Schedule */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Today's Schedule
        </Typography>
        <List disablePadding>
          {todaysJobs.map((job, index) => (
            <React.Fragment key={job.id}>
              <ListItem 
                sx={{ 
                  px: 2, 
                  py: 2,
                  borderRadius: 1,
                  bgcolor: job.id === currentJob?.id ? 'action.selected' : 'transparent',
                  opacity: job.status === 'completed' ? 0.7 : 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 48 }}>
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: job.status === 'completed' ? 'success.main' : 
                        job.status === 'in_progress' ? 'warning.main' :
                        job.status === 'en_route' ? 'info.main' : 'grey.300',
                    }}
                  >
                    {getStatusIcon(job.status)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {job.customerName}
                      </Typography>
                      {job.priority === 'high' && (
                        <Chip label="High Priority" size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {job.serviceType}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {job.scheduledTime} • {job.address.city} • Est. {job.estimatedDuration} min
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Chip 
                    label={job.status.replace('_', ' ')} 
                    size="small"
                    color={getStatusColor(job.status) as any}
                    sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                  />
                  {job.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                      <Typography variant="caption">{job.rating}/5</Typography>
                    </Box>
                  )}
                </Box>
              </ListItem>
              {index < todaysJobs.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Monthly Stats */}
      {myPerformance && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            This Month's Stats
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h4" color="primary">
                  {myPerformance.jobsCompleted}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Jobs Completed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h4" color="success.main">
                  {myPerformance.milesdriven.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Miles Driven
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h4" color="info.main">
                  {myPerformance.productsUsed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Products Used
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default TechnicianDashboard;

