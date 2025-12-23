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
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  FormTextField,
  FormSelectField,
  FormSection,
  FormMultiSelectField,
  FormDateField,
  FormCurrencyField,
} from '@shared/components';
import { Lead, CreateLeadDto, UpdateLeadDto, leadsApi } from '../services/leads.api';
import { Contact, contactsApi } from '../services/contacts.api';
import ContactForm from './ContactForm';

interface LeadFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (lead: Lead) => void;
  lead?: Lead | null; // If provided, it's edit mode
  defaultContactId?: string;
}

const LEAD_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'nurturing', label: 'Nurturing' },
];

const LEAD_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const LEAD_SOURCES = [
  { value: 'website', label: 'Website Form' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'facebook_ads', label: 'Facebook Ads' },
  { value: 'yelp', label: 'Yelp' },
  { value: 'referral', label: 'Referral' },
  { value: 'door_knock', label: 'Door Knock' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];

const LEAD_SOURCE_CATEGORIES = [
  { value: 'organic', label: 'Organic' },
  { value: 'paid', label: 'Paid' },
  { value: 'referral', label: 'Referral' },
  { value: 'partner', label: 'Partner' },
  { value: 'direct', label: 'Direct' },
  { value: 'other', label: 'Other' },
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
  { value: 'inspection', label: 'Inspection Only' },
];

const PEST_TYPES = [
  'Ants',
  'Roaches',
  'Termites',
  'Bed Bugs',
  'Rodents/Mice',
  'Rats',
  'Spiders',
  'Wasps/Bees',
  'Mosquitoes',
  'Fleas',
  'Ticks',
  'Silverfish',
  'Beetles',
  'Moths',
  'Wildlife',
  'Other',
];

const SEVERITY_LEVELS = [
  { value: 'minor', label: 'Minor - Occasional sightings' },
  { value: 'moderate', label: 'Moderate - Regular presence' },
  { value: 'severe', label: 'Severe - Heavy infestation' },
  { value: 'emergency', label: 'Emergency - Immediate action needed' },
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low - No rush' },
  { value: 'normal', label: 'Normal - Within a week' },
  { value: 'high', label: 'High - Within 2-3 days' },
  { value: 'urgent', label: 'Urgent - Same day / Next day' },
];

const DEFAULT_TAGS = ['Hot Lead', 'Commercial', 'Recurring Interest', 'Price Sensitive', 'Referral'];

const initialFormData: CreateLeadDto = {
  companyId: '',
  contactId: '',
  title: '',
  description: '',
  status: 'new',
  priority: 'medium',
  leadSource: '',
  leadSourceCategory: 'organic',
  campaignId: '',
  referralSource: '',
  serviceType: '',
  pestTypes: [],
  severityLevel: '',
  propertyType: '',
  propertySizeSqft: undefined,
  estimatedValueCents: undefined,
  expectedCloseDate: '',
  urgency: 'normal',
  nextFollowUpDate: '',
  isQualified: false,
  qualificationNotes: '',
  notes: '',
  tags: [],
  customFields: {},
};

// Lead score color and display
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4caf50'; // green
  if (score >= 60) return '#8bc34a'; // light green
  if (score >= 40) return '#ff9800'; // orange
  if (score >= 20) return '#ff5722'; // deep orange
  return '#f44336'; // red
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Hot';
  if (score >= 60) return 'Warm';
  if (score >= 40) return 'Neutral';
  if (score >= 20) return 'Cold';
  return 'Very Cold';
};

