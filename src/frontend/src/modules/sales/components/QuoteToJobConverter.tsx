/**
 * Quote-to-Job Converter Component
 * 
 * Converts accepted quotes into scheduled jobs:
 * - Automatic job creation from quote line items
 * - Service scheduling with technician assignment
 * - Recurring service setup
 * - Route optimization integration
 * - Customer communication automation
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
  Alert,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  AvatarGroup,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  alpha,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RepeatIcon from '@mui/icons-material/Repeat';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RouteIcon from '@mui/icons-material/Route';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

import { ServiceFrequency } from '../types/pricing.types';
import { formatCurrency } from '../services/pricing.service';

interface QuoteToJobConverterProps {
  quoteId: string;
  onConversionComplete?: (jobIds: string[]) => void;
  onCancel?: () => void;
}

interface QuoteData {
  id: string;
  quoteNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  acceptedAt: string;
  signedBy: string;
}

interface QuoteLineItem {
  id: string;
  description: string;
  serviceType: string;
  quantity: number;
  unitPrice: number;
  frequency: ServiceFrequency;
  total: number;
}

interface Technician {
  id: string;
  name: string;
  avatar?: string;
  specializations: string[];
  availability: 'available' | 'busy' | 'off';
  currentLocation?: string;
  rating: number;
}

interface JobCreationData {
  lineItemId: string;
  scheduledDate: Date | null;
  scheduledTime: Date | null;
  assignedTechnicianId: string | null;
  estimatedDuration: number;
  isRecurring: boolean;
  recurringFrequency: ServiceFrequency;
  recurringEndDate: Date | null;
  notes: string;
  sendConfirmation: boolean;
  sendReminder: boolean;
  reminderHours: number;
}

// Mock data
const mockQuote: QuoteData = {
  id: 'q-12345',
  quoteNumber: 'Q-2024-0156',
  status: 'accepted',
  customerName: 'John Smith',
  customerEmail: 'john.smith@email.com',
  customerPhone: '(555) 123-4567',
  customerAddress: '123 Main Street, Anytown, ST 12345',
  lineItems: [
    {
      id: 'li-1',
      description: 'Initial Pest Control Treatment - Interior & Exterior',
      serviceType: 'general_pest',
      quantity: 1,
      unitPrice: 17500,
      frequency: 'one_time',
      total: 17500,
    },
    {
      id: 'li-2',
      description: 'Monthly Pest Control Service',
      serviceType: 'general_pest',
      quantity: 12,
      unitPrice: 7500,
      frequency: 'monthly',
      total: 90000,
    },
    {
      id: 'li-3',
      description: 'Termite Bait Station Installation',
      serviceType: 'termite',
      quantity: 1,
      unitPrice: 150000,
      frequency: 'one_time',
      total: 150000,
    },
  ],
  subtotal: 257500,
  discount: 25750,
  tax: 15056,
  total: 246806,
  acceptedAt: '2024-12-22T14:30:00Z',
  signedBy: 'John Smith',
};

const mockTechnicians: Technician[] = [
  {
    id: 't1',
    name: 'Mike Johnson',
    avatar: undefined,
    specializations: ['general_pest', 'rodent'],
    availability: 'available',
    currentLocation: '5.2 miles away',
    rating: 4.9,
  },
  {
    id: 't2',
    name: 'Sarah Williams',
    avatar: undefined,
    specializations: ['termite', 'general_pest'],
    availability: 'available',
    currentLocation: '8.1 miles away',
    rating: 4.8,
  },
  {
    id: 't3',
    name: 'David Chen',
    avatar: undefined,
    specializations: ['bed_bug', 'termite', 'general_pest'],
    availability: 'busy',
    currentLocation: 'On job until 2:30 PM',
    rating: 4.7,
  },
  {
    id: 't4',
    name: 'Emily Rodriguez',
    avatar: undefined,
    specializations: ['wildlife', 'rodent'],
    availability: 'off',
    rating: 4.6,
  },
];

const CONVERSION_STEPS = [
  'Review Quote',
  'Schedule Services',
  'Assign Technicians',
  'Set Notifications',
  'Confirm & Create Jobs',
];

const QuoteToJobConverter = ({
  quoteId,
  onConversionComplete,
  onCancel,
}: QuoteToJobConverterProps) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobCreationData, setJobCreationData] = useState<Map<string, JobCreationData>>(new Map());
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdJobIds, setCreatedJobIds] = useState<string[]>([]);

  // Load quote data
  useEffect(() => {
    const loadQuote = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setQuote(mockQuote);
      
      // Initialize job creation data for each line item
      const initialData = new Map<string, JobCreationData>();
      mockQuote.lineItems.forEach(item => {
        initialData.set(item.id, {
          lineItemId: item.id,
          scheduledDate: null,
          scheduledTime: null,
          assignedTechnicianId: null,
          estimatedDuration: item.serviceType === 'termite' ? 240 : 60,
          isRecurring: item.frequency !== 'one_time',
          recurringFrequency: item.frequency,
          recurringEndDate: item.frequency !== 'one_time' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
          notes: '',
          sendConfirmation: true,
          sendReminder: true,
          reminderHours: 24,
        });
      });
      setJobCreationData(initialData);
      setLoading(false);
    };
    
    loadQuote();
  }, [quoteId]);

  const updateJobData = (lineItemId: string, updates: Partial<JobCreationData>) => {
    setJobCreationData(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(lineItemId);
      if (existing) {
        newMap.set(lineItemId, { ...existing, ...updates });
      }
      return newMap;
    });
  };

  const isStepComplete = (step: number): boolean => {
    if (!quote) return false;
    
    switch (step) {
      case 0: // Review
        return true;
      case 1: // Schedule
        return Array.from(jobCreationData.values()).every(
          data => data.scheduledDate && data.scheduledTime
        );
      case 2: // Assign
        return Array.from(jobCreationData.values()).every(
          data => data.assignedTechnicianId
        );
      case 3: // Notifications
        return true; // Optional
      case 4: // Confirm
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, CONVERSION_STEPS.length - 1));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleCreateJobs = async () => {
    setLoading(true);
    // Simulate job creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const jobIds = quote?.lineItems.map((_, i) => `JOB-${Date.now()}-${i}`) || [];
    setCreatedJobIds(jobIds);
    setLoading(false);
    setShowSuccessDialog(true);
  };

  const getTechnicianAvailabilityColor = (availability: Technician['availability']) => {
    switch (availability) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      case 'off': return 'error';
      default: return 'default';
    }
  };

  const getRecommendedTechnicians = (serviceType: string) => {
    return mockTechnicians
      .filter(t => t.specializations.includes(serviceType) && t.availability !== 'off')
      .sort((a, b) => {
        if (a.availability !== b.availability) {
          return a.availability === 'available' ? -1 : 1;
        }
        return b.rating - a.rating;
      });
  };

  const getFrequencyLabel = (frequency: ServiceFrequency): string => {
    const labels: Record<ServiceFrequency, string> = {
      one_time: 'One-Time',
      weekly: 'Weekly',
      bi_weekly: 'Every 2 Weeks',
      monthly: 'Monthly',
      bi_monthly: 'Every 2 Months',
      quarterly: 'Quarterly',
      semi_annual: 'Every 6 Months',
      annual: 'Annually',
      custom: 'Custom',
    };
    return labels[frequency];
  };

  if (loading || !quote) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading quote...</Typography>
      </Paper>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Convert Quote to Jobs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {quote.quoteNumber} • {quote.customerName}
              </Typography>
              <Chip
                icon={<CheckCircleIcon />}
                label={`Accepted on ${new Date(quote.acceptedAt).toLocaleDateString()}`}
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" fontWeight={700} color="primary">
                {formatCurrency(quote.total)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {quote.lineItems.length} service{quote.lineItems.length !== 1 ? 's' : ''} to schedule
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {CONVERSION_STEPS.map((label, index) => (
              <Step key={label} completed={activeStep > index || (activeStep === index && isStepComplete(index))}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step Content */}
        <Paper sx={{ p: 3, mb: 3 }}>
          {/* Step 0: Review Quote */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Quote Details
              </Typography>
              
              {/* Customer Info */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Customer</Typography>
                          <Typography variant="body1" fontWeight={500}>{quote.customerName}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{quote.customerEmail}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Service Address</Typography>
                          <Typography variant="body1">{quote.customerAddress}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Services to Convert
              </Typography>
              <List>
                {quote.lineItems.map((item, index) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography fontWeight={500}>{item.description}</Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={item.frequency === 'one_time' ? 'One-Time' : 'Recurring'}
                            color={item.frequency === 'one_time' ? 'default' : 'primary'}
                            variant="outlined"
                          />
                          {item.frequency !== 'one_time' && (
                            <Chip
                              size="small"
                              icon={<RepeatIcon />}
                              label={getFrequencyLabel(item.frequency)}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="h6" fontWeight={600}>
                        {formatCurrency(item.total)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Step 1: Schedule Services */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Schedule Each Service
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Select preferred dates and times for each service. Recurring services will be automatically scheduled based on the selected frequency.
              </Alert>

              {quote.lineItems.map((item, index) => {
                const data = jobCreationData.get(item.id);
                if (!data) return null;
                
                return (
                  <Card key={item.id} variant="outlined" sx={{ mb: 3 }}>
                    <CardHeader
                      title={item.description}
                      subheader={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={formatCurrency(item.unitPrice)}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            icon={<AccessTimeIcon />}
                            label={`Est. ${data.estimatedDuration} min`}
                            variant="outlined"
                          />
                        </Box>
                      }
                      action={
                        data.isRecurring && (
                          <Chip
                            icon={<EventRepeatIcon />}
                            label={getFrequencyLabel(data.recurringFrequency)}
                            color="primary"
                          />
                        )
                      }
                    />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <DatePicker
                            label="Service Date"
                            value={data.scheduledDate}
                            onChange={(date) => updateJobData(item.id, { scheduledDate: date })}
                            slotProps={{
                              textField: { fullWidth: true, size: 'small' },
                            }}
                            minDate={new Date()}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <TimePicker
                            label="Service Time"
                            value={data.scheduledTime}
                            onChange={(time) => updateJobData(item.id, { scheduledTime: time })}
                            slotProps={{
                              textField: { fullWidth: true, size: 'small' },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Duration (minutes)"
                            value={data.estimatedDuration}
                            onChange={(e) => updateJobData(item.id, { estimatedDuration: parseInt(e.target.value) || 60 })}
                          />
                        </Grid>
                        
                        {data.isRecurring && (
                          <>
                            <Grid item xs={12}>
                              <Divider sx={{ my: 1 }}>
                                <Chip label="Recurring Settings" size="small" />
                              </Divider>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Frequency</InputLabel>
                                <Select
                                  value={data.recurringFrequency}
                                  label="Frequency"
                                  onChange={(e) => updateJobData(item.id, { recurringFrequency: e.target.value as ServiceFrequency })}
                                >
                                  <MenuItem value="weekly">Weekly</MenuItem>
                                  <MenuItem value="bi_weekly">Every 2 Weeks</MenuItem>
                                  <MenuItem value="monthly">Monthly</MenuItem>
                                  <MenuItem value="bi_monthly">Every 2 Months</MenuItem>
                                  <MenuItem value="quarterly">Quarterly</MenuItem>
                                  <MenuItem value="semi_annual">Every 6 Months</MenuItem>
                                  <MenuItem value="annual">Annually</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <DatePicker
                                label="End Date"
                                value={data.recurringEndDate}
                                onChange={(date) => updateJobData(item.id, { recurringEndDate: date })}
                                slotProps={{
                                  textField: { fullWidth: true, size: 'small' },
                                }}
                                minDate={data.scheduledDate || new Date()}
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

          {/* Step 2: Assign Technicians */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Assign Technicians
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Recommended technicians are shown based on specialization and availability.
              </Alert>

              {quote.lineItems.map((item) => {
                const data = jobCreationData.get(item.id);
                if (!data) return null;
                
                const recommendedTechs = getRecommendedTechnicians(item.serviceType);
                
                return (
                  <Card key={item.id} variant="outlined" sx={{ mb: 3 }}>
                    <CardHeader
                      title={item.description}
                      subheader={
                        data.scheduledDate && data.scheduledTime
                          ? `${data.scheduledDate.toLocaleDateString()} at ${data.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Not scheduled'
                      }
                    />
                    <CardContent>
                      <FormControl fullWidth size="small">
                        <InputLabel>Assigned Technician</InputLabel>
                        <Select
                          value={data.assignedTechnicianId || ''}
                          label="Assigned Technician"
                          onChange={(e) => updateJobData(item.id, { assignedTechnicianId: e.target.value })}
                        >
                          <MenuItem value="" disabled>Select a technician</MenuItem>
                          {recommendedTechs.length > 0 && (
                            <MenuItem disabled sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>
                              Recommended
                            </MenuItem>
                          )}
                          {recommendedTechs.map(tech => (
                            <MenuItem key={tech.id} value={tech.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                                  {tech.name.charAt(0)}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body2" fontWeight={500}>{tech.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {tech.currentLocation || 'Location unknown'}
                                  </Typography>
                                </Box>
                                <Chip
                                  size="small"
                                  label={tech.availability}
                                  color={getTechnicianAvailabilityColor(tech.availability)}
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </Box>
                            </MenuItem>
                          ))}
                          {mockTechnicians.filter(t => !recommendedTechs.includes(t)).length > 0 && (
                            <>
                              <Divider />
                              <MenuItem disabled sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>
                                Other Technicians
                              </MenuItem>
                              {mockTechnicians
                                .filter(t => !recommendedTechs.includes(t))
                                .map(tech => (
                                  <MenuItem key={tech.id} value={tech.id} disabled={tech.availability === 'off'}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                                        {tech.name.charAt(0)}
                                      </Avatar>
                                      <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2">{tech.name}</Typography>
                                      </Box>
                                      <Chip
                                        size="small"
                                        label={tech.availability}
                                        color={getTechnicianAvailabilityColor(tech.availability)}
                                        sx={{ textTransform: 'capitalize' }}
                                      />
                                    </Box>
                                  </MenuItem>
                                ))}
                            </>
                          )}
                        </Select>
                      </FormControl>
                      
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        label="Notes for Technician"
                        placeholder="Special instructions, access codes, customer preferences..."
                        value={data.notes}
                        onChange={(e) => updateJobData(item.id, { notes: e.target.value })}
                        sx={{ mt: 2 }}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

          {/* Step 3: Set Notifications */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Customer Notifications
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Configure automated communications to be sent to the customer.
              </Alert>

              {quote.lineItems.map((item) => {
                const data = jobCreationData.get(item.id);
                if (!data) return null;
                
                return (
                  <Card key={item.id} variant="outlined" sx={{ mb: 3 }}>
                    <CardHeader title={item.description} />
                    <CardContent>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={data.sendConfirmation}
                              onChange={(e) => updateJobData(item.id, { sendConfirmation: e.target.checked })}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" />
                              Send booking confirmation email
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={data.sendReminder}
                              onChange={(e) => updateJobData(item.id, { sendReminder: e.target.checked })}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <NotificationsIcon fontSize="small" />
                              Send appointment reminder
                            </Box>
                          }
                        />
                      </FormGroup>
                      
                      {data.sendReminder && (
                        <TextField
                          size="small"
                          type="number"
                          label="Reminder before (hours)"
                          value={data.reminderHours}
                          onChange={(e) => updateJobData(item.id, { reminderHours: parseInt(e.target.value) || 24 })}
                          sx={{ mt: 2, width: 200 }}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

          {/* Step 4: Confirm */}
          {activeStep === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Confirm Job Creation
              </Typography>
              
              <Alert severity="success" sx={{ mb: 3 }}>
                Review the summary below. Click "Create Jobs" to convert this quote into scheduled service jobs.
              </Alert>

              {/* Summary */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardHeader title="Conversion Summary" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Total Services</Typography>
                      <Typography variant="h5" fontWeight={600}>{quote.lineItems.length}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Recurring Services</Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {quote.lineItems.filter(i => i.frequency !== 'one_time').length}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Technicians Assigned</Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {new Set(Array.from(jobCreationData.values()).map(d => d.assignedTechnicianId).filter(Boolean)).size}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Total Value</Typography>
                      <Typography variant="h5" fontWeight={600} color="success.main">
                        {formatCurrency(quote.total)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Job Details */}
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Jobs to Create
              </Typography>
              {quote.lineItems.map((item) => {
                const data = jobCreationData.get(item.id);
                if (!data) return null;
                
                const tech = mockTechnicians.find(t => t.id === data.assignedTechnicianId);
                
                return (
                  <Card key={item.id} variant="outlined" sx={{ mb: 2, bgcolor: alpha(theme.palette.success.main, 0.02) }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography fontWeight={600}>{item.description}</Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                            <Chip
                              size="small"
                              icon={<CalendarMonthIcon />}
                              label={data.scheduledDate?.toLocaleDateString() || 'Not scheduled'}
                            />
                            <Chip
                              size="small"
                              icon={<AccessTimeIcon />}
                              label={data.scheduledTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '--:--'}
                            />
                            <Chip
                              size="small"
                              icon={<PersonIcon />}
                              label={tech?.name || 'Unassigned'}
                            />
                            {data.isRecurring && (
                              <Chip
                                size="small"
                                icon={<RepeatIcon />}
                                label={getFrequencyLabel(data.recurringFrequency)}
                                color="primary"
                              />
                            )}
                          </Box>
                          {data.notes && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              Notes: {data.notes}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" fontWeight={600}>
                            {formatCurrency(item.total)}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', mt: 1 }}>
                            {data.sendConfirmation && (
                              <Tooltip title="Confirmation email">
                                <EmailIcon fontSize="small" color="action" />
                              </Tooltip>
                            )}
                            {data.sendReminder && (
                              <Tooltip title={`Reminder ${data.reminderHours}h before`}>
                                <NotificationsIcon fontSize="small" color="action" />
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* Navigation */}
        <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            {activeStep === CONVERSION_STEPS.length - 1 ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<AssignmentTurnedInIcon />}
                onClick={handleCreateJobs}
                disabled={!isStepComplete(1) || !isStepComplete(2)}
              >
                Create Jobs
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={600}>
              Jobs Created Successfully!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>
              {createdJobIds.length} job{createdJobIds.length !== 1 ? 's' : ''} have been created from quote {quote.quoteNumber}.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Confirmation emails will be sent to {quote.customerEmail}
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              {createdJobIds.map(jobId => (
                <Chip key={jobId} label={jobId} size="small" />
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button onClick={() => {
              setShowSuccessDialog(false);
              onConversionComplete?.(createdJobIds);
            }}>
              Close
            </Button>
            <Button variant="contained" startIcon={<CalendarMonthIcon />}>
              View in Schedule
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default QuoteToJobConverter;

