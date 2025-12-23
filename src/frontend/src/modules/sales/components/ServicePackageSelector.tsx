/**
 * Service Package Selector Component
 * 
 * Displays tiered service packages (Good/Better/Best) for customer selection.
 * Allows comparing features and pricing across different service levels.
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
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RepeatIcon from '@mui/icons-material/Repeat';
import InfoIcon from '@mui/icons-material/Info';

import {
  ServicePackage,
  TieredQuoteOption,
  PricingFactors,
  CalculatedPrice,
  PropertyAssessment,
} from '../types/pricing.types';
import {
  formatCurrency,
  DEFAULT_SERVICE_PACKAGES,
  calculateTieredOptions,
  DEFAULT_PRICING_MATRIX,
} from '../services/pricing.service';

interface ServicePackageSelectorProps {
  packages?: ServicePackage[];
  selectedPackageId?: string;
  onSelectPackage: (pkg: ServicePackage, price: CalculatedPrice) => void;
  factors?: Partial<PricingFactors>;
  assessment?: Partial<PropertyAssessment>;
  showComparison?: boolean;
  layout?: 'cards' | 'compact' | 'comparison';
}

const TIER_ICONS: Record<string, React.ReactNode> = {
  basic: <ShieldIcon />,
  standard: <VerifiedIcon />,
  premium: <WorkspacePremiumIcon />,
};

const TIER_COLORS: Record<string, string> = {
  basic: '#1976d2',
  standard: '#4caf50',
  premium: '#9c27b0',
};

const ServicePackageSelector = ({
  packages = DEFAULT_SERVICE_PACKAGES,
  selectedPackageId,
  onSelectPackage,
  factors = {},
  assessment,
  showComparison = true,
  layout = 'cards',
}: ServicePackageSelectorProps) => {
  const theme = useTheme();
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  // Calculate prices for each package
  const tieredOptions = useMemo(() => {
    const completedFactors: PricingFactors = {
      propertyType: factors.propertyType || assessment?.propertyType || 'single_family',
      squareFootage: factors.squareFootage || assessment?.squareFootage || 2000,
      pestType: factors.pestType || 'general',
      severity: factors.severity || assessment?.pestFindings?.[0]?.severity || 'light',
      frequency: factors.frequency || 'quarterly',
      accessDifficulty: factors.accessDifficulty || assessment?.accessDifficulty || 'easy',
      distanceFromBranch: factors.distanceFromBranch || assessment?.distanceFromBranch || 0,
      isRush: factors.isRush || false,
      isAfterHours: factors.isAfterHours || false,
      isWeekend: factors.isWeekend || false,
      numberOfUnits: factors.numberOfUnits || assessment?.numberOfUnits,
    };

    return calculateTieredOptions(completedFactors, packages, DEFAULT_PRICING_MATRIX);
  }, [factors, assessment, packages]);

  // Build comparison features
  const comparisonFeatures = useMemo(() => {
    const allFeatures = new Set<string>();
    packages.forEach(pkg => {
      pkg.features.forEach(f => allFeatures.add(f));
      pkg.guarantees.forEach(g => allFeatures.add(g));
    });

    return Array.from(allFeatures).map(feature => ({
      feature,
      basic: packages.find(p => p.tier === 'basic')?.features.includes(feature) ||
             packages.find(p => p.tier === 'basic')?.guarantees.includes(feature) || false,
      standard: packages.find(p => p.tier === 'standard')?.features.includes(feature) ||
                packages.find(p => p.tier === 'standard')?.guarantees.includes(feature) || false,
      premium: packages.find(p => p.tier === 'premium')?.features.includes(feature) ||
               packages.find(p => p.tier === 'premium')?.guarantees.includes(feature) || false,
    }));
  }, [packages]);

  const handleSelect = (pkg: ServicePackage) => {
    const option = tieredOptions.find(o => o.package.id === pkg.id);
    if (option) {
      onSelectPackage(pkg, option.calculatedPrice);
    }
  };

  const renderPackageCard = (option: TieredQuoteOption, index: number) => {
    const { tier, package: pkg, calculatedPrice, isRecommended } = option;
    const isSelected = pkg.id === selectedPackageId;
    const tierColor = TIER_COLORS[tier] || theme.palette.primary.main;
    const isExpanded = expandedPackage === pkg.id;

    return (
      <Grid item xs={12} md={4} key={pkg.id}>
        <Card
          elevation={isRecommended ? 8 : isSelected ? 6 : 2}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: isSelected ? `3px solid ${tierColor}` : isRecommended ? `2px solid ${tierColor}` : 1,
            borderColor: isSelected || isRecommended ? undefined : 'divider',
            transform: isRecommended ? 'scale(1.02)' : 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: isRecommended ? 'scale(1.04)' : 'scale(1.02)',
              boxShadow: theme.shadows[8],
            },
          }}
        >
          {/* Popular Badge */}
          {pkg.isPopular && (
            <Box
              sx={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1,
              }}
            >
              <Chip
                icon={<StarIcon />}
                label="Most Popular"
                color="success"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          )}

          {/* Header */}
          <Box
            sx={{
              bgcolor: tierColor,
              color: 'white',
              p: 2,
              textAlign: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              {TIER_ICONS[tier]}
              <Typography variant="h6" fontWeight={700}>
                {pkg.name}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {pkg.shortDescription}
            </Typography>
          </Box>

          {/* Pricing */}
          <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha(tierColor, 0.05) }}>
            <Typography variant="h3" fontWeight={700} color={tierColor}>
              {formatCurrency(calculatedPrice.suggestedPrice)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              per {pkg.frequency === 'monthly' ? 'month' : pkg.frequency === 'quarterly' ? 'quarter' : 'visit'}
            </Typography>
            
            {pkg.frequency !== 'one_time' && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={<RepeatIcon />}
                  label={`${formatCurrency(calculatedPrice.annualValue)}/year`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: tierColor, color: tierColor }}
                />
              </Box>
            )}

            {pkg.savings && pkg.savings > 0 && (
              <Chip
                icon={<LocalOfferIcon />}
                label={`Save ${formatCurrency(pkg.savings)}`}
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Divider />

          {/* Features */}
          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              What's Included:
            </Typography>
            <List dense disablePadding>
              {pkg.features.slice(0, isExpanded ? undefined : 5).map((feature, i) => (
                <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: tierColor }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={feature}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>

            {pkg.features.length > 5 && (
              <Button
                size="small"
                onClick={() => setExpandedPackage(isExpanded ? null : pkg.id)}
                endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ mt: 1 }}
              >
                {isExpanded ? 'Show Less' : `+${pkg.features.length - 5} more features`}
              </Button>
            )}

            {/* Guarantees */}
            {pkg.guarantees.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="success.main">
                  Our Guarantees:
                </Typography>
                {pkg.guarantees.slice(0, isExpanded ? undefined : 2).map((guarantee, i) => (
                  <Chip
                    key={i}
                    icon={<VerifiedIcon />}
                    label={guarantee}
                    size="small"
                    variant="outlined"
                    color="success"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            )}

            {/* Covered Pests */}
            <Collapse in={isExpanded}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Covered Pests:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {pkg.coveredPests.map(pest => (
                    <Chip
                      key={pest}
                      label={pest.replace('_', ' ')}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  ))}
                </Box>
              </Box>
            </Collapse>
          </CardContent>

          {/* Action */}
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              fullWidth
              variant={isSelected ? 'contained' : 'outlined'}
              size="large"
              onClick={() => handleSelect(pkg)}
              sx={{
                bgcolor: isSelected ? tierColor : 'transparent',
                borderColor: tierColor,
                color: isSelected ? 'white' : tierColor,
                '&:hover': {
                  bgcolor: isSelected ? tierColor : alpha(tierColor, 0.1),
                },
              }}
            >
              {isSelected ? 'Selected' : 'Select Plan'}
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  const renderComparisonTable = () => (
    <Collapse in={showComparisonTable}>
      <Paper variant="outlined" sx={{ mt: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600, width: '40%' }}>Feature</TableCell>
                {packages.map(pkg => (
                  <TableCell
                    key={pkg.id}
                    align="center"
                    sx={{
                      fontWeight: 600,
                      bgcolor: alpha(TIER_COLORS[pkg.tier] || '#1976d2', 0.1),
                      color: TIER_COLORS[pkg.tier],
                    }}
                  >
                    {pkg.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Pricing Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Price</TableCell>
                {tieredOptions.map(opt => (
                  <TableCell key={opt.package.id} align="center">
                    <Typography variant="body2" fontWeight={700} color={TIER_COLORS[opt.tier]}>
                      {formatCurrency(opt.calculatedPrice.suggestedPrice)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      /{opt.package.frequency === 'monthly' ? 'mo' : 'qtr'}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Annual Value Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Annual Value</TableCell>
                {tieredOptions.map(opt => (
                  <TableCell key={opt.package.id} align="center">
                    <Typography variant="body2">
                      {formatCurrency(opt.calculatedPrice.annualValue)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
              
              <TableRow>
                <TableCell colSpan={4} sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>
                  Features
                </TableCell>
              </TableRow>
              
              {/* Feature Rows */}
              {comparisonFeatures.map((row, i) => (
                <TableRow key={i} hover>
                  <TableCell>{row.feature}</TableCell>
                  <TableCell align="center">
                    {row.basic ? (
                      <CheckCircleIcon fontSize="small" color="success" />
                    ) : (
                      <CancelIcon fontSize="small" color="disabled" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {row.standard ? (
                      <CheckCircleIcon fontSize="small" color="success" />
                    ) : (
                      <CancelIcon fontSize="small" color="disabled" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {row.premium ? (
                      <CheckCircleIcon fontSize="small" color="success" />
                    ) : (
                      <CancelIcon fontSize="small" color="disabled" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Collapse>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Choose Your Protection Plan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select the level of service that best fits your needs
          </Typography>
        </Box>
        
        {showComparison && (
          <Button
            startIcon={<CompareArrowsIcon />}
            onClick={() => setShowComparisonTable(!showComparisonTable)}
            variant={showComparisonTable ? 'contained' : 'outlined'}
          >
            {showComparisonTable ? 'Hide' : 'Compare'} Plans
          </Button>
        )}
      </Box>

      {/* Package Cards */}
      <Grid container spacing={3}>
        {tieredOptions.map((option, index) => renderPackageCard(option, index))}
      </Grid>

      {/* Comparison Table */}
      {showComparison && renderComparisonTable()}

      {/* Info Note */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          All plans include our satisfaction guarantee. Prices may vary based on property size and pest severity.
        </Typography>
      </Box>
    </Box>
  );
};

export default ServicePackageSelector;

