import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Chip,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  LinearProgress,
  alpha,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Description as DocumentIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  AttachFile as AttachIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { mockCertifications, mockMetrics } from '../data/mockComplianceData';
import type { Certification, CertificationType, ComplianceStatus } from '../types/compliance.types';

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

// Get type label
const getTypeLabel = (type: CertificationType): string => {
  switch (type) {
    case 'license':
      return 'License';
    case 'certification':
      return 'Certification';
    case 'insurance':
      return 'Insurance';
    case 'permit':
      return 'Permit';
    default:
      return type;
  }
};

// Type badge color
const getTypeColor = (type: CertificationType): string => {
  switch (type) {
    case 'license':
      return '#1976d2';
    case 'certification':
      return '#9c27b0';
    case 'insurance':
      return '#2e7d32';
    case 'permit':
      return '#ed6c02';
    default:
      return '#757575';
  }
};

// Stats Card
interface StatsCardProps {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, color, icon }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        borderTop: 3,
        borderTopColor: color,
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: alpha(color, 0.1),
            color: color,
            width: 48,
            height: 48,
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Certification Detail Dialog
interface CertDetailDialogProps {
  open: boolean;
  certification: Certification | null;
  onClose: () => void;
}

const CertDetailDialog: React.FC<CertDetailDialogProps> = ({ open, certification, onClose }) => {
  const theme = useTheme();
  
  if (!certification) return null;

  const daysUntil = getDaysUntil(certification.expirationDate);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: getTypeColor(certification.type),
              width: 48,
              height: 48,
            }}
          >
            <DocumentIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">{certification.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {certification.licenseNumber}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body1">
              <Chip
                label={getTypeLabel(certification.type)}
                size="small"
                sx={{
                  bgcolor: alpha(getTypeColor(certification.type), 0.1),
                  color: getTypeColor(certification.type),
                }}
              />
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
            <Typography variant="body1">
              <Chip
                icon={getStatusIcon(certification.status)}
                label={certification.status}
                size="small"
                color={getStatusColor(certification.status)}
                sx={{ textTransform: 'capitalize' }}
              />
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Issuer
            </Typography>
            <Typography variant="body1">{certification.issuer}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Holder
            </Typography>
            <Typography variant="body1">
              {certification.employeeName || 'Company-wide'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Issue Date
            </Typography>
            <Typography variant="body1">{formatDate(certification.issuedDate)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Expiration Date
            </Typography>
            <Typography variant="body1">
              {formatDate(certification.expirationDate)}
              <Typography
                component="span"
                variant="caption"
                sx={{
                  ml: 1,
                  color: daysUntil <= 30 ? 'error.main' : daysUntil <= 90 ? 'warning.main' : 'success.main',
                }}
              >
                ({daysUntil <= 0 ? 'Expired' : `${daysUntil} days`})
              </Typography>
            </Typography>
          </Grid>
          {certification.renewalCost && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Renewal Cost
              </Typography>
              <Typography variant="body1">
                ${certification.renewalCost.toLocaleString()}
              </Typography>
            </Grid>
          )}
          {certification.notes && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body1">{certification.notes}</Typography>
            </Grid>
          )}
        </Grid>

        {/* Expiration Progress */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Time Until Expiration
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, (daysUntil / 365) * 100))}
              color={daysUntil <= 30 ? 'error' : daysUntil <= 90 ? 'warning' : 'success'}
              sx={{ flex: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
              {daysUntil <= 0 ? 'Expired' : `${daysUntil} days`}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="outlined" startIcon={<EditIcon />}>
          Edit
        </Button>
        <Button variant="contained" startIcon={<RefreshIcon />}>
          Renew
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
const CertificationsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CertificationType | 'all'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCert, setMenuCert] = useState<Certification | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Filter certifications
  const filteredCerts = useMemo(() => {
    return mockCertifications.filter((cert) => {
      const matchesSearch =
        cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cert.employeeName && cert.employeeName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
      const matchesType = typeFilter === 'all' || cert.type === typeFilter;

      // Tab filtering
      let matchesTab = true;
      if (tabValue === 1) {
        // Expiring soon (within 90 days)
        const days = getDaysUntil(cert.expirationDate);
        matchesTab = days > 0 && days <= 90;
      } else if (tabValue === 2) {
        // Expired
        matchesTab = cert.status === 'expired';
      }

      return matchesSearch && matchesStatus && matchesType && matchesTab;
    });
  }, [searchQuery, statusFilter, typeFilter, tabValue]);

  // Pagination
  const paginatedCerts = filteredCerts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Stats
  const stats = {
    total: mockCertifications.length,
    compliant: mockCertifications.filter((c) => c.status === 'compliant').length,
    expiringSoon: mockCertifications.filter((c) => {
      const days = getDaysUntil(c.expirationDate);
      return days > 0 && days <= 90;
    }).length,
    expired: mockCertifications.filter((c) => c.status === 'expired').length,
  };

  // Handlers
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, cert: Certification) => {
    setAnchorEl(event.currentTarget);
    setMenuCert(cert);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCert(null);
  };

  const handleViewDetails = (cert: Certification) => {
    setSelectedCert(cert);
    setDetailDialogOpen(true);
    handleMenuClose();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Certifications & Licenses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all certifications, licenses, permits, and insurance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export to CSV">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Certification
          </Button>
        </Box>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Total Certifications"
            value={stats.total}
            color={theme.palette.primary.main}
            icon={<DocumentIcon />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Compliant"
            value={stats.compliant}
            color={theme.palette.success.main}
            icon={<CheckIcon />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Expiring Soon"
            value={stats.expiringSoon}
            color={theme.palette.warning.main}
            icon={<WarningIcon />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Expired"
            value={stats.expired}
            color={theme.palette.error.main}
            icon={<ErrorIcon />}
          />
        </Grid>
      </Grid>

      {/* Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(_, v) => {
              setTabValue(v);
              setPage(0);
            }}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`All (${mockCertifications.length})`} />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Expiring Soon
                  <Chip label={stats.expiringSoon} size="small" color="warning" sx={{ height: 20 }} />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Expired
                  <Chip label={stats.expired} size="small" color="error" sx={{ height: 20 }} />
                </Box>
              }
            />
          </Tabs>

          {/* Search and Filters */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, license number, or holder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as ComplianceStatus | 'all')}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="compliant">Compliant</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e: SelectChangeEvent) => setTypeFilter(e.target.value as CertificationType | 'all')}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="license">License</MenuItem>
                  <MenuItem value="certification">Certification</MenuItem>
                  <MenuItem value="insurance">Insurance</MenuItem>
                  <MenuItem value="permit">Permit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setTabValue(0);
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Certification</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Holder</TableCell>
                <TableCell>Issuer</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Expiration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        No certifications found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters or add a new certification
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCerts.map((cert) => {
                  const daysUntil = getDaysUntil(cert.expirationDate);
                  
                  return (
                    <TableRow
                      key={cert.id}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        cursor: 'pointer',
                      }}
                      onClick={() => handleViewDetails(cert)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: alpha(getTypeColor(cert.type), 0.1),
                              color: getTypeColor(cert.type),
                              fontSize: '0.875rem',
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
                        <Chip
                          label={getTypeLabel(cert.type)}
                          size="small"
                          sx={{
                            bgcolor: alpha(getTypeColor(cert.type), 0.1),
                            color: getTypeColor(cert.type),
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {cert.employeeName ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body2">{cert.employeeName}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Company-wide
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{cert.issuer}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(cert.issuedDate)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{formatDate(cert.expirationDate)}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                daysUntil <= 0
                                  ? 'error.main'
                                  : daysUntil <= 30
                                  ? 'error.main'
                                  : daysUntil <= 90
                                  ? 'warning.main'
                                  : 'text.secondary',
                            }}
                          >
                            {daysUntil <= 0 ? 'Expired' : `${daysUntil} days remaining`}
                          </Typography>
                        </Box>
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
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, cert);
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredCerts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuCert && handleViewDetails(menuCert)}>
          <OpenIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
          Renew
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <AttachIcon fontSize="small" sx={{ mr: 1 }} />
          Attachments
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <CertDetailDialog
        open={detailDialogOpen}
        certification={selectedCert}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedCert(null);
        }}
      />
    </Container>
  );
};

export default CertificationsPage;
