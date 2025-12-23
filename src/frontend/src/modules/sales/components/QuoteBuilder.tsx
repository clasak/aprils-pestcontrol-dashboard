import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Collapse,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BugReportIcon from '@mui/icons-material/BugReport';
import PestControlIcon from '@mui/icons-material/PestControl';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import RepeatIcon from '@mui/icons-material/Repeat';
import { FormTextField, FormDateField, FormSection } from '@shared/components';
import { Contact, contactsApi } from '../services/contacts.api';
import { Deal, dealsApi } from '../services/deals.api';
import QuotePreview from './QuotePreview';
import QuoteSendDialog from './QuoteSendDialog';
import { QuoteForPDF } from '../utils/generateQuotePdf';

interface QuoteBuilderProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (quote: Quote) => void;
  quote?: Quote | null;
  defaultDealId?: string;
  defaultContactId?: string;
}

// Service frequency options
type ServiceFrequency = 'one-time' | 'monthly' | 'quarterly' | 'bi-annual' | 'annual';

const FREQUENCY_OPTIONS: { value: ServiceFrequency; label: string; timesPerYear: number }[] = [
  { value: 'one-time', label: 'One-time', timesPerYear: 1 },
  { value: 'monthly', label: 'Monthly', timesPerYear: 12 },
  { value: 'quarterly', label: 'Quarterly', timesPerYear: 4 },
  { value: 'bi-annual', label: 'Bi-Annual', timesPerYear: 2 },
  { value: 'annual', label: 'Annual', timesPerYear: 1 },
];

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  frequency: ServiceFrequency;
}

interface Quote {
  id?: string;
  dealId?: string;
  contactId: string;
  contact?: Contact;
  quoteNumber?: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  lineItems: LineItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  termsAndConditions: string;
  notes: string;
  validUntil: string;
  createdAt?: string;
  updatedAt?: string;
}

// New contact form data
interface NewContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  leadSource: string;
  notes: string;
}

const emptyContactForm: NewContactForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  leadSource: '',
  notes: '',
};

// Lead source options
const LEAD_SOURCES = [
  'Website',
  'Phone Call',
  'Referral',
  'Door Knock',
  'Yard Sign',
  'Google Ads',
  'Facebook',
  'Nextdoor',
  'Home Show',
  'Other',
];

// Service templates organized by category
interface ServiceTemplate {
  name: string;
  description: string;
  unitPrice: number;
}

interface ServiceCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  services: ServiceTemplate[];
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    name: 'General Pest Control',
    icon: <BugReportIcon />,
    color: '#1976d2',
    services: [
      {
        name: 'Monthly Service',
        description: 'Monthly pest control service - interior and exterior treatment',
        unitPrice: 7500,
      },
      {
        name: 'Quarterly Service',
        description: 'Quarterly pest control service - comprehensive treatment',
        unitPrice: 12500,
      },
      {
        name: 'One-Time Treatment',
        description: 'Single pest control treatment - interior and exterior',
        unitPrice: 17500,
      },
    ],
  },
  {
    name: 'Termite',
    icon: <HomeWorkIcon />,
    color: '#ed6c02',
    services: [
      {
        name: 'Inspection',
        description: 'Complete termite inspection with detailed report',
        unitPrice: 15000,
      },
      {
        name: 'Bait Station Treatment',
        description: 'Termite bait station installation and monitoring',
        unitPrice: 150000,
      },
      {
        name: 'Liquid Treatment',
        description: 'Liquid termiticide treatment - full perimeter',
        unitPrice: 200000,
      },
    ],
  },
  {
    name: 'Bed Bug',
    icon: <PestControlIcon />,
    color: '#d32f2f',
    services: [
      {
        name: 'Single Room',
        description: 'Heat treatment for single room bed bug elimination',
        unitPrice: 50000,
      },
      {
        name: 'Whole House',
        description: 'Complete house heat treatment for bed bugs',
        unitPrice: 150000,
      },
      {
        name: 'Inspection',
        description: 'Comprehensive bed bug inspection with K-9 or visual',
        unitPrice: 20000,
      },
    ],
  },
  {
    name: 'Rodent',
    icon: <PestControlIcon />,
    color: '#7b1fa2',
    services: [
      {
        name: 'Initial Service',
        description: 'Initial rodent inspection and trap placement',
        unitPrice: 25000,
      },
      {
        name: 'Monthly Maintenance',
        description: 'Monthly rodent monitoring and maintenance',
        unitPrice: 7500,
      },
      {
        name: 'Exclusion Work',
        description: 'Rodent exclusion - sealing entry points',
        unitPrice: 75000,
      },
    ],
  },
  {
    name: 'Specialty Services',
    icon: <BugReportIcon />,
    color: '#388e3c',
    services: [
      {
        name: 'Mosquito Control',
        description: 'Monthly mosquito yard treatment',
        unitPrice: 8500,
      },
      {
        name: 'Wildlife Removal',
        description: 'Humane wildlife removal and exclusion',
        unitPrice: 35000,
      },
      {
        name: 'Flea Treatment',
        description: 'Interior flea treatment - whole house',
        unitPrice: 22500,
      },
      {
        name: 'Wasp/Bee Removal',
        description: 'Wasp nest or bee hive removal',
        unitPrice: 17500,
      },
    ],
  },
];

