/**
 * Material-UI Theme Configuration
 * April's Pest Control CRM Platform
 *
 * This theme provides consistent styling across all 10 department modules.
 * Based on Material Design principles with pest control industry branding.
 * Supports both light and dark mode.
 *
 * @see /docs/DESIGN_SYSTEM.md for full design system documentation
 */

import { createTheme, ThemeOptions, PaletteMode, Theme } from '@mui/material/styles';

// Breakpoint values (Material-UI defaults)
const breakpoints = {
  values: {
    xs: 0,      // Mobile portrait
    sm: 600,    // Mobile landscape, tablets
    md: 960,    // Tablets, small laptops
    lg: 1280,   // Laptops, desktops
    xl: 1920,   // Large desktops
  },
};

// Spacing function: theme.spacing(n) returns n * 8px
const spacing = 8;

/**
 * Get palette configuration based on mode
 */
const getPalette = (mode: PaletteMode) => ({
  mode,

  primary: {
    main: '#1976d2',      // Material Blue 700
    light: '#42a5f5',     // Material Blue 400
    dark: '#1565c0',      // Material Blue 800
    contrastText: '#ffffff',
  },

  secondary: {
    main: '#4caf50',      // Material Green 500
    light: '#81c784',     // Material Green 300
    dark: '#388e3c',      // Material Green 700
    contrastText: '#ffffff',
  },

  success: {
    main: '#4caf50',      // Green 500
    light: '#81c784',     // Green 300
    dark: '#388e3c',      // Green 700
    contrastText: '#ffffff',
  },

  warning: {
    main: '#ff9800',      // Orange 500
    light: '#ffb74d',     // Orange 300
    dark: '#f57c00',      // Orange 700
    contrastText: '#000000',
    lighter: mode === 'light' ? '#fff3e0' : '#3d2e00',   // Orange 50 or dark variant
  },

  error: {
    main: '#f44336',      // Red 500
    light: '#e57373',     // Red 300
    dark: '#d32f2f',      // Red 700
    contrastText: '#ffffff',
    lighter: mode === 'light' ? '#ffebee' : '#3d0000',   // Red 50 or dark variant
  },

  info: {
    main: '#2196f3',      // Blue 500
    light: '#64b5f6',     // Blue 300
    dark: '#1976d2',      // Blue 700
    contrastText: '#ffffff',
  },

  // Neutral grayscale palette
  grey: {
    50: mode === 'light' ? '#fafafa' : '#121212',
    100: mode === 'light' ? '#f5f5f5' : '#1e1e1e',
    200: mode === 'light' ? '#eeeeee' : '#2c2c2c',
    300: mode === 'light' ? '#e0e0e0' : '#3d3d3d',
    400: mode === 'light' ? '#bdbdbd' : '#5c5c5c',
    500: mode === 'light' ? '#9e9e9e' : '#7a7a7a',
    600: mode === 'light' ? '#757575' : '#9e9e9e',
    700: mode === 'light' ? '#616161' : '#bdbdbd',
    800: mode === 'light' ? '#424242' : '#e0e0e0',
    900: mode === 'light' ? '#212121' : '#f5f5f5',
  },

  // Background colors
  background: {
    default: mode === 'light' ? '#fafafa' : '#0a0a0a',
    paper: mode === 'light' ? '#ffffff' : '#121212',
  },

  // Text colors
  text: {
    primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
    secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.60)' : 'rgba(255, 255, 255, 0.60)',
    disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.38)' : 'rgba(255, 255, 255, 0.38)',
  },

  // Divider color
  divider: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',

  // Action states
  action: {
    active: mode === 'light' ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)',
    hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
    selected: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.16)',
    disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
    disabledBackground: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
  },
});

/**
 * Typography System
 * Using Roboto font family (Material-UI default)
 */
const typography = {
  fontFamily: [
    'Roboto',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),

  // Display headings
  h1: {
    fontSize: '2.5rem',      // 40px
    fontWeight: 300,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',        // 32px
    fontWeight: 400,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',     // 28px
    fontWeight: 400,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem',      // 24px
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',     // 20px
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',        // 16px
    fontWeight: 500,
    lineHeight: 1.6,
  },

  // Body text
  body1: {
    fontSize: '1rem',        // 16px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 400,
    lineHeight: 1.43,
  },

  // Labels and UI text
  subtitle1: {
    fontSize: '1rem',        // 16px
    fontWeight: 500,
    lineHeight: 1.75,
  },
  subtitle2: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 500,
    lineHeight: 1.57,
  },
  caption: {
    fontSize: '0.75rem',     // 12px
    fontWeight: 400,
    lineHeight: 1.66,
  },
  overline: {
    fontSize: '0.75rem',     // 12px
    fontWeight: 400,
    lineHeight: 2.66,
    textTransform: 'uppercase' as const,
  },

  // Button text
  button: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: 'uppercase' as const,
  },
};

