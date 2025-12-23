# Component Library Specifications

## Overview

This document provides detailed specifications for reusable UI components in the pest control CRM platform. All components are built with Material-UI and follow the design system guidelines.

**Related Documentation:**
- `/docs/DESIGN_SYSTEM.md` - Design system foundation
- `/docs/UI_PATTERNS.md` - Layout and UI patterns
- `/src/frontend/src/shared/theme/theme.ts` - MUI theme configuration

---

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Core Components](#core-components)
3. [Form Components](#form-components)
4. [Data Display Components](#data-display-components)
5. [Dashboard Widgets](#dashboard-widgets)
6. [Feedback Components](#feedback-components)
7. [Navigation Components](#navigation-components)
8. [Custom Components](#custom-components)

---

## Component Architecture

### File Structure

```
src/frontend/src/shared/components/
├── core/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Card/
│   └── ...
├── forms/
│   ├── TextField/
│   ├── Select/
│   └── ...
├── data-display/
│   ├── DataTable/
│   ├── KPICard/
│   └── ...
├── feedback/
│   ├── Alert/
│   ├── Toast/
│   └── ...
├── navigation/
│   ├── AppBar/
│   ├── Sidebar/
│   └── ...
└── index.ts (barrel export)
```

### Component Template

```tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

export interface MyComponentProps {
  /**
   * The title to display
   */
  title: string;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Callback when component is clicked
   */
  onClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * MyComponent - Brief description
 *
 * @example
 * <MyComponent title="Hello" description="World" />
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  description,
  onClick,
  className,
}) => {
  return (
    <Box className={className} onClick={onClick}>
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default MyComponent;
```

---

## Core Components

### 1. Button Component

Extended Material-UI Button with consistent styling and variants.

```tsx
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { ReactNode } from 'react';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  /**
   * Button variant
   * - primary: Main CTAs (contained, primary color)
   * - secondary: Secondary actions (outlined)
   * - tertiary: Tertiary actions (text only)
   * - danger: Destructive actions (contained, error color)
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Icon to display before text
   */
  startIcon?: ReactNode;
  /**
   * Icon to display after text
   */
  endIcon?: ReactNode;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Full width button
   */
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  children,
  disabled,
  ...props
}) => {
  const muiVariant = variant === 'primary' || variant === 'danger'
    ? 'contained'
    : variant === 'secondary'
    ? 'outlined'
    : 'text';

  const color = variant === 'danger' ? 'error' : 'primary';

  return (
    <MuiButton
      variant={muiVariant}
      color={color}
      size={size}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </MuiButton>
  );
};
```

**Usage:**
```tsx
<Button variant="primary" startIcon={<AddIcon />}>
  Create Lead
</Button>

<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

<Button variant="danger" startIcon={<DeleteIcon />}>
  Delete
</Button>
```

### 2. Card Component

Wrapper for Material-UI Card with consistent styling.

```tsx
import { Card as MuiCard, CardProps as MuiCardProps } from '@mui/material';

export interface CardProps extends MuiCardProps {
  /**
   * Hover effect (adds elevation on hover)
   */
  hoverable?: boolean;
  /**
   * Clickable card (adds cursor pointer)
   */
  clickable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  clickable = false,
  children,
  sx,
  ...props
}) => {
  return (
    <MuiCard
      sx={{
        ...(hoverable && {
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: 4,
          },
        }),
        ...(clickable && {
          cursor: 'pointer',
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiCard>
  );
};
```

---

## Form Components

### 1. TextField Component

Enhanced text input with validation and helper text.

```tsx
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'variant'> {
  /**
   * Field name for form handling
   */
  name: string;
  /**
   * Field label
   */
  label: string;
  /**
   * Error message to display
   */
  errorMessage?: string;
  /**
   * Helper text below input
   */
  helperText?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  name,
  label,
  errorMessage,
  helperText,
  error,
  ...props
}) => {
  return (
    <MuiTextField
      name={name}
      label={label}
      variant="outlined"
      fullWidth
      error={!!errorMessage || error}
      helperText={errorMessage || helperText}
      {...props}
    />
  );
};
```

**Usage:**
```tsx
<TextField
  name="email"
  label="Email Address"
  type="email"
  required
  errorMessage={errors.email}
  helperText="We'll never share your email"
/>
```

### 2. Select Component

Custom select dropdown with consistent styling.

```tsx
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
} from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  name: string;
  label: string;
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
  errorMessage,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
}) => {
  return (
    <FormControl fullWidth={fullWidth} error={error} required={required} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <MuiSelect
        name={name}
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {(errorMessage || helperText) && (
        <FormHelperText>{errorMessage || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
```

**Usage:**
```tsx
<Select
  name="serviceType"
  label="Service Type"
  value={serviceType}
  onChange={setServiceType}
  options={[
    { value: 'termite', label: 'Termite Inspection' },
    { value: 'rodent', label: 'Rodent Control' },
    { value: 'general', label: 'General Pest Control' },
  ]}
  required
/>
```

### 3. DatePicker Component

Date selection with calendar popup.

```tsx
import { TextField } from '@mui/material';
import { formatDate } from '@/utils/date';

export interface DatePickerProps {
  name: string;
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  name,
  label,
  value,
  onChange,
  minDate,
  maxDate,
  error,
  errorMessage,
  required = false,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value ? new Date(e.target.value) : null;
    onChange(dateValue);
  };

  return (
    <TextField
      name={name}
      label={label}
      type="date"
      value={value ? formatDate(value, 'yyyy-MM-dd') : ''}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      inputProps={{
        min: minDate ? formatDate(minDate, 'yyyy-MM-dd') : undefined,
        max: maxDate ? formatDate(maxDate, 'yyyy-MM-dd') : undefined,
      }}
      error={error}
      helperText={errorMessage}
      required={required}
      disabled={disabled}
      fullWidth
    />
  );
};
```

### 4. SearchInput Component

Search input with icon and clear button.

```tsx
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useState } from 'react';

export interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
}) => {
  const [value, setValue] = useState('');

  // Debounce implementation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Simple debounce (use lodash.debounce in production)
    setTimeout(() => {
      onSearch(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <TextField
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};
```

---

## Data Display Components

### 1. DataTable Component

Reusable data table with sorting, pagination, and actions.

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  IconButton,
  Paper,
} from '@mui/material';
import { useState } from 'react';

export interface Column<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string | React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  actions?: (row: T) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  selectable = false,
  onSelectionChange,
  actions,
  loading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof T | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<T[]>([]);

  const handleSort = (columnId: keyof T) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(data);
      onSelectionChange?.(data);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectOne = (row: T) => {
    const selectedIndex = selected.findIndex((item) => item.id === row.id);
    let newSelected: T[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, row];
    } else {
      newSelected = selected.filter((item) => item.id !== row.id);
    }

    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const isSelected = (row: T) => selected.some((item) => item.id === row.id);

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow
                hover
                key={row.id}
                onClick={() => onRowClick?.(row)}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(row)}
                      onChange={() => handleSelectOne(row)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={String(column.id)} align={column.align}>
                    {column.format
                      ? column.format(row[column.id])
                      : String(row[column.id])}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
}
```

**Usage:**
```tsx
const columns: Column<Lead>[] = [
  { id: 'name', label: 'Customer', minWidth: 170 },
  { id: 'phone', label: 'Phone', minWidth: 130 },
  { id: 'service', label: 'Service', minWidth: 150 },
  {
    id: 'value',
    label: 'Value',
    minWidth: 100,
    align: 'right',
    format: (value) => `$${value.toLocaleString()}`,
  },
  {
    id: 'status',
    label: 'Status',
    format: (value) => <Chip label={value} size="small" />,
  },
];

<DataTable
  columns={columns}
  data={leads}
  selectable
  onSelectionChange={setSelectedLeads}
  onRowClick={handleViewLead}
  actions={(row) => (
    <>
      <IconButton size="small" onClick={() => handleEdit(row)}>
        <EditIcon />
      </IconButton>
      <IconButton size="small" onClick={() => handleDelete(row)}>
        <DeleteIcon />
      </IconButton>
    </>
  )}
/>
```

### 2. StatusChip Component

Color-coded chip for status display.

```tsx
import { Chip, ChipProps } from '@mui/material';

export type Status =
  | 'active'
  | 'pending'
  | 'inactive'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: Status;
}

const statusColors: Record<Status, ChipProps['color']> = {
  active: 'success',
  pending: 'warning',
  inactive: 'error',
  scheduled: 'info',
  completed: 'success',
  cancelled: 'default',
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, ...props }) => {
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={statusColors[status]}
      size="small"
      {...props}
    />
  );
};
```

---

## Dashboard Widgets

### 1. KPICard Component

Key performance indicator card with value, trend, and sparkline.

```tsx
import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
  sparklineData?: number[];
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  prefix = '',
  suffix = '',
  sparklineData,
  loading = false,
}) => {
  const trendColor = trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary';
  const TrendIcon = trend === 'up' ? TrendingUpIcon : TrendingDownIcon;

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={40} />
          <Skeleton variant="text" width="30%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Title */}
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          {title}
        </Typography>

        {/* Value */}
        <Typography variant="h3" component="div" sx={{ my: 1 }}>
          {prefix}{value}{suffix}
        </Typography>

        {/* Trend Indicator */}
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend !== 'neutral' && <TrendIcon sx={{ fontSize: 20, color: trendColor }} />}
            <Typography variant="body2" sx={{ color: trendColor }}>
              {change > 0 ? '+' : ''}{change}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs last month
            </Typography>
          </Box>
        )}

        {/* Optional Sparkline */}
        {sparklineData && (
          <Box sx={{ mt: 2, height: 40 }}>
            {/* Implement sparkline chart here using Recharts */}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
```

**Usage:**
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    <KPICard
      title="Monthly Recurring Revenue"
      value="127,450"
      prefix="$"
      change={12.5}
      trend="up"
    />
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <KPICard
      title="Active Customers"
      value={1234}
      change={5.2}
      trend="up"
    />
  </Grid>
</Grid>
```

### 2. ChartCard Component

Card wrapper for charts with title and controls.

```tsx
import { Card, CardHeader, CardContent, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: Array<{ label: string; onClick: () => void }>;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  actions,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Card>
      <CardHeader
        title={title}
        subheader={subtitle}
        action={
          actions && (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                {actions.map((action) => (
                  <MenuItem
                    key={action.label}
                    onClick={() => {
                      action.onClick();
                      setAnchorEl(null);
                    }}
                  >
                    {action.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )
        }
      />
      <CardContent>{children}</CardContent>
    </Card>
  );
};
```

---

## Feedback Components

### 1. Toast Component

Notification toast for success/error messages.

```tsx
import { Snackbar, Alert, AlertColor } from '@mui/material';

export interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity = 'info',
  duration = 6000,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};
```

**Usage:**
```tsx
const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

<Toast
  open={toast.open}
  message={toast.message}
  severity={toast.severity}
  onClose={() => setToast({ ...toast, open: false })}
/>

// Show toast
setToast({ open: true, message: 'Lead created successfully!', severity: 'success' });
```

### 2. ConfirmDialog Component

Confirmation dialog for destructive actions.

```tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { Button } from '../core/Button';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="secondary" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### 3. LoadingOverlay Component

Full-screen loading overlay.

```tsx
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

export interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = 'Loading...',
}) => {
  return (
    <Backdrop
      open={open}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.modal + 1,
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <CircularProgress color="inherit" />
      <Typography variant="h6">{message}</Typography>
    </Backdrop>
  );
};
```

---

## Navigation Components

### 1. Sidebar Component

Left sidebar navigation.

```tsx
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
}

