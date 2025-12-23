import { useState, useEffect, useCallback } from 'react';
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
  Tabs,
  Tab,
  Chip,
  TextField,
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import {
  FormTextField,
  FormSelectField,
  FormRadioGroup,
  FormSection,
  FormMultiSelectField,
} from '@shared/components';
import { Contact, CreateContactDto, UpdateContactDto, contactsApi } from '../services/contacts.api';

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (contact: Contact) => void;
  contact?: Contact | null; // If provided, it's edit mode
  defaultValues?: Partial<CreateContactDto>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const CONTACT_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'referral_partner', label: 'Referral Partner' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'other', label: 'Other' },
];

const CONTACT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'do_not_contact', label: 'Do Not Contact' },
];

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family Home' },
  { value: 'multi_family', label: 'Multi-Family / Apartment' },
  { value: 'condo', label: 'Condo / Townhouse' },
  { value: 'mobile_home', label: 'Mobile Home' },
  { value: 'office', label: 'Office Building' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'retail', label: 'Retail Store' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'healthcare', label: 'Healthcare Facility' },
  { value: 'education', label: 'School / University' },
  { value: 'hotel', label: 'Hotel / Motel' },
  { value: 'other', label: 'Other' },
];

const CONTACT_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'text', label: 'Text Message' },
  { value: 'any', label: 'Any' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
].map((s) => ({ value: s, label: s }));

const LEAD_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'yelp', label: 'Yelp' },
  { value: 'referral', label: 'Referral' },
  { value: 'door_knock', label: 'Door Knock' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'other', label: 'Other' },
];

const DEFAULT_TAGS = [
  'VIP', 'Commercial', 'Residential', 'Priority', 'Recurring',
  'New Customer', 'Long-term', 'Referral Source',
];

const initialFormData: CreateContactDto = {
  companyId: '', // Will be set from user context
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  mobilePhone: '',
  workPhone: '',
  title: '',
  department: '',
  type: 'residential',
  status: 'active',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'USA',
  propertyType: '',
  propertySizeSqft: undefined,
  lotSizeAcres: undefined,
  yearBuilt: undefined,
  companyName: '',
  industry: '',
  preferredContactMethod: 'any',
  bestContactTime: '',
  notes: '',
  leadSource: '',
  referralSource: '',
  tags: [],
  customFields: {},
};

