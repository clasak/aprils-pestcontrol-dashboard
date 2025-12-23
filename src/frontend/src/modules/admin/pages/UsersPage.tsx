import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Paper,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Grid,
  Tabs,
  Tab,
  Badge,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as RoleIcon,
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  VpnKey as KeyIcon,
  History as HistoryIcon,
  Send as SendIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
} from '@mui/icons-material';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
  avatar?: string;
}

type Order = 'asc' | 'desc';

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@aprilspestcontrol.com',
    phone: '(555) 123-4567',
    role: 'Administrator',
    department: 'IT',
    status: 'active',
    lastLogin: '2024-12-23 09:45 AM',
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@aprilspestcontrol.com',
    phone: '(555) 234-5678',
    role: 'Manager',
    department: 'Operations',
    status: 'active',
    lastLogin: '2024-12-23 08:30 AM',
    createdAt: '2023-03-22',
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Davis',
    email: 'mike.davis@aprilspestcontrol.com',
    phone: '(555) 345-6789',
    role: 'Technician',
    department: 'Field Services',
    status: 'active',
    lastLogin: '2024-12-22 04:15 PM',
    createdAt: '2023-05-10',
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Wilson',
    email: 'emily.wilson@aprilspestcontrol.com',
    phone: '(555) 456-7890',
    role: 'Sales Rep',
    department: 'Sales',
    status: 'active',
    lastLogin: '2024-12-23 10:00 AM',
    createdAt: '2023-07-08',
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@aprilspestcontrol.com',
    phone: '(555) 567-8901',
    role: 'Technician',
    department: 'Field Services',
    status: 'inactive',
    lastLogin: '2024-11-15 02:30 PM',
    createdAt: '2023-02-20',
  },
  {
    id: '6',
    firstName: 'Lisa',
    lastName: 'Martinez',
    email: 'lisa.martinez@aprilspestcontrol.com',
    phone: '(555) 678-9012',
    role: 'Manager',
    department: 'Customer Service',
    status: 'active',
    lastLogin: '2024-12-23 07:45 AM',
    createdAt: '2023-04-12',
  },
  {
    id: '7',
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.anderson@aprilspestcontrol.com',
    phone: '(555) 789-0123',
    role: 'Viewer',
    department: 'Finance',
    status: 'pending',
    lastLogin: 'Never',
    createdAt: '2024-12-20',
  },
  {
    id: '8',
    firstName: 'Jennifer',
    lastName: 'Taylor',
    email: 'jennifer.taylor@aprilspestcontrol.com',
    phone: '(555) 890-1234',
    role: 'Technician',
    department: 'Field Services',
    status: 'active',
    lastLogin: '2024-12-22 06:00 PM',
    createdAt: '2023-08-15',
  },
];

const roles = ['Administrator', 'Manager', 'Technician', 'Sales Rep', 'Viewer'];
const departments = ['IT', 'Operations', 'Field Services', 'Sales', 'Customer Service', 'Finance', 'Marketing', 'HR'];