export interface SidebarProps {
  items: NavItem[];
  width?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, width = 240 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      setExpandedItems((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (item: NavItem) => {
    return location.pathname === item.path;
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);

    return (
      <div key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            selected={isActive(item)}
            onClick={() => handleItemClick(item)}
            sx={{ pl: 2 + depth * 2 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </div>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          top: 64,
        },
      }}
    >
      <List>{items.map((item) => renderNavItem(item))}</List>
    </Drawer>
  );
};
```

---

## Custom Components

### 1. EmptyState Component

Display for empty data states.

```tsx
import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import { Button } from '../core/Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <InboxIcon />,
  title,
  description,
  action,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        textAlign: 'center',
        p: 4,
      }}
    >
      <Box sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}>{icon}</Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
};
```

### 2. PageHeader Component

Reusable page header with breadcrumbs and actions.

```tsx
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export interface Breadcrumb {
  label: string;
  path?: string;
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs,
  actions,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1 }}>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary">
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={index}
                underline="hover"
                color="inherit"
                onClick={() => crumb.path && navigate(crumb.path)}
                sx={{ cursor: crumb.path ? 'pointer' : 'default' }}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" component="h1">
          {title}
        </Typography>
        {actions && <Box sx={{ display: 'flex', gap: 2 }}>{actions}</Box>}
      </Box>
    </Box>
  );
};
```

**Usage:**
```tsx
<PageHeader
  title="Sales Leads"
  breadcrumbs={[
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Sales', path: '/sales' },
    { label: 'Leads' },
  ]}
  actions={
    <>
      <Button variant="secondary" startIcon={<FilterListIcon />}>
        Filter
      </Button>
      <Button variant="primary" startIcon={<AddIcon />}>
        New Lead
      </Button>
    </>
  }