const LeadForm = ({
  open,
  onClose,
  onSuccess,
  lead,
  defaultContactId,
}: LeadFormProps) => {
  const [formData, setFormData] = useState<CreateLeadDto>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactOptions, setContactOptions] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const isEditMode = !!lead;

  // Initialize form data
  useEffect(() => {
    if (lead) {
      // Edit mode
      setFormData({
        companyId: lead.companyId,
        contactId: lead.contactId,
        title: lead.title,
        description: lead.description || '',
        status: lead.status,
        priority: lead.priority,
        leadSource: lead.leadSource,
        leadSourceCategory: lead.leadSourceCategory,
        campaignId: lead.campaignId || '',
        referralSource: lead.referralSource || '',
        serviceType: lead.serviceType || '',
        pestTypes: lead.pestTypes || [],
        severityLevel: lead.severityLevel || '',
        propertyType: lead.propertyType || '',
        propertySizeSqft: lead.propertySizeSqft,
        estimatedValueCents: lead.estimatedValueCents,
        expectedCloseDate: lead.expectedCloseDate?.split('T')[0] || '',
        urgency: lead.urgency || 'normal',
        nextFollowUpDate: lead.nextFollowUpDate?.split('T')[0] || '',
        isQualified: lead.isQualified,
        qualificationNotes: lead.qualificationNotes || '',
        notes: lead.notes || '',
        tags: lead.tags || [],
        customFields: lead.customFields || {},
      });
      setSelectedContact(lead.contact);
    } else {
      // New lead
      const newData = {
        ...initialFormData,
        companyId: 'default-company-id', // TODO: Get from auth context
        contactId: defaultContactId || '',
      };
      setFormData(newData);
      setSelectedContact(null);
    }
    setError(null);
    setValidationErrors({});
  }, [lead, defaultContactId, open]);

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

  const updateField = <K extends keyof CreateLeadDto>(
    field: K,
    value: CreateLeadDto[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      setFormData((prev) => ({
        ...prev,
        contactId: contact.id,
        title: prev.title || `Lead from ${contact.firstName} ${contact.lastName}`,
        propertyType: prev.propertyType || contact.propertyType || '',
        propertySizeSqft: prev.propertySizeSqft || contact.propertySizeSqft,
      }));
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
      errors.title = 'Title is required';
    }
    if (!formData.leadSource) {
      errors.leadSource = 'Lead source is required';
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
      let result: Lead;

      if (isEditMode && lead) {
        const updateData: UpdateLeadDto = { ...formData };
        const response = await leadsApi.update(lead.id, updateData);
        result = response.data;
      } else {
        const response = await leadsApi.create(formData);
        result = response.data;
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save lead');
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
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" component="span">
              {isEditMode ? 'Edit Lead' : 'New Lead'}
            </Typography>
            {isEditMode && lead && (
              <Chip
                icon={<TrendingUpIcon />}
                label={`Score: ${lead.leadScore} (${getScoreLabel(lead.leadScore)})`}
                sx={{
                  bgcolor: getScoreColor(lead.leadScore),
                  color: 'white',
                  fontWeight: 600,
                }}
              />
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

          {/* Lead Score Preview (for existing leads) */}
          {isEditMode && lead && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Lead Score Breakdown
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: getScoreColor(lead.leadScore) }}>
                  {lead.leadScore}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={lead.leadScore}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getScoreColor(lead.leadScore),
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
                <Chip label={getScoreLabel(lead.leadScore)} size="small" />
              </Box>
            </Paper>
          )}

          {/* Contact Selection */}
          <FormSection title="Contact" columns={1}>
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
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option.firstName} {option.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email} • {option.phone}
                      </Typography>
                    </Box>
                  </li>
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

          {/* Lead Details */}
          <FormSection title="Lead Details" columns={2}>
            <FormTextField
              name="title"
              label="Lead Title"
              value={formData.title}
              onChange={(v) => updateField('title', v)}
              error={validationErrors.title}
              required
              placeholder="e.g., Termite inspection request"
            />
            <FormSelectField
              name="priority"
              label="Priority"
              value={formData.priority || 'medium'}
              onChange={(v) => updateField('priority', v)}
              options={LEAD_PRIORITIES}
            />
          </FormSection>

          <FormSection columns={2}>
            <FormSelectField
              name="leadSource"
              label="Lead Source"
              value={formData.leadSource}
              onChange={(v) => updateField('leadSource', v)}
              options={LEAD_SOURCES}
              error={validationErrors.leadSource}
              required
            />
            <FormSelectField
              name="leadSourceCategory"
              label="Source Category"
              value={formData.leadSourceCategory || 'organic'}
              onChange={(v) => updateField('leadSourceCategory', v)}
              options={LEAD_SOURCE_CATEGORIES}
            />
          </FormSection>

          {formData.leadSource === 'referral' && (
            <FormSection columns={1}>
              <FormTextField
                name="referralSource"
                label="Referral Source"
                value={formData.referralSource || ''}
                onChange={(v) => updateField('referralSource', v)}
                placeholder="Who referred this lead?"
              />
            </FormSection>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Service Information */}
          <FormSection title="Service Information" columns={2}>
            <FormSelectField
              name="serviceType"
              label="Service Type"
              value={formData.serviceType || ''}
              onChange={(v) => updateField('serviceType', v)}
              options={SERVICE_TYPES}
              placeholder="Select service type"
            />
            <FormMultiSelectField
              name="pestTypes"
              label="Pest Types"
              value={formData.pestTypes || []}
              onChange={(v) => updateField('pestTypes', v)}
              options={PEST_TYPES.map((p) => ({ value: p, label: p }))}
              placeholder="Select pest types..."
            />
          </FormSection>

          <FormSection columns={2}>
            <FormSelectField
              name="severityLevel"
              label="Severity Level"
              value={formData.severityLevel || ''}
              onChange={(v) => updateField('severityLevel', v)}
              options={SEVERITY_LEVELS}
              placeholder="Select severity"
            />
            <FormSelectField
              name="urgency"
              label="Urgency"
              value={formData.urgency || 'normal'}
              onChange={(v) => updateField('urgency', v)}
              options={URGENCY_LEVELS}
            />
          </FormSection>

          <Divider sx={{ my: 3 }} />

          {/* Value & Timeline */}
          <FormSection title="Value & Timeline" columns={2}>
            <FormCurrencyField
              name="estimatedValue"
              label="Estimated Value"
              value={(formData.estimatedValueCents || 0) / 100}
              onChange={(v) => updateField('estimatedValueCents', Math.round(v * 100))}
              helperText="Estimated deal value if converted"
            />
            <FormDateField
              name="expectedCloseDate"
              label="Expected Close Date"
              value={formData.expectedCloseDate || ''}
              onChange={(v) => updateField('expectedCloseDate', v)}
            />
          </FormSection>

          <FormSection columns={2}>
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

          <Divider sx={{ my: 3 }} />

          {/* Description & Notes */}
          <FormSection title="Notes" columns={1}>
            <FormTextField
              name="description"
              label="Description"
              value={formData.description || ''}
              onChange={(v) => updateField('description', v)}
              multiline
              rows={2}
              placeholder="Brief description of the lead..."
            />
            <FormTextField
              name="notes"
              label="Internal Notes"
              value={formData.notes || ''}
              onChange={(v) => updateField('notes', v)}
              multiline
              rows={3}
              placeholder="Notes for your team..."
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
            {isEditMode ? 'Save Changes' : 'Create Lead'}
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

export default LeadForm;

