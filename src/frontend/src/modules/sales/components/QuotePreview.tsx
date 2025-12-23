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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import { QuotePDFDocument, QuotePDFData } from './QuotePDF';
import { 
  downloadQuotePdf, 
  openQuotePdfInNewTab,
  convertQuoteToPDFData,
  QuoteForPDF,
} from '../utils/generateQuotePdf';

interface QuotePreviewProps {
  open: boolean;
  onClose: () => void;
  quote: QuoteForPDF | null;
}

const QuotePreview = ({ open, onClose, quote }: QuotePreviewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && quote) {
      generatePreview();
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [open, quote]);

  const generatePreview = async () => {
    if (!quote) return;
    
    setLoading(true);
    setError(null);

    try {
      const pdfData = convertQuoteToPDFData(quote);
      const doc = createElement(QuotePDFDocument, { data: pdfData });
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      console.error('Error generating PDF preview:', err);
      setError('Failed to generate PDF preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!quote) return;
    
    try {
      const pdfData = convertQuoteToPDFData(quote);
      await downloadQuotePdf(pdfData);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    }
  };

  const handleOpenInNewTab = async () => {
    if (!quote) return;
    
    try {
      const pdfData = convertQuoteToPDFData(quote);
      await openQuotePdfInNewTab(pdfData);
    } catch (err) {
      console.error('Error opening PDF:', err);
      setError('Failed to open PDF. Please try again.');
    }
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ 
        sx: { 
          height: '90vh',
          maxHeight: '90vh',
        } 
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          Quote Preview
          {quote?.quoteNumber && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              #{quote.quoteNumber}
            </Typography>
          )}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenInNewTab}
            disabled={loading || !quote}
          >
            Open in New Tab
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={loading || !quote}
          >
            Download
          </Button>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box 
            sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography color="text.secondary">Generating PDF preview...</Typography>
          </Box>
        ) : pdfUrl ? (
          <Box sx={{ flex: 1, bgcolor: 'grey.200' }}>
            <iframe
              src={pdfUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Quote PDF Preview"
            />
          </Box>
        ) : (
          <Box 
            sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">
              No preview available
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={loading || !quote}
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuotePreview;

