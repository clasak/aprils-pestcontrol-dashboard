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
  Menu,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { LoadingSpinner, ConfirmDialog } from '@shared/components';
import { Lead, leadsApi, LeadsQueryParams } from '../services/leads.api';
import { LeadForm } from '../components';

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  const colors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    new: 'default',
    contacted: 'default',
    qualified: 'success',
    unqualified: 'error',
    nurturing: 'warning',
    converted: 'success',
    lost: 'error',
  };
  return colors[status] || 'default';
};

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    urgent: '#f44336',
    high: '#ff9800',
    medium: '#2196f3',
    low: '#9e9e9e',
  };
  return colors[priority] || colors.medium;
};

const LeadsPage = () => {
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLeads, setTotalLeads] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params: LeadsQueryParams = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await leadsApi.getAll(params);
      setLeads(response.data);
      setTotalLeads(response.pagination.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, statusFilter, priorityFilter]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

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

  const handleAddLead = () => {
    setEditingLead(null);
    setShowForm(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleFormSuccess = (lead: Lead) => {
    if (editingLead) {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
    } else {
      loadLeads();
    }
    setShowForm(false);
    setEditingLead(null);
  };

  const handleDeleteLead = async () => {
    if (!deletingLead) return;

    setDeleteLoading(true);
    try {
      await leadsApi.delete(deletingLead.id);
      setLeads((prev) => prev.filter((l) => l.id !== deletingLead.id));
      setTotalLeads((prev) => prev - 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete lead');
    } finally {
      setDeleteLoading(false);
      setDeletingLead(null);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, lead: Lead) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLead(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Leads
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage your sales leads
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddLead}
        >
          Add Lead
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
            placeholder="Search leads..."
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
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="unqualified">Unqualified</MenuItem>
                <MenuItem value="nurturing">Nurturing</MenuItem>
                <MenuItem value="converted">Converted</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>

      {/* Leads Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <LoadingSpinner message="Loading leads..." />
        ) : leads.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No leads found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
              {searchQuery || statusFilter || priorityFilter
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first lead'}
            </Typography>
            {!searchQuery && !statusFilter && !priorityFilter && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddLead}
              >
                Add Lead
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lead</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/sales/leads/${lead.id}`)}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {lead.title}
                        </Typography>
                        {lead.description && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                            {lead.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {lead.contact ? (
                        <Box>
                          <Typography variant="body2">
                            {lead.contact.firstName} {lead.contact.lastName}
                          </Typography>
                          {lead.contact.email && (
                            <Typography variant="caption" color="text.secondary">
                              {lead.contact.email}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{lead.leadSource}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lead.leadSourceCategory}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TrendingUpIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {lead.leadScore}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.status}
                        size="small"
                        color={getStatusColor(lead.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.priority}
                        size="small"
                        sx={{
                          bgcolor: getPriorityColor(lead.priority),
                          color: 'white',
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {lead.estimatedValueCents ? (
                        <Typography variant="body2" fontWeight={500}>
                          ${(lead.estimatedValueCents / 100).toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, lead)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalLeads}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </TableContainer>

      {/* Lead Form Dialog */}
      <LeadForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingLead(null);
        }}
        onSuccess={handleFormSuccess}
        lead={editingLead}
      />

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => {
          if (selectedLead) {
            navigate(`/sales/leads/${selectedLead.id}`);
          }
          handleMenuClose();
        }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedLead) {
            handleEditLead(selectedLead);
          }
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedLead) {
            setDeletingLead(selectedLead);
          }
          handleMenuClose();
        }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingLead}
        title="Delete Lead"
        message={
          deletingLead
            ? `Are you sure you want to delete "${deletingLead.title}"?`
            : ''
        }
        confirmText="Delete"
        confirmColor="error"
        loading={deleteLoading}
        onConfirm={handleDeleteLead}
        onCancel={() => setDeletingLead(null)}
      />
    </Box>
  );
};

export default LeadsPage;
