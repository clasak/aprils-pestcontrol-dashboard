import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import { LoadingSpinner, ConfirmDialog } from '@shared/components';
import { Lead, leadsApi } from '../services/leads.api';
import { LeadForm } from '../components';

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4caf50';
  if (score >= 60) return '#8bc34a';
  if (score >= 40) return '#ff9800';
  if (score >= 20) return '#ff5722';
  return '#f44336';
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Hot';
  if (score >= 60) return 'Warm';
  if (score >= 40) return 'Neutral';
  if (score >= 20) return 'Cold';
  return 'Very Cold';
};

const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' | 'default' => {
  const colors: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
    urgent: 'error',
    high: 'error',
    medium: 'warning',
    low: 'info',
  };
  return colors[priority] || 'default';
};

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  const colors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    new: 'info',
    contacted: 'warning',
    qualified: 'success',
    unqualified: 'default',
    nurturing: 'info',
    converted: 'success',
    lost: 'error',
  };
  return colors[status] || 'default';
};

const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showQualifyDialog, setShowQualifyDialog] = useState(false);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadLead = async () => {
      if (!id) {
        setError('Lead ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await leadsApi.getById(id);
        setLead(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load lead');
      } finally {
        setLoading(false);
      }
    };

    loadLead();
  }, [id]);

  const handleEditSuccess = (updatedLead: Lead) => {
    setLead(updatedLead);
    setShowEditForm(false);
  };

  const handleDelete = async () => {
    if (!lead) return;

    setActionLoading(true);
    try {
      await leadsApi.delete(lead.id);
      navigate('/sales/leads');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete lead');
    } finally {
      setActionLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleQualify = async () => {
    if (!lead) return;

    setActionLoading(true);
    try {
      await leadsApi.qualify(lead.id, true);
      const response = await leadsApi.getById(lead.id);
      setLead(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to qualify lead');
    } finally {
      setActionLoading(false);
      setShowQualifyDialog(false);
    }
  };

  const handleMarkLost = async () => {
    if (!lead) return;

    setActionLoading(true);
    try {
      await leadsApi.markAsLost(lead.id, 'Marked as lost');
      const response = await leadsApi.getById(lead.id);
      setLead(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark lead as lost');
    } finally {
      setActionLoading(false);
      setShowLostDialog(false);
    }
  };

  const handleConvertToDeal = () => {
    if (!lead) return;
    // Navigate to deal creation with lead context
    navigate(`/sales/pipeline/new?leadId=${lead.id}&contactId=${lead.contactId}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading lead..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/sales/leads')}>
          Back to Leads
        </Button>
      </Box>
    );
  }

  if (!lead) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Lead not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/sales/leads')} sx={{ mt: 2 }}>
          Back to Leads
        </Button>
      </Box>
    );
  }

  const contactName = lead.contact
    ? `${lead.contact.firstName} ${lead.contact.lastName}`
    : 'Unknown';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <IconButton onClick={() => navigate('/sales/leads')}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h5" fontWeight={600}>
            {lead.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lead from {contactName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {lead.status !== 'converted' && lead.status !== 'lost' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<SwapHorizIcon />}
                onClick={handleConvertToDeal}
              >
                Convert to Deal
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => setShowQualifyDialog(true)}
              >
                Qualify
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setShowLostDialog(true)}
              >
                Mark Lost
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setShowEditForm(true)}
          >
            Edit
          </Button>
          <IconButton color="error" onClick={() => setShowDeleteDialog(true)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Lead Score Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="overline" color="text.secondary">
              Lead Score
            </Typography>
            <Box sx={{ my: 2 }}>
              <Typography
                variant="h2"
                fontWeight={700}
                sx={{ color: getScoreColor(lead.leadScore) }}
              >
                {lead.leadScore}
              </Typography>
              <Chip
                label={getScoreLabel(lead.leadScore)}
                sx={{
                  bgcolor: getScoreColor(lead.leadScore),
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={lead.leadScore}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getScoreColor(lead.leadScore),
                  borderRadius: 5,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Based on {Object.keys(lead.scoreFactors || {}).length} scoring factors
            </Typography>
          </Paper>

          {/* Status & Priority */}
          <Paper sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box>
                  <Chip
                    label={lead.status.replace('_', ' ')}
                    color={getStatusColor(lead.status)}
                    size="small"
                  />
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  Priority
                </Typography>
                <Box>
                  <Chip
                    label={lead.priority}
                    color={getPriorityColor(lead.priority)}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Contact Info */}
            <Typography variant="subtitle2" gutterBottom>
              Contact Information
            </Typography>
            <List dense>
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PersonIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={contactName}
                  secondary="Contact"
                />
              </ListItem>
              {lead.contact?.email && (
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <EmailIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={lead.contact.email}
                    secondary="Email"
                  />
                </ListItem>
              )}
              {lead.contact?.phone && (
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PhoneIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={lead.contact.phone}
                    secondary="Phone"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Lead Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lead Source
                    </Typography>
                    <Typography variant="body1">
                      {lead.leadSource} ({lead.leadSourceCategory})
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Service Type
                    </Typography>
                    <Typography variant="body1">
                      {lead.serviceType || 'Not specified'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estimated Value
                    </Typography>
                    <Typography variant="body1">
                      {lead.estimatedValueCents
                        ? `$${(lead.estimatedValueCents / 100).toLocaleString()}`
                        : 'Not specified'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Contact Attempts
                    </Typography>
                    <Typography variant="body1">
                      {lead.contactAttempts} attempts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {lead.pestTypes && lead.pestTypes.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Pest Types
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {lead.pestTypes.map((pest) => (
                          <Chip key={pest} label={pest} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {lead.nextFollowUpDate && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ bgcolor: 'warning.50' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Next Follow-up
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon color="warning" />
                        <Typography variant="body1">
                          {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {lead.description && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1">{lead.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {lead.notes && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {lead.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Form */}
      <LeadForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleEditSuccess}
        lead={lead}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Lead"
        message={`Are you sure you want to delete "${lead.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Qualify Dialog */}
      <ConfirmDialog
        open={showQualifyDialog}
        title="Qualify Lead"
        message={`Mark "${lead.title}" as qualified? This indicates the lead meets your qualification criteria.`}
        confirmText="Qualify"
        confirmColor="success"
        loading={actionLoading}
        onConfirm={handleQualify}
        onCancel={() => setShowQualifyDialog(false)}
      />

      {/* Mark Lost Dialog */}
      <ConfirmDialog
        open={showLostDialog}
        title="Mark Lead as Lost"
        message={`Mark "${lead.title}" as lost? You can add a reason in the lead details.`}
        confirmText="Mark Lost"
        confirmColor="error"
        loading={actionLoading}
        onConfirm={handleMarkLost}
        onCancel={() => setShowLostDialog(false)}
      />
    </Box>
  );
};

export default LeadDetailPage;

