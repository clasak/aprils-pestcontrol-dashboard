import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';

export interface ChartCardAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export interface ChartCardProps {
  /**
   * Card title
   */
  title: string;
  /**
   * Optional subtitle
   */
  subtitle?: string;
  /**
   * Chart content
   */
  children: React.ReactNode;
  /**
   * Optional actions in dropdown menu
   */
  actions?: ChartCardAction[];
  /**
   * Optional custom action buttons
   */
  headerAction?: React.ReactNode;
  /**
   * Card height
   */
  height?: number | string;
}

/**
 * ChartCard - Wrapper component for charts with title and optional actions
 *
 * @example
 * <ChartCard
 *   title="Revenue Trend"
 *   subtitle="Last 12 months"
 *   actions={[
 *     { label: 'Export', onClick: handleExport },
 *     { label: 'View Details', onClick: handleViewDetails }
 *   ]}
 * >
 *   <LineChart data={data} />
 * </ChartCard>
 */
export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  headerAction,
  height,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: ChartCardAction) => {
    action.onClick();
    handleMenuClose();
  };

  return (
    <Card
      sx={{
        height: height || '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={title}
        subheader={subtitle}
        titleTypographyProps={{
          variant: 'h6',
          fontWeight: 600,
        }}
        subheaderTypographyProps={{
          variant: 'caption',
        }}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {headerAction}
            {actions && actions.length > 0 && (
              <>
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  aria-label="chart options"
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {actions.map((action, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleActionClick(action)}
                    >
                      {action.icon && (
                        <Box sx={{ mr: 1, display: 'flex' }}>{action.icon}</Box>
                      )}
                      {action.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>
        }
        sx={{
          pb: 1,
        }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          pt: 0,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;

