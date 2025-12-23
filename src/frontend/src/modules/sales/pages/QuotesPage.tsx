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
import SendIcon from '@mui/icons-material/Send';
import DescriptionIcon from '@mui/icons-material/Description';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HistoryIcon from '@mui/icons-material/History';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { LoadingSpinner } from '@shared/components';
import { Deal, dealsApi } from '../services/deals.api';
import { quotesApi, Quote } from '../services/quotes.api';
import { QuoteBuilder, QuotePreview, QuoteSendDialog, QuoteVersionHistory } from '../components';
import { QuoteForPDF } from '../utils/generateQuotePdf';

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  const colors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    draft: 'default',
    sent: 'info',
    viewed: 'warning',
    accepted: 'success',
    rejected: 'error',
    expired: 'error',
  };
  return colors[status] || 'default';
};

const QuotesPage = () => {
  const navigate = useNavigate();

  const [quotes, setQuotes] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Deal | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedQuote, setSelectedQuote] = useState<Deal | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  const loadQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        stage: 'quote_sent',
      };
      if (searchQuery) params.search = searchQuery;

      const response = await dealsApi.getAll(params);
      setQuotes(response.data);
      setTotalQuotes(response.pagination.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

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

  const handleAddQuote = () => {
    setEditingQuote(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    loadQuotes();
    setShowForm(false);
    setEditingQuote(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, quote: Deal) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuote(quote);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuote(null);
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Quotes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage customer quotes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddQuote}
        >
          Create Quote
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          placeholder="Search quotes..."
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
      </Paper>

      {/* Quotes Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <LoadingSpinner message="Loading quotes..." />
        ) : quotes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No quotes found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
              {searchQuery
                ? 'Try adjusting your search'
                : 'Get started by creating your first quote'}
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddQuote}
              >
                Create Quote
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quote #</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Deal</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sent Date</TableCell>
                  <TableCell>Valid Until</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow
                    key={quote.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/sales/pipeline/${quote.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {quote.quoteId ? `Q-${quote.quoteId.slice(0, 8)}` : 'Draft'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {quote.contact ? (
                        <Box>
                          <Typography variant="body2">
                            {quote.contact.firstName} {quote.contact.lastName}
                          </Typography>
                          {quote.contact.email && (
                            <Typography variant="caption" color="text.secondary">
                              {quote.contact.email}
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
                      <Typography variant="body2" fontWeight={500}>
                        {quote.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(quote.dealValueCents)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={quote.stage.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(quote.stage)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(quote.quoteSentAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {quote.expectedCloseDate ? formatDate(quote.expectedCloseDate) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, quote)}
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
              count={totalQuotes}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </TableContainer>

      {/* Quote Builder Dialog */}
      {showForm && (
        <QuoteBuilder
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingQuote(null);
          }}
          onSuccess={handleFormSuccess}
          quote={editingQuote as any}
          defaultDealId={editingQuote?.id}
          defaultContactId={editingQuote?.contactId}
        />
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => {
          if (selectedQuote) {
            navigate(`/sales/pipeline/${selectedQuote.id}`);
          }
          handleMenuClose();
        }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedQuote) {
            setEditingQuote(selectedQuote);
            setShowForm(true);
          }
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Quote
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedQuote) {
            setSelectedQuoteId(selectedQuote.id);
            setShowPreview(true);
          }
          handleMenuClose();
        }}>
          <PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} />
          Preview PDF
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedQuote) {
            setShowSendDialog(true);
          }
          handleMenuClose();
        }}>
          <SendIcon fontSize="small" sx={{ mr: 1 }} />
          Send Quote
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedQuote) {
            setSelectedQuoteId(selectedQuote.id);
            setShowVersionHistory(true);
          }
          handleMenuClose();
        }}>
          <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
          Version History
        </MenuItem>
        <MenuItem onClick={async () => {
          if (selectedQuote) {
            try {
              await quotesApi.clone(selectedQuote.id);
              loadQuotes();
            } catch (err) {
              setError('Failed to clone quote');
            }
          }
          handleMenuClose();
        }}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          Clone Quote
        </MenuItem>
      </Menu>

      {/* Quote Preview Dialog */}
      <QuotePreview
        open={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedQuoteId(null);
        }}
        quote={selectedQuote ? getQuoteForPreview(selectedQuote) : null}
      />

      {/* Send Quote Dialog */}
      <QuoteSendDialog
        open={showSendDialog}
        onClose={() => {
          setShowSendDialog(false);
          setSelectedQuote(null);
        }}
        onSuccess={() => {
          setShowSendDialog(false);
          setSelectedQuote(null);
          loadQuotes();
        }}
        quote={selectedQuote ? {
          id: selectedQuote.id,
          quoteNumber: selectedQuote.quoteId,
          contact: selectedQuote.contact,
          totalAmount: selectedQuote.dealValueCents,
          validUntil: selectedQuote.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          lineItems: [],
        } : null}
      />

      {/* Version History Dialog */}
      <QuoteVersionHistory
        open={showVersionHistory}
        onClose={() => {
          setShowVersionHistory(false);
          setSelectedQuoteId(null);
        }}
        quoteId={selectedQuoteId}
      />
    </Box>
  );

  // Helper function to convert Deal to QuoteForPDF
  function getQuoteForPreview(deal: Deal): QuoteForPDF | null {
    return {
      id: deal.id,
      quoteNumber: deal.quoteId || `Q-${deal.id.slice(0, 8)}`,
      status: deal.stage,
      createdAt: deal.createdAt,
      validUntil: deal.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      contact: deal.contact ? {
        firstName: deal.contact.firstName,
        lastName: deal.contact.lastName,
        email: deal.contact.email,
        phone: deal.contact.phone,
        addressLine1: deal.contact.addressLine1,
        city: deal.contact.city,
        state: deal.contact.state,
        postalCode: deal.contact.postalCode,
      } : undefined,
      lineItems: [
        {
          id: '1',
          description: deal.title || 'Pest Control Services',
          quantity: 1,
          unitPrice: deal.dealValueCents,
          total: deal.dealValueCents,
        }
      ],
      subtotal: deal.dealValueCents,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      total: deal.dealValueCents,
      termsAndConditions: '',
    };
  }
};

export default QuotesPage;
