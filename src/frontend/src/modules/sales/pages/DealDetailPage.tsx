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
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import { LoadingSpinner, ConfirmDialog } from '@shared/components';
import { Deal, dealsApi } from '../services/deals.api';
import { DealForm } from '../components';

const DEAL_STAGES = [
  { value: 'lead', label: 'Lead', probability: 10 },
  { value: 'inspection_scheduled', label: 'Inspection Scheduled', probability: 20 },
  { value: 'inspection_completed', label: 'Inspection Completed', probability: 40 },
  { value: 'quote_sent', label: 'Quote Sent', probability: 60 },
  { value: 'negotiation', label: 'Negotiation', probability: 70 },
  { value: 'verbal_commitment', label: 'Verbal Commitment', probability: 80 },
  { value: 'contract_sent', label: 'Contract Sent', probability: 90 },
  { value: 'closed_won', label: 'Closed Won', probability: 100 },
  { value: 'closed_lost', label: 'Closed Lost', probability: 0 },
];

const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

const getStageIndex = (stage: string): number => {
  return DEAL_STAGES.findIndex((s) => s.value === stage);
};

const DealDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWonDialog, setShowWonDialog] = useState(false);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadDeal = async () => {
      if (!id) {
        setError('Deal ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await dealsApi.getById(id);
        setDeal(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load deal');
      } finally {
        setLoading(false);
      }
    };

    loadDeal();
  }, [id]);

  const handleEditSuccess = (updatedDeal: Deal) => {
    setDeal(updatedDeal);
    setShowEditForm(false);
  };

  const handleDelete = async () => {
    if (!deal) return;

    setActionLoading(true);
    try {
      await dealsApi.delete(deal.id);
      navigate('/sales/pipeline');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete deal');
    } finally {
      setActionLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleMarkWon = async () => {
    if (!deal) return;

    setActionLoading(true);
    try {
      await dealsApi.markAsWon(deal.id);
      const response = await dealsApi.getById(deal.id);
      setDeal(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark deal as won');
    } finally {
      setActionLoading(false);
      setShowWonDialog(false);
    }
  };

  const handleMarkLost = async () => {
    if (!deal) return;

    setActionLoading(true);
    try {
      await dealsApi.markAsLost(deal.id, 'Marked as lost');
      const response = await dealsApi.getById(deal.id);
      setDeal(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark deal as lost');
    } finally {
      setActionLoading(false);
      setShowLostDialog(false);
    }
  };

  const handleMoveStage = async (newStage: string) => {
    if (!deal) return;

    try {
      await dealsApi.moveToStage(deal.id, newStage);
      const response = await dealsApi.getById(deal.id);
      setDeal(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to move deal');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading deal..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/sales/pipeline')}>
          Back to Pipeline
        </Button>
      </Box>
    );
  }

  if (!deal) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Deal not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/sales/pipeline')} sx={{ mt: 2 }}>
          Back to Pipeline
        </Button>
      </Box>
    );
  }

  const contactName = deal.contact
    ? `${deal.contact.firstName} ${deal.contact.lastName}`
    : 'Unknown';

  const currentStageIndex = getStageIndex(deal.stage);
  const activeStages = DEAL_STAGES.filter((s) => !['closed_won', 'closed_lost'].includes(s.value));
  const serviceAddress = [
    deal.serviceAddressLine1,
    deal.serviceCity,
    deal.serviceState,
    deal.servicePostalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const isClosed = deal.stage === 'closed_won' || deal.stage === 'closed_lost';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <IconButton onClick={() => navigate('/sales/pipeline')}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h5" fontWeight={600}>
            {deal.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {contactName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {!isClosed && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => setShowWonDialog(true)}
              >
                Mark Won
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

      {/* Deal Stage Stepper */}
      {!isClosed && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Deal Pipeline Stage
          </Typography>
          <Stepper
            activeStep={Math.min(currentStageIndex, activeStages.length - 1)}
            alternativeLabel
            sx={{ mt: 2 }}
          >
            {activeStages.map((stage, index) => (
              <Step
                key={stage.value}
                completed={index < currentStageIndex}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleMoveStage(stage.value)}
              >
                <StepLabel>
                  <Typography variant="caption">{stage.label}</Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {stage.probability}%
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* Closed Status Banner */}
      {isClosed && (
        <Alert
          severity={deal.stage === 'closed_won' ? 'success' : 'error'}
          sx={{ mb: 3 }}
          icon={deal.stage === 'closed_won' ? <CheckCircleIcon /> : <CancelIcon />}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Deal {deal.stage === 'closed_won' ? 'Won' : 'Lost'}
          </Typography>
          {deal.actualCloseDate && (
            <Typography variant="body2">
              Closed on {new Date(deal.actualCloseDate).toLocaleDateString()}
            </Typography>
          )}
          {deal.wonReason && (
            <Typography variant="body2">Reason: {deal.wonReason}</Typography>
          )}
          {deal.lostReason && (
            <Typography variant="body2">Reason: {deal.lostReason}</Typography>
          )}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Value & Contact */}
        <Grid item xs={12} md={4}>
          {/* Deal Value Card */}
          <Paper sx={{ p: 3, textAlign: 'center', mb: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Deal Value
            </Typography>
            <Typography variant="h3" color="primary" fontWeight={700}>
              {formatCurrency(deal.dealValueCents)}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Win Probability
                  </Typography>
                  <Typography variant="h6">{deal.winProbability}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Weighted Value
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(deal.weightedValueCents)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            {deal.recurringRevenueCents && deal.recurringRevenueCents > 0 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Recurring Revenue
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(deal.recurringRevenueCents)}/{deal.serviceFrequency}
                </Typography>
                {deal.lifetimeValueCents && (
                  <Typography variant="caption" color="text.secondary">
                    Lifetime: {formatCurrency(deal.lifetimeValueCents)}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>

          {/* Contact Info */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Customer
            </Typography>
            <List dense>
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PersonIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={contactName}
                  secondary={
                    <Button
                      size="small"
                      onClick={() => navigate(`/sales/contacts/${deal.contactId}`)}
                    >
                      View Contact
                    </Button>
                  }
                />
              </ListItem>
              {deal.contact?.email && (
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <EmailIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText primary={deal.contact.email} />
                </ListItem>
              )}
              {deal.contact?.phone && (
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PhoneIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText primary={deal.contact.phone} />
                </ListItem>
              )}
            </List>

            {serviceAddress && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Service Address
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2">{serviceAddress}</Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Deal Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Service Type
                    </Typography>
                    <Typography variant="body1">
                      {deal.serviceType || 'Not specified'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Service Frequency
                    </Typography>
                    <Typography variant="body1">
                      {deal.serviceFrequency?.replace('_', ' ') || 'One Time'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expected Close Date
                    </Typography>
                    <Typography variant="body1">
                      {deal.expectedCloseDate
                        ? new Date(deal.expectedCloseDate).toLocaleDateString()
                        : 'Not set'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Days in Pipeline
                    </Typography>
                    <Typography variant="body1">
                      {deal.daysInPipeline} days
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {deal.pestTypes && deal.pestTypes.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Pest Types
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {deal.pestTypes.map((pest) => (
                          <Chip key={pest} label={pest} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {deal.currentProvider && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Current Provider
                      </Typography>
                      <Typography variant="body1">{deal.currentProvider}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {deal.competitiveAdvantage && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Competitive Advantage
                      </Typography>
                      <Typography variant="body1">{deal.competitiveAdvantage}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {deal.notes && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {deal.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

            {/* Stage History */}
            {deal.stageHistory && deal.stageHistory.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Stage History
                </Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {deal.stageHistory.map((entry, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        py: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Chip
                        label={entry.stage.replace('_', ' ')}
                        size="small"
                        color={
                          entry.stage === 'closed_won'
                            ? 'success'
                            : entry.stage === 'closed_lost'
                            ? 'error'
                            : 'default'
                        }
                      />
                      <Typography variant="body2">
                        {new Date(entry.enteredAt).toLocaleDateString()}
                      </Typography>
                      {entry.durationDays !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          ({entry.durationDays} days)
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Form */}
      <DealForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleEditSuccess}
        deal={deal}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Deal"
        message={`Are you sure you want to delete "${deal.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Mark Won Dialog */}
      <ConfirmDialog
        open={showWonDialog}
        title="Mark Deal as Won"
        message={`Congratulations! Mark "${deal.title}" as won for ${formatCurrency(deal.dealValueCents)}?`}
        confirmText="Mark Won"
        confirmColor="success"
        loading={actionLoading}
        onConfirm={handleMarkWon}
        onCancel={() => setShowWonDialog(false)}
      />

      {/* Mark Lost Dialog */}
      <ConfirmDialog
        open={showLostDialog}
        title="Mark Deal as Lost"
        message={`Mark "${deal.title}" as lost?`}
        confirmText="Mark Lost"
        confirmColor="error"
        loading={actionLoading}
        onConfirm={handleMarkLost}
        onCancel={() => setShowLostDialog(false)}
      />
    </Box>
  );
};

export default DealDetailPage;

