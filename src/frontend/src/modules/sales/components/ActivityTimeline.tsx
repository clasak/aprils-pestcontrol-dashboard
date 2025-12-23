/**
 * Activity Timeline Component
 * 
 * Displays activities in a timeline format for any CRM entity.
 * Supports logging new activities and viewing history.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import NoteIcon from '@mui/icons-material/Note';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format, formatDistanceToNow, isToday, isPast } from 'date-fns';
import { activitiesService } from '../../../services/activities.service';
import type { Activity, ActivityType } from '../../../lib/database.types';
import { LogActivityDialog } from './LogActivityDialog';

interface ActivityTimelineProps {
  relatedToType: 'account' | 'contact' | 'lead' | 'opportunity';
  relatedToId: string;
  showAddButton?: boolean;
  maxItems?: number;
  onActivityLogged?: () => void;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  call: <PhoneIcon />,
  email: <EmailIcon />,
  meeting: <EventIcon />,
  task: <TaskAltIcon />,
  note: <NoteIcon />,
};

const activityColors: Record<ActivityType, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  call: 'primary',
  email: 'info',
  meeting: 'secondary',
  task: 'warning',
  note: 'success',
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  relatedToType,
  relatedToId,
  showAddButton = true,
  maxItems = 10,
  onActivityLogged,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityType>('call');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    loadActivities();
  }, [relatedToType, relatedToId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await activitiesService.getForEntity(relatedToType, relatedToId);
      setActivities(data.slice(0, maxItems));
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = (type: ActivityType) => {
    setSelectedType(type);
    setDialogOpen(true);
  };

  const handleActivityLogged = () => {
    loadActivities();
    onActivityLogged?.();
  };

  const handleCompleteActivity = async (activity: Activity) => {
    try {
      await activitiesService.complete(activity.id);
      loadActivities();
    } catch (error) {
      console.error('Failed to complete activity:', error);
    }
    setMenuAnchorEl(null);
  };

  const formatActivityDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, yyyy h:mm a');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {showAddButton && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PhoneIcon />}
            onClick={() => handleAddActivity('call')}
          >
            Log Call
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={() => handleAddActivity('email')}
          >
            Log Email
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EventIcon />}
            onClick={() => handleAddActivity('meeting')}
          >
            Log Meeting
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<TaskAltIcon />}
            onClick={() => handleAddActivity('task')}
          >
            Create Task
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<NoteIcon />}
            onClick={() => handleAddActivity('note')}
          >
            Add Note
          </Button>
        </Box>
      )}

      {activities.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No activities yet. Log your first activity to start tracking.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Timeline position="right" sx={{ p: 0 }}>
          {activities.map((activity, index) => {
            const isOverdue = activity.due_date && !activity.is_completed && isPast(new Date(activity.due_date));
            
            return (
              <TimelineItem key={activity.id}>
                <TimelineOppositeContent sx={{ flex: 0.2, minWidth: 100 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatActivityDate(activity.activity_date)}
                  </Typography>
                </TimelineOppositeContent>
                
                <TimelineSeparator>
                  <TimelineDot color={activityColors[activity.activity_type as ActivityType]}>
                    {activityIcons[activity.activity_type as ActivityType]}
                  </TimelineDot>
                  {index < activities.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                
                <TimelineContent>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      mb: 1,
                      borderColor: isOverdue ? 'error.main' : undefined,
                      bgcolor: isOverdue ? 'error.50' : undefined,
                    }}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2">
                              {activity.subject}
                            </Typography>
                            {activity.is_completed ? (
                              <Chip
                                icon={<CheckCircleIcon />}
                                label="Completed"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ height: 20 }}
                              />
                            ) : activity.due_date && (
                              <Chip
                                icon={<ScheduleIcon />}
                                label={isOverdue ? 'Overdue' : `Due ${formatDistanceToNow(new Date(activity.due_date), { addSuffix: true })}`}
                                size="small"
                                color={isOverdue ? 'error' : 'default'}
                                variant="outlined"
                                sx={{ height: 20 }}
                              />
                            )}
                            {activity.priority && activity.priority !== 'normal' && (
                              <Chip
                                label={activity.priority}
                                size="small"
                                color={activity.priority === 'urgent' ? 'error' : activity.priority === 'high' ? 'warning' : 'default'}
                                sx={{ height: 20, textTransform: 'capitalize' }}
                              />
                            )}
                          </Box>
                          
                          {activity.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {activity.description}
                            </Typography>
                          )}
                          
                          {activity.outcome && (
                            <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                              Outcome: {activity.outcome}
                            </Typography>
                          )}
                        </Box>
                        
                        {!activity.is_completed && activity.activity_type === 'task' && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setSelectedActivity(activity);
                              setMenuAnchorEl(e.currentTarget);
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      )}

      <LogActivityDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        relatedToType={relatedToType}
        relatedToId={relatedToId}
        defaultType={selectedType}
        onSuccess={handleActivityLogged}
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => selectedActivity && handleCompleteActivity(selectedActivity)}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark Complete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ActivityTimeline;

