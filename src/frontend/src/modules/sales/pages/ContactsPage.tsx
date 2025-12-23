import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { LoadingSpinner, ConfirmDialog } from '@shared/components';
import { Contact, contactsApi, ContactsQueryParams } from '../services/contacts.api';
import { ContactForm } from '../components';

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    residential: '#4caf50',
    commercial: '#2196f3',
    property_manager: '#9c27b0',
    referral_partner: '#ff9800',
    vendor: '#607d8b',
    other: '#757575',
  };
  return colors[type] || colors.other;
};

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  const colors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    active: 'success',
    inactive: 'warning',
    do_not_contact: 'error',
  };
  return colors[status] || 'default';
};

const ContactsPage = () => {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalContacts, setTotalContacts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params: ContactsQueryParams = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (searchQuery) params.search = searchQuery;
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await contactsApi.getAll(params);
      setContacts(response.data);
      setTotalContacts(response.pagination.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, typeFilter, statusFilter]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setShowForm(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleFormSuccess = (contact: Contact) => {
    if (editingContact) {
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? contact : c))
      );
    } else {
      loadContacts();
    }
    setShowForm(false);
    setEditingContact(null);
  };

  const handleDeleteContact = async () => {
    if (!deletingContact) return;

    setDeleteLoading(true);
    try {
      await contactsApi.delete(deletingContact.id);
      setContacts((prev) => prev.filter((c) => c.id !== deletingContact.id));
      setTotalContacts((prev) => prev - 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete contact');
    } finally {
      setDeleteLoading(false);
      setDeletingContact(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Contacts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your customer and business contacts
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddContact}
        >
          Add Contact
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={handleSearch}
            size="small"
            sx={{ minWidth: 300, flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </Box>

        {showFilters && (
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="property_manager">Property Manager</MenuItem>
                <MenuItem value="referral_partner">Referral Partner</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="do_not_contact">Do Not Contact</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>

      {/* Contacts Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <LoadingSpinner message="Loading contacts..." />
        ) : contacts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No contacts found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
              {searchQuery || typeFilter || statusFilter
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first contact'}
            </Typography>
            {!searchQuery && !typeFilter && !statusFilter && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddContact}
              >
                Add Contact
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contact</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/sales/contacts/${contact.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: getTypeColor(contact.type),
                            fontSize: '0.875rem',
                          }}
                        >
                          {contact.firstName[0]}
                          {contact.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {contact.firstName} {contact.lastName}
                          </Typography>
                          {contact.companyName && (
                            <Typography variant="caption" color="text.secondary">
                              {contact.companyName}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {contact.email ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{contact.email}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.phone ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{contact.phone}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contact.type.replace('_', ' ')}
                        size="small"
                        sx={{
                          bgcolor: getTypeColor(contact.type),
                          color: 'white',
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contact.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(contact.status)}
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/sales/contacts/${contact.id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditContact(contact)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeletingContact(contact)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalContacts}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </TableContainer>

      {/* Contact Form Dialog */}
      <ContactForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingContact(null);
        }}
        onSuccess={handleFormSuccess}
        contact={editingContact}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingContact}
        title="Delete Contact"
        message={
          deletingContact
            ? `Are you sure you want to delete ${deletingContact.firstName} ${deletingContact.lastName}?`
            : ''
        }
        confirmText="Delete"
        confirmColor="error"
        loading={deleteLoading}
        onConfirm={handleDeleteContact}
        onCancel={() => setDeletingContact(null)}
      />
    </Box>
  );
};

export default ContactsPage;

