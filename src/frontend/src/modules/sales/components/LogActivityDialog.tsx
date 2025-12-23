/**
 * Log Activity Dialog
 * 
 * Modal for logging new activities (calls, emails, meetings, tasks, notes).
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import NoteIcon from '@mui/icons-material/Note';
import { activitiesService } from '../../../services/activities.service';
import type { ActivityType, ActivityInsert } from '../../../lib/database.types';
import { supabase } from '../../../lib/supabase';

interface LogActivityDialogProps {
  open: boolean;
  onClose: () => void;
  relatedToType: 'account' | 'contact' | 'lead' | 'opportunity';
  relatedToId: string;
  defaultType?: ActivityType;
  onSuccess?: () => void;
}

const activityTypeConfig = {
  call: { icon: <PhoneIcon />, label: 'Call', hasOutcome: true, hasDuration: true },
  email: { icon: <EmailIcon />, label: 'Email', hasOutcome: false, hasDuration: false },
  meeting: { icon: <EventIcon />, label: 'Meeting', hasOutcome: true, hasDuration: true },
  task: { icon: <TaskAltIcon />, label: 'Task', hasOutcome: false, hasDuration: false, hasDueDate: true },
  note: { icon: <NoteIcon />, label: 'Note', hasOutcome: false, hasDuration: false },
};

export const LogActivityDialog: React.FC<LogActivityDialogProps> = ({
  open,
  onClose,
  relatedToType,
  relatedToId,
  defaultType = 'call',
  onSuccess,
}) => {
  const [activityType, setActivityType] = useState<ActivityType>(defaultType);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [outcome, setOutcome] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [isCompleted, setIsCompleted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setActivityType(defaultType);
      setSubject('');
      setDescription('');
      setOutcome('');
      setDurationMinutes('');
      setDueDate('');
      setPriority('normal');
      setIsCompleted(defaultType !== 'task');
      setError(null);
    }
  }, [open, defaultType]);

  const config = activityTypeConfig[activityType];

  const handleSubmit = async () => {
    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }

    if (activityType === 'task' && !dueDate) {
      setError('Due date is required for tasks');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user profile
      const { data: userData } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('users')
        .select('id, org_id')
        .eq('auth_user_id', userData.user?.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      const activityData: ActivityInsert = {
        org_id: profile.org_id,
        activity_type: activityType,
        subject: subject.trim(),
        description: description.trim() || undefined,
        related_to_type: relatedToType,
        related_to_id: relatedToId,
        owner_id: profile.id,
        created_by: profile.id,
        is_completed: isCompleted,
        priority,
      };

      if (config.hasOutcome && outcome.trim()) {
        activityData.outcome = outcome.trim();
      }

      if (config.hasDuration && durationMinutes) {
        activityData.duration_minutes = Number(durationMinutes);
      }

      if (config.hasDueDate && dueDate) {
        activityData.due_date = dueDate;
      }

      if (isCompleted) {
        activityData.completed_at = new Date().toISOString();
      }

      await activitiesService.create(activityData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Log Activity
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Activity Type
          </Typography>
          <ToggleButtonGroup
            value={activityType}
            exclusive
            onChange={(_, value) => value && setActivityType(value)}
            fullWidth
            size="small"
          >
            {Object.entries(activityTypeConfig).map(([type, { icon, label }]) => (
              <ToggleButton key={type} value={type}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {icon}
                  <span>{label}</span>
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder={`What was this ${activityType} about?`}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              placeholder="Add details or notes..."
            />
          </Grid>

          {config.hasOutcome && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Outcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="What was the result?"
              />
            </Grid>
          )}

          {config.hasDuration && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : '')}
                inputProps={{ min: 0 }}
              />
            </Grid>
          )}

          {config.hasDueDate && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priority}
                    label="Priority"
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {activityType !== 'task' && (
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                  />
                }
                label="Mark as completed"
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? 'Saving...' : `Log ${config.label}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogActivityDialog;

