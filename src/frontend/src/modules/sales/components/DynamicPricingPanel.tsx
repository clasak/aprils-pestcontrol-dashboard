/**
 * Dynamic Pricing Panel Component
 * 
 * Displays real-time price calculations based on property assessment
 * and service selections. Shows breakdown of all pricing factors.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalculateIcon from '@mui/icons-material/Calculate';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RepeatIcon from '@mui/icons-material/Repeat';

import {
  PricingFactors,
  CalculatedPrice,
  PriceAdjustment,
  ServiceFrequency,
  PropertyAssessment,
} from '../types/pricing.types';
import {
  calculatePrice,
  formatCurrency,
  DEFAULT_PRICING_MATRIX,
} from '../services/pricing.service';

interface DynamicPricingPanelProps {
  factors: Partial<PricingFactors>;
  assessment?: Partial<PropertyAssessment>;
  isRecurring?: boolean;
  onPriceCalculated?: (price: CalculatedPrice) => void;
  onOverridePrice?: (price: number) => void;
  allowPriceOverride?: boolean;
  showBreakdown?: boolean;
  compact?: boolean;
}

const FREQUENCY_LABELS: Record<ServiceFrequency, string> = {
  one_time: 'One-Time',
  weekly: 'Weekly',
  bi_weekly: 'Bi-Weekly',
  monthly: 'Monthly',
  bi_monthly: 'Bi-Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annual: 'Annual',
  custom: 'Custom',
};

const DynamicPricingPanel = ({
  factors,
  assessment,
  isRecurring = false,
  onPriceCalculated,
  onOverridePrice,
  allowPriceOverride = false,
  showBreakdown = true,
  compact = false,
}: DynamicPricingPanelProps) => {
  const [expanded, setExpanded] = useState(showBreakdown);
  const [isOverriding, setIsOverriding] = useState(false);
  const [overridePrice, setOverridePrice] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Build complete pricing factors from props
  const completeFutradeFactors: PricingFactors = useMemo(() => ({
    propertyType: factors.propertyType || assessment?.propertyType || 'single_family',
    squareFootage: factors.squareFootage || assessment?.squareFootage || 2000,
    pestType: factors.pestType || 'general',
    severity: factors.severity || assessment?.pestFindings?.[0]?.severity || 'light',
    frequency: factors.frequency || (isRecurring ? 'quarterly' : 'one_time'),
    accessDifficulty: factors.accessDifficulty || assessment?.accessDifficulty || 'easy',
    distanceFromBranch: factors.distanceFromBranch || assessment?.distanceFromBranch || 0,
    isRush: factors.isRush || false,
    isAfterHours: factors.isAfterHours || false,
    isWeekend: factors.isWeekend || false,
    contractLengthMonths: factors.contractLengthMonths,
    numberOfUnits: factors.numberOfUnits || assessment?.numberOfUnits,
  }), [factors, assessment, isRecurring]);

  // Calculate price
  const calculatedPrice = useMemo(() => {
    return calculatePrice(completeFutradeFactors, DEFAULT_PRICING_MATRIX, isRecurring);
  }, [completeFutradeFactors, isRecurring]);

  // Apply discount if set
  const finalPrice = useMemo(() => {
    let price = overridePrice !== null ? overridePrice : calculatedPrice.suggestedPrice;
    
    if (discountPercent > 0) {
      price = price - Math.round(price * discountPercent / 100);
    }
    
    return price;
  }, [calculatedPrice.suggestedPrice, overridePrice, discountPercent]);

  // Calculate margin (simplified estimate)
  const estimatedMargin = useMemo(() => {
    const estimatedCost = calculatedPrice.basePrice * 0.35; // 35% estimated cost
    const margin = finalPrice - estimatedCost;
    const marginPercent = (margin / finalPrice) * 100;
    return { margin, marginPercent };
  }, [finalPrice, calculatedPrice.basePrice]);

  // Notify parent of price changes
  useEffect(() => {
    if (onPriceCalculated) {
      onPriceCalculated({
        ...calculatedPrice,
        suggestedPrice: finalPrice,
      });
    }
  }, [finalPrice, calculatedPrice, onPriceCalculated]);

  const handleOverrideSubmit = () => {
    if (overridePrice !== null && onOverridePrice) {
      onOverridePrice(overridePrice);
    }
    setIsOverriding(false);
  };

  const renderAdjustmentRow = (adj: PriceAdjustment) => {
    const isDiscount = adj.impact < 0;
    
    return (
      <Box
        key={adj.name}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 0.5,
          px: 1,
          borderRadius: 1,
          bgcolor: isDiscount ? 'success.light' : adj.impact > 0 ? 'warning.light' : 'transparent',
          '& + &': { mt: 0.5 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isDiscount ? (
            <TrendingDownIcon fontSize="small" color="success" />
          ) : adj.impact > 0 ? (
            <TrendingUpIcon fontSize="small" color="warning" />
          ) : null}
          <Box>
            <Typography variant="body2">{adj.name}</Typography>
            {adj.description && (
              <Typography variant="caption" color="text.secondary">
                {adj.description}
              </Typography>
            )}
          </Box>
        </Box>
        <Typography
          variant="body2"
          fontWeight={500}
          color={isDiscount ? 'success.main' : adj.impact > 0 ? 'warning.dark' : 'text.primary'}
        >
          {adj.impact >= 0 ? '+' : ''}{formatCurrency(adj.impact)}
        </Typography>
      </Box>
    );
  };

  if (compact) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {isRecurring ? 'Per Visit' : 'Total'}
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary">
              {formatCurrency(finalPrice)}
            </Typography>
            {isRecurring && calculatedPrice.annualValue > 0 && (
              <Typography variant="caption" color="text.secondary">
                {formatCurrency(calculatedPrice.annualValue)}/year ({calculatedPrice.visitsPerYear} visits)
              </Typography>
            )}
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expanded}>
          <Divider sx={{ my: 1 }} />
          {calculatedPrice.adjustments.map(renderAdjustmentRow)}
        </Collapse>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <CalculateIcon />
        <Typography variant="h6">Dynamic Pricing</Typography>
        {overridePrice !== null && (
          <Chip
            label="Price Override"
            size="small"
            sx={{ bgcolor: 'white', color: 'primary.main' }}
          />
        )}
      </Box>

      {/* Main Price Display */}
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
        {isOverriding ? (
          <Box sx={{ maxWidth: 200, mx: 'auto' }}>
            <TextField
              fullWidth
              label="Override Price"
              type="number"
              value={(overridePrice || calculatedPrice.suggestedPrice) / 100}
              onChange={(e) => setOverridePrice(Math.round(parseFloat(e.target.value) * 100) || 0)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              autoFocus
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button size="small" onClick={() => setIsOverriding(false)}>Cancel</Button>
              <Button size="small" variant="contained" onClick={handleOverrideSubmit}>Apply</Button>
            </Box>
          </Box>
        ) : (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {isRecurring ? `${FREQUENCY_LABELS[completeFutradeFactors.frequency]} Price` : 'Service Price'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {formatCurrency(finalPrice)}
              </Typography>
              
              {allowPriceOverride && (
                <Tooltip title="Override calculated price">
                  <IconButton size="small" onClick={() => setIsOverriding(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            {isRecurring && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={<RepeatIcon />}
                  label={`${formatCurrency(calculatedPrice.annualValue)}/year (${calculatedPrice.visitsPerYear} visits)`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            )}
            
            {overridePrice !== null && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Calculated: {formatCurrency(calculatedPrice.suggestedPrice)} (overridden)
              </Typography>
            )}
          </>
        )}
      </Box>

      {/* Discount Slider */}
      <Box sx={{ px: 3, py: 2, bgcolor: 'grey.100' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalOfferIcon fontSize="small" color="success" />
            <Typography variant="subtitle2">Quick Discount</Typography>
          </Box>
          <Typography variant="body2" fontWeight={600} color="success.main">
            {discountPercent}% off
          </Typography>
        </Box>
        <Slider
          value={discountPercent}
          onChange={(_, value) => setDiscountPercent(value as number)}
          min={0}
          max={30}
          step={5}
          marks={[
            { value: 0, label: '0%' },
            { value: 10, label: '10%' },
            { value: 20, label: '20%' },
            { value: 30, label: '30%' },
          ]}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}%`}
          color="success"
        />
        {discountPercent > 20 && (
          <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
            <Typography variant="caption">
              Discounts over 20% may require manager approval
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Margin Indicator */}
      <Box sx={{ px: 3, py: 1.5, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Estimated Margin
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            color={estimatedMargin.marginPercent >= 50 ? 'success.main' : 
                   estimatedMargin.marginPercent >= 30 ? 'warning.main' : 'error.main'}
          >
            {estimatedMargin.marginPercent.toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(estimatedMargin.marginPercent, 100)}
          sx={{
            height: 8,
            borderRadius: 1,
            bgcolor: 'grey.300',
            '& .MuiLinearProgress-bar': {
              bgcolor: estimatedMargin.marginPercent >= 50 ? 'success.main' : 
                       estimatedMargin.marginPercent >= 30 ? 'warning.main' : 'error.main',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Est. Profit: {formatCurrency(estimatedMargin.margin)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Target: 50%+
          </Typography>
        </Box>
      </Box>

      {/* Price Breakdown */}
      <Box sx={{ px: 2, py: 1 }}>
        <Button
          fullWidth
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ justifyContent: 'space-between' }}
        >
          Price Breakdown
        </Button>
      </Box>
      
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2 }}>
          {/* Base Price */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Base Price</Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatCurrency(calculatedPrice.basePrice)}
            </Typography>
          </Box>
          
          {/* Adjustments */}
          {calculatedPrice.adjustments.length > 0 ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                Adjustments
              </Typography>
              {calculatedPrice.adjustments.map(renderAdjustmentRow)}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No adjustments applied
            </Typography>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {/* Totals */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Subtotal</Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatCurrency(calculatedPrice.subtotal)}
            </Typography>
          </Box>
          
          {discountPercent > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
              <Typography variant="body2">Discount ({discountPercent}%)</Typography>
              <Typography variant="body2" fontWeight={500}>
                -{formatCurrency(Math.round(calculatedPrice.suggestedPrice * discountPercent / 100))}
              </Typography>
            </Box>
          )}
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              p: 1.5,
              bgcolor: 'primary.light',
              borderRadius: 1,
              mt: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>Final Price</Typography>
            <Typography variant="subtitle1" fontWeight={700} color="primary.dark">
              {formatCurrency(finalPrice)}
            </Typography>
          </Box>
        </Box>
      </Collapse>

      {/* Factors Summary */}
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
          Pricing Factors
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label={completeFutradeFactors.propertyType.replace('_', ' ')}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${completeFutradeFactors.squareFootage.toLocaleString()} sq ft`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={completeFutradeFactors.pestType}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${completeFutradeFactors.severity} severity`}
            size="small"
            variant="outlined"
            color={
              completeFutradeFactors.severity === 'critical' ? 'error' :
              completeFutradeFactors.severity === 'severe' ? 'warning' :
              'default'
            }
          />
          {isRecurring && (
            <Chip
              label={FREQUENCY_LABELS[completeFutradeFactors.frequency]}
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default DynamicPricingPanel;

