import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';

export interface KPICardProps {
  /**
   * The title/label of the KPI
   */
  title: string;
  /**
   * The main value to display
   */
  value: string | number;
  /**
   * Percentage change from previous period
   */
  change?: number;
  /**
   * Trend direction
   */
  trend?: 'up' | 'down' | 'neutral';
  /**
   * Prefix for the value (e.g., "$")
   */
  prefix?: string;
  /**
   * Suffix for the value (e.g., "%")
   */
  suffix?: string;
  /**
   * Comparison period text
   */
  comparisonText?: string;
  /**
   * Icon to display
   */
  icon?: React.ReactNode;
  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * KPICard - Displays a key performance indicator with value, trend, and comparison
 *
 * @example
 * <KPICard
 *   title="Monthly Recurring Revenue"
 *   value="127,450"
 *   prefix="$"
 *   change={12.5}
 *   trend="up"
 * />
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  prefix = '',
  suffix = '',
  comparisonText = 'vs last month',
  icon,
  loading = false,
}) => {
  const trendColor =
    trend === 'up'
      ? 'success.main'
      : trend === 'down'
      ? 'error.main'
      : 'text.secondary';

  const TrendIcon =
    trend === 'up'
      ? TrendingUpIcon
      : trend === 'down'
      ? TrendingDownIcon
      : RemoveIcon;

  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          minHeight: 140,
        }}
      >
        <CardContent>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={48} sx={{ my: 1 }} />
          <Skeleton variant="text" width="50%" height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 140,
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        {/* Header with title and optional icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: 'uppercase',
              fontWeight: 500,
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                color: 'primary.main',
                opacity: 0.7,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        {/* Main Value */}
        <Typography
          variant="h3"
          component="div"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: 'text.primary',
          }}
        >
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix}
        </Typography>

        {/* Trend Indicator */}
        {change !== undefined && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <TrendIcon
              sx={{
                fontSize: 18,
                color: trendColor,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: trendColor,
                fontWeight: 500,
              }}
            >
              {change > 0 ? '+' : ''}
              {change}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {comparisonText}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;

