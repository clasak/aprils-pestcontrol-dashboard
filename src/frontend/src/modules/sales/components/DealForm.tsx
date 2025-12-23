import { useState, useEffect } from 'react';
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
  Chip,
  Autocomplete,
  TextField,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  FormTextField,
  FormSelectField,
  FormSection,
  FormMultiSelectField,
  FormDateField,
  FormCurrencyField,
} from '@shared/components';
import { Deal, CreateDealDto, UpdateDealDto, dealsApi } from '../services/deals.api';
import { Contact, contactsApi } from '../services/contacts.api';
import ContactForm from './ContactForm';

interface DealFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (deal: Deal) => void;
  deal?: Deal | null; // If provided, it's edit mode
  defaultContactId?: string;
  defaultLeadId?: string;
}

const DEAL_STAGES = [
  { value: 'lead', label: 'Lead', probability: 10 },
  { value: 'inspection_scheduled', label: 'Inspection Scheduled', probability: 20 },
  { value: 'inspection_completed', label: 'Inspection Completed', probability: 40 },
  { value: 'quote_sent', label: 'Quote Sent', probability: 60 },
  { value: 'negotiation', label: 'Negotiation', probability: 70 },
  { value: 'verbal_commitment', label: 'Verbal Commitment', probability: 80 },
  { value: 'contract_sent', label: 'Contract Sent', probability: 90 },
  { value: 'closed_won', label: 'Closed Won', probability: 100 },
  { value: 'closed_lost', label: 'Closed Lost', probability: 0 },
];

const SERVICE_TYPES = [
  { value: 'general_pest', label: 'General Pest Control' },
  { value: 'termite', label: 'Termite Treatment' },
  { value: 'bed_bug', label: 'Bed Bug Treatment' },
  { value: 'rodent', label: 'Rodent Control' },
  { value: 'mosquito', label: 'Mosquito Control' },
  { value: 'wildlife', label: 'Wildlife Removal' },
  { value: 'lawn_care', label: 'Lawn Care' },
  { value: 'commercial', label: 'Commercial Services' },
];