const DEFAULT_TERMS = `TERMS AND CONDITIONS:

1. Payment: Payment is due upon completion of service unless other arrangements have been made.

2. Guarantee: We guarantee our services for 30 days. If pests return within this period, we will re-treat at no additional cost.

3. Access: Customer agrees to provide access to all areas required for treatment.

4. Preparation: For certain treatments, customer may be required to prepare the property according to our instructions.

5. Safety: Please follow all safety instructions provided by our technicians regarding pets, children, and food preparation areas.

6. Cancellation: Cancellations made less than 24 hours before scheduled service may be subject to a cancellation fee.

This quote is valid for 30 days from the date of issue.`;

const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

const generateQuoteNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `Q-${year}-${random}`;
};

const createEmptyLineItem = (): LineItem => ({
  id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  description: '',
  quantity: 1,
  unitPrice: 0,
  total: 0,
  frequency: 'one-time',
});

const initialQuote: Quote = {
  contactId: '',
  status: 'draft',
  lineItems: [createEmptyLineItem()],
  subtotal: 0,
  discountType: 'percentage',
  discountValue: 0,
  discountAmount: 0,
  taxRate: 0,
  taxAmount: 0,
  total: 0,
  termsAndConditions: DEFAULT_TERMS,
  notes: '',
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

const QuoteBuilder = ({
  open,
  onClose,
  onSuccess,
  quote,
  defaultDealId,
  defaultContactId,
}: QuoteBuilderProps) => {
  const [quoteData, setQuoteData] = useState<Quote>(initialQuote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactOptions, setContactOptions] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  
  // New contact form state
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [newContactForm, setNewContactForm] = useState<NewContactForm>(emptyContactForm);
  const [savingContact, setSavingContact] = useState(false);
  const [contactFormErrors, setContactFormErrors] = useState<Partial<Record<keyof NewContactForm, string>>>({});
  
  // Expanded service categories
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['General Pest Control']);

  const isEditMode = !!quote?.id;

  // Calculate totals including recurring annual values
  const calculations = useMemo(() => {
    const subtotal = quoteData.lineItems.reduce((sum, item) => sum + item.total, 0);
    
    // Calculate annual value for recurring services
    const annualValue = quoteData.lineItems.reduce((sum, item) => {
      const freq = FREQUENCY_OPTIONS.find(f => f.value === item.frequency);
      return sum + (item.total * (freq?.timesPerYear || 1));
    }, 0);
    
    let discountAmount = 0;
    if (quoteData.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * quoteData.discountValue) / 100);
    } else {
      discountAmount = quoteData.discountValue * 100;
    }
    
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = Math.round((afterDiscount * quoteData.taxRate) / 100);
    const total = afterDiscount + taxAmount;
    
    const hasRecurring = quoteData.lineItems.some(item => item.frequency !== 'one-time');
    
    return { subtotal, discountAmount, taxAmount, total, annualValue, hasRecurring };
  }, [quoteData.lineItems, quoteData.discountType, quoteData.discountValue, quoteData.taxRate]);

  // Initialize quote data
  useEffect(() => {
    if (quote) {
      setQuoteData(quote);
      setSelectedContact(quote.contact || null);
    } else {
      setQuoteData({
        ...initialQuote,
        dealId: defaultDealId,
        contactId: defaultContactId || '',
        quoteNumber: generateQuoteNumber(),
      });
      setSelectedContact(null);
      setSelectedDeal(null);
    }
    setError(null);
    setShowNewContactForm(false);
    setNewContactForm(emptyContactForm);
  }, [quote, defaultDealId, defaultContactId, open]);

  // Load deal if defaultDealId provided
  useEffect(() => {
    const loadDeal = async () => {
      if (defaultDealId && !selectedDeal) {
        try {
          const response = await dealsApi.getById(defaultDealId);
          setSelectedDeal(response.data);
          setSelectedContact(response.data.contact);
          setQuoteData((prev) => ({
            ...prev,
            dealId: defaultDealId,
            contactId: response.data.contactId,
          }));
        } catch {
          // Ignore errors
        }
      }
    };
    loadDeal();
  }, [defaultDealId, selectedDeal]);

  // Load contact if defaultContactId provided
  useEffect(() => {
    const loadContact = async () => {
      if (defaultContactId && !selectedContact) {
        try {
          const response = await contactsApi.getById(defaultContactId);
          setSelectedContact(response.data);
          setQuoteData((prev) => ({ ...prev, contactId: defaultContactId }));
        } catch {
          // Ignore errors
        }
      }
    };
    loadContact();
  }, [defaultContactId, selectedContact]);

  // Search contacts
  useEffect(() => {
    const searchContacts = async () => {
      if (contactSearchQuery.length < 2) {
        setContactOptions([]);
        return;
      }
      setContactsLoading(true);
      try {
        const response = await contactsApi.getAll({ search: contactSearchQuery, limit: 10 });
        setContactOptions(response.data);
      } catch {
        setContactOptions([]);
      } finally {
        setContactsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchContacts, 300);
    return () => clearTimeout(timeoutId);
  }, [contactSearchQuery]);

  const handleContactSelect = (contact: Contact | null) => {
    setSelectedContact(contact);
    setQuoteData((prev) => ({ ...prev, contactId: contact?.id || '' }));
    setShowNewContactForm(false);
  };

  // New contact form handlers
  const handleNewContactChange = (field: keyof NewContactForm, value: string) => {
    setNewContactForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (contactFormErrors[field]) {
      setContactFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateContactForm = (): boolean => {
    const errors: Partial<Record<keyof NewContactForm, string>> = {};
    
    if (!newContactForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!newContactForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!newContactForm.email.trim() && !newContactForm.phone.trim()) {
      errors.email = 'Email or phone is required';
      errors.phone = 'Email or phone is required';
    }
    if (newContactForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContactForm.email)) {
      errors.email = 'Invalid email format';
    }
    
    setContactFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveNewContact = async () => {
    if (!validateContactForm()) return;
    
    setSavingContact(true);
    try {
      const response = await contactsApi.create({
        firstName: newContactForm.firstName,
        lastName: newContactForm.lastName,
        email: newContactForm.email || undefined,
        phone: newContactForm.phone || undefined,
        company: newContactForm.company || undefined,
        addressLine1: newContactForm.addressLine1 || undefined,
        city: newContactForm.city || undefined,
        state: newContactForm.state || undefined,
        postalCode: newContactForm.postalCode || undefined,
        leadSource: newContactForm.leadSource || undefined,
        notes: newContactForm.notes || undefined,
        type: 'customer',
        status: 'active',
      });
      
      // Select the newly created contact
      setSelectedContact(response.data);
      setQuoteData((prev) => ({ ...prev, contactId: response.data.id }));
      setShowNewContactForm(false);
      setNewContactForm(emptyContactForm);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create contact');
    } finally {
      setSavingContact(false);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setQuoteData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => {
        if (item.id !== id) return item;
        
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }),
    }));
  };

  const addLineItem = () => {
    setQuoteData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, createEmptyLineItem()],
    }));
  };

  const removeLineItem = (id: string) => {
    if (quoteData.lineItems.length <= 1) return;
    setQuoteData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  };

  const addFromTemplate = (template: ServiceTemplate, frequency: ServiceFrequency = 'one-time') => {
    const newItem: LineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: template.description,
      quantity: 1,
      unitPrice: template.unitPrice,
      total: template.unitPrice,
      frequency,
    };
    
    setQuoteData((prev) => {
      const hasEmptyFirst = prev.lineItems.length === 1 && 
        !prev.lineItems[0].description && 
        prev.lineItems[0].unitPrice === 0;
      
      return {
        ...prev,
        lineItems: hasEmptyFirst ? [newItem] : [...prev.lineItems, newItem],
      };
    });
  };

  const handleSubmit = async (sendToCustomer: boolean = false) => {
    if (!quoteData.contactId) {
      setError('Please select or add a contact');
      return;
    }
    
    if (quoteData.lineItems.every((item) => !item.description || item.total === 0)) {
      setError('Please add at least one line item');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const savedQuote: Quote = {
        ...quoteData,
        ...calculations,
        status: sendToCustomer ? 'sent' : 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      onSuccess(savedQuote);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save quote');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { maxHeight: '95vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DescriptionIcon />
          <Typography variant="h6" component="span">
            {isEditMode ? 'Edit Quote' : 'New Quote'}
          </Typography>
          {quoteData.quoteNumber && (
            <Typography variant="body2" color="text.secondary">
              #{quoteData.quoteNumber}
            </Typography>
          )}
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

        {/* Customer Selection Section */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Customer
            </Typography>
            {!showNewContactForm && !selectedContact && (
              <Button
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => setShowNewContactForm(true)}
                color="primary"
              >
                Add New Contact
              </Button>
            )}
          </Box>

          {/* Selected Contact Display */}
          {selectedContact && !showNewContactForm && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              bgcolor: 'success.light',
              p: 2,
              borderRadius: 1,
            }}>
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {selectedContact.firstName} {selectedContact.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedContact.email && selectedContact.email}
                  {selectedContact.email && selectedContact.phone && ' • '}
                  {selectedContact.phone && selectedContact.phone}
                </Typography>
                {selectedContact.addressLine1 && (
                  <Typography variant="caption" color="text.secondary">
                    {selectedContact.addressLine1}, {selectedContact.city}, {selectedContact.state} {selectedContact.postalCode}
                  </Typography>
                )}
              </Box>
              <Button 
                size="small" 
                onClick={() => {
                  setSelectedContact(null);
                  setQuoteData(prev => ({ ...prev, contactId: '' }));
                }}
              >
                Change
              </Button>
            </Box>
          )}

          {/* Contact Search */}
          {!selectedContact && !showNewContactForm && (
            <Autocomplete
              options={contactOptions}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName}${option.email ? ` (${option.email})` : ''}`
              }
              value={selectedContact}
              onChange={(_, newValue) => handleContactSelect(newValue)}
              onInputChange={(_, newInputValue) => setContactSearchQuery(newInputValue)}
              loading={contactsLoading}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Existing Contacts"
                  placeholder="Search by name, email, or phone..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {contactsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}

          {/* New Contact Form */}
          <Collapse in={showNewContactForm}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                  New Contact Details
                </Typography>
                <Button size="small" onClick={() => {
                  setShowNewContactForm(false);
                  setNewContactForm(emptyContactForm);
                  setContactFormErrors({});
                }}>
                  Cancel
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="First Name"
                    required
                    value={newContactForm.firstName}
                    onChange={(e) => handleNewContactChange('firstName', e.target.value)}
                    error={!!contactFormErrors.firstName}
                    helperText={contactFormErrors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Last Name"
                    required
                    value={newContactForm.lastName}
                    onChange={(e) => handleNewContactChange('lastName', e.target.value)}
                    error={!!contactFormErrors.lastName}
                    helperText={contactFormErrors.lastName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Phone"
                    value={newContactForm.phone}
                    onChange={(e) => handleNewContactChange('phone', e.target.value)}
                    error={!!contactFormErrors.phone}
                    helperText={contactFormErrors.phone}
                    placeholder="(555) 123-4567"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    type="email"
                    value={newContactForm.email}
                    onChange={(e) => handleNewContactChange('email', e.target.value)}
                    error={!!contactFormErrors.email}
                    helperText={contactFormErrors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Company (optional)"
                    value={newContactForm.company}
                    onChange={(e) => handleNewContactChange('company', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Service Address"
                    value={newContactForm.addressLine1}
                    onChange={(e) => handleNewContactChange('addressLine1', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="City"
                    value={newContactForm.city}
                    onChange={(e) => handleNewContactChange('city', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="State"
                    value={newContactForm.state}
                    onChange={(e) => handleNewContactChange('state', e.target.value)}
                    inputProps={{ maxLength: 2 }}
                    placeholder="TX"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="ZIP Code"
                    value={newContactForm.postalCode}
                    onChange={(e) => handleNewContactChange('postalCode', e.target.value)}
                    placeholder="12345"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Lead Source</InputLabel>
                    <Select
                      value={newContactForm.leadSource}
                      label="Lead Source"
                      onChange={(e) => handleNewContactChange('leadSource', e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Select...</em>
                      </MenuItem>
                      {LEAD_SOURCES.map(source => (
                        <MenuItem key={source} value={source}>{source}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Notes"
                    value={newContactForm.notes}
                    onChange={(e) => handleNewContactChange('notes', e.target.value)}
                    placeholder="How did they hear about us?"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleSaveNewContact}
                    disabled={savingContact}
                    startIcon={savingContact ? <CircularProgress size={16} /> : <PersonAddIcon />}
                  >
                    {savingContact ? 'Saving...' : 'Save Contact & Continue'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Paper>

        {/* Service Categories */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Add Services
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click a service to add it to the quote. Use the frequency dropdown to set recurring schedules.
          </Typography>
          
          {SERVICE_CATEGORIES.map((category) => (
            <Accordion
              key={category.name}
              expanded={expandedCategories.includes(category.name)}
              onChange={() => toggleCategory(category.name)}
              sx={{ 
                mb: 1,
                '&:before': { display: 'none' },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                '&.Mui-expanded': { margin: '0 0 8px 0' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: 'grey.50',
                  '&.Mui-expanded': { minHeight: 48 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: category.color }}>{category.icon}</Box>
                  <Typography fontWeight={500}>{category.name}</Typography>
                  <Chip 
                    label={`${category.services.length} services`} 
                    size="small" 
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                <Grid container spacing={1}>
                  {category.services.map((service) => (
                    <Grid item xs={12} sm={6} md={4} key={service.name}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: category.color,
                            bgcolor: 'action.hover',
                            transform: 'translateY(-1px)',
                          },
                        }}
                        onClick={() => addFromTemplate(service)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {service.name}
                          </Typography>
                          <Typography variant="body2" color="primary" fontWeight={700}>
                            {formatCurrency(service.unitPrice)}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {service.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Line Items Table with Frequency */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ width: '35%' }}>Description</TableCell>
                <TableCell sx={{ width: '10%' }} align="center">Qty</TableCell>
                <TableCell sx={{ width: '15%' }} align="right">Unit Price</TableCell>
                <TableCell sx={{ width: '20%' }} align="center">Frequency</TableCell>
                <TableCell sx={{ width: '15%' }} align="right">Total</TableCell>
                <TableCell sx={{ width: '5%' }} align="center"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quoteData.lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      variant="standard"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Service description..."
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      variant="standard"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      inputProps={{ min: 1, style: { textAlign: 'center' } }}
                      sx={{ width: 50 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      variant="standard"
                      type="number"
                      value={(item.unitPrice / 100).toFixed(2)}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', Math.round(parseFloat(e.target.value || '0') * 100))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right' } }}
                      sx={{ width: 90 }}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={item.frequency}
                        onChange={(e) => updateLineItem(item.id, 'frequency', e.target.value as ServiceFrequency)}
                        variant="standard"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {FREQUENCY_OPTIONS.map(freq => (
                          <MenuItem key={freq.value} value={freq.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {freq.value !== 'one-time' && <RepeatIcon fontSize="small" color="primary" />}
                              {freq.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={500}>{formatCurrency(item.total)}</Typography>
                    {item.frequency !== 'one-time' && (
                      <Tooltip title="Annual value">
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {formatCurrency(item.total * (FREQUENCY_OPTIONS.find(f => f.value === item.frequency)?.timesPerYear || 1))}/yr
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => removeLineItem(item.id)}
                      disabled={quoteData.lineItems.length <= 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button startIcon={<AddIcon />} onClick={addLineItem} sx={{ mb: 3 }}>
          Add Line Item
        </Button>

        {/* Totals */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Discounts & Tax
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      value={quoteData.discountType}
                      label="Discount Type"
                      onChange={(e) => setQuoteData((prev) => ({
                        ...prev,
                        discountType: e.target.value as 'percentage' | 'fixed',
                      }))}
                    >
                      <MenuItem value="percentage">Percentage (%)</MenuItem>
                      <MenuItem value="fixed">Fixed Amount ($)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label={quoteData.discountType === 'percentage' ? 'Discount %' : 'Discount $'}
                    type="number"
                    value={quoteData.discountValue}
                    onChange={(e) => setQuoteData((prev) => ({
                      ...prev,
                      discountValue: parseFloat(e.target.value) || 0,
                    }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {quoteData.discountType === 'percentage' ? '%' : '$'}
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tax Rate (%)"
                    type="number"
                    value={quoteData.taxRate}
                    onChange={(e) => setQuoteData((prev) => ({
                      ...prev,
                      taxRate: parseFloat(e.target.value) || 0,
                    }))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ mt: 2 }}>
              <FormDateField
                name="validUntil"
                label="Quote Valid Until"
                value={quoteData.validUntil}
                onChange={(v) => setQuoteData((prev) => ({ ...prev, validUntil: v }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Quote Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography>{formatCurrency(calculations.subtotal)}</Typography>
                </Box>
                {calculations.discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">
                      Discount
                      {quoteData.discountType === 'percentage' && ` (${quoteData.discountValue}%)`}
                    </Typography>
                    <Typography color="error.main">
                      -{formatCurrency(calculations.discountAmount)}
                    </Typography>
                  </Box>
                )}
                {calculations.taxAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Tax ({quoteData.taxRate}%)</Typography>
                    <Typography>{formatCurrency(calculations.taxAmount)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    {formatCurrency(calculations.total)}
                  </Typography>
                </Box>
                
                {/* Show annual value for recurring services */}
                {calculations.hasRecurring && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 1.5, 
                    bgcolor: 'info.light', 
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <RepeatIcon color="info" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Annual Contract Value
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="info.dark">
                        {formatCurrency(calculations.annualValue)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Notes & Terms */}
        <FormSection title="Notes & Terms" columns={1}>
          <FormTextField
            name="notes"
            label="Customer Notes"
            value={quoteData.notes}
            onChange={(v) => setQuoteData((prev) => ({ ...prev, notes: v }))}
            multiline
            rows={2}
            placeholder="Notes visible to the customer..."
          />
          <FormTextField
            name="termsAndConditions"
            label="Terms and Conditions"
            value={quoteData.termsAndConditions}
            onChange={(v) => setQuoteData((prev) => ({ ...prev, termsAndConditions: v }))}
            multiline
            rows={6}
          />
        </FormSection>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Box>
          <Button
            onClick={() => setShowPreview(true)}
            disabled={loading || quoteData.lineItems.every((item) => !item.description || item.total === 0)}
            startIcon={<PictureAsPdfIcon />}
            sx={{ mr: 1 }}
          >
            Preview PDF
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            variant="outlined"
            disabled={loading}
          >
            Save Draft
          </Button>
          <Button
            onClick={() => {
              if (isEditMode) {
                setShowSendDialog(true);
              } else {
                handleSubmit(true);
              }
            }}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
          >
            {isEditMode ? 'Send Quote' : 'Create & Send'}
          </Button>
        </Box>
      </DialogActions>

      {/* PDF Preview Dialog */}
      <QuotePreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        quote={getQuoteForPDF()}
      />

      {/* Send Quote Dialog */}
      <QuoteSendDialog
        open={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        onSuccess={(sentQuote) => {
          setShowSendDialog(false);
          onSuccess(sentQuote as any);
          onClose();
        }}
        quote={getQuoteForSend()}
      />
    </Dialog>
  );

  // Helper function to convert current quote data for PDF preview
  function getQuoteForPDF(): QuoteForPDF | null {
    if (quoteData.lineItems.every((item) => !item.description || item.total === 0)) {
      return null;
    }

    return {
      id: quoteData.id,
      quoteNumber: quoteData.quoteNumber,
      status: quoteData.status,
      createdAt: quoteData.createdAt,
      validUntil: quoteData.validUntil,
      contact: selectedContact ? {
        firstName: selectedContact.firstName,
        lastName: selectedContact.lastName,
        email: selectedContact.email,
        phone: selectedContact.phone,
        addressLine1: selectedContact.addressLine1,
        addressLine2: selectedContact.addressLine2,
        city: selectedContact.city,
        state: selectedContact.state,
        postalCode: selectedContact.postalCode,
      } : undefined,
      lineItems: quoteData.lineItems
        .filter(item => item.description && item.total > 0)
        .map(item => ({
          ...item,
          description: item.frequency !== 'one-time' 
            ? `${item.description} (${FREQUENCY_OPTIONS.find(f => f.value === item.frequency)?.label})`
            : item.description,
        })),
      subtotal: calculations.subtotal,
      discountType: quoteData.discountType,
      discountValue: quoteData.discountValue,
      discountAmount: calculations.discountAmount,
      taxRate: quoteData.taxRate,
      taxAmount: calculations.taxAmount,
      total: calculations.total,
      termsAndConditions: quoteData.termsAndConditions,
      notes: quoteData.notes,
    };
  }

  // Helper function to get quote data for send dialog
  function getQuoteForSend() {
    if (!isEditMode) return null;

    return {
      id: quoteData.id,
      quoteNumber: quoteData.quoteNumber,
      contact: selectedContact,
      totalAmount: calculations.total,
      validUntil: quoteData.validUntil,
      lineItems: quoteData.lineItems.filter(item => item.description && item.total > 0),
    };
  }
};

export default QuoteBuilder;
