import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { quotesApi, Quote, QuoteStatus } from '../services/quotes.api';

interface QuoteVersionHistoryProps {
  open: boolean;
  onClose: () => void;
  quoteId: string | null;
  onSelectVersion?: (quote: Quote) => void;
}

const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: QuoteStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const colors: Record<QuoteStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    draft: 'default',
    pending_approval: 'warning',
    approved: 'info',
    sent: 'info',
    viewed: 'warning',
    accepted: 'success',
    rejected: 'error',
    expired: 'error',
    revised: 'secondary',
  };
  return colors[status] || 'default';
};

const getStatusIcon = (status: QuoteStatus) => {
  switch (status) {
    case 'accepted':
      return <CheckCircleIcon />;
    case 'rejected':
    case 'expired':
      return <CancelIcon />;
    case 'sent':
      return <SendIcon />;
    case 'viewed':
      return <VisibilityIcon />;
    case 'revised':
      return <EditIcon />;
    default:
      return <DescriptionIcon />;
  }
};

const QuoteVersionHistory = ({ open, onClose, quoteId, onSelectVersion }: QuoteVersionHistoryProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<Quote[]>([]);

  useEffect(() => {
    if (open && quoteId) {
      loadVersionHistory();
    }
  }, [open, quoteId]);

  const loadVersionHistory = async () => {
    if (!quoteId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await quotesApi.getVersionHistory(quoteId);
      setVersions(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVersion = (quote: Quote) => {
    if (onSelectVersion) {
      onSelectVersion(quote);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" />
          <Typography variant="h6">Version History</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : versions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No version history available
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Version history will appear here after the quote is revised
            </Typography>
          </Box>
        ) : (
          <Timeline position="right">
            {versions.map((version, index) => (
              <TimelineItem key={version.id}>
                <TimelineOppositeContent sx={{ maxWidth: 180, py: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(version.createdAt)}
                  </Typography>
                </TimelineOppositeContent>
                
                <TimelineSeparator>
                  <TimelineDot color={getStatusColor(version.status)}>
                    {getStatusIcon(version.status)}
                  </TimelineDot>
                  {index < versions.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                
                <TimelineContent sx={{ py: 2, px: 2 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: onSelectVersion ? 'pointer' : 'default',
                      '&:hover': onSelectVersion ? {
                        bgcolor: 'action.hover',
                        borderColor: 'primary.main',
                      } : {},
                    }}
                    onClick={() => onSelectVersion && handleSelectVersion(version)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Version {version.version}
                          {index === 0 && (
                            <Chip 
                              label="Current" 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1, height: 20 }} 
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {version.quoteNumber}
                        </Typography>
                      </Box>
                      <Chip
                        label={version.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(version.status)}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total: <strong>{formatCurrency(version.totalAmount)}</strong>
                      </Typography>
                      {version.lineItems && (
                        <Typography variant="caption" color="text.secondary">
                          {version.lineItems.length} line item{version.lineItems.length !== 1 ? 's' : ''}
                        </Typography>
                      )}
                    </Box>

                    {version.revisionNotes && (
                      <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">
                          Revision Notes:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {version.revisionNotes}
                        </Typography>
                      </Box>
                    )}

                    {version.sentAt && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        Sent to: {version.sentToEmail} on {formatDate(version.sentAt)}
                      </Typography>
                    )}

                    {version.signedAt && (
                      <Typography variant="caption" color="success.main" display="block" mt={0.5}>
                        ✓ Signed by {version.signedByName} on {formatDate(version.signedAt)}
                      </Typography>
                    )}
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuoteVersionHistory;

