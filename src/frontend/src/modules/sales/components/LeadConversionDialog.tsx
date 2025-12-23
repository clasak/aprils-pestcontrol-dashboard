/**
 * Lead Conversion Dialog
 * 
 * A modal dialog for converting leads to opportunities.
 * Handles the workflow of creating Account, Contact, and Opportunity.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { leadConversionService, ConversionData } from '../../../services/leadConversion.service';
import { accountsService } from '../../../services/accounts.service';
import type { Lead, Account } from '../../../lib/database.types';

interface LeadConversionDialogProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess: (opportunityId: string) => void;
}

const steps = ['Account', 'Contact', 'Opportunity', 'Review'];

export const LeadConversionDialog: React.FC<LeadConversionDialogProps> = ({
  open,
  onClose,
  lead,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingAccounts, setExistingAccounts] = useState<Account[]>([]);
  const [searchingAccounts, setSearchingAccounts] = useState(false);

  // Form data
  const [formData, setFormData] = useState<ConversionData>({
    createNewAccount: true,
    accountName: '',
    accountIndustry: '',
    accountPhone: '',
    accountAddress: {},
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    isDecisionMaker: true,
    opportunityName: '',
    opportunityAmount: 0,
    expectedCloseDate: '',
    serviceType: '',
    serviceFrequency: '',
    contractLengthMonths: 12,
    description: '',
    nextStep: 'Schedule initial consultation',
    nextStepDate: '',
  });

  // Initialize form with lead data
  useEffect(() => {
    if (lead && open) {
      const name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
      const suggestedAccountName = lead.company_name || name || 'New Account';
      const suggestedOpportunityName = `${suggestedAccountName} - ${lead.property_type || 'Pest Control'}`;
      
      // Set next step date to 3 days from now
      const nextStepDate = new Date();
      nextStepDate.setDate(nextStepDate.getDate() + 3);
      
      // Set expected close date to 30 days from now
      const closeDate = new Date();
      closeDate.setDate(closeDate.getDate() + 30);

      setFormData((prev) => ({
        ...prev,
        accountName: suggestedAccountName,
        accountPhone: lead.phone || '',
        accountAddress: {
          line1: lead.address_line1 || '',
          city: lead.city || '',
          state: lead.state || '',
          postalCode: lead.postal_code || '',
        },
        firstName: lead.first_name || '',
        lastName: lead.last_name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        jobTitle: lead.job_title || '',
        opportunityName: suggestedOpportunityName,
        opportunityAmount: lead.estimated_value || 0,
        serviceType: lead.property_type || '',
        expectedCloseDate: closeDate.toISOString().split('T')[0],
        nextStepDate: nextStepDate.toISOString().split('T')[0],
      }));

      setActiveStep(0);
      setError(null);
      setSuccess(false);
    }
  }, [lead, open]);

  // Search for existing accounts
  const handleAccountSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setExistingAccounts([]);
      return;
    }

    setSearchingAccounts(true);
    try {
      const accounts = await accountsService.search(query);
      setExistingAccounts(accounts);
    } catch (err) {
      console.error('Error searching accounts:', err);
    } finally {
      setSearchingAccounts(false);
    }
  };

  const handleInputChange = (field: keyof ConversionData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      accountAddress: { ...prev.accountAddress, [field]: value },
    }));
  };

  const validateStep = (): boolean => {
    switch (activeStep) {
      case 0: // Account
        if (formData.createNewAccount && !formData.accountName?.trim()) {
          setError('Account name is required');
          return false;
        }
        if (!formData.createNewAccount && !formData.existingAccountId) {
          setError('Please select an existing account');
          return false;
        }
        break;
      case 1: // Contact
        if (!formData.firstName?.trim()) {
          setError('First name is required');
          return false;
        }
        if (!formData.lastName?.trim()) {
          setError('Last name is required');
          return false;
        }
        break;
      case 2: // Opportunity
        if (!formData.opportunityName?.trim()) {
          setError('Opportunity name is required');
          return false;
        }
        if (!formData.opportunityAmount || formData.opportunityAmount <= 0) {
          setError('Amount must be greater than 0');
          return false;
        }
        if (!formData.expectedCloseDate) {
          setError('Expected close date is required');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleConvert = async () => {
    if (!lead) return;

    setLoading(true);
    setError(null);

    try {
      const result = await leadConversionService.convertLead(lead.id, formData);

      if (result.success && result.opportunity) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess(result.opportunity!.id);
          handleClose();
        }, 1500);
      } else {
        setError(result.error || 'Conversion failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const renderAccountStep = () => (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={formData.createNewAccount}
            onChange={(e) => handleInputChange('createNewAccount', e.target.checked)}
          />
        }
        label="Create new account"
        sx={{ mb: 2 }}
      />

      {formData.createNewAccount ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Account Name"
              value={formData.accountName}
              onChange={(e) => handleInputChange('accountName', e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Industry"
              value={formData.accountIndustry}
              onChange={(e) => handleInputChange('accountIndustry', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.accountPhone}
              onChange={(e) => handleInputChange('accountPhone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.accountAddress?.line1 || ''}
              onChange={(e) => handleAddressChange('line1', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              value={formData.accountAddress?.city || ''}
              onChange={(e) => handleAddressChange('city', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              value={formData.accountAddress?.state || ''}
              onChange={(e) => handleAddressChange('state', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Postal Code"
              value={formData.accountAddress?.postalCode || ''}
              onChange={(e) => handleAddressChange('postalCode', e.target.value)}
            />
          </Grid>
        </Grid>
      ) : (
        <Autocomplete
          options={existingAccounts}
          getOptionLabel={(option) => option.name}
          loading={searchingAccounts}
          onInputChange={(_, value) => handleAccountSearch(value)}
          onChange={(_, value) => handleInputChange('existingAccountId', value?.id)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Existing Account"
              placeholder="Start typing to search..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      )}
    </Box>
  );

  const renderContactStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Job Title"
          value={formData.jobTitle}
          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isDecisionMaker}
              onChange={(e) => handleInputChange('isDecisionMaker', e.target.checked)}
            />
          }
          label="This contact is a decision maker"
        />
      </Grid>
    </Grid>
  );

  const renderOpportunityStep = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Opportunity Name"
          value={formData.opportunityName}
          onChange={(e) => handleInputChange('opportunityName', e.target.value)}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TrendingUpIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={formData.opportunityAmount}
          onChange={(e) => handleInputChange('opportunityAmount', parseFloat(e.target.value) || 0)}
          required
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Expected Close Date"
          type="date"
          value={formData.expectedCloseDate}
          onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
          required
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Service Type"
          value={formData.serviceType}
          onChange={(e) => handleInputChange('serviceType', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Contract Length (months)"
          type="number"
          value={formData.contractLengthMonths}
          onChange={(e) => handleInputChange('contractLengthMonths', parseInt(e.target.value) || 12)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={2}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Next Step (Required for pipeline hygiene)
        </Typography>
      </Grid>
      <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          label="Next Step"
          value={formData.nextStep}
          onChange={(e) => handleInputChange('nextStep', e.target.value)}
          placeholder="e.g., Schedule initial consultation"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Next Step Date"
          type="date"
          value={formData.nextStepDate}
          onChange={(e) => handleInputChange('nextStepDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );

  const renderReviewStep = () => (
    <Box>
      {success ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" color="success.main">
            Lead Converted Successfully!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to opportunity...
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Review Conversion Details
          </Typography>

          <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 2, mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Account
            </Typography>
            <Typography variant="body2">
              {formData.createNewAccount
                ? `New: ${formData.accountName}`
                : `Existing: ${existingAccounts.find((a) => a.id === formData.existingAccountId)?.name}`}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 2, mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2">
              {formData.firstName} {formData.lastName}
              {formData.email && ` • ${formData.email}`}
              {formData.isDecisionMaker && ' • Decision Maker'}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Opportunity
            </Typography>
            <Typography variant="body2" gutterBottom>
              {formData.opportunityName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Amount: ${formData.opportunityAmount?.toLocaleString()} • Close: {formData.expectedCloseDate}
            </Typography>
            {formData.nextStep && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Next Step: {formData.nextStep} ({formData.nextStepDate})
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderAccountStep();
      case 1:
        return renderContactStep();
      case 2:
        return renderOpportunityStep();
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Convert Lead to Opportunity
        {lead && (
          <Typography variant="body2" color="text.secondary">
            {lead.first_name} {lead.last_name}
            {lead.company_name && ` • ${lead.company_name}`}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {getStepContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {activeStep > 0 && !success && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        ) : (
          !success && (
            <Button
              variant="contained"
              onClick={handleConvert}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Converting...' : 'Convert Lead'}
            </Button>
          )
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LeadConversionDialog;

