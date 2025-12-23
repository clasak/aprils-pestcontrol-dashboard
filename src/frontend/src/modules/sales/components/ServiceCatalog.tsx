/**
 * Service Catalog Component
 * 
 * Comprehensive service management with:
 * - Service type catalog with categories
 * - Price book management
 * - Service templates for quick quoting
 * - Bulk pricing updates
 * - Service availability by region
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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BugReportIcon from '@mui/icons-material/BugReport';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PestControlIcon from '@mui/icons-material/PestControl';
import GroupsIcon from '@mui/icons-material/Groups';

import { PestType, ServiceFrequency, PropertyType } from '../types/pricing.types';
import { formatCurrency } from '../services/pricing.service';

interface ServiceCatalogProps {
  onSelectService?: (service: CatalogService) => void;
  viewMode?: 'manage' | 'select';
}

interface CatalogService {
  id: string;
  name: string;
  code: string;
  description: string;
  category: ServiceCategory;
  
  // Pricing
  basePrice: number;
  pricePerSqFt?: number;
  minPrice?: number;
  maxPrice?: number;
  pricingByFrequency: Record<ServiceFrequency, number>;
  
  // Duration
  estimatedDurationMinutes: number;
  
  // Requirements
  requiresInspection: boolean;
  requiredCertifications: string[];
  restrictedChemicals: boolean;
  
  // Target
  targetPests: PestType[];
  applicablePropertyTypes: PropertyType[];
  
  // Display
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  
  // Tax
  isTaxable: boolean;
  taxCategory?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

type ServiceCategory = 
  | 'general_pest'
  | 'termite'
  | 'bed_bug'
  | 'rodent'
  | 'mosquito'
  | 'wildlife'
  | 'specialty'
  | 'commercial'
  | 'inspection'
  | 'maintenance';

const CATEGORY_INFO: Record<ServiceCategory, { label: string; icon: React.ReactNode; color: string }> = {
  general_pest: { label: 'General Pest Control', icon: <BugReportIcon />, color: '#1976d2' },
  termite: { label: 'Termite Services', icon: <HomeWorkIcon />, color: '#ed6c02' },
  bed_bug: { label: 'Bed Bug Treatment', icon: <PestControlIcon />, color: '#d32f2f' },
  rodent: { label: 'Rodent Control', icon: <PestControlIcon />, color: '#7b1fa2' },
  mosquito: { label: 'Mosquito Control', icon: <BugReportIcon />, color: '#0288d1' },
  wildlife: { label: 'Wildlife Removal', icon: <PestControlIcon />, color: '#388e3c' },
  specialty: { label: 'Specialty Services', icon: <StarIcon />, color: '#f57c00' },
  commercial: { label: 'Commercial Services', icon: <GroupsIcon />, color: '#5c6bc0' },
  inspection: { label: 'Inspections', icon: <VisibilityIcon />, color: '#00796b' },
  maintenance: { label: 'Maintenance Plans', icon: <SettingsIcon />, color: '#455a64' },
};

// Default service catalog
const DEFAULT_SERVICES: CatalogService[] = [
  // General Pest Control
  {
    id: 'svc-001',
    name: 'General Pest Treatment - One Time',
    code: 'GPC-OT',
    description: 'Comprehensive interior and exterior treatment for common household pests including ants, roaches, spiders, and silverfish.',
    category: 'general_pest',
    basePrice: 17500,
    pricePerSqFt: 3,
    minPrice: 12500,
    maxPrice: 35000,
    pricingByFrequency: {
      one_time: 17500,
      weekly: 5000,
      bi_weekly: 6000,
      monthly: 7500,
      bi_monthly: 10000,
      quarterly: 12500,
      semi_annual: 15000,
      annual: 17500,
      custom: 7500,
    },
    estimatedDurationMinutes: 45,
    requiresInspection: false,
    requiredCertifications: [],
    restrictedChemicals: false,
    targetPests: ['ants', 'roaches', 'spiders', 'silverfish', 'earwigs', 'crickets'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'apartment', 'condo', 'townhouse', 'mobile_home'],
    isActive: true,
    isPopular: true,
    displayOrder: 1,
    isTaxable: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'svc-002',
    name: 'Monthly Pest Maintenance',
    code: 'GPC-MO',
    description: 'Recurring monthly service for ongoing pest prevention. Interior and exterior treatment with guaranteed results.',
    category: 'general_pest',
    basePrice: 7500,
    pricePerSqFt: 2,
    minPrice: 5500,
    maxPrice: 15000,
    pricingByFrequency: {
      one_time: 7500,
      weekly: 3500,
      bi_weekly: 4500,
      monthly: 7500,
      bi_monthly: 9500,
      quarterly: 12500,
      semi_annual: 15000,
      annual: 17500,
      custom: 7500,
    },
    estimatedDurationMinutes: 30,
    requiresInspection: false,
    requiredCertifications: [],
    restrictedChemicals: false,
    targetPests: ['ants', 'roaches', 'spiders', 'silverfish'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'apartment', 'condo', 'townhouse', 'mobile_home'],
    isActive: true,
    isPopular: true,
    displayOrder: 2,
    isTaxable: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  // Termite Services
  {
    id: 'svc-010',
    name: 'Termite Inspection',
    code: 'TRM-INS',
    description: 'Comprehensive WDO (Wood Destroying Organism) inspection with detailed report. Required for real estate transactions.',
    category: 'termite',
    basePrice: 15000,
    minPrice: 10000,
    maxPrice: 25000,
    pricingByFrequency: {
      one_time: 15000,
      weekly: 0,
      bi_weekly: 0,
      monthly: 0,
      bi_monthly: 0,
      quarterly: 0,
      semi_annual: 0,
      annual: 15000,
      custom: 15000,
    },
    estimatedDurationMinutes: 60,
    requiresInspection: false,
    requiredCertifications: ['WDO Inspector'],
    restrictedChemicals: false,
    targetPests: ['termites'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'condo', 'townhouse', 'commercial_office', 'commercial_retail'],
    isActive: true,
    isPopular: true,
    displayOrder: 10,
    isTaxable: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'svc-011',
    name: 'Termite Bait Station System',
    code: 'TRM-BAIT',
    description: 'Sentricon or equivalent bait station installation and monitoring. Eliminates colony at the source.',
    category: 'termite',
    basePrice: 150000,
    pricePerSqFt: 8,
    minPrice: 100000,
    maxPrice: 500000,
    pricingByFrequency: {
      one_time: 150000,
      weekly: 0,
      bi_weekly: 0,
      monthly: 12500,
      bi_monthly: 0,
      quarterly: 25000,
      semi_annual: 0,
      annual: 150000,
      custom: 150000,
    },
    estimatedDurationMinutes: 240,
    requiresInspection: true,
    requiredCertifications: ['Termite Specialist', 'Sentricon Certified'],
    restrictedChemicals: true,
    targetPests: ['termites'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'condo', 'townhouse'],
    isActive: true,
    isPopular: false,
    displayOrder: 11,
    isTaxable: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'svc-012',
    name: 'Termite Liquid Treatment',
    code: 'TRM-LIQ',
    description: 'Full perimeter liquid termiticide treatment. Creates protective barrier around structure.',
    category: 'termite',
    basePrice: 200000,
    pricePerSqFt: 10,
    minPrice: 150000,
    maxPrice: 750000,
    pricingByFrequency: {
      one_time: 200000,
      weekly: 0,
      bi_weekly: 0,
      monthly: 0,
      bi_monthly: 0,
      quarterly: 0,
      semi_annual: 0,
      annual: 200000,
      custom: 200000,
    },
    estimatedDurationMinutes: 360,
    requiresInspection: true,
    requiredCertifications: ['Termite Specialist'],
    restrictedChemicals: true,
    targetPests: ['termites'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'condo', 'townhouse'],
    isActive: true,
    isPopular: false,
    displayOrder: 12,
    isTaxable: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  // Bed Bug Services
  {
    id: 'svc-020',
    name: 'Bed Bug Inspection',
    code: 'BB-INS',
    description: 'Thorough inspection for bed bug activity using visual and K-9 detection methods.',
    category: 'bed_bug',
    basePrice: 20000,
    minPrice: 15000,
    maxPrice: 35000,
    pricingByFrequency: {
      one_time: 20000,
      weekly: 0,
      bi_weekly: 0,
      monthly: 0,
      bi_monthly: 0,
      quarterly: 0,
      semi_annual: 0,
      annual: 0,
      custom: 20000,
    },
    estimatedDurationMinutes: 45,
    requiresInspection: false,
    requiredCertifications: ['Bed Bug Specialist'],
    restrictedChemicals: false,
    targetPests: ['bed_bugs'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'apartment', 'condo', 'townhouse', 'commercial_medical'],
    isActive: true,
    isPopular: false,
    displayOrder: 20,
    isTaxable: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'svc-021',
    name: 'Bed Bug Heat Treatment - Single Room',
    code: 'BB-HEAT-1',
    description: 'Professional heat treatment for single room bed bug elimination. Chemical-free solution.',
    category: 'bed_bug',
    basePrice: 50000,
    minPrice: 40000,
    maxPrice: 75000,
    pricingByFrequency: {
      one_time: 50000,
      weekly: 0,
      bi_weekly: 0,
      monthly: 0,
      bi_monthly: 0,
      quarterly: 0,
      semi_annual: 0,
      annual: 0,
      custom: 50000,
    },
    estimatedDurationMinutes: 360,
    requiresInspection: true,
    requiredCertifications: ['Bed Bug Specialist', 'Heat Treatment Certified'],
    restrictedChemicals: false,
    targetPests: ['bed_bugs'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'apartment', 'condo', 'townhouse'],
    isActive: true,
    isPopular: true,
    displayOrder: 21,
    isTaxable: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'svc-022',
    name: 'Bed Bug Heat Treatment - Whole House',
    code: 'BB-HEAT-WH',
    description: 'Complete house heat treatment for severe bed bug infestations. Kills all life stages.',
    category: 'bed_bug',
    basePrice: 150000,
    pricePerSqFt: 25,
    minPrice: 100000,
    maxPrice: 400000,
    pricingByFrequency: {
      one_time: 150000,
      weekly: 0,
      bi_weekly: 0,
      monthly: 0,
      bi_monthly: 0,
      quarterly: 0,
      semi_annual: 0,
      annual: 0,
      custom: 150000,
    },
    estimatedDurationMinutes: 480,
    requiresInspection: true,
    requiredCertifications: ['Bed Bug Specialist', 'Heat Treatment Certified'],
    restrictedChemicals: false,
    targetPests: ['bed_bugs'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'apartment', 'condo', 'townhouse'],
    isActive: true,
    isPopular: false,
    displayOrder: 22,
    isTaxable: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  // Rodent Services
  {
    id: 'svc-030',
    name: 'Rodent Initial Service',
    code: 'ROD-INIT',
    description: 'Initial rodent inspection and trap/bait placement. Includes exterior assessment.',
    category: 'rodent',
    basePrice: 25000,
    minPrice: 20000,
    maxPrice: 45000,
    pricingByFrequency: {
      one_time: 25000,
      weekly: 0,
      bi_weekly: 0,
      monthly: 0,
      bi_monthly: 0,
      quarterly: 0,
      semi_annual: 0,
      annual: 0,
      custom: 25000,
    },
    estimatedDurationMinutes: 60,
    requiresInspection: false,
    requiredCertifications: [],
    restrictedChemicals: false,
    targetPests: ['mice', 'rats'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'apartment', 'condo', 'townhouse', 'commercial_warehouse', 'commercial_restaurant'],
    isActive: true,
    isPopular: true,
    displayOrder: 30,
    isTaxable: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'svc-031',
    name: 'Rodent Monthly Maintenance',
    code: 'ROD-MO',
    description: 'Monthly rodent monitoring and maintenance. Trap/bait station checks and replacement.',
    category: 'rodent',
    basePrice: 7500,
    minPrice: 5000,
    maxPrice: 15000,
    pricingByFrequency: {
      one_time: 7500,
      weekly: 0,
      bi_weekly: 0,
      monthly: 7500,
      bi_monthly: 0,
      quarterly: 15000,
      semi_annual: 0,
      annual: 75000,
      custom: 7500,
    },
    estimatedDurationMinutes: 30,
    requiresInspection: false,
    requiredCertifications: [],
    restrictedChemicals: false,
    targetPests: ['mice', 'rats'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'apartment', 'condo', 'townhouse', 'commercial_warehouse', 'commercial_restaurant'],
    isActive: true,
    isPopular: true,
    displayOrder: 31,
    isTaxable: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'svc-032',
    name: 'Rodent Exclusion',
    code: 'ROD-EXC',
    description: 'Comprehensive exclusion work - sealing entry points, gaps, and holes to prevent rodent entry.',
    category: 'rodent',
    basePrice: 75000,
    pricePerSqFt: 5,
    minPrice: 50000,
    maxPrice: 200000,
    pricingByFrequency: {
      one_time: 75000,
      weekly: 0,
      bi_weekly: 0,
      monthly: 0,
      bi_monthly: 0,
      quarterly: 0,
      semi_annual: 0,
      annual: 0,
      custom: 75000,
    },
    estimatedDurationMinutes: 180,
    requiresInspection: true,
    requiredCertifications: [],
    restrictedChemicals: false,
    targetPests: ['mice', 'rats'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'commercial_warehouse', 'commercial_restaurant'],
    isActive: true,
    isPopular: false,
    displayOrder: 32,
    isTaxable: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  // Mosquito Services
  {
    id: 'svc-040',
    name: 'Mosquito Yard Treatment',
    code: 'MOS-YD',
    description: 'Comprehensive yard treatment for mosquito control. Treats breeding areas and resting sites.',
    category: 'mosquito',
    basePrice: 8500,
    pricePerSqFt: 1,
    minPrice: 6500,
    maxPrice: 20000,
    pricingByFrequency: {
      one_time: 8500,
      weekly: 0,
      bi_weekly: 6500,
      monthly: 8500,
      bi_monthly: 0,
      quarterly: 0,
      semi_annual: 0,
      annual: 0,
      custom: 8500,
    },
    estimatedDurationMinutes: 30,
    requiresInspection: false,
    requiredCertifications: [],
    restrictedChemicals: false,
    targetPests: ['mosquitoes'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'condo', 'townhouse'],
    isActive: true,
    isPopular: true,
    displayOrder: 40,
    isTaxable: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  // Wildlife Services
  {
    id: 'svc-050',
    name: 'Wildlife Inspection & Quote',
    code: 'WL-INS',
    description: 'Professional wildlife inspection with assessment and detailed removal/exclusion quote.',
    category: 'wildlife',
    basePrice: 15000,
    minPrice: 10000,
    maxPrice: 25000,
    pricingByFrequency: {
      one_time: 15000,
      weekly: 0,
      bi_weekly: 0,
      monthly: 0,
      bi_monthly: 0,
      quarterly: 0,
      semi_annual: 0,
      annual: 0,
      custom: 15000,
    },
    estimatedDurationMinutes: 60,
    requiresInspection: false,
    requiredCertifications: ['Wildlife Control'],
    restrictedChemicals: false,
    targetPests: ['raccoons', 'squirrels', 'birds', 'snakes', 'other_wildlife'],
    applicablePropertyTypes: ['single_family', 'multi_family', 'commercial_warehouse'],
    isActive: true,
    isPopular: false,
    displayOrder: 50,
    isTaxable: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
  {
    id: 'svc-051',
    name: 'Wildlife Removal & Exclusion',
    code: 'WL-REM',
    description: 'Humane wildlife removal and exclusion work. Includes warranty on sealed entry points.',
    category: 'wildlife',
    basePrice: 35000,
    minPrice: 25000,
    maxPrice: 150000,
    pricingByFrequency: {
      one_time: 35000,
      weekly: 0,
      bi_weekly: 0,
      monthly: 0,
      bi_monthly: 0,
      quarterly: 0,
      semi_annual: 0,
      annual: 0,
      custom: 35000,
    },
    estimatedDurationMinutes: 180,
    requiresInspection: true,
    requiredCertifications: ['Wildlife Control'],
    restrictedChemicals: false,
    targetPests: ['raccoons', 'squirrels', 'birds', 'snakes', 'other_wildlife'],
    applicablePropertyTypes: ['single_family', 'multi_family'],
    isActive: true,
    isPopular: false,
    displayOrder: 51,
    isTaxable: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
  },
];

const ServiceCatalog = ({
  onSelectService,
  viewMode = 'manage',
}: ServiceCatalogProps) => {
  const theme = useTheme();
  const [services, setServices] = useState<CatalogService[]>(DEFAULT_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [showInactiveServices, setShowInactiveServices] = useState(false);
  const [editingService, setEditingService] = useState<CatalogService | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !service.name.toLowerCase().includes(query) &&
          !service.code.toLowerCase().includes(query) &&
          !service.description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      
      // Category filter
      if (selectedCategory !== 'all' && service.category !== selectedCategory) {
        return false;
      }
      
      // Active filter
      if (!showInactiveServices && !service.isActive) {
        return false;
      }
      
      return true;
    }).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [services, searchQuery, selectedCategory, showInactiveServices]);

  // Group by category
  const groupedServices = useMemo(() => {
    const groups: Record<ServiceCategory, CatalogService[]> = {
      general_pest: [],
      termite: [],
      bed_bug: [],
      rodent: [],
      mosquito: [],
      wildlife: [],
      specialty: [],
      commercial: [],
      inspection: [],
      maintenance: [],
    };
    
    filteredServices.forEach(service => {
      groups[service.category].push(service);
    });
    
    return groups;
  }, [filteredServices]);

  const handleEditService = (service: CatalogService) => {
    setEditingService({ ...service });
    setShowEditDialog(true);
  };

  const handleSaveService = () => {
    if (!editingService) return;
    
    setServices(prev => {
      const index = prev.findIndex(s => s.id === editingService.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = editingService;
        return updated;
      }
      return [...prev, editingService];
    });
    
    setShowEditDialog(false);
    setEditingService(null);
  };

  const handleToggleActive = (serviceId: string) => {
    setServices(prev =>
      prev.map(s =>
        s.id === serviceId ? { ...s, isActive: !s.isActive } : s
      )
    );
  };

  const handleDuplicateService = (service: CatalogService) => {
    const newService: CatalogService = {
      ...service,
      id: `svc-${Date.now()}`,
      name: `${service.name} (Copy)`,
      code: `${service.code}-COPY`,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setServices(prev => [...prev, newService]);
  };

  const renderServiceCard = (service: CatalogService) => {
    const categoryInfo = CATEGORY_INFO[service.category];
    
    return (
      <Card
        key={service.id}
        elevation={service.isActive ? 2 : 0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: service.isActive ? 1 : 0.6,
          borderLeft: `4px solid ${categoryInfo.color}`,
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: theme.shadows[6],
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color: categoryInfo.color }}>{categoryInfo.icon}</Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {service.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {service.code}
                </Typography>
              </Box>
            </Box>
            {service.isPopular && (
              <Chip
                icon={<StarIcon />}
                label="Popular"
                size="small"
                color="warning"
              />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
            {service.description}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h5" fontWeight={700} color="primary">
              {formatCurrency(service.basePrice)}
            </Typography>
            {service.pricePerSqFt && (
              <Typography variant="caption" color="text.secondary">
                +${(service.pricePerSqFt / 100).toFixed(2)}/sq ft
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
            {service.targetPests.slice(0, 4).map(pest => (
              <Chip
                key={pest}
                label={pest.replace('_', ' ')}
                size="small"
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
            {service.targetPests.length > 4 && (
              <Chip
                label={`+${service.targetPests.length - 4}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Est. {service.estimatedDurationMinutes} min
            {service.requiresInspection && ' • Requires inspection'}
          </Typography>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          {viewMode === 'select' ? (
            <Button
              variant="contained"
              fullWidth
              onClick={() => onSelectService?.(service)}
              disabled={!service.isActive}
            >
              Add to Quote
            </Button>
          ) : (
            <>
              <Box>
                <Tooltip title={service.isActive ? 'Deactivate' : 'Activate'}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleActive(service.id)}
                    color={service.isActive ? 'success' : 'default'}
                  >
                    {service.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Duplicate">
                  <IconButton size="small" onClick={() => handleDuplicateService(service)}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => handleEditService(service)}
              >
                Edit
              </Button>
            </>
          )}
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
            Service Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredServices.length} services • {filteredServices.filter(s => s.isActive).length} active
          </Typography>
        </Box>
        {viewMode === 'manage' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingService({
                id: `svc-${Date.now()}`,
                name: '',
                code: '',
                description: '',
                category: 'general_pest',
                basePrice: 0,
                pricingByFrequency: {
                  one_time: 0,
                  weekly: 0,
                  bi_weekly: 0,
                  monthly: 0,
                  bi_monthly: 0,
                  quarterly: 0,
                  semi_annual: 0,
                  annual: 0,
                  custom: 0,
                },
                estimatedDurationMinutes: 30,
                requiresInspection: false,
                requiredCertifications: [],
                restrictedChemicals: false,
                targetPests: [],
                applicablePropertyTypes: [],
                isActive: false,
                isPopular: false,
                displayOrder: services.length + 1,
                isTaxable: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              setShowEditDialog(true);
            }}
          >
            Add Service
          </Button>
        )}
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search services..."
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value as ServiceCategory | 'all')}
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
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={showInactiveServices}
                  onChange={(e) => setShowInactiveServices(e.target.checked)}
                />
              }
              label="Show inactive services"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Services Grid */}
      {selectedCategory === 'all' ? (
        // Grouped by category
        Object.entries(groupedServices).map(([category, categoryServices]) => {
          if (categoryServices.length === 0) return null;
          const categoryInfo = CATEGORY_INFO[category as ServiceCategory];
          
          return (
            <Accordion key={category} defaultExpanded={categoryServices.length > 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: categoryInfo.color }}>{categoryInfo.icon}</Box>
                  <Typography fontWeight={500}>{categoryInfo.label}</Typography>
                  <Chip label={categoryServices.length} size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {categoryServices.map(service => (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                      {renderServiceCard(service)}
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        // Flat list for selected category
        <Grid container spacing={2}>
          {filteredServices.map(service => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              {renderServiceCard(service)}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Service Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingService?.id.startsWith('svc-') && editingService?.name === '' ? 'Add Service' : 'Edit Service'}
        </DialogTitle>
        <DialogContent>
          {editingService && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Service Name"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Service Code"
                  value={editingService.code}
                  onChange={(e) => setEditingService({ ...editingService, code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editingService.category}
                    label="Category"
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value as ServiceCategory })}
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
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Base Price"
                  type="number"
                  value={(editingService.basePrice / 100).toFixed(2)}
                  onChange={(e) => setEditingService({ ...editingService, basePrice: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Price per Sq Ft"
                  type="number"
                  value={editingService.pricePerSqFt ? (editingService.pricePerSqFt / 100).toFixed(2) : ''}
                  onChange={(e) => setEditingService({ ...editingService, pricePerSqFt: Math.round(parseFloat(e.target.value) * 100) || undefined })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Est. Duration (min)"
                  type="number"
                  value={editingService.estimatedDurationMinutes}
                  onChange={(e) => setEditingService({ ...editingService, estimatedDurationMinutes: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingService.isActive}
                        onChange={(e) => setEditingService({ ...editingService, isActive: e.target.checked })}
                      />
                    }
                    label="Active"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingService.isPopular}
                        onChange={(e) => setEditingService({ ...editingService, isPopular: e.target.checked })}
                      />
                    }
                    label="Popular"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingService.requiresInspection}
                        onChange={(e) => setEditingService({ ...editingService, requiresInspection: e.target.checked })}
                      />
                    }
                    label="Requires Inspection"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingService.isTaxable}
                        onChange={(e) => setEditingService({ ...editingService, isTaxable: e.target.checked })}
                      />
                    }
                    label="Taxable"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveService}>
            Save Service
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceCatalog;