/**
 * Shape (Border Radius)
 */
const shape = {
  borderRadius: 8,  // Default border radius (8px)
};

/**
 * Get shadows based on mode
 */
const getShadows = (mode: PaletteMode) => {
  const opacity = mode === 'light' ? 0.1 : 0.5;
  return [
    'none',
    `0px 2px 4px rgba(0,0,0,${opacity})`,    // elevation 1 - Cards (default)
    `0px 4px 8px rgba(0,0,0,${opacity * 1.2})`,   // elevation 2 - Raised cards
    `0px 4px 8px rgba(0,0,0,${opacity * 1.2})`,   // elevation 3
    `0px 8px 16px rgba(0,0,0,${opacity * 1.4})`,  // elevation 4 - Dropdowns, popovers
    `0px 8px 16px rgba(0,0,0,${opacity * 1.4})`,  // elevation 5
    `0px 8px 16px rgba(0,0,0,${opacity * 1.4})`,  // elevation 6
    `0px 8px 16px rgba(0,0,0,${opacity * 1.4})`,  // elevation 7
    `0px 16px 24px rgba(0,0,0,${opacity * 1.6})`, // elevation 8 - Modals, dialogs
    `0px 16px 24px rgba(0,0,0,${opacity * 1.6})`, // elevation 9
    `0px 16px 24px rgba(0,0,0,${opacity * 1.6})`, // elevation 10
    `0px 16px 24px rgba(0,0,0,${opacity * 1.6})`, // elevation 11
    `0px 16px 24px rgba(0,0,0,${opacity * 1.6})`, // elevation 12
    `0px 16px 24px rgba(0,0,0,${opacity * 1.6})`, // elevation 13
    `0px 16px 24px rgba(0,0,0,${opacity * 1.6})`, // elevation 14
    `0px 16px 24px rgba(0,0,0,${opacity * 1.6})`, // elevation 15
    `0px 24px 32px rgba(0,0,0,${opacity * 1.8})`, // elevation 16 - Top-level overlays
    `0px 24px 32px rgba(0,0,0,${opacity * 1.8})`, // elevation 17
    `0px 24px 32px rgba(0,0,0,${opacity * 1.8})`, // elevation 18
    `0px 24px 32px rgba(0,0,0,${opacity * 1.8})`, // elevation 19
    `0px 24px 32px rgba(0,0,0,${opacity * 1.8})`, // elevation 20
    `0px 24px 32px rgba(0,0,0,${opacity * 1.8})`, // elevation 21
    `0px 24px 32px rgba(0,0,0,${opacity * 1.8})`, // elevation 22
    `0px 24px 32px rgba(0,0,0,${opacity * 1.8})`, // elevation 23
    `0px 24px 32px rgba(0,0,0,${opacity * 1.8})`, // elevation 24
  ] as Theme['shadows'];
};

/**
 * Transitions
 * Animation timing and easing functions
 */
const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },
};

/**
 * Get component overrides based on mode
 */
