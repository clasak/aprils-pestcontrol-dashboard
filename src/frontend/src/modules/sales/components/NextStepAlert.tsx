/**
 * Next Step Alert Component
 * 
 * Displays warnings when an opportunity has no next step or when the next step is overdue.
 * Critical for pipeline hygiene and sales management best practices.
 */

import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddTaskIcon from '@mui/icons-material/AddTask';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { format, isPast, isToday, addDays } from 'date-fns';
import { opportunitiesService } from '../../../services/opportunities.service';
import type { Opportunity } from '../../../lib/database.types';

interface NextStepAlertProps {
  opportunity: Opportunity;
  onUpdate?: () => void;
}

type AlertStatus = 'none' | 'warning' | 'error';

export const NextStepAlert: React.FC<NextStepAlertProps> = ({ opportunity, onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nextStep, setNextStep] = useState(opportunity.next_step || '');
  const [nextStepDate, setNextStepDate] = useState(
    opportunity.next_step_date || format(addDays(new Date(), 3), 'yyyy-MM-dd')
  );
  const [loading, setLoading] = useState(false);

  // Determine alert status
  const getAlertStatus = (): AlertStatus => {
    // Closed opportunities don't need next steps
    if (opportunity.status !== 'open') return 'none';

    // No next step at all
    if (!opportunity.next_step || !opportunity.next_step.trim()) return 'error';

    // No next step date
    if (!opportunity.next_step_date) return 'warning';

    // Next step date is in the past
    if (isPast(new Date(opportunity.next_step_date))) return 'error';

    return 'none';
  };

  const alertStatus = getAlertStatus();

  const handleUpdate = async () => {
    if (!nextStep.trim() || !nextStepDate) return;

    setLoading(true);
    try {
      await opportunitiesService.updateNextStep(opportunity.id, nextStep.trim(), nextStepDate);
      setDialogOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update next step:', error);
    } finally {
      setLoading(false);
    }
  };

  if (alertStatus === 'none') return null;

  return (
    <>
      <Alert
        severity={alertStatus === 'error' ? 'error' : 'warning'}
        icon={alertStatus === 'error' ? <ErrorOutlineIcon /> : <WarningAmberIcon />}
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<AddTaskIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Set Next Step
          </Button>
        }
        sx={{ mb: 2 }}
      >
        <AlertTitle>
          {alertStatus === 'error' ? 'Missing Next Step' : 'Next Step Warning'}
        </AlertTitle>
        {!opportunity.next_step ? (
          <>
            This opportunity has no next step defined. 
            <strong> Every opportunity needs a clear next action to keep deals moving.</strong>
          </>
        ) : isPast(new Date(opportunity.next_step_date!)) ? (
          <>
            The next step "{opportunity.next_step}" was due on{' '}
            <strong>{format(new Date(opportunity.next_step_date!), 'MMM d, yyyy')}</strong>.
            Please update it or mark it complete.
          </>
        ) : (
          <>
            Next step date is not set. Please add a due date.
          </>
        )}
      </Alert>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Set Next Step
          <Typography variant="body2" color="text.secondary">
            {opportunity.name}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="What's the next action?"
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                placeholder="e.g., Follow up on quote, Schedule site visit, Send proposal"
                helperText="Be specific about what needs to happen next"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="When should this happen?"
                type="date"
                value={nextStepDate}
                onChange={(e) => setNextStepDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Set a realistic deadline"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
                  Quick set:
                </Typography>
                <Chip
                  label="Tomorrow"
                  size="small"
                  onClick={() => setNextStepDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'))}
                />
                <Chip
                  label="In 3 days"
                  size="small"
                  onClick={() => setNextStepDate(format(addDays(new Date(), 3), 'yyyy-MM-dd'))}
                />
                <Chip
                  label="In 1 week"
                  size="small"
                  onClick={() => setNextStepDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'))}
                />
                <Chip
                  label="In 2 weeks"
                  size="small"
                  onClick={() => setNextStepDate(format(addDays(new Date(), 14), 'yyyy-MM-dd'))}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={loading || !nextStep.trim() || !nextStepDate}
          >
            {loading ? 'Saving...' : 'Save Next Step'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/**
 * Compact version for list views
 */
export const NextStepIndicator: React.FC<{ opportunity: Opportunity }> = ({ opportunity }) => {
  // Don't show for closed opportunities
  if (opportunity.status !== 'open') return null;

  const hasNextStep = opportunity.next_step && opportunity.next_step.trim();
  const hasNextStepDate = opportunity.next_step_date;
  const isOverdue = hasNextStepDate && isPast(new Date(opportunity.next_step_date!));
  const isDueToday = hasNextStepDate && isToday(new Date(opportunity.next_step_date!));

  if (!hasNextStep) {
    return (
      <Chip
        icon={<ErrorOutlineIcon />}
        label="No Next Step"
        size="small"
        color="error"
        variant="outlined"
      />
    );
  }

  if (isOverdue) {
    return (
      <Chip
        icon={<ScheduleIcon />}
        label={`Overdue: ${opportunity.next_step}`}
        size="small"
        color="error"
        variant="outlined"
        sx={{ maxWidth: 200 }}
      />
    );
  }

  if (isDueToday) {
    return (
      <Chip
        icon={<ScheduleIcon />}
        label={`Due Today: ${opportunity.next_step}`}
        size="small"
        color="warning"
        variant="outlined"
        sx={{ maxWidth: 200 }}
      />
    );
  }

  return (
    <Chip
      icon={<ScheduleIcon />}
      label={opportunity.next_step}
      size="small"
      color="default"
      variant="outlined"
      sx={{ maxWidth: 200 }}
    />
  );
};

export default NextStepAlert;

