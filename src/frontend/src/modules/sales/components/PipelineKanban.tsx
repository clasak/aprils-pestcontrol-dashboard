import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as WonIcon,
  Cancel as LostIcon,
  DragIndicator as DragIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  BugReport as PestIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { dealsApi, Deal } from '../services/deals.api';

interface StageColumn {
  id: string;
  name: string;
  color: string;
  deals: Deal[];
  totalValue: number;
  count: number;
}

const STAGE_CONFIG = [
  { id: 'lead', name: 'Lead', color: '#9e9e9e' },
  { id: 'inspection_scheduled', name: 'Inspection Scheduled', color: '#2196f3' },
  { id: 'inspection_completed', name: 'Inspection Completed', color: '#03a9f4' },
  { id: 'quote_sent', name: 'Quote Sent', color: '#00bcd4' },
  { id: 'negotiation', name: 'Negotiation', color: '#009688' },
  { id: 'verbal_commitment', name: 'Verbal Commitment', color: '#4caf50' },
  { id: 'contract_sent', name: 'Contract Sent', color: '#8bc34a' },
  { id: 'closed_won', name: 'Closed Won', color: '#4caf50' },
  { id: 'closed_lost', name: 'Closed Lost', color: '#f44336' },
];

// Get next stage for quick actions
const getNextStage = (currentStage: string): string | null => {
  const stageOrder = STAGE_CONFIG.map(s => s.id);
  const currentIndex = stageOrder.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex >= stageOrder.length - 2) return null;
  return stageOrder[currentIndex + 1];
};