/>
```

---

## Best Practices

### Component Development

1. **TypeScript First:** Always define prop interfaces
2. **Props Validation:** Use TypeScript for type safety
3. **Default Props:** Provide sensible defaults
4. **Documentation:** Add JSDoc comments for props
5. **Examples:** Include usage examples in comments
6. **Accessibility:** ARIA labels, keyboard navigation
7. **Testing:** Unit tests for all components

### Performance

1. **Memoization:** Use React.memo for expensive components
2. **Callbacks:** Use useCallback for function props
3. **Lazy Loading:** Code split large components
4. **Virtualization:** For long lists (react-window)
5. **Debouncing:** For search/filter inputs

### Styling

1. **Use Theme:** Always use theme values (colors, spacing)
2. **sx Prop:** Prefer sx over inline styles
3. **Responsive:** Use breakpoint utilities
4. **Consistency:** Follow design system guidelines

### Accessibility

1. **Semantic HTML:** Use proper HTML elements
2. **ARIA:** Add ARIA attributes where needed
3. **Keyboard:** Support keyboard navigation
4. **Focus:** Visible focus indicators
5. **Labels:** Proper form labels

---

**Version:** 1.0.0
**Last Updated:** 2025-12-22
**Maintained By:** UX Designer, Frontend Developer