const SERVICE_FREQUENCIES = [
  { value: 'one_time', label: 'One Time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'bi_monthly', label: 'Bi-Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
];

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family Home' },
  { value: 'multi_family', label: 'Multi-Family' },
  { value: 'condo', label: 'Condo / Townhouse' },
  { value: 'office', label: 'Office Building' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'retail', label: 'Retail Store' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'hotel', label: 'Hotel / Motel' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
].map((s) => ({ value: s, label: s }));

const PEST_TYPES = [
  'Ants', 'Roaches', 'Termites', 'Bed Bugs', 'Rodents/Mice',
  'Rats', 'Spiders', 'Wasps/Bees', 'Mosquitoes', 'Fleas',
  'Ticks', 'Silverfish', 'Beetles', 'Moths', 'Wildlife', 'Other',
];

const DEFAULT_TAGS = ['VIP', 'Recurring', 'Commercial', 'High Value', 'Referral'];

const initialFormData: CreateDealDto = {
  companyId: '',
  contactId: '',
  leadId: '',
  title: '',
  description: '',
  status: 'open',
  stage: 'lead',
  dealValueCents: 0,
  recurringRevenueCents: 0,
  serviceFrequency: 'one_time',
  contractLengthMonths: 12,
  winProbability: 10,
  expectedCloseDate: '',
  assignedTo: '',
  serviceType: '',
  pestTypes: [],
  propertyType: '',
  propertySizeSqft: undefined,
  serviceAddressLine1: '',
  serviceAddressLine2: '',
  serviceCity: '',
  serviceState: '',
  servicePostalCode: '',
  competitors: [],
  competitiveAdvantage: '',
  currentProvider: '',
  nextFollowUpDate: '',
  notes: '',
  tags: [],
  customFields: {},
};

// Helper functions
const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

const getStageIndex = (stage: string): number => {
  return DEAL_STAGES.findIndex((s) => s.value === stage);
};

const getDefaultProbability = (stage: string): number => {
  const stageConfig = DEAL_STAGES.find((s) => s.value === stage);
  return stageConfig?.probability || 10;
};

const DealForm = ({
  open,
  onClose,
  onSuccess,
  deal,
  defaultContactId,
  defaultLeadId,
}: DealFormProps) => {
  const [formData, setFormData] = useState<CreateDealDto>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactOptions, setContactOptions] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [useContactAddress, setUseContactAddress] = useState(true);

  const isEditMode = !!deal;

  // Calculated values
  const weightedValue = Math.round((formData.dealValueCents || 0) * ((formData.winProbability || 0) / 100));
  const lifetimeValue = formData.serviceFrequency !== 'one_time'
    ? (formData.recurringRevenueCents || 0) * (formData.contractLengthMonths || 12)
    : formData.dealValueCents || 0;

  // Initialize form data
  useEffect(() => {
    if (deal) {
      // Edit mode
      setFormData({
        companyId: deal.companyId,
        contactId: deal.contactId,
        leadId: deal.leadId || '',
        title: deal.title,
        description: deal.description || '',
        status: deal.status,
        stage: deal.stage,
        dealValueCents: deal.dealValueCents,
        recurringRevenueCents: deal.recurringRevenueCents || 0,
        serviceFrequency: deal.serviceFrequency || 'one_time',
        contractLengthMonths: deal.contractLengthMonths || 12,
        winProbability: deal.winProbability,
        expectedCloseDate: deal.expectedCloseDate?.split('T')[0] || '',
        assignedTo: deal.assignedTo || '',
        serviceType: deal.serviceType || '',
        pestTypes: deal.pestTypes || [],
        propertyType: deal.propertyType || '',
        propertySizeSqft: deal.propertySizeSqft,
        serviceAddressLine1: deal.serviceAddressLine1 || '',
        serviceAddressLine2: deal.serviceAddressLine2 || '',
        serviceCity: deal.serviceCity || '',
        serviceState: deal.serviceState || '',
        servicePostalCode: deal.servicePostalCode || '',
        competitors: deal.competitors || [],
        competitiveAdvantage: deal.competitiveAdvantage || '',
        currentProvider: deal.currentProvider || '',
        nextFollowUpDate: deal.nextFollowUpDate?.split('T')[0] || '',
        notes: deal.notes || '',
        tags: deal.tags || [],
        customFields: deal.customFields || {},
      });
      setSelectedContact(deal.contact);
      setUseContactAddress(false);
    } else {
      // New deal
      const newData = {
        ...initialFormData,
        companyId: 'default-company-id',
        contactId: defaultContactId || '',
        leadId: defaultLeadId || '',
      };
      setFormData(newData);
      setSelectedContact(null);
      setUseContactAddress(true);
    }
    setError(null);
    setValidationErrors({});
  }, [deal, defaultContactId, defaultLeadId, open]);

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

  // Load contact if defaultContactId is provided
  useEffect(() => {
    const loadContact = async () => {
      if (defaultContactId && !selectedContact) {
        try {
          const response = await contactsApi.getById(defaultContactId);
          setSelectedContact(response.data);
          setFormData((prev) => ({ ...prev, contactId: defaultContactId }));
        } catch {
          // Ignore errors
        }
      }
    };
    loadContact();
  }, [defaultContactId, selectedContact]);

  const updateField = <K extends keyof CreateDealDto>(
    field: K,
    value: CreateDealDto[K]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-update probability when stage changes
      if (field === 'stage' && typeof value === 'string') {
        updated.winProbability = getDefaultProbability(value);
      }
      
      return updated;
    });
    
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleContactSelect = (contact: Contact | null) => {
    setSelectedContact(contact);
    if (contact) {
      const updates: Partial<CreateDealDto> = {
        contactId: contact.id,
        title: formData.title || `${contact.firstName} ${contact.lastName} - Service`,
        propertyType: formData.propertyType || contact.propertyType || '',
        propertySizeSqft: formData.propertySizeSqft || contact.propertySizeSqft,
      };
      
      // Copy address if enabled
      if (useContactAddress) {
        updates.serviceAddressLine1 = contact.addressLine1 || '';
        updates.serviceAddressLine2 = contact.addressLine2 || '';
        updates.serviceCity = contact.city || '';
        updates.serviceState = contact.state || '';
        updates.servicePostalCode = contact.postalCode || '';
      }
      
      setFormData((prev) => ({ ...prev, ...updates }));
    } else {
      setFormData((prev) => ({ ...prev, contactId: '' }));
    }
  };

  const handleNewContactCreated = (contact: Contact) => {
    handleContactSelect(contact);
    setShowContactForm(false);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.contactId) {
      errors.contactId = 'Contact is required';
    }
    if (!formData.title.trim()) {
      errors.title = 'Deal title is required';
    }
    if (!formData.dealValueCents || formData.dealValueCents <= 0) {
      errors.dealValueCents = 'Deal value must be greater than 0';
    }
    if (!formData.expectedCloseDate) {
      errors.expectedCloseDate = 'Expected close date is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setError('Please fix the validation errors');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result: Deal;

      if (isEditMode && deal) {
        const updateData: UpdateDealDto = { ...formData };
        const response = await dealsApi.update(deal.id, updateData);
        result = response.data;
      } else {
        const response = await dealsApi.create(formData);
        result = response.data;
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save deal');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Current stage index for stepper
  const currentStageIndex = getStageIndex(formData.stage || 'lead');
  const activeStages = DEAL_STAGES.filter((s) => !['closed_won', 'closed_lost'].includes(s.value));

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { maxHeight: '95vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span">
            {isEditMode ? 'Edit Deal' : 'New Deal'}
          </Typography>
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

          {/* Pipeline Stage Stepper */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Deal Pipeline Stage
            </Typography>
            <Stepper
              activeStep={Math.min(currentStageIndex, activeStages.length - 1)}
              alternativeLabel
              sx={{ mt: 2 }}
            >
              {activeStages.map((stage, index) => (
                <Step key={stage.value} completed={index < currentStageIndex}>
                  <StepLabel
                    onClick={() => updateField('stage', stage.value)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="caption">{stage.label}</Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {stage.probability}%
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Value Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Deal Value
                </Typography>
                <Typography variant="h5" color="primary" fontWeight={600}>
                  {formatCurrency(formData.dealValueCents || 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Win Probability
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formData.winProbability}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                <Typography variant="caption" color="text.secondary">
                  Weighted Value
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>
                  {formatCurrency(weightedValue)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Contact Selection */}
          <FormSection title="Customer" columns={1}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Autocomplete
                sx={{ flex: 1 }}
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
                    label="Select Contact"
                    placeholder="Search by name, email, or phone..."
                    error={!!validationErrors.contactId}
                    helperText={validationErrors.contactId}
                    required
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
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => setShowContactForm(true)}
                sx={{ minWidth: 140, height: 56 }}
              >
                New Contact
              </Button>
            </Box>
          </FormSection>

          {/* Deal Details */}
          <FormSection title="Deal Details" columns={2}>
            <FormTextField
              name="title"
              label="Deal Title"
              value={formData.title}
              onChange={(v) => updateField('title', v)}
              error={validationErrors.title}
              required
              placeholder="e.g., Smith Residence - Annual Pest Control"
            />
            <FormSelectField
              name="stage"
              label="Pipeline Stage"
              value={formData.stage || 'lead'}
              onChange={(v) => updateField('stage', v)}
              options={DEAL_STAGES}
            />
          </FormSection>

          <FormSection columns={3}>
            <FormCurrencyField
              name="dealValue"
              label="Deal Value"
              value={(formData.dealValueCents || 0) / 100}
              onChange={(v) => updateField('dealValueCents', Math.round(v * 100))}
              error={validationErrors.dealValueCents}
              required
            />
            <FormTextField
              name="winProbability"
              label="Win Probability (%)"
              type="number"
              value={formData.winProbability?.toString() || '10'}
              onChange={(v) => updateField('winProbability', parseInt(v) || 0)}
              inputProps={{ min: 0, max: 100 }}
            />
            <FormDateField
              name="expectedCloseDate"
              label="Expected Close Date"
              value={formData.expectedCloseDate || ''}
              onChange={(v) => updateField('expectedCloseDate', v)}
              error={validationErrors.expectedCloseDate}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </FormSection>

          <Divider sx={{ my: 3 }} />

          {/* Service Information */}
          <FormSection title="Service Information" columns={2}>
            <FormSelectField
              name="serviceType"
              label="Service Type"
              value={formData.serviceType || ''}
              onChange={(v) => updateField('serviceType', v)}
              options={SERVICE_TYPES}
              placeholder="Select service"
            />
            <FormSelectField
              name="serviceFrequency"
              label="Service Frequency"
              value={formData.serviceFrequency || 'one_time'}
              onChange={(v) => updateField('serviceFrequency', v)}
              options={SERVICE_FREQUENCIES}
            />
          </FormSection>

          {formData.serviceFrequency && formData.serviceFrequency !== 'one_time' && (
            <FormSection columns={3}>
              <FormCurrencyField
                name="recurringRevenue"
                label="Recurring Revenue (per service)"
                value={(formData.recurringRevenueCents || 0) / 100}
                onChange={(v) => updateField('recurringRevenueCents', Math.round(v * 100))}
              />
              <FormTextField
                name="contractLength"
                label="Contract Length (months)"
                type="number"
                value={formData.contractLengthMonths?.toString() || '12'}
                onChange={(v) => updateField('contractLengthMonths', parseInt(v) || 12)}
                inputProps={{ min: 1, max: 60 }}
              />
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'info.50' }}>
                <Typography variant="caption" color="text.secondary">
                  Lifetime Value
                </Typography>
                <Typography variant="h6" color="info.main" fontWeight={600}>
                  {formatCurrency(lifetimeValue)}
                </Typography>
              </Paper>
            </FormSection>
          )}

          <FormSection columns={2}>
            <FormMultiSelectField
              name="pestTypes"
              label="Pest Types"
              value={formData.pestTypes || []}
              onChange={(v) => updateField('pestTypes', v)}
              options={PEST_TYPES.map((p) => ({ value: p, label: p }))}
              placeholder="Select pest types..."
            />
            <FormSelectField
              name="propertyType"
              label="Property Type"
              value={formData.propertyType || ''}
              onChange={(v) => updateField('propertyType', v)}
              options={PROPERTY_TYPES}
              placeholder="Select property type"
            />
          </FormSection>

          <Divider sx={{ my: 3 }} />

          {/* Service Address */}
          <FormSection title="Service Address" columns={1}>
            <FormTextField
              name="serviceAddressLine1"
              label="Address Line 1"
              value={formData.serviceAddressLine1 || ''}
              onChange={(v) => updateField('serviceAddressLine1', v)}
              placeholder="Street address"
            />
            <FormTextField
              name="serviceAddressLine2"
              label="Address Line 2"
              value={formData.serviceAddressLine2 || ''}
              onChange={(v) => updateField('serviceAddressLine2', v)}
              placeholder="Apt, Suite, Unit, etc."
            />
          </FormSection>

          <FormSection columns={3}>
            <FormTextField
              name="serviceCity"
              label="City"
              value={formData.serviceCity || ''}
              onChange={(v) => updateField('serviceCity', v)}
            />
            <FormSelectField
              name="serviceState"
              label="State"
              value={formData.serviceState || ''}
              onChange={(v) => updateField('serviceState', v)}
              options={US_STATES}
              placeholder="Select state"
            />
            <FormTextField
              name="servicePostalCode"
              label="ZIP Code"
              value={formData.servicePostalCode || ''}
              onChange={(v) => updateField('servicePostalCode', v)}
            />
          </FormSection>

          <Divider sx={{ my: 3 }} />

          {/* Competition & Notes */}
          <FormSection title="Competition" columns={2}>
            <FormTextField
              name="currentProvider"
              label="Current Provider"
              value={formData.currentProvider || ''}
              onChange={(v) => updateField('currentProvider', v)}
              placeholder="Who are they using now?"
            />
            <FormTextField
              name="competitiveAdvantage"
              label="Our Competitive Advantage"
              value={formData.competitiveAdvantage || ''}
              onChange={(v) => updateField('competitiveAdvantage', v)}
              placeholder="Why will they choose us?"
            />
          </FormSection>

          <FormSection title="Follow-up & Notes" columns={2}>
            <FormDateField
              name="nextFollowUpDate"
              label="Next Follow-up Date"
              value={formData.nextFollowUpDate || ''}
              onChange={(v) => updateField('nextFollowUpDate', v)}
              min={new Date().toISOString().split('T')[0]}
            />
            <FormMultiSelectField
              name="tags"
              label="Tags"
              value={formData.tags || []}
              onChange={(v) => updateField('tags', v)}
              options={DEFAULT_TAGS.map((t) => ({ value: t, label: t }))}
              freeSolo
              placeholder="Add tags..."
            />
          </FormSection>

          <FormSection columns={1}>
            <FormTextField
              name="notes"
              label="Internal Notes"
              value={formData.notes || ''}
              onChange={(v) => updateField('notes', v)}
              multiline
              rows={3}
              placeholder="Notes about this deal..."
            />
          </FormSection>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isEditMode ? 'Save Changes' : 'Create Deal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Form Dialog */}
      <ContactForm
        open={showContactForm}
        onClose={() => setShowContactForm(false)}
        onSuccess={handleNewContactCreated}
      />
    </>
  );
};

export default DealForm;

