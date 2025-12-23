/**
 * Quote Templates Component
 * 
 * Pre-configured quote templates for common scenarios:
 * - Quick quoting from templates
 * - Template management (create, edit, delete)
 * - Template categories
 * - Auto-population of line items
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  Alert,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import StarIcon from '@mui/icons-material/Star';
import BugReportIcon from '@mui/icons-material/BugReport';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import { ServiceFrequency } from '../types/pricing.types';
import { formatCurrency } from '../services/pricing.service';

interface QuoteTemplatesProps {
  onUseTemplate?: (template: QuoteTemplate) => void;
  viewMode?: 'manage' | 'select';
}

interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  
  // Template content
  lineItems: TemplateLineItem[];
  termsAndConditions: string;
  notes: string;
  
  // Pricing
  defaultDiscountType: 'percentage' | 'fixed' | 'none';
  defaultDiscountValue: number;
  
  // Validity
  defaultValidityDays: number;
  
  // Metadata
  isActive: boolean;
  isFavorite: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateLineItem {
  id: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  frequency: ServiceFrequency;
  isOptional: boolean;
}

type TemplateCategory = 
  | 'residential_starter'
  | 'residential_premium'
  | 'commercial'
  | 'termite'
  | 'specialty'
  | 'seasonal'
  | 'custom';

const CATEGORY_INFO: Record<TemplateCategory, { label: string; icon: React.ReactNode; color: string }> = {
  residential_starter: { label: 'Residential Starter', icon: <HomeIcon />, color: '#4caf50' },
  residential_premium: { label: 'Residential Premium', icon: <StarIcon />, color: '#ff9800' },
  commercial: { label: 'Commercial', icon: <BusinessIcon />, color: '#2196f3' },
  termite: { label: 'Termite', icon: <BugReportIcon />, color: '#f44336' },
  specialty: { label: 'Specialty', icon: <LocalOfferIcon />, color: '#9c27b0' },
  seasonal: { label: 'Seasonal', icon: <BugReportIcon />, color: '#00bcd4' },
  custom: { label: 'Custom', icon: <DescriptionIcon />, color: '#607d8b' },
};

const DEFAULT_TERMS = `TERMS AND CONDITIONS:

1. Payment: Payment is due upon completion of service unless other arrangements have been made.

2. Guarantee: We guarantee our services for 30 days. If pests return within this period, we will re-treat at no additional cost.

3. Access: Customer agrees to provide access to all areas required for treatment.

4. Preparation: For certain treatments, customer may be required to prepare the property according to our instructions.

5. Safety: Please follow all safety instructions provided by our technicians regarding pets, children, and food preparation areas.

6. Cancellation: Cancellations made less than 24 hours before scheduled service may be subject to a cancellation fee.`;

// Default templates
const DEFAULT_TEMPLATES: QuoteTemplate[] = [
  {
    id: 'tmpl-001',
    name: 'New Customer - Quarterly Service',
    description: 'Standard quarterly pest control package for new residential customers. Includes initial treatment and follow-up.',
    category: 'residential_starter',
    lineItems: [
      {
        id: 'li-001',
        description: 'Initial Pest Control Treatment - Interior & Exterior',
        quantity: 1,
        unitPrice: 17500,
        frequency: 'one_time',
        isOptional: false,
      },
      {
        id: 'li-002',
        description: 'Quarterly Pest Control Service',
        quantity: 4,
        unitPrice: 12500,
        frequency: 'quarterly',
        isOptional: false,
      },
      {
        id: 'li-003',
        description: 'Exterior Rodent Bait Stations (2)',
        quantity: 2,
        unitPrice: 2500,
        frequency: 'one_time',
        isOptional: true,
      },
    ],
    termsAndConditions: DEFAULT_TERMS,
    notes: 'New customer special - first service includes free exterior rodent bait stations!',
    defaultDiscountType: 'percentage',
    defaultDiscountValue: 10,
    defaultValidityDays: 30,
    isActive: true,
    isFavorite: true,
    usageCount: 127,
    lastUsedAt: '2024-12-20',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'tmpl-002',
    name: 'Premium Home Protection Annual Plan',
    description: 'Comprehensive year-round protection including monthly service, mosquito control, and termite monitoring.',
    category: 'residential_premium',
    lineItems: [
      {
        id: 'li-010',
        description: 'Monthly Pest Control Service - Interior & Exterior',
        quantity: 12,
        unitPrice: 7500,
        frequency: 'monthly',
        isOptional: false,
      },
      {
        id: 'li-011',
        description: 'Seasonal Mosquito Treatment (Apr-Oct)',
        quantity: 7,
        unitPrice: 8500,
        frequency: 'monthly',
        isOptional: false,
      },
      {
        id: 'li-012',
        description: 'Termite Monitoring Stations (Quarterly Check)',
        quantity: 4,
        unitPrice: 12500,
        frequency: 'quarterly',
        isOptional: true,
      },
      {
        id: 'li-013',
        description: 'Annual Termite Inspection & WDO Report',
        quantity: 1,
        unitPrice: 15000,
        frequency: 'annual',
        isOptional: false,
      },
    ],
    termsAndConditions: DEFAULT_TERMS + `\n\n7. Annual Plan Commitment: This plan requires a 12-month commitment. Early cancellation may be subject to the remaining service discount being charged back.`,
    notes: 'Premium protection bundle - includes 15% discount on all services and priority scheduling.',
    defaultDiscountType: 'percentage',
    defaultDiscountValue: 15,
    defaultValidityDays: 14,
    isActive: true,
    isFavorite: true,
    usageCount: 84,
    lastUsedAt: '2024-12-19',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'tmpl-003',
    name: 'Commercial Restaurant - Monthly Service',
    description: 'Monthly pest management program for food service establishments. Includes all required documentation.',
    category: 'commercial',
    lineItems: [
      {
        id: 'li-020',
        description: 'Initial Commercial Inspection & Assessment',
        quantity: 1,
        unitPrice: 25000,
        frequency: 'one_time',
        isOptional: false,
      },
      {
        id: 'li-021',
        description: 'Monthly Commercial Pest Management Service',
        quantity: 12,
        unitPrice: 22500,
        frequency: 'monthly',
        isOptional: false,
      },
      {
        id: 'li-022',
        description: 'Interior Fly Control System (ILT)',
        quantity: 1,
        unitPrice: 35000,
        frequency: 'one_time',
        isOptional: true,
      },
      {
        id: 'li-023',
        description: 'Monthly ILT Maintenance & Bulb Replacement',
        quantity: 12,
        unitPrice: 7500,
        frequency: 'monthly',
        isOptional: true,
      },
      {
        id: 'li-024',
        description: 'Quarterly Drain Treatment',
        quantity: 4,
        unitPrice: 15000,
        frequency: 'quarterly',
        isOptional: true,
      },
    ],
    termsAndConditions: DEFAULT_TERMS + `\n\n8. Documentation: All service visits include detailed documentation for health inspector requirements.\n\n9. Emergency Response: 24-hour emergency response included for pest sightings.`,
    notes: 'Commercial food service program - includes all required documentation for health inspections.',
    defaultDiscountType: 'percentage',
    defaultDiscountValue: 10,
    defaultValidityDays: 14,
    isActive: true,
    isFavorite: false,
    usageCount: 42,
    lastUsedAt: '2024-12-18',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'tmpl-004',
    name: 'Real Estate - Termite Inspection & Letter',
    description: 'WDO inspection package for real estate transactions. Includes official inspection letter.',
    category: 'termite',
    lineItems: [
      {
        id: 'li-030',
        description: 'WDO (Wood Destroying Organism) Inspection',
        quantity: 1,
        unitPrice: 15000,
        frequency: 'one_time',
        isOptional: false,
      },
      {
        id: 'li-031',
        description: 'Official WDO Inspection Letter',
        quantity: 1,
        unitPrice: 0,
        frequency: 'one_time',
        isOptional: false,
      },
      {
        id: 'li-032',
        description: 'Re-Inspection (if needed within 30 days)',
        quantity: 1,
        unitPrice: 7500,
        frequency: 'one_time',
        isOptional: true,
      },
    ],
    termsAndConditions: `WDO INSPECTION TERMS:

1. Scope: This inspection is a visual inspection for evidence of wood destroying organisms in accessible areas.

2. Limitations: Concealed areas, furniture, stored items, and areas covered by flooring or wall coverings cannot be inspected.

3. Report: An official WDO Inspection Report will be provided within 24 hours of inspection.

4. Validity: This inspection report is valid for 90 days from the date of inspection.

5. Re-Inspection: If requested within 30 days, a re-inspection will be provided at the reduced rate shown.`,
    notes: 'Real estate transaction - WDO inspection and official letter. Report delivered within 24 hours.',
    defaultDiscountType: 'none',
    defaultDiscountValue: 0,
    defaultValidityDays: 7,
    isActive: true,
    isFavorite: true,
    usageCount: 156,
    lastUsedAt: '2024-12-22',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'tmpl-005',
    name: 'Termite Treatment - Bait System',
    description: 'Complete termite bait station system installation and monitoring program.',
    category: 'termite',
    lineItems: [
      {
        id: 'li-040',
        description: 'Termite Bait Station System Installation',
        quantity: 1,
        unitPrice: 150000,
        frequency: 'one_time',
        isOptional: false,
      },
      {
        id: 'li-041',
        description: 'Annual Bait Station Monitoring & Maintenance',
        quantity: 1,
        unitPrice: 35000,
        frequency: 'annual',
        isOptional: false,
      },
    ],
    termsAndConditions: `TERMITE BAIT SYSTEM WARRANTY:

1. Installation: Bait stations will be installed around the perimeter of the structure at recommended intervals.

2. Monitoring: Quarterly inspections of all bait stations are included in the annual maintenance fee.

3. Re-Treatment: If termite activity is detected during the warranty period, re-treatment is provided at no additional cost.

4. Warranty: System includes a 5-year warranty against termite damage when annual maintenance is maintained.

5. Transferability: Warranty is transferable to new property owners if the annual maintenance is current.`,
    notes: 'Termite bait system with 5-year warranty. Annual renewal required for continued protection.',
    defaultDiscountType: 'none',
    defaultDiscountValue: 0,
    defaultValidityDays: 30,
    isActive: true,
    isFavorite: false,
    usageCount: 28,
    lastUsedAt: '2024-12-15',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'tmpl-006',
    name: 'Bed Bug Heat Treatment',
    description: 'Complete bed bug heat treatment package with preparation guide and follow-up inspection.',
    category: 'specialty',
    lineItems: [
      {
        id: 'li-050',
        description: 'Bed Bug Inspection & Assessment',
        quantity: 1,
        unitPrice: 20000,
        frequency: 'one_time',
        isOptional: false,
      },
      {
        id: 'li-051',
        description: 'Whole House Heat Treatment',
        quantity: 1,
        unitPrice: 150000,
        frequency: 'one_time',
        isOptional: false,
      },
      {
        id: 'li-052',
        description: '2-Week Follow-Up Inspection',
        quantity: 1,
        unitPrice: 0,
        frequency: 'one_time',
        isOptional: false,
      },
      {
        id: 'li-053',
        description: 'Mattress & Box Spring Encasements (per bed)',
        quantity: 2,
        unitPrice: 7500,
        frequency: 'one_time',
        isOptional: true,
      },
    ],
    termsAndConditions: `BED BUG TREATMENT TERMS:

1. Preparation: Customer must follow the provided preparation checklist prior to treatment. Treatment may be postponed if preparation is incomplete.

2. Treatment Method: Heat treatment raises room temperature to lethal levels for bed bugs at all life stages.

3. Duration: Treatment typically takes 6-8 hours. Property must be vacated during treatment.

4. Follow-Up: A complimentary follow-up inspection is included 2 weeks after treatment.

5. Guarantee: 90-day guarantee against bed bug activity. Re-treatment provided free of charge if activity is detected.

6. Encasements: Mattress encasements are highly recommended to prevent re-infestation.`,
    notes: 'Bed bug heat treatment - chemical-free solution. Customer must follow preparation checklist.',
    defaultDiscountType: 'none',
    defaultDiscountValue: 0,
    defaultValidityDays: 7,
    isActive: true,
    isFavorite: false,
    usageCount: 19,
    lastUsedAt: '2024-12-10',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'tmpl-007',
    name: 'Summer Mosquito Season Package',
    description: 'Seasonal mosquito control program for the summer months. Includes 7 monthly treatments.',
    category: 'seasonal',
    lineItems: [
      {
        id: 'li-060',
        description: 'Monthly Mosquito Yard Treatment (Apr-Oct)',
        quantity: 7,
        unitPrice: 8500,
        frequency: 'monthly',
        isOptional: false,
      },
      {
        id: 'li-061',
        description: 'Mosquito Breeding Site Assessment',
        quantity: 1,
        unitPrice: 0,
        frequency: 'one_time',
        isOptional: false,
      },
      {
        id: 'li-062',
        description: 'Special Event Treatment (same-day service)',
        quantity: 1,
        unitPrice: 12500,
        frequency: 'one_time',
        isOptional: true,
      },
    ],
    termsAndConditions: `MOSQUITO PROGRAM TERMS:

1. Schedule: Treatments are scheduled monthly from April through October.

2. Weather: If treatment is postponed due to weather, it will be rescheduled within 48 hours.

3. Effectiveness: Maximum effectiveness requires treatment of the entire yard. Neighboring properties may affect results.

4. Special Events: Same-day service available for special events with 24-hour notice.

5. Guarantee: Free re-treatment between scheduled visits if excessive mosquito activity is noticed.`,
    notes: 'Seasonal mosquito program - April through October. Book early for best scheduling.',
    defaultDiscountType: 'percentage',
    defaultDiscountValue: 5,
    defaultValidityDays: 14,
    isActive: true,
    isFavorite: false,
    usageCount: 67,
    lastUsedAt: '2024-04-15',
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
];

const QuoteTemplates = ({
  onUseTemplate,
  viewMode = 'manage',
}: QuoteTemplatesProps) => {
  const theme = useTheme();
  const [templates, setTemplates] = useState<QuoteTemplate[]>(DEFAULT_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<QuoteTemplate | null>(null);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !template.name.toLowerCase().includes(query) &&
          !template.description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      
      if (selectedCategory !== 'all' && template.category !== selectedCategory) {
        return false;
      }
      
      if (!template.isActive && viewMode === 'select') {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by favorites first, then by usage count
      if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
      return b.usageCount - a.usageCount;
    });
  }, [templates, searchQuery, selectedCategory, viewMode]);

  const calculateTemplateTotal = (template: QuoteTemplate) => {
    return template.lineItems
      .filter(li => !li.isOptional)
      .reduce((sum, li) => sum + (li.unitPrice * li.quantity), 0);
  };

  const handleUseTemplate = (template: QuoteTemplate) => {
    // Update usage stats
    setTemplates(prev =>
      prev.map(t =>
        t.id === template.id
          ? { ...t, usageCount: t.usageCount + 1, lastUsedAt: new Date().toISOString().split('T')[0] }
          : t
      )
    );
    
    onUseTemplate?.(template);
  };

  const handleToggleFavorite = (templateId: string) => {
    setTemplates(prev =>
      prev.map(t =>
        t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
      )
    );
  };

  const handleDuplicateTemplate = (template: QuoteTemplate) => {
    const newTemplate: QuoteTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isActive: false,
      isFavorite: false,
      usageCount: 0,
      lastUsedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const renderTemplateCard = (template: QuoteTemplate) => {
    const categoryInfo = CATEGORY_INFO[template.category];
    const total = calculateTemplateTotal(template);
    const optionalCount = template.lineItems.filter(li => li.isOptional).length;
    
    return (
      <Card
        key={template.id}
        elevation={2}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderTop: `4px solid ${categoryInfo.color}`,
          opacity: template.isActive ? 1 : 0.6,
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-4px)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                {template.name}
              </Typography>
              <Chip
                icon={categoryInfo.icon as React.ReactElement}
                label={categoryInfo.label}
                size="small"
                sx={{ bgcolor: alpha(categoryInfo.color, 0.1), color: categoryInfo.color }}
              />
            </Box>
            <IconButton
              size="small"
              onClick={() => handleToggleFavorite(template.id)}
              sx={{ color: template.isFavorite ? 'warning.main' : 'text.disabled' }}
            >
              <StarIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 48 }}>
            {template.description}
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          {/* Line Items Summary */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
            INCLUDED SERVICES ({template.lineItems.filter(li => !li.isOptional).length})
          </Typography>
          <List dense disablePadding sx={{ mb: 2 }}>
            {template.lineItems.filter(li => !li.isOptional).slice(0, 3).map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemText
                  primary={item.description}
                  primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                  secondary={`${item.quantity}x @ ${formatCurrency(item.unitPrice)}`}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
            {template.lineItems.filter(li => !li.isOptional).length > 3 && (
              <Typography variant="caption" color="primary">
                +{template.lineItems.filter(li => !li.isOptional).length - 3} more services
              </Typography>
            )}
          </List>
          
          {optionalCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              + {optionalCount} optional add-on{optionalCount !== 1 ? 's' : ''}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">
                {formatCurrency(total)}
              </Typography>
              {template.defaultDiscountType !== 'none' && (
                <Typography variant="caption" color="success.main">
                  {template.defaultDiscountValue}% discount applied
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Used {template.usageCount} times
              </Typography>
              {template.lastUsedAt && (
                <Typography variant="caption" color="text.secondary">
                  Last: {template.lastUsedAt}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box>
            <Tooltip title="Preview">
              <IconButton size="small" onClick={() => setPreviewTemplate(template)}>
                <DescriptionIcon />
              </IconButton>
            </Tooltip>
            {viewMode === 'manage' && (
              <>
                <Tooltip title="Duplicate">
                  <IconButton size="small" onClick={() => handleDuplicateTemplate(template)}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => { setEditingTemplate(template); setShowEditDialog(true); }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => handleUseTemplate(template)}
            disabled={!template.isActive}
          >
            Use Template
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Quote Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredTemplates.length} templates • Start quoting faster with pre-built templates
          </Typography>
        </Box>
        {viewMode === 'manage' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTemplate({
                id: `tmpl-${Date.now()}`,
                name: '',
                description: '',
                category: 'custom',
                lineItems: [],
                termsAndConditions: DEFAULT_TERMS,
                notes: '',
                defaultDiscountType: 'none',
                defaultDiscountValue: 0,
                defaultValidityDays: 30,
                isActive: false,
                isFavorite: false,
                usageCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              setShowEditDialog(true);
            }}
          >
            Create Template
          </Button>
        )}
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {info.icon}
                      {info.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.map(template => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            {renderTemplateCard(template)}
          </Grid>
        ))}
        {filteredTemplates.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No templates found matching your search criteria.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        maxWidth="md"
        fullWidth
      >
        {previewTemplate && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {CATEGORY_INFO[previewTemplate.category].icon}
                {previewTemplate.name}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {previewTemplate.description}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>LINE ITEMS</Typography>
              <List dense>
                {previewTemplate.lineItems.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.description}
                          {item.isOptional && <Chip label="Optional" size="small" variant="outlined" />}
                        </Box>
                      }
                      secondary={`Qty: ${item.quantity} | ${formatCurrency(item.unitPrice)} each | ${item.frequency.replace('_', ' ')}`}
                    />
                    <ListItemSecondaryAction>
                      <Typography fontWeight={600}>
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              {previewTemplate.notes && (
                <>
                  <Typography variant="subtitle2" gutterBottom>NOTES</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {previewTemplate.notes}
                  </Typography>
                </>
              )}
              
              <Typography variant="subtitle2" gutterBottom>TERMS & CONDITIONS</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {previewTemplate.termsAndConditions}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewTemplate(null)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => {
                  handleUseTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
              >
                Use This Template
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTemplate?.name ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogContent>
          {editingTemplate && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editingTemplate.category}
                    label="Category"
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value as TemplateCategory })}
                  >
                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                      <MenuItem key={key} value={key}>{info.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  Line item editing is available in the full template editor. Save this template first, then edit its line items.
                </Alert>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Default Discount</InputLabel>
                  <Select
                    value={editingTemplate.defaultDiscountType}
                    label="Default Discount"
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultDiscountType: e.target.value as 'percentage' | 'fixed' | 'none' })}
                  >
                    <MenuItem value="none">No Discount</MenuItem>
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="fixed">Fixed Amount</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {editingTemplate.defaultDiscountType !== 'none' && (
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={editingTemplate.defaultDiscountType === 'percentage' ? 'Discount %' : 'Discount $'}
                    value={editingTemplate.defaultDiscountValue}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultDiscountValue: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Validity (days)"
                  value={editingTemplate.defaultValidityDays}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultValidityDays: parseInt(e.target.value) || 30 })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (editingTemplate) {
                setTemplates(prev => {
                  const index = prev.findIndex(t => t.id === editingTemplate.id);
                  if (index >= 0) {
                    const updated = [...prev];
                    updated[index] = { ...editingTemplate, updatedAt: new Date().toISOString() };
                    return updated;
                  }
                  return [...prev, { ...editingTemplate, isActive: true }];
                });
              }
              setShowEditDialog(false);
            }}
          >
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuoteTemplates;

