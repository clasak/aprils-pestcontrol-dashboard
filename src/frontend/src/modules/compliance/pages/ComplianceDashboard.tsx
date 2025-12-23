import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Badge,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Gavel as ComplianceIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  School as TrainingIcon,
  Assignment as AuditIcon,
  Notifications as AlertIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Description as DocumentIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import {
  mockMetrics,
  mockCertifications,
  mockTrainingRecords,
  mockAudits,
  mockAlerts,
  mockEmployeeCompliance,
  mockRequirements,
} from '../data/mockComplianceData';
import type {
  ComplianceStatus,
  Certification,
  TrainingRecord,
  ComplianceAlert,
  EmployeeComplianceStatus,
  RegulatoryRequirement,
} from '../types/compliance.types';

// Helper function to get status color
const getStatusColor = (status: ComplianceStatus) => {
  switch (status) {
    case 'compliant':
      return 'success';
    case 'warning':
      return 'warning';
    case 'expired':
      return 'error';
    case 'pending':
      return 'info';
    default:
      return 'default';
  }
};

// Helper to get status icon
const getStatusIcon = (status: ComplianceStatus) => {
  switch (status) {
    case 'compliant':
      return <CheckIcon fontSize="small" />;
    case 'warning':
      return <WarningIcon fontSize="small" />;
    case 'expired':
      return <ErrorIcon fontSize="small" />;
    case 'pending':
      return <ScheduleIcon fontSize="small" />;
    default:
      return null;
  }
};

// Helper to format dates
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Helper to calculate days until expiration
const getDaysUntil = (dateStr: string) => {
  const today = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, color, trend, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend >= 0 ? (
                  <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography
                  variant="caption"
                  color={trend >= 0 ? 'success.main' : 'error.main'}
                >
                  {trend >= 0 ? '+' : ''}{trend}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette[color as 'primary' | 'success' | 'warning' | 'error' | 'info']?.main || color, 0.15),
              color: theme.palette[color as 'primary' | 'success' | 'warning' | 'error' | 'info']?.main || color,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Alert Item Component
interface AlertItemProps {
  alert: ComplianceAlert;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'expiration':
        return <ErrorIcon />;
      case 'renewal':
        return <ScheduleIcon />;
      case 'audit':
        return <AuditIcon />;
      case 'training':
        return <TrainingIcon />;
      default:
        return <AlertIcon />;
    }
  };

  return (
    <ListItem
      sx={{
        borderRadius: 1,
        mb: 1,
        bgcolor: alert.isRead ? 'transparent' : 'action.hover',
        border: 1,
        borderColor: 'divider',
      }}
      secondaryAction={
        <Chip
          label={alert.severity}
          size="small"
          color={getSeverityColor(alert.severity) as 'error' | 'warning' | 'info' | 'default'}
          sx={{ textTransform: 'capitalize' }}
        />
      }
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: alpha('#f44336', 0.1),
            color: 'error.main',
          }}
        >
          {getAlertIcon(alert.type)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="subtitle2" sx={{ fontWeight: alert.isRead ? 400 : 600 }}>
            {alert.title}
          </Typography>
        }
        secondary={
          <>
            <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block', mb: 0.5 }}>
              {alert.description}
            </Typography>
            {alert.dueDate && (
              <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                Due: {formatDate(alert.dueDate)}
              </Typography>
            )}
          </>
        }
      />
    </ListItem>
  );
};

// Certification Row Component
interface CertificationRowProps {
  cert: Certification;
}