const ContactForm = ({
  open,
  onClose,
  onSuccess,
  contact,
  defaultValues,
}: ContactFormProps) => {
  const [formData, setFormData] = useState<CreateContactDto>(initialFormData);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isEditMode = !!contact;

  // Initialize form data
  useEffect(() => {
    if (contact) {
      // Edit mode - populate from contact
      setFormData({
        companyId: contact.companyId,
        firstName: contact.firstName,
        lastName: contact.lastName,
        middleName: contact.middleName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobilePhone: contact.mobilePhone || '',
        workPhone: contact.workPhone || '',
        title: contact.title || '',
        department: contact.department || '',
        type: contact.type,
        status: contact.status,
        addressLine1: contact.addressLine1 || '',
        addressLine2: contact.addressLine2 || '',
        city: contact.city || '',
        state: contact.state || '',
        postalCode: contact.postalCode || '',
        country: contact.country || 'USA',
        propertyType: contact.propertyType || '',
        propertySizeSqft: contact.propertySizeSqft,
        lotSizeAcres: contact.lotSizeAcres,
        yearBuilt: contact.yearBuilt,
        companyName: contact.companyName || '',
        industry: contact.industry || '',
        preferredContactMethod: contact.preferredContactMethod || 'any',
        bestContactTime: contact.bestContactTime || '',
        notes: contact.notes || '',
        leadSource: contact.leadSource || '',
        referralSource: contact.referralSource || '',
        tags: contact.tags || [],
        customFields: contact.customFields || {},
      });
    } else if (defaultValues) {
      // New with defaults
      setFormData({ ...initialFormData, ...defaultValues });
    } else {
      // New contact
      setFormData({ ...initialFormData, companyId: 'default-company-id' }); // TODO: Get from auth context
    }
    setTabValue(0);
    setError(null);
    setDuplicateWarning(null);
    setValidationErrors({});
  }, [contact, defaultValues, open]);

  // Check for duplicate email/phone
  const checkDuplicates = useCallback(
    async (field: 'email' | 'phone', value: string) => {
      if (!value || value.length < 3) {
        setDuplicateWarning(null);
        return;
      }
      
      // Skip if editing and value hasn't changed
      if (isEditMode && contact) {
        if (field === 'email' && value === contact.email) return;
        if (field === 'phone' && value === contact.phone) return;
      }

      try {
        const params: Record<string, string> = {};
        params[field] = value;
        const response = await contactsApi.getAll({ search: value, limit: 5 });
        
        if (response.data && response.data.length > 0) {
          const matches = response.data.filter(
            (c) => c.id !== contact?.id && (c.email === value || c.phone === value)
          );
          if (matches.length > 0) {
            setDuplicateWarning(
              `A contact with this ${field} already exists: ${matches[0].firstName} ${matches[0].lastName}`
            );
            return;
          }
        }
        setDuplicateWarning(null);
      } catch {
        // Ignore errors in duplicate check
      }
    },
    [contact, isEditMode]
  );

  // Debounced duplicate check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email) {
        checkDuplicates('email', formData.email);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email, checkDuplicates]);

  const updateField = <K extends keyof CreateContactDto>(
    field: K,
    value: CreateContactDto[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.email && !formData.phone && !formData.mobilePhone) {
      errors.email = 'At least one contact method (email or phone) is required';
      errors.phone = 'At least one contact method (email or phone) is required';
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
      let result: Contact;

      if (isEditMode && contact) {
        // Update existing contact
        const updateData: UpdateContactDto = { ...formData };
        const response = await contactsApi.update(contact.id, updateData);
        result = response.data;
      } else {
        // Create new contact
        const response = await contactsApi.create(formData);
        result = response.data;
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save contact');
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
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="span">
          {isEditMode ? 'Edit Contact' : 'New Contact'}
        </Typography>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
      >
        <Tab icon={<PersonIcon />} iconPosition="start" label="Basic Info" />
        <Tab icon={<HomeIcon />} iconPosition="start" label="Address & Property" />
        <Tab icon={<BusinessIcon />} iconPosition="start" label="Business & Notes" />
      </Tabs>

      <DialogContent sx={{ pt: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {duplicateWarning && (
          <Alert severity="warning" sx={{ mb: 2, mt: 2 }}>
            {duplicateWarning}
          </Alert>
        )}

        {/* Tab 1: Basic Info */}
        <TabPanel value={tabValue} index={0}>
          <FormSection title="Personal Information" columns={3}>
            <FormTextField
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={(v) => updateField('firstName', v)}
              error={validationErrors.firstName}
              required
            />
            <FormTextField
              name="middleName"
              label="Middle Name"
              value={formData.middleName || ''}
              onChange={(v) => updateField('middleName', v)}
            />
            <FormTextField
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={(v) => updateField('lastName', v)}
              error={validationErrors.lastName}
              required
            />
          </FormSection>

          <FormSection title="Contact Information" columns={2}>
            <FormTextField
              name="email"
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(v) => updateField('email', v)}
              error={validationErrors.email}
            />
            <FormTextField
              name="phone"
              label="Phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(v) => updateField('phone', v)}
              error={validationErrors.phone}
            />
            <FormTextField
              name="mobilePhone"
              label="Mobile Phone"
              type="tel"
              value={formData.mobilePhone || ''}
              onChange={(v) => updateField('mobilePhone', v)}
            />
            <FormTextField
              name="workPhone"
              label="Work Phone"
              type="tel"
              value={formData.workPhone || ''}
              onChange={(v) => updateField('workPhone', v)}
            />
          </FormSection>

          <FormSection title="Classification" columns={2}>
            <FormSelectField
              name="type"
              label="Contact Type"
              value={formData.type || 'residential'}
              onChange={(v) => updateField('type', v)}
              options={CONTACT_TYPES}
              required
            />
            <FormRadioGroup
              name="status"
              label="Status"
              value={formData.status || 'active'}
              onChange={(v) => updateField('status', v)}
              options={CONTACT_STATUSES}
              row
            />
          </FormSection>

          <FormSection title="Tags" columns={1}>
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
        </TabPanel>

        {/* Tab 2: Address & Property */}
        <TabPanel value={tabValue} index={1}>
          <FormSection title="Address" columns={1}>
            <FormTextField
              name="addressLine1"
              label="Address Line 1"
              value={formData.addressLine1 || ''}
              onChange={(v) => updateField('addressLine1', v)}
              placeholder="Street address"
            />
            <FormTextField
              name="addressLine2"
              label="Address Line 2"
              value={formData.addressLine2 || ''}
              onChange={(v) => updateField('addressLine2', v)}
              placeholder="Apt, Suite, Unit, etc."
            />
          </FormSection>

          <FormSection columns={3}>
            <FormTextField
              name="city"
              label="City"
              value={formData.city || ''}
              onChange={(v) => updateField('city', v)}
            />
            <FormSelectField
              name="state"
              label="State"
              value={formData.state || ''}
              onChange={(v) => updateField('state', v)}
              options={US_STATES}
              placeholder="Select state"
            />
            <FormTextField
              name="postalCode"
              label="ZIP Code"
              value={formData.postalCode || ''}
              onChange={(v) => updateField('postalCode', v)}
            />
          </FormSection>

          <Divider sx={{ my: 3 }} />

          <FormSection title="Property Information" columns={2}>
            <FormSelectField
              name="propertyType"
              label="Property Type"
              value={formData.propertyType || ''}
              onChange={(v) => updateField('propertyType', v)}
              options={PROPERTY_TYPES}
              placeholder="Select type"
            />
            <FormTextField
              name="propertySizeSqft"
              label="Property Size (sq ft)"
              type="number"
              value={formData.propertySizeSqft?.toString() || ''}
              onChange={(v) => updateField('propertySizeSqft', v ? parseInt(v) : undefined)}
              inputProps={{ min: 0 }}
            />
            <FormTextField
              name="lotSizeAcres"
              label="Lot Size (acres)"
              type="number"
              value={formData.lotSizeAcres?.toString() || ''}
              onChange={(v) => updateField('lotSizeAcres', v ? parseFloat(v) : undefined)}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <FormTextField
              name="yearBuilt"
              label="Year Built"
              type="number"
              value={formData.yearBuilt?.toString() || ''}
              onChange={(v) => updateField('yearBuilt', v ? parseInt(v) : undefined)}
              inputProps={{ min: 1800, max: new Date().getFullYear() }}
            />
          </FormSection>
        </TabPanel>

        {/* Tab 3: Business & Notes */}
        <TabPanel value={tabValue} index={2}>
          <FormSection title="Business Information" columns={2}>
            <FormTextField
              name="companyName"
              label="Company Name"
              value={formData.companyName || ''}
              onChange={(v) => updateField('companyName', v)}
            />
            <FormTextField
              name="industry"
              label="Industry"
              value={formData.industry || ''}
              onChange={(v) => updateField('industry', v)}
            />
            <FormTextField
              name="title"
              label="Job Title"
              value={formData.title || ''}
              onChange={(v) => updateField('title', v)}
            />
            <FormTextField
              name="department"
              label="Department"
              value={formData.department || ''}
              onChange={(v) => updateField('department', v)}
            />
          </FormSection>

          <FormSection title="Lead Source" columns={2}>
            <FormSelectField
              name="leadSource"
              label="Lead Source"
              value={formData.leadSource || ''}
              onChange={(v) => updateField('leadSource', v)}
              options={LEAD_SOURCES}
              placeholder="Select source"
            />
            <FormTextField
              name="referralSource"
              label="Referral Source"
              value={formData.referralSource || ''}
              onChange={(v) => updateField('referralSource', v)}
              placeholder="Who referred them?"
            />
          </FormSection>

          <FormSection title="Communication Preferences" columns={2}>
            <FormSelectField
              name="preferredContactMethod"
              label="Preferred Contact Method"
              value={formData.preferredContactMethod || 'any'}
              onChange={(v) => updateField('preferredContactMethod', v)}
              options={CONTACT_METHODS}
            />
            <FormTextField
              name="bestContactTime"
              label="Best Time to Contact"
              value={formData.bestContactTime || ''}
              onChange={(v) => updateField('bestContactTime', v)}
              placeholder="e.g., Weekdays 9-5, Evenings only"
            />
          </FormSection>

          <FormSection title="Notes" columns={1}>
            <FormTextField
              name="notes"
              label="Notes"
              value={formData.notes || ''}
              onChange={(v) => updateField('notes', v)}
              multiline
              rows={4}
              placeholder="Any additional notes about this contact..."
            />
          </FormSection>
        </TabPanel>
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
          {isEditMode ? 'Save Changes' : 'Create Contact'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactForm;