const UsersPage = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof User>('lastName');
  const [order, setOrder] = useState<Order>('asc');
  
  // Dialog states
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Viewer',
    department: '',
    status: 'active' as 'active' | 'inactive' | 'pending',
  });

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Tab filter
      if (tabValue === 1 && user.status !== 'active') return false;
      if (tabValue === 2 && user.status !== 'inactive') return false;
      if (tabValue === 3 && user.status !== 'pending') return false;
      
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.department.toLowerCase().includes(searchLower);
      
      // Role filter
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
      const isAsc = order === 'asc';
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (aValue < bValue) return isAsc ? -1 : 1;
      if (aValue > bValue) return isAsc ? 1 : -1;
      return 0;
    });
  }, [users, searchQuery, filterRole, filterStatus, tabValue, orderBy, order]);

  // Counts
  const counts = useMemo(() => ({
    all: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    pending: users.filter(u => u.status === 'pending').length,
  }), [users]);

  const handleSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      status: user.status,
    });
    setOpenUserDialog(true);
    handleMenuClose();
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'Viewer',
      department: '',
      status: 'pending',
    });
    setOpenUserDialog(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...formData }
          : u
      ));
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
    } else {
      // Add new user
      const newUser: User = {
        id: String(Date.now()),
        ...formData,
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
      setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
    }
    setOpenUserDialog(false);
  };

  const handleDeleteUser = () => {
    if (menuUser) {
      setUsers(users.filter(u => u.id !== menuUser.id));
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
    }
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, status: newStatus }
        : u
    ));
    setSnackbar({ 
      open: true, 
      message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 
      severity: 'success' 
    });
    handleMenuClose();
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip icon={<ActiveIcon />} label="Active" size="small" color="success" variant="outlined" />;
      case 'inactive':
        return <Chip icon={<InactiveIcon />} label="Inactive" size="small" color="default" variant="outlined" />;
      case 'pending':
        return <Chip icon={<ScheduleIcon />} label="Pending" size="small" color="warning" variant="outlined" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrator':
        return theme.palette.error.main;
      case 'Manager':
        return theme.palette.warning.main;
      case 'Technician':
        return theme.palette.primary.main;
      case 'Sales Rep':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage user accounts, roles, and permissions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddUser}>
            Add User
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {counts.all}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" fontWeight={700} color="success.main">
              {counts.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" fontWeight={700} color="text.secondary">
              {counts.inactive}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inactive
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" fontWeight={700} color="warning.main">
              {counts.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content Card */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab 
              label={
                <Badge badgeContent={counts.all} color="primary" max={999}>
                  <Box sx={{ pr: 2 }}>All Users</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.active} color="success" max={999}>
                  <Box sx={{ pr: 2 }}>Active</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.inactive} color="default" max={999}>
                  <Box sx={{ pr: 2 }}>Inactive</Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={counts.pending} color="warning" max={999}>
                  <Box sx={{ pr: 2 }}>Pending</Box>
                </Badge>
              } 
            />
          </Tabs>
        </Box>

        {/* Filters */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={filterRole}
              label="Role"
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              {roles.map(role => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>

        <Divider />

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'lastName'}
                    direction={orderBy === 'lastName' ? order : 'asc'}
                    onClick={() => handleSort('lastName')}
                  >
                    User
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'role'}
                    direction={orderBy === 'role' ? order : 'asc'}
                    onClick={() => handleSort('role')}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'department'}
                    direction={orderBy === 'department' ? order : 'asc'}
                    onClick={() => handleSort('department')}
                  >
                    Department
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'lastLogin'}
                    direction={orderBy === 'lastLogin' ? order : 'asc'}
                    onClick={() => handleSort('lastLogin')}
                  >
                    Last Login
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow 
                    key={user.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(getRoleColor(user.role), 0.1),
                            color: getRoleColor(user.role),
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(user.firstName, user.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          bgcolor: alpha(getRoleColor(user.role), 0.1),
                          color: getRoleColor(user.role),
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.department}</Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(user.status)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.lastLogin}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditUser(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More actions">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                          <MoreIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No users found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search or filters
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleEditUser(menuUser!)}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleToggleStatus(menuUser!)}>
          <ListItemIcon>
            {menuUser?.status === 'active' ? <BlockIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{menuUser?.status === 'active' ? 'Deactivate' : 'Activate'}</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon><KeyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Reset Password</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon><SendIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Send Invite</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setDeleteDialogOpen(true); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* User Dialog */}
      <Dialog 
        open={openUserDialog} 
        onClose={() => setOpenUserDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              {selectedUser ? 'Edit User' : 'Add New User'}
            </Typography>
            <IconButton size="small" onClick={() => setOpenUserDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {roles.map(role => (
                    <MenuItem key={role} value={role}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: getRoleColor(role),
                          }}
                        />
                        {role}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="active">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ActiveIcon color="success" fontSize="small" />
                      Active
                    </Box>
                  </MenuItem>
                  <MenuItem value="inactive">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InactiveIcon color="disabled" fontSize="small" />
                      Inactive
                    </Box>
                  </MenuItem>
                  <MenuItem value="pending">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon color="warning" fontSize="small" />
                      Pending
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {!selectedUser && (
              <Grid item xs={12}>
                <Alert severity="info">
                  An invitation email will be sent to the user with instructions to set their password.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveUser}
            disabled={!formData.firstName || !formData.lastName || !formData.email}
          >
            {selectedUser ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>{menuUser?.firstName} {menuUser?.lastName}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;
