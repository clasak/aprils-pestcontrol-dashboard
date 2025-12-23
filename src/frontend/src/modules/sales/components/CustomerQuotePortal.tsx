/**
 * Customer Quote Portal Component
 * 
 * Customer-facing quote view with:
 * - Professional branded presentation
 * - Interactive service selection
 * - E-signature capture
 * - Digital acceptance workflow
 * - Payment link integration
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Tooltip,
  Fade,
  Collapse,
  Link,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningIcon from '@mui/icons-material/Warning';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import DrawIcon from '@mui/icons-material/Draw';
import UndoIcon from '@mui/icons-material/Undo';
import SecurityIcon from '@mui/icons-material/Security';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HelpIcon from '@mui/icons-material/Help';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { QuoteForPDF } from '../utils/generateQuotePdf';

interface CustomerQuotePortalProps {
  quote: CustomerQuote;
  companyInfo: CompanyInfo;
  onAccept: (acceptanceData: QuoteAcceptance) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onRequestCallback?: () => void;
  onScheduleService?: () => void;
  isPreview?: boolean;
}

interface CustomerQuote {
  id: string;
  quoteNumber: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  validUntil: string;
  
  // Customer Info
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  
  // Service Address
  serviceAddress?: string;
  
  // Line Items
  lineItems: QuoteLineItem[];
  
  // Pricing
  subtotal: number;
  discountAmount: number;
  discountPercent?: number;
  taxAmount: number;
  taxRate?: number;
  total: number;
  
  // Recurring
  isRecurring: boolean;
  frequency?: string;
  monthlyAmount?: number;
  annualAmount?: number;
  
  // Terms
  termsAndConditions?: string;
  paymentTerms?: string;
  guarantees?: string[];
  
  // Notes
  customerNotes?: string;
  salesRepName?: string;
  salesRepPhone?: string;
  salesRepEmail?: string;
}

interface QuoteLineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isRecurring?: boolean;
  frequency?: string;
  isOptional?: boolean;
  isSelected?: boolean;
}

interface CompanyInfo {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  tagline?: string;
  licenses?: string[];
}

interface QuoteAcceptance {
  quoteId: string;
  signatureName: string;
  signatureEmail: string;
  signatureData: string;
  agreedToTerms: boolean;
  preferredStartDate?: string;
  preferredTimeSlot?: string;
  paymentMethod?: string;
  additionalNotes?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

const ACCEPTANCE_STEPS = ['Review Quote', 'Sign Agreement', 'Schedule Service'];

const CustomerQuotePortal = ({
  quote,
  companyInfo,
  onAccept,
  onReject,
  onRequestCallback,
  onScheduleService,
  isPreview = false,
}: CustomerQuotePortalProps) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  
  // Acceptance form state
  const [activeStep, setActiveStep] = useState(0);
  const [signatureName, setSignatureName] = useState(quote.customerName || '');
  const [signatureEmail, setSignatureEmail] = useState(quote.customerEmail || '');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [preferredStartDate, setPreferredStartDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // UI state
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [optionalSelections, setOptionalSelections] = useState<Record<string, boolean>>({});

  // Initialize optional item selections
  useEffect(() => {
    const initialSelections: Record<string, boolean> = {};
    quote.lineItems.forEach(item => {
      if (item.isOptional) {
        initialSelections[item.id] = item.isSelected ?? false;
      }
    });
    setOptionalSelections(initialSelections);
  }, [quote.lineItems]);

  // Calculate adjusted totals based on optional selections
  const adjustedTotals = useCallback(() => {
    let subtotal = 0;
    quote.lineItems.forEach(item => {
      if (!item.isOptional || optionalSelections[item.id]) {
        subtotal += item.total;
      }
    });
    
    const discountAmount = quote.discountPercent 
      ? Math.round(subtotal * quote.discountPercent / 100)
      : quote.discountAmount;
    
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = quote.taxRate 
      ? Math.round(afterDiscount * quote.taxRate / 100)
      : quote.taxAmount;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total: afterDiscount + taxAmount,
    };
  }, [quote, optionalSelections]);

  // Signature canvas handlers
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    if (showAcceptDialog && activeStep === 1) {
      initCanvas();
    }
  }, [showAcceptDialog, activeStep, initCanvas]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    initCanvas();
    setHasSignature(false);
  };

  const getSignatureData = (): string => {
    const canvas = canvasRef.current;
    return canvas ? canvas.toDataURL('image/png') : '';
  };

  const handleAccept = async () => {
    if (!hasSignature || !agreedToTerms || !signatureName.trim() || !signatureEmail.trim()) {
      setError('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const acceptanceData: QuoteAcceptance = {
        quoteId: quote.id,
        signatureName: signatureName.trim(),
        signatureEmail: signatureEmail.trim(),
        signatureData: getSignatureData(),
        agreedToTerms,
        preferredStartDate,
        preferredTimeSlot,
        additionalNotes,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      await onAccept(acceptanceData);
      setShowAcceptDialog(false);
      setActiveStep(2); // Move to scheduling step
    } catch (err: any) {
      setError(err.message || 'Failed to accept quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onReject(rejectReason);
      setShowRejectDialog(false);
    } catch (err: any) {
      setError(err.message || 'Failed to reject quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpired = new Date(quote.validUntil) < new Date();
  const daysUntilExpiry = Math.ceil((new Date(quote.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const totals = adjustedTotals();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      py: { xs: 2, md: 4 },
      px: { xs: 1, md: 2 },
    }}>
      {/* Company Header */}
      <Paper 
        elevation={0}
        sx={{ 
          maxWidth: 900, 
          mx: 'auto', 
          mb: 3,
          bgcolor: 'primary.main',
          color: 'white',
          p: 3,
          borderRadius: 2,
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={8}>
            {companyInfo.logo ? (
              <Box
                component="img"
                src={companyInfo.logo}
                alt={companyInfo.name}
                sx={{ height: 60, mb: 1 }}
              />
            ) : (
              <Typography variant="h4" fontWeight={700}>
                {companyInfo.name}
              </Typography>
            )}
            {companyInfo.tagline && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {companyInfo.tagline}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { md: 'flex-end' }, mb: 0.5 }}>
              <PhoneIcon fontSize="small" />
              <Typography variant="body2">{companyInfo.phone}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { md: 'flex-end' } }}>
              <EmailIcon fontSize="small" />
              <Typography variant="body2">{companyInfo.email}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Status Banner */}
      {(isExpired || quote.status === 'accepted' || quote.status === 'rejected') && (
        <Alert
          severity={quote.status === 'accepted' ? 'success' : isExpired ? 'error' : 'warning'}
          sx={{ maxWidth: 900, mx: 'auto', mb: 2 }}
          icon={
            quote.status === 'accepted' ? <CheckCircleIcon /> :
            quote.status === 'rejected' ? <CancelIcon /> :
            <WarningIcon />
          }
        >
          {quote.status === 'accepted' && 'This quote has been accepted. Thank you for your business!'}
          {quote.status === 'rejected' && 'This quote has been declined.'}
          {isExpired && quote.status !== 'accepted' && 'This quote has expired. Please request a new quote.'}
        </Alert>
      )}

      {/* Expiring Soon Warning */}
      {!isExpired && daysUntilExpiry <= 7 && quote.status === 'sent' && (
        <Alert severity="warning" sx={{ maxWidth: 900, mx: 'auto', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon />
            <Typography>
              This quote expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} on {formatDate(quote.validUntil)}
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Main Quote Card */}
      <Paper 
        elevation={2} 
        sx={{ 
          maxWidth: 900, 
          mx: 'auto',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Quote Header */}
        <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Service Proposal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quote #{quote.quoteNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prepared: {formatDate(quote.createdAt)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
              <Chip
                label={quote.status.toUpperCase()}
                color={
                  quote.status === 'accepted' ? 'success' :
                  quote.status === 'rejected' ? 'error' :
                  quote.status === 'expired' ? 'default' :
                  'primary'
                }
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Valid until: {formatDate(quote.validUntil)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Customer & Service Info */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                PREPARED FOR
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {quote.customerName}
              </Typography>
              {quote.customerEmail && (
                <Typography variant="body2">{quote.customerEmail}</Typography>
              )}
              {quote.customerPhone && (
                <Typography variant="body2">{quote.customerPhone}</Typography>
              )}
              {quote.customerAddress && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {quote.customerAddress}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                SERVICE LOCATION
              </Typography>
              {quote.serviceAddress ? (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOnIcon color="action" sx={{ mt: 0.5 }} />
                  <Typography variant="body2">{quote.serviceAddress}</Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Same as customer address
                </Typography>
              )}
              
              {quote.salesRepName && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    YOUR REPRESENTATIVE
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {quote.salesRepName}
                  </Typography>
                  {quote.salesRepPhone && (
                    <Typography variant="body2">{quote.salesRepPhone}</Typography>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Services Table */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Proposed Services
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  {quote.lineItems.some(i => i.isOptional) && (
                    <TableCell padding="checkbox"></TableCell>
                  )}
                  <TableCell>Service</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quote.lineItems.map(item => {
                  const isIncluded = !item.isOptional || optionalSelections[item.id];
                  
                  return (
                    <TableRow 
                      key={item.id}
                      sx={{ 
                        opacity: isIncluded ? 1 : 0.5,
                        bgcolor: item.isOptional ? alpha(theme.palette.info.main, 0.05) : 'inherit',
                      }}
                    >
                      {quote.lineItems.some(i => i.isOptional) && (
                        <TableCell padding="checkbox">
                          {item.isOptional && (
                            <Checkbox
                              checked={optionalSelections[item.id] || false}
                              onChange={(e) => setOptionalSelections(prev => ({
                                ...prev,
                                [item.id]: e.target.checked,
                              }))}
                              disabled={quote.status !== 'sent'}
                            />
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {item.name}
                          {item.isOptional && (
                            <Chip 
                              label="Optional" 
                              size="small" 
                              color="info" 
                              sx={{ ml: 1 }} 
                            />
                          )}
                          {item.isRecurring && (
                            <Chip 
                              label={item.frequency || 'Recurring'} 
                              size="small" 
                              variant="outlined"
                              sx={{ ml: 1 }} 
                            />
                          )}
                        </Typography>
                        {item.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Totals */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Grid container justifyContent="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">{formatCurrency(totals.subtotal)}</Typography>
                </Box>
                
                {totals.discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                    <Typography variant="body2">
                      Discount {quote.discountPercent && `(${quote.discountPercent}%)`}
                    </Typography>
                    <Typography variant="body2">-{formatCurrency(totals.discountAmount)}</Typography>
                  </Box>
                )}
                
                {totals.taxAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tax {quote.taxRate && `(${quote.taxRate}%)`}
                    </Typography>
                    <Typography variant="body2">{formatCurrency(totals.taxAmount)}</Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={600}>Total</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {formatCurrency(totals.total)}
                  </Typography>
                </Box>
                
                {quote.isRecurring && quote.annualAmount && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="caption" color="info.dark">
                      Annual Value: {formatCurrency(quote.annualAmount)}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Guarantees */}
        {quote.guarantees && quote.guarantees.length > 0 && (
          <Box sx={{ px: 3, pb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUserIcon color="success" />
              Our Guarantees
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quote.guarantees.map((guarantee, i) => (
                <Chip
                  key={i}
                  icon={<CheckCircleIcon />}
                  label={guarantee}
                  variant="outlined"
                  color="success"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Customer Notes */}
        {quote.customerNotes && (
          <Box sx={{ px: 3, pb: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Special Notes
              </Typography>
              <Typography variant="body2">{quote.customerNotes}</Typography>
            </Paper>
          </Box>
        )}

        {/* Terms & Conditions */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setShowTerms(!showTerms)}
            endIcon={showTerms ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mb: 1 }}
          >
            Terms & Conditions
          </Button>
          <Collapse in={showTerms}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {quote.termsAndConditions || 'Standard terms and conditions apply.'}
              </Typography>
            </Paper>
          </Collapse>
        </Box>

        {/* Action Buttons */}
        {quote.status === 'sent' && !isExpired && !isPreview && (
          <Box 
            sx={{ 
              p: 3, 
              bgcolor: 'grey.100', 
              borderTop: '1px solid', 
              borderColor: 'divider',
            }}
          >
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<DrawIcon />}
                  onClick={() => setShowAcceptDialog(true)}
                  sx={{ py: 1.5 }}
                >
                  Accept & Sign
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<PhoneIcon />}
                  onClick={onRequestCallback}
                  sx={{ py: 1.5 }}
                >
                  Request Callback
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={() => setShowRejectDialog(true)}
                  sx={{ py: 1.5 }}
                >
                  Decline Quote
                </Button>
              </Grid>
            </Grid>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
              <SecurityIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Your signature will be securely recorded with timestamp and IP address
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Accept Dialog with E-Signature */}
      <Dialog
        open={showAcceptDialog}
        onClose={() => !isSubmitting && setShowAcceptDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Accept Quote & Sign Agreement</Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {ACCEPTANCE_STEPS.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please review the quote details above, then proceed to sign.
              </Alert>
              <Typography variant="body2" gutterBottom>
                <strong>Total Amount:</strong> {formatCurrency(totals.total)}
              </Typography>
              {quote.isRecurring && (
                <Typography variant="body2" gutterBottom>
                  <strong>Billing:</strong> {quote.frequency} service
                </Typography>
              )}
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Type your full legal name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    type="email"
                    value={signatureEmail}
                    onChange={(e) => setSignatureEmail(e.target.value)}
                    placeholder="For confirmation receipt"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Sign Below *
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1,
                      bgcolor: 'background.paper',
                      position: 'relative',
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={150}
                      style={{
                        width: '100%',
                        maxWidth: 500,
                        height: 150,
                        touchAction: 'none',
                        cursor: 'crosshair',
                      }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    <IconButton
                      size="small"
                      onClick={clearSignature}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <UndoIcon />
                    </IconButton>
                  </Paper>
                  <Typography variant="caption" color="text.secondary">
                    Use your mouse or finger to sign above
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I have read and agree to the{' '}
                        <Link href="#" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>
                          terms and conditions
                        </Link>
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
                Your acceptance has been recorded. Would you like to schedule your service now?
              </Alert>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preferred Start Date"
                    type="date"
                    value={preferredStartDate}
                    onChange={(e) => setPreferredStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preferred Time"
                    select
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select a time...</option>
                    <option value="morning">Morning (8am - 12pm)</option>
                    <option value="afternoon">Afternoon (12pm - 5pm)</option>
                    <option value="flexible">Flexible</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    multiline
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Gate codes, pet information, special instructions..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setShowAcceptDialog(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {activeStep > 0 && (
            <Button
              onClick={() => setActiveStep(prev => prev - 1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          {activeStep < 1 ? (
            <Button
              variant="contained"
              onClick={() => setActiveStep(1)}
            >
              Continue to Sign
            </Button>
          ) : activeStep === 1 ? (
            <Button
              variant="contained"
              color="success"
              onClick={handleAccept}
              disabled={isSubmitting || !hasSignature || !agreedToTerms || !signatureName || !signatureEmail}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            >
              {isSubmitting ? 'Processing...' : 'Accept & Sign'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                setShowAcceptDialog(false);
                onScheduleService?.();
              }}
              startIcon={<ScheduleIcon />}
            >
              Schedule Service
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={showRejectDialog}
        onClose={() => !isSubmitting && setShowRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Decline Quote</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We're sorry to hear that. Please let us know why so we can improve:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for declining (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Price too high, chose different provider, no longer need service..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <CancelIcon />}
          >
            {isSubmitting ? 'Processing...' : 'Decline Quote'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Questions? Contact us at {companyInfo.phone} or {companyInfo.email}
        </Typography>
        {companyInfo.licenses && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {companyInfo.licenses.join(' • ')}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CustomerQuotePortal;