const getComponents = (mode: PaletteMode, shadows: Theme['shadows']) => ({
  // Button customization
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        textTransform: 'uppercase' as const,
        fontWeight: 500,
        padding: '8px 16px',
      },
      sizeLarge: {
        padding: '12px 24px',
        fontSize: '0.9375rem',
      },
      containedPrimary: {
        boxShadow: shadows[2],
        '&:hover': {
          boxShadow: shadows[4],
        },
      },
    },
    defaultProps: {
      disableElevation: false,
    },
  },

  // Card customization
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        boxShadow: shadows[1],
        backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
        '&:hover': {
          boxShadow: shadows[2],
        },
      },
    },
  },

  // Paper customization
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none', // Remove default gradient in dark mode
      },
      rounded: {
        borderRadius: 8,
      },
      elevation1: {
        boxShadow: shadows[1],
      },
      elevation4: {
        boxShadow: shadows[4],
      },
      elevation8: {
        boxShadow: shadows[8],
      },
    },
  },

  // TextField (Input) customization
  MuiTextField: {
    defaultProps: {
      variant: 'outlined' as const,
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },

  // AppBar customization
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: shadows[4],
      },
      colorPrimary: {
        backgroundColor: mode === 'light' ? '#1976d2' : '#1e1e1e',
      },
    },
  },

  // Drawer customization
  MuiDrawer: {
    styleOverrides: {
      paper: {
        boxShadow: shadows[8],
        backgroundColor: mode === 'light' ? '#ffffff' : '#121212',
      },
    },
  },

  // Table customization
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: mode === 'light' 
          ? '1px solid rgba(0, 0, 0, 0.12)' 
          : '1px solid rgba(255, 255, 255, 0.12)',
      },
      head: {
        backgroundColor: mode === 'light' ? '#f5f5f5' : '#1e1e1e',
        fontWeight: 500,
        fontSize: '0.875rem',
      },
    },
  },

  // Chip customization
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
    },
  },

  // Dialog customization
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
        boxShadow: shadows[8],
        backgroundImage: 'none',
      },
    },
  },

  // Tooltip customization
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: mode === 'light' ? '#616161' : '#424242',
        fontSize: '0.75rem',
        borderRadius: 4,
        padding: '8px 12px',
      },
      arrow: {
        color: mode === 'light' ? '#616161' : '#424242',
      },
    },
  },

  // Icon button customization
  MuiIconButton: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: mode === 'light' 
            ? 'rgba(0, 0, 0, 0.04)' 
            : 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },

  // FAB (Floating Action Button) customization
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow: shadows[6],
        '&:hover': {
          boxShadow: shadows[8],
        },
      },
    },
  },

  // Switch customization for better dark mode visibility
  MuiSwitch: {
    styleOverrides: {
      switchBase: {
        '&.Mui-checked': {
          color: '#4caf50',
          '& + .MuiSwitch-track': {
            backgroundColor: '#4caf50',
            opacity: 0.5,
          },
        },
      },
    },
  },

  // Accordion for settings
  MuiAccordion: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: 0,
        },
      },
    },
  },
});

/**
 * Z-Index Layers
 * Ensures proper stacking of components
 */
const zIndex = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

/**
 * Create the Material-UI theme for a specific mode
 */
export const createAppTheme = (mode: PaletteMode): Theme => {
  const shadows = getShadows(mode);
  
  const themeOptions: ThemeOptions = {
    palette: getPalette(mode),
    typography,
    spacing,
    breakpoints,
    shape,
    shadows,
    transitions,
    components: getComponents(mode, shadows),
    zIndex,
  };

  return createTheme(themeOptions);
};

// Default theme (light mode) for backwards compatibility
const theme = createAppTheme('light');

export default theme;

/**
 * Custom theme extensions for specific use cases
 */

// Chart color palette for data visualization
export const chartColors = {
  primary: ['#1976d2', '#42a5f5', '#1565c0'],
  multiSeries: [
    '#1976d2', // Blue
    '#4caf50', // Green
    '#ff9800', // Orange
    '#9c27b0', // Purple
    '#f44336', // Red
    '#00bcd4', // Teal
    '#ffc107', // Amber
    '#3f51b5', // Indigo
  ],
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

// Status color mapping
export const statusColors = {
  active: '#4caf50',
  pending: '#ff9800',
  inactive: '#f44336',
  scheduled: '#2196f3',
  completed: '#4caf50',
  cancelled: '#9e9e9e',
};

// Priority color mapping
export const priorityColors = {
  high: '#f44336',
  medium: '#ff9800',
  low: '#2196f3',
};

// Dashboard widget colors
export const widgetColors = {
  revenue: '#4caf50',
  expense: '#f44336',
  neutral: '#1976d2',
  forecast: '#9c27b0',
};

/**
 * Helper function to create custom border radius variants
 */
export const borderRadius = {
  none: 0,
  small: 4,
  medium: 8,
  large: 12,
  round: '50%',
};

/**
 * Helper function for responsive spacing
 */
export const getResponsiveSpacing = (theme: Theme) => ({
  mobile: {
    padding: theme.spacing(2),    // 16px
    gap: theme.spacing(2),         // 16px
  },
  tablet: {
    padding: theme.spacing(3),    // 24px
    gap: theme.spacing(3),         // 24px
  },
  desktop: {
    padding: theme.spacing(4),    // 32px
    gap: theme.spacing(3),         // 24px
  },
});

/**
 * Common layout dimensions
 */
export const layoutDimensions = {
  appBarHeight: 64,
  drawerWidth: 240,
  drawerWidthCollapsed: 64,
  bottomNavHeight: 56,
  footerHeight: 48,
};

/**
 * Common touch target sizes (mobile)
 */
export const touchTargets = {
  minimum: 48,      // Minimum touch target size (48x48px)
  comfortable: 56,  // Comfortable touch target
  large: 64,        // Large touch target
};
