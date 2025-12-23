import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

export interface StatCardProps {
  /**
   * The title/label
   */
  title: string;
  /**
   * The main value
   */
  value: string | number;
  /**
   * Icon to display
   */
  icon: React.ReactNode;
  /**
   * Background color for icon
   */
  iconColor?: string;
  /**
   * Background color for icon container
   */
  iconBgColor?: string;
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
}

/**
 * StatCard - Simple stat display card with icon
 *
 * @example
 * <StatCard
 *   title="Total Customers"
 *   value="1,234"
 *   icon={<PeopleIcon />}
 *   iconColor="primary.main"
 * />
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = 'primary.main',
  iconBgColor = 'primary.light',
  subtitle,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                textTransform: 'uppercase',
                fontWeight: 500,
                letterSpacing: 0.5,
                display: 'block',
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 600,
                mb: subtitle ? 0.5 : 0,
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: iconBgColor,
              color: iconColor,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;

