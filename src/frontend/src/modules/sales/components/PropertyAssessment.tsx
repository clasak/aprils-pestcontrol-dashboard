/**
 * Property Assessment Component
 * 
 * Captures comprehensive property details for accurate quoting:
 * - Property type and size
 * - Structural features and risk factors
 * - Pest findings with severity levels
 * - Photo and diagram attachments
 * - Recommendations
 */

import { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Slider,
  Tooltip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  Rating,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import BugReportIcon from '@mui/icons-material/BugReport';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import RecommendIcon from '@mui/icons-material/Recommend';
import MapIcon from '@mui/icons-material/Map';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import {
  PropertyAssessment as IPropertyAssessment,
  PropertyType,
  PestFinding,
  InspectionPhoto,
  SiteDiagram,
  PestType,
  InfestationSeverity,
  AccessDifficulty,
  ServiceFrequency,
} from '../types/pricing.types';

interface PropertyAssessmentProps {
  assessment: Partial<IPropertyAssessment>;
  onChange: (assessment: Partial<IPropertyAssessment>) => void;
  contactAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  readOnly?: boolean;
}

// Constants
const PROPERTY_TYPES: { value: PropertyType; label: string; category: 'residential' | 'commercial' }[] = [
  { value: 'single_family', label: 'Single Family Home', category: 'residential' },
  { value: 'multi_family', label: 'Multi-Family (2-4 Units)', category: 'residential' },
  { value: 'apartment', label: 'Apartment', category: 'residential' },
  { value: 'condo', label: 'Condominium', category: 'residential' },
  { value: 'townhouse', label: 'Townhouse', category: 'residential' },
  { value: 'mobile_home', label: 'Mobile/Manufactured Home', category: 'residential' },
  { value: 'commercial_office', label: 'Office Building', category: 'commercial' },
  { value: 'commercial_retail', label: 'Retail Store', category: 'commercial' },
  { value: 'commercial_restaurant', label: 'Restaurant/Food Service', category: 'commercial' },
  { value: 'commercial_warehouse', label: 'Warehouse', category: 'commercial' },
  { value: 'commercial_industrial', label: 'Industrial', category: 'commercial' },
  { value: 'commercial_medical', label: 'Medical/Healthcare', category: 'commercial' },
  { value: 'agricultural', label: 'Agricultural', category: 'commercial' },
  { value: 'other', label: 'Other', category: 'commercial' },
];

const PEST_TYPES: { value: PestType; label: string; icon: string; color: string }[] = [
  { value: 'ants', label: 'Ants', icon: '🐜', color: '#795548' },
  { value: 'roaches', label: 'Roaches', icon: '🪳', color: '#5d4037' },
  { value: 'spiders', label: 'Spiders', icon: '🕷️', color: '#424242' },
  { value: 'termites', label: 'Termites', icon: '🐛', color: '#ff9800' },
  { value: 'bed_bugs', label: 'Bed Bugs', icon: '🛏️', color: '#d32f2f' },
  { value: 'mice', label: 'Mice', icon: '🐭', color: '#9e9e9e' },
  { value: 'rats', label: 'Rats', icon: '🐀', color: '#616161' },
  { value: 'mosquitoes', label: 'Mosquitoes', icon: '🦟', color: '#607d8b' },
  { value: 'fleas', label: 'Fleas', icon: '🦗', color: '#8d6e63' },
  { value: 'ticks', label: 'Ticks', icon: '🕷️', color: '#6d4c41' },
  { value: 'wasps', label: 'Wasps/Bees', icon: '🐝', color: '#ffc107' },
  { value: 'silverfish', label: 'Silverfish', icon: '🐟', color: '#90a4ae' },
  { value: 'flies', label: 'Flies', icon: '🪰', color: '#37474f' },
  { value: 'raccoons', label: 'Raccoons', icon: '🦝', color: '#78909c' },
  { value: 'squirrels', label: 'Squirrels', icon: '🐿️', color: '#a1887f' },
  { value: 'other_wildlife', label: 'Other Wildlife', icon: '🦨', color: '#546e7a' },
];

const SEVERITY_OPTIONS: { value: InfestationSeverity; label: string; color: string; description: string }[] = [
  { value: 'none', label: 'None', color: '#4caf50', description: 'No evidence of pests' },
  { value: 'light', label: 'Light', color: '#8bc34a', description: 'Minor activity, isolated areas' },
  { value: 'moderate', label: 'Moderate', color: '#ff9800', description: 'Noticeable activity, multiple areas' },
  { value: 'severe', label: 'Severe', color: '#f44336', description: 'Heavy infestation, widespread' },
  { value: 'critical', label: 'Critical', color: '#b71c1c', description: 'Emergency level, immediate action needed' },
];

const EVIDENCE_TYPES = [
  { value: 'live_pests', label: 'Live Pests' },
  { value: 'droppings', label: 'Droppings/Feces' },
  { value: 'damage', label: 'Structural Damage' },
  { value: 'nests', label: 'Nests/Colonies' },
  { value: 'tracks', label: 'Tracks/Trails' },
  { value: 'other', label: 'Other Evidence' },
];

const ACCESS_OPTIONS: { value: AccessDifficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Standard access, no obstacles' },
  { value: 'moderate', label: 'Moderate', description: 'Some obstacles, extra time needed' },
  { value: 'difficult', label: 'Difficult', description: 'Tight spaces, attic/crawlspace work' },
  { value: 'requires_equipment', label: 'Requires Equipment', description: 'Lift, ladder, or special tools needed' },
];

const FREQUENCY_OPTIONS: { value: ServiceFrequency; label: string }[] = [
  { value: 'one_time', label: 'One-Time Treatment' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'bi_monthly', label: 'Bi-Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
];

const PropertyAssessment = ({
  assessment,
  onChange,
  contactAddress,
  readOnly = false,
}: PropertyAssessmentProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['property', 'pests']);
  const [addPestDialogOpen, setAddPestDialogOpen] = useState(false);
  const [editingPestIndex, setEditingPestIndex] = useState<number | null>(null);
  const [newPestFinding, setNewPestFinding] = useState<Partial<PestFinding>>({
    severity: 'light',
    locations: [],
    evidenceType: [],
  });
  
  const photoInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const updateField = <K extends keyof IPropertyAssessment>(
    field: K,
    value: IPropertyAssessment[K]
  ) => {
    onChange({ ...assessment, [field]: value });
  };

  const handleAddPest = () => {
    if (!newPestFinding.pestType) return;
    
    const finding: PestFinding = {
      id: `pest-${Date.now()}`,
      pestType: newPestFinding.pestType as PestType,
      severity: newPestFinding.severity as InfestationSeverity,
      locations: newPestFinding.locations || [],
      evidenceType: newPestFinding.evidenceType || [],
      notes: newPestFinding.notes,
    };
    
    const updatedFindings = [...(assessment.pestFindings || [])];
    if (editingPestIndex !== null) {
      updatedFindings[editingPestIndex] = finding;
    } else {
      updatedFindings.push(finding);
    }
    
    updateField('pestFindings', updatedFindings);
    setNewPestFinding({ severity: 'light', locations: [], evidenceType: [] });
    setAddPestDialogOpen(false);
    setEditingPestIndex(null);
  };

  const handleEditPest = (index: number) => {
    const pest = assessment.pestFindings?.[index];
    if (pest) {
      setNewPestFinding(pest);
      setEditingPestIndex(index);
      setAddPestDialogOpen(true);
    }
  };

  const handleDeletePest = (index: number) => {
    const updatedFindings = [...(assessment.pestFindings || [])];
    updatedFindings.splice(index, 1);
    updateField('pestFindings', updatedFindings);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    // In production, upload to server and get URL
    // For now, create local URLs
    const newPhotos: InspectionPhoto[] = Array.from(files).map(file => ({
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      caption: '',
      location: '',
      timestamp: new Date().toISOString(),
    }));
    
    updateField('photos', [...(assessment.photos || []), ...newPhotos]);
  };

  const handleDeletePhoto = (photoId: string) => {
    const updatedPhotos = (assessment.photos || []).filter(p => p.id !== photoId);
    updateField('photos', updatedPhotos);
  };

  const updatePhotoCaption = (photoId: string, caption: string) => {
    const updatedPhotos = (assessment.photos || []).map(p =>
      p.id === photoId ? { ...p, caption } : p
    );
    updateField('photos', updatedPhotos);
  };

  // Calculate overall severity
  const overallSeverity = assessment.pestFindings?.reduce((max, finding) => {
    const severityOrder = ['none', 'light', 'moderate', 'severe', 'critical'];
    const findingIndex = severityOrder.indexOf(finding.severity);
    const maxIndex = severityOrder.indexOf(max);
    return findingIndex > maxIndex ? finding.severity : max;
  }, 'none' as InfestationSeverity) || 'none';

  const severityInfo = SEVERITY_OPTIONS.find(s => s.value === overallSeverity);

  return (
    <Box>
      {/* Summary Header */}
      {(assessment.propertyType || assessment.pestFindings?.length) && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: severityInfo?.value === 'critical' ? 'error.light' :
                     severityInfo?.value === 'severe' ? 'warning.light' :
                     'success.light',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HomeIcon />
                <Box>
                  <Typography variant="caption" color="text.secondary">Property</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {PROPERTY_TYPES.find(p => p.value === assessment.propertyType)?.label || 'Not specified'}
                    {assessment.squareFootage && ` • ${assessment.squareFootage.toLocaleString()} sq ft`}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugReportIcon />
                <Box>
                  <Typography variant="caption" color="text.secondary">Pest Findings</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {assessment.pestFindings?.length || 0} pest type(s) identified
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {severityInfo?.value === 'none' ? <CheckCircleIcon color="success" /> : <WarningIcon color="warning" />}
                <Box>
                  <Typography variant="caption" color="text.secondary">Overall Severity</Typography>
                  <Chip 
                    label={severityInfo?.label || 'Unknown'}
                    size="small"
                    sx={{ 
                      bgcolor: severityInfo?.color,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Property Details Section */}
      <Accordion 
        expanded={expandedSections.includes('property')}
        onChange={() => toggleSection('property')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeIcon color="primary" />
            <Typography fontWeight={500}>Property Details</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Property Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={readOnly}>
                <InputLabel>Property Type *</InputLabel>
                <Select
                  value={assessment.propertyType || ''}
                  label="Property Type *"
                  onChange={(e) => updateField('propertyType', e.target.value as PropertyType)}
                >
                  <MenuItem disabled>
                    <em>Residential</em>
                  </MenuItem>
                  {PROPERTY_TYPES.filter(p => p.category === 'residential').map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                  <MenuItem disabled>
                    <em>Commercial</em>
                  </MenuItem>
                  {PROPERTY_TYPES.filter(p => p.category === 'commercial').map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Square Footage */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Square Footage *"
                type="number"
                value={assessment.squareFootage || ''}
                onChange={(e) => updateField('squareFootage', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                InputProps={{
                  endAdornment: <InputAdornment position="end">sq ft</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* Stories */}
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Stories"
                type="number"
                value={assessment.stories || 1}
                onChange={(e) => updateField('stories', parseInt(e.target.value) || 1)}
                disabled={readOnly}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            
            {/* Year Built */}
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Year Built"
                type="number"
                value={assessment.yearBuilt || ''}
                onChange={(e) => updateField('yearBuilt', parseInt(e.target.value) || undefined)}
                disabled={readOnly}
                inputProps={{ min: 1800, max: new Date().getFullYear() }}
              />
            </Grid>
            
            {/* Lot Size */}
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Lot Size"
                type="number"
                value={assessment.lotSizeAcres || ''}
                onChange={(e) => updateField('lotSizeAcres', parseFloat(e.target.value) || undefined)}
                disabled={readOnly}
                InputProps={{
                  endAdornment: <InputAdornment position="end">acres</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* Number of Units */}
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Number of Units"
                type="number"
                value={assessment.numberOfUnits || 1}
                onChange={(e) => updateField('numberOfUnits', parseInt(e.target.value) || 1)}
                disabled={readOnly}
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Structural Features
              </Typography>
            </Grid>
            
            {/* Structural Features */}
            <Grid item xs={12}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assessment.hasBasement || false}
                      onChange={(e) => updateField('hasBasement', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="Basement"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assessment.hasCrawlSpace || false}
                      onChange={(e) => updateField('hasCrawlSpace', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="Crawl Space"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assessment.hasAttic || false}
                      onChange={(e) => updateField('hasAttic', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="Attic"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assessment.hasGarage || false}
                      onChange={(e) => updateField('hasGarage', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="Garage"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assessment.hasPool || false}
                      onChange={(e) => updateField('hasPool', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="Pool"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assessment.hasSprinklerSystem || false}
                      onChange={(e) => updateField('hasSprinklerSystem', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="Irrigation System"
                />
              </FormGroup>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1, color: 'warning.main' }}>
                <WarningIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Risk Factors
              </Typography>
            </Grid>
            
            {/* Risk Factors */}
            <Grid item xs={12}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assessment.moistureIssues || false}
                      onChange={(e) => updateField('moistureIssues', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="Moisture Issues"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assessment.woodToGroundContact || false}
                      onChange={(e) => updateField('woodToGroundContact', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="Wood-to-Ground Contact"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assessment.vegetationTouchingStructure || false}
                      onChange={(e) => updateField('vegetationTouchingStructure', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="Vegetation Touching Structure"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assessment.standingWater || false}
                      onChange={(e) => updateField('standingWater', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="Standing Water"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assessment.nearWaterSource || false}
                      onChange={(e) => updateField('nearWaterSource', e.target.checked)}
                      disabled={readOnly}
                    />
                  }
                  label="Near Water Source"
                />
              </FormGroup>
            </Grid>
            
            {/* Access Difficulty */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={readOnly}>
                <InputLabel>Access Difficulty</InputLabel>
                <Select
                  value={assessment.accessDifficulty || 'easy'}
                  label="Access Difficulty"
                  onChange={(e) => updateField('accessDifficulty', e.target.value as AccessDifficulty)}
                >
                  {ACCESS_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box>
                        <Typography variant="body2">{opt.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{opt.description}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Distance from Branch */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Distance from Branch"
                type="number"
                value={assessment.distanceFromBranch || ''}
                onChange={(e) => updateField('distanceFromBranch', parseFloat(e.target.value) || undefined)}
                disabled={readOnly}
                InputProps={{
                  endAdornment: <InputAdornment position="end">miles</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Pest Findings Section */}
      <Accordion 
        expanded={expandedSections.includes('pests')}
        onChange={() => toggleSection('pests')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReportIcon color="error" />
            <Typography fontWeight={500}>Pest Findings</Typography>
            {assessment.pestFindings && assessment.pestFindings.length > 0 && (
              <Chip 
                label={assessment.pestFindings.length} 
                size="small" 
                color="error"
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {!readOnly && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddPestDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              Add Pest Finding
            </Button>
          )}
          
          {/* Pest Findings List */}
          <Grid container spacing={2}>
            {assessment.pestFindings?.map((finding, index) => {
              const pestInfo = PEST_TYPES.find(p => p.value === finding.pestType);
              const severityInfo = SEVERITY_OPTIONS.find(s => s.value === finding.severity);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={finding.id}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      borderLeft: `4px solid ${severityInfo?.color}`,
                      height: '100%',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h5">{pestInfo?.icon}</Typography>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {pestInfo?.label || finding.pestType}
                            </Typography>
                            <Chip 
                              label={severityInfo?.label}
                              size="small"
                              sx={{ 
                                bgcolor: severityInfo?.color,
                                color: 'white',
                                fontSize: '0.7rem',
                              }}
                            />
                          </Box>
                        </Box>
                        {!readOnly && (
                          <Box>
                            <IconButton size="small" onClick={() => handleEditPest(index)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeletePest(index)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      
                      {finding.locations.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">Locations:</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {finding.locations.map((loc, i) => (
                              <Chip key={i} label={loc} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {finding.evidenceType.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">Evidence:</Typography>
                          <Typography variant="body2">
                            {finding.evidenceType.map(e => 
                              EVIDENCE_TYPES.find(et => et.value === e)?.label || e
                            ).join(', ')}
                          </Typography>
                        </Box>
                      )}
                      
                      {finding.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {finding.notes}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          
          {(!assessment.pestFindings || assessment.pestFindings.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BugReportIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                No pest findings recorded yet
              </Typography>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Photos Section */}
      <Accordion 
        expanded={expandedSections.includes('photos')}
        onChange={() => toggleSection('photos')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhotoCameraIcon color="info" />
            <Typography fontWeight={500}>Inspection Photos</Typography>
            {assessment.photos && assessment.photos.length > 0 && (
              <Chip 
                label={assessment.photos.length} 
                size="small" 
                color="info"
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {!readOnly && (
            <>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={photoInputRef}
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<AddPhotoAlternateIcon />}
                onClick={() => photoInputRef.current?.click()}
                sx={{ mb: 2 }}
              >
                Add Photos
              </Button>
            </>
          )}
          
          <Grid container spacing={2}>
            {assessment.photos?.map(photo => (
              <Grid item xs={6} sm={4} md={3} key={photo.id}>
                <Card variant="outlined">
                  <CardMedia
                    component="img"
                    height="140"
                    image={photo.url}
                    alt={photo.caption || 'Inspection photo'}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add caption..."
                      value={photo.caption}
                      onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                      disabled={readOnly}
                      variant="standard"
                    />
                    {!readOnly && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeletePhoto(photo.id)}
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {(!assessment.photos || assessment.photos.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                No photos added yet
              </Typography>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Recommendations Section */}
      <Accordion 
        expanded={expandedSections.includes('recommendations')}
        onChange={() => toggleSection('recommendations')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RecommendIcon color="success" />
            <Typography fontWeight={500}>Recommendations</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={readOnly}>
                <InputLabel>Recommended Frequency</InputLabel>
                <Select
                  value={assessment.recommendedFrequency || ''}
                  label="Recommended Frequency"
                  onChange={(e) => updateField('recommendedFrequency', e.target.value as ServiceFrequency)}
                >
                  {FREQUENCY_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={readOnly}>
                <InputLabel>Urgency Level</InputLabel>
                <Select
                  value={assessment.urgencyLevel || 'routine'}
                  label="Urgency Level"
                  onChange={(e) => updateField('urgencyLevel', e.target.value as any)}
                >
                  <MenuItem value="routine">Routine - Schedule at convenience</MenuItem>
                  <MenuItem value="soon">Soon - Within 1-2 weeks</MenuItem>
                  <MenuItem value="urgent">Urgent - Within days</MenuItem>
                  <MenuItem value="emergency">Emergency - Immediate action needed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assessment Notes"
                multiline
                rows={4}
                value={assessment.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                disabled={readOnly}
                placeholder="Document findings, observations, and recommendations..."
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Add/Edit Pest Finding Dialog */}
      <Dialog open={addPestDialogOpen} onClose={() => setAddPestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPestIndex !== null ? 'Edit Pest Finding' : 'Add Pest Finding'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Select Pest Type</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {PEST_TYPES.map(pest => (
                  <Chip
                    key={pest.value}
                    label={`${pest.icon} ${pest.label}`}
                    onClick={() => setNewPestFinding(prev => ({ ...prev, pestType: pest.value }))}
                    color={newPestFinding.pestType === pest.value ? 'primary' : 'default'}
                    variant={newPestFinding.pestType === pest.value ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Severity Level</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {SEVERITY_OPTIONS.map(sev => (
                  <Chip
                    key={sev.value}
                    label={sev.label}
                    onClick={() => setNewPestFinding(prev => ({ ...prev, severity: sev.value }))}
                    sx={{ 
                      bgcolor: newPestFinding.severity === sev.value ? sev.color : 'transparent',
                      color: newPestFinding.severity === sev.value ? 'white' : 'inherit',
                      border: `1px solid ${sev.color}`,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Locations Found"
                placeholder="e.g., Kitchen, Bathroom, Garage (press Enter)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      setNewPestFinding(prev => ({
                        ...prev,
                        locations: [...(prev.locations || []), input.value.trim()],
                      }));
                      input.value = '';
                    }
                  }
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {newPestFinding.locations?.map((loc, i) => (
                  <Chip
                    key={i}
                    label={loc}
                    size="small"
                    onDelete={() => setNewPestFinding(prev => ({
                      ...prev,
                      locations: prev.locations?.filter((_, idx) => idx !== i),
                    }))}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Evidence Type</Typography>
              <FormGroup row>
                {EVIDENCE_TYPES.map(ev => (
                  <FormControlLabel
                    key={ev.value}
                    control={
                      <Checkbox
                        checked={newPestFinding.evidenceType?.includes(ev.value as any) || false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewPestFinding(prev => ({
                              ...prev,
                              evidenceType: [...(prev.evidenceType || []), ev.value as any],
                            }));
                          } else {
                            setNewPestFinding(prev => ({
                              ...prev,
                              evidenceType: prev.evidenceType?.filter(et => et !== ev.value),
                            }));
                          }
                        }}
                      />
                    }
                    label={ev.label}
                  />
                ))}
              </FormGroup>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={2}
                value={newPestFinding.notes || ''}
                onChange={(e) => setNewPestFinding(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddPestDialogOpen(false);
            setEditingPestIndex(null);
            setNewPestFinding({ severity: 'light', locations: [], evidenceType: [] });
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddPest}
            disabled={!newPestFinding.pestType}
          >
            {editingPestIndex !== null ? 'Save Changes' : 'Add Finding'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyAssessment;