const CertificationRow: React.FC<CertificationRowProps> = ({ cert }) => {
  const daysUntil = getDaysUntil(cert.expirationDate);
  
  return (
    <TableRow
      sx={{
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.75rem',
            }}
          >
            {cert.type === 'license' ? 'L' : cert.type === 'certification' ? 'C' : cert.type === 'insurance' ? 'I' : 'P'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{cert.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {cert.licenseNumber}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        {cert.employeeName || '—'}
      </TableCell>
      <TableCell>
        <Typography variant="body2">{formatDate(cert.expirationDate)}</Typography>
        <Typography variant="caption" color={daysUntil <= 30 ? 'error.main' : daysUntil <= 90 ? 'warning.main' : 'text.secondary'}>
          {daysUntil <= 0 ? 'Expired' : `${daysUntil} days remaining`}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          icon={getStatusIcon(cert.status)}
          label={cert.status}
          size="small"
          color={getStatusColor(cert.status)}
          sx={{ textTransform: 'capitalize' }}
        />
      </TableCell>
    </TableRow>
  );
};

// Employee Compliance Card
interface EmployeeCardProps {
  employee: EmployeeComplianceStatus;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        borderLeft: 4,
        borderLeftColor: 
          employee.status === 'compliant' ? 'success.main' :
          employee.status === 'warning' ? 'warning.main' : 'error.main',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {employee.employeeName.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {employee.employeeName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {employee.role} • {employee.department}
            </Typography>
          </Box>
          <Chip
            label={`${employee.complianceScore}%`}
            size="small"
            color={getStatusColor(employee.status)}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Licenses: {employee.activeLicenses}/{employee.requiredLicenses}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Training: {employee.completedTrainings}/{employee.requiredTrainings}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={employee.complianceScore}
            color={getStatusColor(employee.status)}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {employee.nextExpiration && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Next expiration: {formatDate(employee.nextExpiration)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component
const ComplianceDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Filter certifications expiring soon
  const expiringCerts = mockCertifications
    .filter(cert => {
      const days = getDaysUntil(cert.expirationDate);
      return days <= 90;
    })
    .sort((a, b) => getDaysUntil(a.expirationDate) - getDaysUntil(b.expirationDate));

  // Unread alerts count
  const unreadAlerts = mockAlerts.filter(a => !a.isRead).length;

  // Employees needing attention
  const employeesNeedingAttention = mockEmployeeCompliance.filter(
    emp => emp.status !== 'compliant'
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Compliance Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor certifications, training compliance, and regulatory requirements
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export report">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<ComplianceIcon />}
            onClick={() => navigate('/compliance/certifications')}
          >
            Manage Certifications
          </Button>
        </Box>
      </Box>

      {/* KPI Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Compliance Rate"
            value={`${mockMetrics.overallComplianceRate}%`}
            subtitle={`${mockMetrics.fullyCompliantEmployees}/${mockMetrics.totalEmployees} employees`}
            icon={<VerifiedIcon />}
            color="success"
            trend={2.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Active Certifications"
            value={mockMetrics.activeCertifications}
            subtitle={`${mockMetrics.expiringThisMonth} expiring this month`}
            icon={<DocumentIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Training Compliance"
            value={`${mockMetrics.trainingComplianceRate}%`}
            subtitle="Annual training completion"
            icon={<TrainingIcon />}
            color="info"
            trend={5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Pending Renewals"
            value={mockMetrics.pendingRenewals}
            subtitle={`${mockMetrics.upcomingAudits} audits scheduled`}
            icon={<ScheduleIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Secondary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          {/* Compliance Overview Card */}
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Compliance Overview
                </Typography>
                <Tabs
                  value={tabValue}
                  onChange={(_, v) => setTabValue(v)}
                  sx={{ minHeight: 36 }}
                >
                  <Tab label="Certifications" sx={{ minHeight: 36, py: 0 }} />
                  <Tab label="Training" sx={{ minHeight: 36, py: 0 }} />
                  <Tab label="Regulations" sx={{ minHeight: 36, py: 0 }} />
                </Tabs>
              </Box>

              {tabValue === 0 && (
                <Box>
                  {/* Certification Status Summary */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h4" color="success.main" fontWeight={600}>
                          {mockCertifications.filter(c => c.status === 'compliant').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Compliant
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h4" color="warning.main" fontWeight={600}>
                          {mockCertifications.filter(c => c.status === 'warning').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expiring Soon
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h4" color="error.main" fontWeight={600}>
                          {mockCertifications.filter(c => c.status === 'expired').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expired
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Expiring Certifications Table */}
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Expiring Within 90 Days
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Certification</TableCell>
                          <TableCell>Holder</TableCell>
                          <TableCell>Expires</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {expiringCerts.slice(0, 5).map((cert) => (
                          <CertificationRow key={cert.id} cert={cert} />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {expiringCerts.length > 5 && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Button
                        size="small"
                        endIcon={<ArrowIcon />}
                        onClick={() => navigate('/compliance/certifications')}
                      >
                        View All {expiringCerts.length} Expiring
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  {/* Training Status Summary */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h4" color="success.main" fontWeight={600}>
                          {mockTrainingRecords.filter(t => t.status === 'compliant').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Up to Date
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h4" color="warning.main" fontWeight={600}>
                          {mockTrainingRecords.filter(t => t.status === 'warning').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expiring Soon
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h4" color="error.main" fontWeight={600}>
                          {mockTrainingRecords.filter(t => t.status === 'expired').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overdue
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Training Records List */}
                  <List disablePadding>
                    {mockTrainingRecords.map((training) => (
                      <ListItem
                        key={training.id}
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: 'info.main',
                            }}
                          >
                            <TrainingIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={training.courseName}
                          secondary={
                            <Box>
                              <Typography variant="caption" component="span">
                                {training.employeeName} • {training.provider}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                {training.hoursCompleted}/{training.hoursRequired} hours • 
                                {training.expirationDate && ` Expires: ${formatDate(training.expirationDate)}`}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={training.status}
                          size="small"
                          color={getStatusColor(training.status)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  {/* Regulatory Requirements List */}
                  <List disablePadding>
                    {mockRequirements.map((req) => (
                      <ListItem
                        key={req.id}
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                            }}
                          >
                            <SecurityIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2">{req.regulation}</Typography>
                              <Chip label={req.category} size="small" variant="outlined" />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {req.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Authority: {req.authority} • Next Review: {formatDate(req.nextReviewDate)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          icon={getStatusIcon(req.status)}
                          label={req.status}
                          size="small"
                          color={getStatusColor(req.status)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Alerts & Notifications
                  </Typography>
                  {unreadAlerts > 0 && (
                    <Badge badgeContent={unreadAlerts} color="error" />
                  )}
                </Box>
                <Button size="small">Mark All Read</Button>
              </Box>
              <List disablePadding>
                {mockAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employee Compliance Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Employee Compliance Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employeesNeedingAttention.length > 0
                ? `${employeesNeedingAttention.length} employee(s) need attention`
                : 'All employees are compliant'}
            </Typography>
          </Box>
          <Button variant="outlined" endIcon={<PersonIcon />}>
            View All Employees
          </Button>
        </Box>
        <Grid container spacing={3}>
          {mockEmployeeCompliance.slice(0, 4).map((employee) => (
            <Grid item xs={12} sm={6} md={3} key={employee.employeeId}>
              <EmployeeCard employee={employee} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Upcoming Audits Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Upcoming Audits & Inspections
            </Typography>
            <Button size="small" endIcon={<ArrowIcon />}>
              View Calendar
            </Button>
          </Box>
          <Grid container spacing={3}>
            {mockAudits
              .filter(audit => audit.status === 'scheduled')
              .map((audit) => (
                <Grid item xs={12} sm={6} md={4} key={audit.id}>
                  <Paper
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          color: 'warning.main',
                        }}
                      >
                        <AuditIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{audit.auditType}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {audit.auditor}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(audit.scheduledDate)}
                      </Typography>
                      <Chip label={audit.status} size="small" color="warning" />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            {mockAudits.filter(a => a.status === 'scheduled').length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No upcoming audits scheduled
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ComplianceDashboard;
