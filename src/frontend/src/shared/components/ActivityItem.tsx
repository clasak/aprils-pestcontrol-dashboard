import { Box, Typography, Avatar, Chip } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

export interface ActivityItemProps {
  /**
   * Activity title
   */
  title: string;
  /**
   * Activity description
   */
  description?: string;
  /**
   * Timestamp
   */
  timestamp: Date;
  /**
   * User who performed the activity
   */
  user?: {
    name: string;
    avatar?: string;
  };
  /**
   * Activity type/status
   */
  type?: 'success' | 'warning' | 'error' | 'info';
  /**
   * Optional icon
   */
  icon?: React.ReactNode;
}

/**
 * ActivityItem - Displays a single activity/event item
 */
export const ActivityItem: React.FC<ActivityItemProps> = ({
  title,
  description,
  timestamp,
  user,
  type = 'info',
  icon,
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default:
        return 'info.main';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      {/* Avatar or Icon */}
      <Avatar
        src={user?.avatar}
        sx={{
          width: 40,
          height: 40,
          bgcolor: icon ? getTypeColor() : 'grey.300',
        }}
      >
        {icon || (user?.name ? user.name.charAt(0).toUpperCase() : '?')}
      </Avatar>

      {/* Content */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 0.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
              ml: 2,
            }}
          >
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </Typography>
        </Box>
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {description}
          </Typography>
        )}
        {user && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            by {user.name}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ActivityItem;

