/**
 * Material-UI Theme Type Extensions
 * Extends the default Material-UI theme types to include custom properties
 */

import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    error: Palette['primary'] & {
      lighter?: string;
    };
    warning: Palette['primary'] & {
      lighter?: string;
    };
  }

  interface PaletteOptions {
    error?: PaletteOptions['primary'] & {
      lighter?: string;
    };
    warning?: PaletteOptions['primary'] & {
      lighter?: string;
    };
  }
}

