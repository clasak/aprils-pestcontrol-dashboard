import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import { quotesApi, SendQuoteDto, Quote } from '../services/quotes.api';
import { Contact } from '../services/contacts.api';

interface QuoteSendDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (quote: Quote) => void;
  quote: {
    id?: string;
    quoteNumber?: string;
    contact?: Contact | null;
    totalAmount: number;
    validUntil: string;
    lineItems: Array<{ description: string; total: number }>;
  } | null;
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
    month: 'long',
    day: 'numeric',
  });
};

const QuoteSendDialog = ({ open, onClose, onSuccess, quote }: QuoteSendDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const defaultEmail = quote?.contact?.email || '';
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail);
  const [ccEmail, setCcEmail] = useState('');
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includePdf, setIncludePdf] = useState(true);

  // Reset form when dialog opens
  const resetForm = () => {
    setRecipientEmail(quote?.contact?.email || '');
    setCcEmail('');
    setCcEmails([]);
    setSubject('');
    setMessage('');
    setIncludePdf(true);
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleAddCc = () => {
    const email = ccEmail.trim();
    if (email && !ccEmails.includes(email)) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        setCcEmails([...ccEmails, email]);
        setCcEmail('');
      } else {
        setError('Please enter a valid email address');
      }
    }
  };

  const handleRemoveCc = (emailToRemove: string) => {
    setCcEmails(ccEmails.filter(email => email !== emailToRemove));
  };

  const handleCcKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddCc();
    }
  };

  const handleSend = async () => {
    if (!quote?.id) {
      setError('Quote must be saved before sending');
      return;
    }

    if (!recipientEmail.trim()) {
      setError('Recipient email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setError('Please enter a valid recipient email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sendData: SendQuoteDto = {
        recipientEmail: recipientEmail.trim(),
        ccEmails: ccEmails.length > 0 ? ccEmails : undefined,
        subject: subject.trim() || undefined,
        message: message.trim() || undefined,
        includePdf,
      };

      const response = await quotesApi.send(quote.id, sendData);
      onSuccess(response.data);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to send quote');
    } finally {
      setLoading(false);
    }
  };

  const contactName = quote?.contact 
    ? `${quote.contact.firstName} ${quote.contact.lastName}` 
    : 'Customer';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SendIcon color="primary" />
          <Typography variant="h6">Send Quote</Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Quote Summary */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <DescriptionIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2">Quote Summary</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Quote Number</Typography>
            <Typography variant="body2" fontWeight={600}>
              {quote?.quoteNumber || 'Draft'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Customer</Typography>
            <Typography variant="body2">{contactName}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Total Amount</Typography>
            <Typography variant="body2" fontWeight={600} color="primary">
              {quote ? formatCurrency(quote.totalAmount) : '$0.00'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Valid Until</Typography>
            <Typography variant="body2">
              {quote?.validUntil ? formatDate(quote.validUntil) : 'N/A'}
            </Typography>
          </Box>
        </Paper>

        <Divider sx={{ mb: 3 }} />

        {/* Recipient Email */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="subtitle2">Recipient</Typography>
          </Box>
          <TextField
            fullWidth
            size="small"
            type="email"
            placeholder="customer@email.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Box>

        {/* CC Emails */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>CC (Optional)</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              size="small"
              type="email"
              placeholder="Add CC email and press Enter"
              value={ccEmail}
              onChange={(e) => setCcEmail(e.target.value)}
              onKeyDown={handleCcKeyDown}
              disabled={loading}
            />
            <Button
              variant="outlined"
              onClick={handleAddCc}
              disabled={loading || !ccEmail.trim()}
            >
              Add
            </Button>
          </Box>
          {ccEmails.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {ccEmails.map((email) => (
                <Chip
                  key={email}
                  label={email}
                  size="small"
                  onDelete={() => handleRemoveCc(email)}
                  disabled={loading}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Custom Subject */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Subject (Optional)</Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={`Your Quote from April's Pest Control - ${quote?.quoteNumber || 'Q-XXXX'}`}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={loading}
          />
        </Box>

        {/* Custom Message */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Personal Message (Optional)</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            placeholder="Add a personal message to include in the email..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
        </Box>

        {/* PDF Attachment */}
        <FormControlLabel
          control={
            <Checkbox
              checked={includePdf}
              onChange={(e) => setIncludePdf(e.target.checked)}
              disabled={loading}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachFileIcon fontSize="small" color="action" />
              <Typography variant="body2">Attach PDF quote</Typography>
            </Box>
          }
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !recipientEmail.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
        >
          {loading ? 'Sending...' : 'Send Quote'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuoteSendDialog;