export const PipelineKanban: React.FC = () => {
  const [pipeline, setPipeline] = useState<Record<string, Deal[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [wonDialogOpen, setWonDialogOpen] = useState(false);
  const [wonReason, setWonReason] = useState('');
  
  // Drag and drop state
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealsApi.getPipelineView();
      setPipeline(response.data.pipeline);
      setSummary(response.data.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', deal.id);
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedDeal(null);
    setDragOverStage(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggedDeal || draggedDeal.stage === targetStage) {
      setDraggedDeal(null);
      return;
    }

    // Don't allow moving to closed stages via drag (use menu instead)
    if (targetStage === 'closed_won' || targetStage === 'closed_lost') {
      setSnackbarMessage('Use the menu to mark deals as won or lost');
      setDraggedDeal(null);
      return;
    }

    // Optimistic update
    const oldStage = draggedDeal.stage;
    setPipeline(prev => {
      const newPipeline = { ...prev };
      // Remove from old stage
      newPipeline[oldStage] = (newPipeline[oldStage] || []).filter(d => d.id !== draggedDeal.id);
      // Add to new stage
      newPipeline[targetStage] = [...(newPipeline[targetStage] || []), { ...draggedDeal, stage: targetStage as Deal['stage'] }];
      return newPipeline;
    });

    setIsUpdating(true);
    try {
      await dealsApi.moveToStage(draggedDeal.id, targetStage);
      setSnackbarMessage(`Deal moved to ${STAGE_CONFIG.find(s => s.id === targetStage)?.name}`);
      // Refresh to get updated data
      await fetchPipeline();
    } catch (err: any) {
      // Revert on error
      setError(err.message || 'Failed to move deal');
      await fetchPipeline();
    } finally {
      setIsUpdating(false);
      setDraggedDeal(null);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, deal: Deal) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedDeal(deal);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMoveToStage = async (stage: string) => {
    if (selectedDeal) {
      setIsUpdating(true);
      try {
        await dealsApi.moveToStage(selectedDeal.id, stage);
        setSnackbarMessage(`Deal moved to ${STAGE_CONFIG.find(s => s.id === stage)?.name}`);
        await fetchPipeline();
      } catch (err: any) {
        setError(err.message || 'Failed to move deal');
      } finally {
        setIsUpdating(false);
      }
    }
    handleMenuClose();
    setSelectedDeal(null);
  };

  const handleQuickAdvance = async (e: React.MouseEvent, deal: Deal) => {
    e.stopPropagation();
    const nextStage = getNextStage(deal.stage);
    if (nextStage) {
      setIsUpdating(true);
      try {
        await dealsApi.moveToStage(deal.id, nextStage);
        setSnackbarMessage(`Deal advanced to ${STAGE_CONFIG.find(s => s.id === nextStage)?.name}`);
        await fetchPipeline();
      } catch (err: any) {
        setError(err.message || 'Failed to advance deal');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleMarkAsWon = async () => {
    if (selectedDeal) {
      setIsUpdating(true);
      try {
        await dealsApi.markAsWon(selectedDeal.id, wonReason || undefined);
        setWonDialogOpen(false);
        setWonReason('');
        setSnackbarMessage('Deal marked as won! 🎉');
        await fetchPipeline();
      } catch (err: any) {
        setError(err.message || 'Failed to mark deal as won');
      } finally {
        setIsUpdating(false);
      }
    }
    handleMenuClose();
    setSelectedDeal(null);
  };

  const handleMarkAsLost = async () => {
    if (selectedDeal && lostReason) {
      setIsUpdating(true);
      try {
        await dealsApi.markAsLost(selectedDeal.id, lostReason);
        setLostDialogOpen(false);
        setLostReason('');
        setSnackbarMessage('Deal marked as lost');
        await fetchPipeline();
      } catch (err: any) {
        setError(err.message || 'Failed to mark deal as lost');
      } finally {
        setIsUpdating(false);
      }
    }
    handleMenuClose();
    setSelectedDeal(null);
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStageColumns = (): StageColumn[] => {
    return STAGE_CONFIG.map((stage) => ({
      id: stage.id,
      name: stage.name,
      color: stage.color,
      deals: pipeline[stage.id] || [],
      totalValue: summary?.stageValues?.[stage.id] || 0,
      count: summary?.stageCounts?.[stage.id] || 0,
    }));
  };

  const getPropertyIcon = (propertyType?: string) => {
    if (!propertyType) return <HomeIcon fontSize="small" />;
    if (['office', 'retail', 'restaurant', 'warehouse'].includes(propertyType)) {
      return <BusinessIcon fontSize="small" />;
    }
    return <HomeIcon fontSize="small" />;
  };

  if (loading && Object.keys(pipeline).length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Updating Progress */}
      {isUpdating && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />
      )}

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Sales Pipeline
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag and drop deals between stages to update their status
        </Typography>
        {summary && (
          <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total Deals
              </Typography>
              <Typography variant="h6">{summary.totalDeals}</Typography>
            </Paper>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Pipeline Value
              </Typography>
              <Typography variant="h6" color="primary.main">
                {formatCurrency(summary.totalValue)}
              </Typography>
            </Paper>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Weighted Value
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(summary.totalWeightedValue)}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Kanban Board */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          minHeight: '70vh',
        }}
      >
        {getStageColumns().map((column) => (
          <Paper
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            sx={{
              minWidth: 300,
              maxWidth: 300,
              backgroundColor: dragOverStage === column.id ? 'action.hover' : 'background.default',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background-color 0.2s ease',
              border: dragOverStage === column.id ? '2px dashed' : '2px solid transparent',
              borderColor: dragOverStage === column.id ? column.color : 'transparent',
            }}
          >
            {/* Column Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: `3px solid ${column.color}`,
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {column.name}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Chip 
                  label={`${column.count} deals`} 
                  size="small" 
                  variant="outlined"
                />
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {formatCurrency(column.totalValue)}
                </Typography>
              </Box>
            </Box>

            {/* Deals */}
            <Box sx={{ p: 1, overflowY: 'auto', flexGrow: 1 }}>
              {column.deals.length === 0 ? (
                <Box
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2">
                    Drop deals here
                  </Typography>
                </Box>
              ) : (
                column.deals.map((deal) => {
                  const nextStage = getNextStage(deal.stage);
                  return (
                    <Card
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                      onDragEnd={handleDragEnd}
                      sx={{
                        mb: 1.5,
                        cursor: 'grab',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)',
                        },
                        '&:active': {
                          cursor: 'grabbing',
                        },
                        transition: 'all 0.2s ease',
                        opacity: draggedDeal?.id === deal.id ? 0.5 : 1,
                      }}
                    >
                      <CardContent sx={{ pb: '12px !important' }}>
                        {/* Header with drag handle and menu */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          <DragIcon 
                            fontSize="small" 
                            sx={{ color: 'text.disabled', mr: 0.5, mt: 0.5, cursor: 'grab' }} 
                          />
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography 
                              variant="body2" 
                              fontWeight="bold" 
                              noWrap
                              sx={{ pr: 1 }}
                            >
                              {deal.title}
                            </Typography>
                            {deal.serviceType && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PestIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {deal.serviceType}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, deal)}
                            sx={{ ml: 'auto' }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Contact Info */}
                        {deal.contact && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {deal.contact.firstName} {deal.contact.lastName}
                            </Typography>
                            {deal.propertyType && (
                              <Tooltip title={deal.propertyType}>
                                {getPropertyIcon(deal.propertyType)}
                              </Tooltip>
                            )}
                          </Box>
                        )}

                        {/* Deal Value */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1 }}>
                            <MoneyIcon sx={{ fontSize: 18, color: 'success.main' }} />
                            <Typography variant="body2" fontWeight="bold" color="success.dark">
                              {formatCurrency(deal.dealValueCents)}
                            </Typography>
                          </Box>
                          <Chip 
                            label={`${deal.winProbability}%`}
                            size="small"
                            color={deal.winProbability >= 70 ? 'success' : deal.winProbability >= 40 ? 'warning' : 'default'}
                            sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                          />
                        </Box>

                        {/* Dates */}
                        {deal.expectedCloseDate && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Expected: {formatDate(deal.expectedCloseDate)}
                            </Typography>
                          </Box>
                        )}

                        {/* Tags */}
                        {deal.tags && deal.tags.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                            {deal.tags.slice(0, 2).map((tag) => (
                              <Chip 
                                key={tag} 
                                label={tag} 
                                size="small" 
                                variant="outlined"
                                sx={{ height: 18, '& .MuiChip-label': { px: 0.5, fontSize: '0.65rem' } }}
                              />
                            ))}
                            {deal.tags.length > 2 && (
                              <Chip 
                                label={`+${deal.tags.length - 2}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ height: 18, '& .MuiChip-label': { px: 0.5, fontSize: '0.65rem' } }}
                              />
                            )}
                          </Box>
                        )}

                        {/* Quick Advance Button */}
                        {nextStage && !['closed_won', 'closed_lost'].includes(deal.stage) && (
                          <Button
                            size="small"
                            variant="text"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                            onClick={(e) => handleQuickAdvance(e, deal)}
                            sx={{ 
                              mt: 0.5, 
                              p: 0, 
                              minWidth: 0,
                              fontSize: '0.7rem',
                              textTransform: 'none',
                              color: 'text.secondary',
                              '&:hover': { color: 'primary.main' }
                            }}
                          >
                            Advance to {STAGE_CONFIG.find(s => s.id === nextStage)?.name}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedDeal && !['closed_won', 'closed_lost'].includes(selectedDeal.stage) && (
          <>
            <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold', fontSize: '0.75rem' }}>
              Move to Stage
            </MenuItem>
            {STAGE_CONFIG.filter(s => !['closed_won', 'closed_lost'].includes(s.id) && s.id !== selectedDeal?.stage).map(stage => (
              <MenuItem key={stage.id} onClick={() => handleMoveToStage(stage.id)}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: stage.color, mr: 1 }} />
                {stage.name}
              </MenuItem>
            ))}
            <MenuItem divider />
          </>
        )}
        <MenuItem onClick={() => { setWonDialogOpen(true); }}>
          <WonIcon fontSize="small" sx={{ mr: 1 }} color="success" />
          Mark as Won
        </MenuItem>
        <MenuItem onClick={() => { setLostDialogOpen(true); }}>
          <LostIcon fontSize="small" sx={{ mr: 1 }} color="error" />
          Mark as Lost
        </MenuItem>
      </Menu>

      {/* Won Dialog */}
      <Dialog open={wonDialogOpen} onClose={() => setWonDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WonIcon color="success" />
            Mark Deal as Won
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Congratulations! Please provide a reason for winning this deal (optional).
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Win Reason (optional)"
            fullWidth
            multiline
            rows={3}
            value={wonReason}
            onChange={(e) => setWonReason(e.target.value)}
            placeholder="e.g., Best price, quality service, quick response..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWonDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMarkAsWon} variant="contained" color="success">
            Mark as Won
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lost Dialog */}
      <Dialog open={lostDialogOpen} onClose={() => setLostDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LostIcon color="error" />
            Mark Deal as Lost
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for losing this deal.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Lost Reason *"
            fullWidth
            multiline
            rows={3}
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            required
            placeholder="e.g., Price too high, chose competitor, no response..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLostDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleMarkAsLost}
            variant="contained"
            color="error"
            disabled={!lostReason}
          >
            Mark as Lost
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default PipelineKanban;
