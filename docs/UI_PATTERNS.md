# UI Patterns & Layout Guidelines

## Overview

This document provides detailed UI patterns and layout specifications for the pest control CRM platform. All patterns are designed for consistency across the 10 department modules while maintaining flexibility for module-specific needs.

**Related Documentation:**
- `/docs/DESIGN_SYSTEM.md` - Complete design system specifications
- `/src/frontend/src/shared/theme/theme.ts` - Material-UI theme implementation

---

## Table of Contents

1. [Application Layout](#application-layout)
2. [Navigation Patterns](#navigation-patterns)
3. [Dashboard Layouts](#dashboard-layouts)
4. [Form Patterns](#form-patterns)
5. [Table & List Patterns](#table--list-patterns)
6. [Modal & Dialog Patterns](#modal--dialog-patterns)
7. [Mobile Patterns](#mobile-patterns)
8. [Responsive Behavior](#responsive-behavior)

---

## Application Layout

### Main Application Structure

The application uses a persistent layout with top navigation and sidebar.

```
┌─────────────────────────────────────────────────────────────┐
│ Top Navigation Bar (AppBar) - 64px height                  │
│ Logo | Module Switcher | Search | Notifications | Avatar   │
├──────┬──────────────────────────────────────────────────────┤
│      │                                                      │
│  S   │  Page Header (Breadcrumbs + Title + Actions)        │
│  I   │  ┌────────────────────────────────────────────┐     │
│  D   │  │                                            │     │
│  E   │  │                                            │     │
│  B   │  │                                            │     │
│  A   │  │          Main Content Area                 │     │
│  R   │  │          (Scrollable)                      │     │
│      │  │                                            │     │
│  2   │  │                                            │     │
│  4   │  │                                            │     │
│  0   │  └────────────────────────────────────────────┘     │
│  p   │                                                      │
│  x   │  Footer (Optional)                                  │
│      │                                                      │
└──────┴──────────────────────────────────────────────────────┘
```

**Implementation:**
```tsx
<Box sx={{ display: 'flex', height: '100vh' }}>
  {/* Top App Bar */}
  <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
    {/* Logo, navigation, user menu */}
  </AppBar>

  {/* Sidebar Drawer */}
  <Drawer
    variant="permanent"
    sx={{
      width: 240,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: 240,
        boxSizing: 'border-box',
        top: 64, // Below AppBar
      },
    }}
  >
    {/* Navigation items */}
  </Drawer>

  {/* Main Content */}
  <Box
    component="main"
    sx={{
      flexGrow: 1,
      p: 3,
      mt: 8, // Account for AppBar height
      ml: '240px', // Account for drawer width
    }}
  >
    {/* Page content */}
  </Box>
</Box>
```

### Page Header Pattern

Every page should have a consistent header structure.

```tsx
<Box sx={{ mb: 3 }}>
  {/* Breadcrumbs */}
  <Breadcrumbs sx={{ mb: 1 }}>
    <Link href="/dashboard">Dashboard</Link>
    <Link href="/sales">Sales</Link>
    <Typography color="text.primary">Leads</Typography>
  </Breadcrumbs>

  {/* Page Title + Actions */}
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="h3" component="h1">
      Sales Leads
    </Typography>
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button variant="outlined" startIcon={<FilterListIcon />}>
        Filter
      </Button>
      <Button variant="contained" startIcon={<AddIcon />}>
        New Lead
      </Button>
    </Box>
  </Box>
</Box>
```

---

## Navigation Patterns

### Top Navigation Bar (AppBar)

**Height:** 64px
**Background:** primary.main (#1976d2)
**Elevation:** 4

```tsx
<AppBar position="fixed">
  <Toolbar>
    {/* Logo */}
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
      <img src="/logo.svg" alt="April's Pest Control" height="40" />
    </Box>

    {/* Module Switcher */}
    <Select
      value="sales"
      sx={{ minWidth: 150, color: 'white' }}
    >
      <MenuItem value="sales">Sales</MenuItem>
      <MenuItem value="service">Service</MenuItem>
      <MenuItem value="scheduling">Scheduling</MenuItem>
      {/* ... other modules */}
    </Select>

    {/* Global Search */}
    <Box sx={{ flexGrow: 1, mx: 4 }}>
      <TextField
        placeholder="Search customers, leads, appointments..."
        fullWidth
        InputProps={{
          startAdornment: <SearchIcon />,
        }}
      />
    </Box>

    {/* Right Side Icons */}
    <IconButton color="inherit">
      <Badge badgeContent={4} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>

    <IconButton color="inherit">
      <HelpOutlineIcon />
    </IconButton>

    {/* User Menu */}
    <Avatar sx={{ ml: 2, cursor: 'pointer' }} onClick={handleMenuOpen}>
      JD
    </Avatar>
  </Toolbar>
</AppBar>
```

### Sidebar Navigation

**Width:** 240px (expanded), 64px (collapsed)
**Background:** white or gray.50
**Elevation:** 2

```tsx
<Drawer variant="permanent">
  <List>
    {/* Active Item */}
    <ListItem
      button
      selected
      sx={{
        '&.Mui-selected': {
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          borderRight: '3px solid',
          borderRightColor: 'primary.main',
        },
      }}
    >
      <ListItemIcon>
        <DashboardIcon color="primary" />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>

    {/* Inactive Item */}
    <ListItem button>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Leads" />
    </ListItem>

    {/* Nested Navigation */}
    <ListItem button onClick={handleExpandClick}>
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary="Settings" />
      {open ? <ExpandLess /> : <ExpandMore />}
    </ListItem>
    <Collapse in={open}>
      <List component="div" disablePadding>
        <ListItem button sx={{ pl: 4 }}>
          <ListItemText primary="Profile" />
        </ListItem>
      </List>
    </Collapse>
  </List>
</Drawer>
```

### Breadcrumb Navigation

```tsx
<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
  <Link
    underline="hover"
    color="inherit"
    href="/dashboard"
    sx={{ display: 'flex', alignItems: 'center' }}
  >
    <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
    Dashboard
  </Link>
  <Link underline="hover" color="inherit" href="/sales">
    Sales
  </Link>
  <Typography color="text.primary">Leads</Typography>
</Breadcrumbs>
```

### Module Switcher

```tsx
<FormControl variant="outlined" sx={{ minWidth: 180 }}>
  <Select
    value={currentModule}
    onChange={handleModuleChange}
    startAdornment={
      <InputAdornment position="start">
        <AppsIcon />
      </InputAdornment>
    }
  >
    <MenuItem value="sales">
      <ListItemIcon><TrendingUpIcon /></ListItemIcon>
      <ListItemText>Sales</ListItemText>
    </MenuItem>
    <MenuItem value="service">
      <ListItemIcon><BuildIcon /></ListItemIcon>
      <ListItemText>Service</ListItemText>
    </MenuItem>
    {/* ... other modules */}
  </Select>
</FormControl>
```

---

## Dashboard Layouts

### Executive Dashboard Layout

3-column grid on desktop, single column on mobile.

```tsx
<Container maxWidth="xl">
  {/* KPI Cards Row */}
  <Grid container spacing={3} sx={{ mb: 3 }}>
    <Grid item xs={12} sm={6} md={3}>
      <KPICard
        title="Monthly Recurring Revenue"
        value="$127,450"
        change={12.5}
        trend="up"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <KPICard
        title="Active Customers"
        value="1,234"
        change={5.2}
        trend="up"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <KPICard
        title="Churn Rate"
        value="2.1%"
        change={-0.5}
        trend="down"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <KPICard
        title="Avg Revenue/Customer"
        value="$103"
        change={3.1}
        trend="up"
      />
    </Grid>
  </Grid>

  {/* Charts Row */}
  <Grid container spacing={3} sx={{ mb: 3 }}>
    <Grid item xs={12} lg={8}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Revenue Trend
          </Typography>
          <LineChart data={revenueData} height={300} />
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} lg={4}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Service Mix
          </Typography>
          <PieChart data={serviceMixData} height={300} />
        </CardContent>
      </Card>
    </Grid>
  </Grid>

  {/* Table Row */}
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Card>
        <CardHeader
          title="Recent Leads"
          action={
            <Button size="small">View All</Button>
          }
        />
        <CardContent>
          <DataTable data={leadsData} />
        </CardContent>
      </Card>
    </Grid>
  </Grid>
</Container>
```

### KPI Card Component

```tsx
<Card sx={{ height: '100%' }}>
  <CardContent>
    {/* Label */}
    <Typography variant="caption" color="text.secondary" gutterBottom>
      {title}
    </Typography>

    {/* Value */}
    <Typography variant="h3" component="div" sx={{ my: 1 }}>
      {value}
    </Typography>

    {/* Trend Indicator */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {trend === 'up' ? (
        <TrendingUpIcon color="success" fontSize="small" />
      ) : (
        <TrendingDownIcon color="error" fontSize="small" />
      )}
      <Typography
        variant="body2"
        color={trend === 'up' ? 'success.main' : 'error.main'}
      >
        {change > 0 ? '+' : ''}{change}%
      </Typography>
      <Typography variant="caption" color="text.secondary">
        vs last month
      </Typography>
    </Box>

    {/* Optional Sparkline */}
    {sparklineData && (
      <Box sx={{ mt: 2 }}>
        <Sparkline data={sparklineData} height={40} />
      </Box>
    )}
  </CardContent>
</Card>
```

---

## Form Patterns

### Two-Column Form Layout

Optimized for desktop, stacks on mobile.

```tsx
<Card>
  <CardHeader title="Customer Information" />
  <CardContent>
    <Grid container spacing={3}>
      {/* Row 1 */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="First Name"
          name="firstName"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="Last Name"
          name="lastName"
        />
      </Grid>

      {/* Row 2 */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Email"
          name="email"
          type="email"
        />
      </Grid>

      {/* Row 3 */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          type="tel"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Company"
          name="company"
        />
      </Grid>

      {/* Full Width Field */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Notes"
          name="notes"
        />
      </Grid>
    </Grid>
  </CardContent>

  {/* Form Actions */}
  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
    <Button variant="outlined">
      Cancel
    </Button>
    <Button variant="contained" type="submit">
      Save Customer
    </Button>
  </CardActions>
</Card>
```

### Inline Form (Search/Filter)

```tsx
<Paper sx={{ p: 2, mb: 3 }}>
  <Grid container spacing={2} alignItems="center">
    <Grid item xs={12} sm={4}>
      <TextField
        fullWidth
        placeholder="Search leads..."
        InputProps={{
          startAdornment: <SearchIcon />,
        }}
      />
    </Grid>
    <Grid item xs={12} sm={3}>
      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select label="Status">
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="new">New</MenuItem>
          <MenuItem value="contacted">Contacted</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={12} sm={3}>
      <TextField
        fullWidth
        type="date"
        label="From Date"
        InputLabelProps={{ shrink: true }}
      />
    </Grid>
    <Grid item xs={12} sm={2}>
      <Button fullWidth variant="contained">
        Apply
      </Button>
    </Grid>
  </Grid>
</Paper>
```

### Stepper Form (Multi-Step)

```tsx
<Card>
  <CardContent>
    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
      <Step>
        <StepLabel>Customer Info</StepLabel>
      </Step>
      <Step>
        <StepLabel>Service Details</StepLabel>
      </Step>
      <Step>
        <StepLabel>Schedule</StepLabel>
      </Step>
      <Step>
        <StepLabel>Confirm</StepLabel>
      </Step>
    </Stepper>

    {/* Step Content */}
    <Box sx={{ minHeight: 300 }}>
      {activeStep === 0 && <CustomerInfoForm />}
      {activeStep === 1 && <ServiceDetailsForm />}
      {activeStep === 2 && <ScheduleForm />}
      {activeStep === 3 && <ConfirmationView />}
    </Box>
  </CardContent>

  {/* Navigation */}
  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
    <Button
      disabled={activeStep === 0}
      onClick={handleBack}
    >
      Back
    </Button>
    <Button
      variant="contained"
      onClick={handleNext}
    >
      {activeStep === 3 ? 'Submit' : 'Next'}
    </Button>
  </CardActions>
</Card>
```

---

## Table & List Patterns

### Data Table with Actions

```tsx
<Card>
  <CardHeader
    title="Sales Leads"
    action={
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton><FilterListIcon /></IconButton>
        <IconButton><DownloadIcon /></IconButton>
      </Box>
    }
  />
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox />
          </TableCell>
          <TableCell>
            <TableSortLabel active direction="asc">
              Customer
            </TableSortLabel>
          </TableCell>
          <TableCell>Phone</TableCell>
          <TableCell>Service</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Value</TableCell>
          <TableCell align="center">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {leads.map((lead) => (
          <TableRow hover key={lead.id}>
            <TableCell padding="checkbox">
              <Checkbox />
            </TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={500}>
                {lead.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lead.email}
              </Typography>
            </TableCell>
            <TableCell>{lead.phone}</TableCell>
            <TableCell>{lead.service}</TableCell>
            <TableCell>
              <Chip
                label={lead.status}
                size="small"
                color={getStatusColor(lead.status)}
              />
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2" fontWeight={500}>
                ${lead.value}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <IconButton size="small">
                <EditIcon />
              </IconButton>
              <IconButton size="small">
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  <TablePagination
    component="div"
    count={totalCount}
    page={page}
    onPageChange={handlePageChange}
    rowsPerPage={rowsPerPage}
    onRowsPerPageChange={handleRowsPerPageChange}
  />
</Card>
```

### List View with Cards

```tsx
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
  {items.map((item) => (
    <Card key={item.id} sx={{ cursor: 'pointer' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Chip label={item.status} size="small" />
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="body2" color="text.secondary">
              {item.date}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2} sx={{ textAlign: 'right' }}>
            <IconButton><MoreVertIcon /></IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  ))}
</Box>
```

---

## Modal & Dialog Patterns

### Standard Modal/Dialog

```tsx
<Dialog
  open={open}
  onClose={handleClose}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>
    Create New Lead
    <IconButton
      onClick={handleClose}
      sx={{ position: 'absolute', right: 8, top: 8 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent dividers>
    {/* Form content */}
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField fullWidth label="Customer Name" />
      </Grid>
      {/* ... more fields */}
    </Grid>
  </DialogContent>

  <DialogActions>
    <Button onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="contained" onClick={handleSubmit}>
      Create Lead
    </Button>
  </DialogActions>
</Dialog>
```

### Confirmation Dialog

```tsx
<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Confirm Deletion</DialogTitle>
  <DialogContent>
    <Typography>
      Are you sure you want to delete this lead? This action cannot be undone.
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="contained" color="error" onClick={handleConfirm}>
      Delete
    </Button>
  </DialogActions>
</Dialog>
```

### Drawer (Side Panel)

```tsx
<Drawer
  anchor="right"
  open={open}
  onClose={handleClose}
  sx={{ '& .MuiDrawer-paper': { width: 400 } }}
>
  <Box sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h6">Lead Details</Typography>
      <IconButton onClick={handleClose}>
        <CloseIcon />
      </IconButton>
    </Box>

    {/* Content */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Lead information */}
    </Box>
  </Box>
</Drawer>
```

---

## Mobile Patterns

### Mobile Bottom Navigation

```tsx
<Paper
  sx={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1100,
  }}
  elevation={3}
>
  <BottomNavigation value={value} onChange={handleChange}>
    <BottomNavigationAction
      label="Dashboard"
      icon={<DashboardIcon />}
      value="dashboard"
    />
    <BottomNavigationAction
      label="Leads"
      icon={<PeopleIcon />}
      value="leads"
    />
    <BottomNavigationAction
      label="Schedule"
      icon={<CalendarIcon />}
      value="schedule"
    />
    <BottomNavigationAction
      label="More"
      icon={<MoreHorizIcon />}
      value="more"
    />
  </BottomNavigation>
</Paper>
```

### Mobile Floating Action Button

```tsx
<Fab
  color="primary"
  sx={{
    position: 'fixed',
    bottom: 72, // Above bottom nav
    right: 16,
  }}
  onClick={handleAdd}
>
  <AddIcon />
</Fab>
```

### Mobile Card List

```tsx
<Box sx={{ p: 2 }}>
  {items.map((item) => (
    <Card key={item.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" component="div">
            {item.name}
          </Typography>
          <Chip label={item.status} size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {item.phone}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.date}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Call</Button>
        <Button size="small">View</Button>
      </CardActions>
    </Card>
  ))}
</Box>
```

---

## Responsive Behavior

### Responsive Grid Example

```tsx
<Grid container spacing={3}>
  {/* Full width on mobile, half on tablet, third on desktop */}
  <Grid item xs={12} sm={6} md={4}>
    <Card>{/* Content */}</Card>
  </Grid>

  {/* Full width on mobile, half on tablet, two-thirds on desktop */}
  <Grid item xs={12} sm={6} md={8}>
    <Card>{/* Content */}</Card>
  </Grid>
</Grid>
```

### Responsive Typography

```tsx
<Typography
  variant="h3"
  sx={{
    fontSize: {
      xs: '1.75rem', // 28px on mobile
      sm: '2rem',    // 32px on tablet
      md: '2.5rem',  // 40px on desktop
    },
  }}
>
  Page Title
</Typography>
```

### Hide/Show on Different Screens

```tsx
{/* Hide on mobile, show on desktop */}
<Box sx={{ display: { xs: 'none', md: 'block' } }}>
  <DesktopOnlyContent />
</Box>

{/* Show on mobile, hide on desktop */}
<Box sx={{ display: { xs: 'block', md: 'none' } }}>
  <MobileOnlyContent />
</Box>
```

### Responsive Container Padding

```tsx
<Container
  sx={{
    px: {
      xs: 2, // 16px on mobile
      sm: 3, // 24px on tablet
      md: 4, // 32px on desktop
    },
  }}
>
  {/* Content */}
</Container>
```

---

## Common UI Patterns Reference

### Empty States

```tsx
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    textAlign: 'center',
  }}
>
  <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
  <Typography variant="h6" gutterBottom>
    No leads yet
  </Typography>
  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
    Start by creating your first lead
  </Typography>
  <Button variant="contained" startIcon={<AddIcon />}>
    Create Lead
  </Button>
</Box>
```

### Loading States

```tsx
{/* Full page loading */}
<Box
  sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  }}
>
  <CircularProgress />
</Box>

{/* Skeleton loader for cards */}
<Card>
  <CardContent>
    <Skeleton variant="text" width="60%" height={32} />
    <Skeleton variant="text" width="40%" />
    <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
  </CardContent>
</Card>
```

### Error States

```tsx
<Alert severity="error" sx={{ mb: 2 }}>
  <AlertTitle>Error</AlertTitle>
  Failed to load data. Please try again.
  <Button size="small" onClick={retry} sx={{ ml: 2 }}>
    Retry
  </Button>
</Alert>
```

### Toast Notifications (Snackbar)

```tsx
<Snackbar
  open={open}
  autoHideDuration={6000}
  onClose={handleClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
>
  <Alert onClose={handleClose} severity="success">
    Lead created successfully!
  </Alert>
</Snackbar>
```

---

## Best Practices

### Layout Guidelines

1. **Consistent spacing:** Use theme spacing values (theme.spacing(n))
2. **Proper hierarchy:** Use heading levels semantically (h1 → h6)
3. **White space:** Don't overcrowd - give elements room to breathe
4. **Alignment:** Maintain consistent alignment (left, center, right)
5. **Visual weight:** Balance heavy and light elements

### Mobile-First Approach

1. Start with mobile layout (xs breakpoint)
2. Enhance for larger screens (sm, md, lg, xl)
3. Test on actual devices, not just browser DevTools
4. Ensure touch targets are minimum 48x48px
5. Optimize for thumb zones (bottom third of screen)

### Performance

1. Lazy load images and heavy components
2. Virtualize long lists (react-window or similar)
3. Debounce search and filter inputs
4. Use skeleton loaders instead of spinners when possible
5. Optimize re-renders with React.memo and useCallback

### Accessibility

1. Proper semantic HTML structure
2. ARIA labels for screen readers
3. Keyboard navigation support
4. Focus management in modals/dialogs
5. Color contrast compliance (WCAG 2.1 AA)

---

**Version:** 1.0.0
**Last Updated:** 2025-12-22
**Maintained By:** UX Designer, Frontend Developer
