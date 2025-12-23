/**
 * Pest Control CRM - Dynamic Pricing Engine
 * 
 * Intelligent pricing calculations based on:
 * - Property size and type
 * - Pest type and infestation severity
 * - Service frequency and contract length
 * - Travel distance and access difficulty
 * - Seasonal factors and time-based surcharges
 */

import {
  PricingMatrix,
  PricingFactors,
  CalculatedPrice,
  PriceAdjustment,
  PropertyType,
  PestType,
  InfestationSeverity,
  ServiceFrequency,
  AccessDifficulty,
  ServicePackage,
  TieredQuoteOption,
  PropertyAssessment,
} from '../types/pricing.types';

// ============================================================================
// DEFAULT PRICING MATRIX
// ============================================================================

export const DEFAULT_PRICING_MATRIX: PricingMatrix = {
  // Base prices by pest type (in cents)
  pestBasePrices: {
    general: { inspection: 0, oneTime: 17500, recurring: 7500, perSqFt: 3 },
    ants: { inspection: 0, oneTime: 15000, recurring: 6500, perSqFt: 2 },
    roaches: { inspection: 0, oneTime: 17500, recurring: 7500, perSqFt: 3 },
    spiders: { inspection: 0, oneTime: 12500, recurring: 5500, perSqFt: 2 },
    termites: { inspection: 15000, oneTime: 200000, recurring: 15000, perSqFt: 8 },
    bed_bugs: { inspection: 20000, oneTime: 150000, recurring: 50000, perSqFt: 25 },
    mice: { inspection: 10000, oneTime: 25000, recurring: 7500, perSqFt: 3 },
    rats: { inspection: 10000, oneTime: 30000, recurring: 10000, perSqFt: 4 },
    mosquitoes: { inspection: 0, oneTime: 12500, recurring: 8500, perSqFt: 1 },
    fleas: { inspection: 5000, oneTime: 22500, recurring: 12500, perSqFt: 5 },
    ticks: { inspection: 5000, oneTime: 20000, recurring: 10000, perSqFt: 4 },
    wasps: { inspection: 0, oneTime: 17500, recurring: 0, perSqFt: 0 },
    bees: { inspection: 0, oneTime: 25000, recurring: 0, perSqFt: 0 },
    silverfish: { inspection: 0, oneTime: 12500, recurring: 5000, perSqFt: 2 },
    centipedes: { inspection: 0, oneTime: 12500, recurring: 5000, perSqFt: 2 },
    earwigs: { inspection: 0, oneTime: 12500, recurring: 5000, perSqFt: 2 },
    crickets: { inspection: 0, oneTime: 12500, recurring: 5000, perSqFt: 2 },
    flies: { inspection: 0, oneTime: 15000, recurring: 7500, perSqFt: 2 },
    gnats: { inspection: 0, oneTime: 12500, recurring: 5000, perSqFt: 2 },
    moths: { inspection: 0, oneTime: 15000, recurring: 7500, perSqFt: 3 },
    beetles: { inspection: 0, oneTime: 15000, recurring: 7500, perSqFt: 3 },
    scorpions: { inspection: 0, oneTime: 20000, recurring: 10000, perSqFt: 4 },
    raccoons: { inspection: 15000, oneTime: 35000, recurring: 0, perSqFt: 0 },
    squirrels: { inspection: 10000, oneTime: 30000, recurring: 0, perSqFt: 0 },
    birds: { inspection: 10000, oneTime: 25000, recurring: 0, perSqFt: 0 },
    snakes: { inspection: 10000, oneTime: 25000, recurring: 0, perSqFt: 0 },
    other_wildlife: { inspection: 15000, oneTime: 35000, recurring: 0, perSqFt: 0 },
  },
  
  // Property type multipliers
  propertyTypeMultipliers: {
    single_family: 1.0,
    multi_family: 1.3,
    apartment: 0.85, // Per unit
    condo: 0.9,
    townhouse: 0.95,
    mobile_home: 0.8,
    commercial_office: 1.4,
    commercial_retail: 1.5,
    commercial_restaurant: 1.8, // High pest risk
    commercial_warehouse: 1.6,
    commercial_industrial: 1.7,
    commercial_medical: 2.0, // High compliance
    agricultural: 1.5,
    other: 1.0,
  },
  
  // Severity multipliers
  severityMultipliers: {
    none: 0.5, // Preventive only
    light: 1.0,
    moderate: 1.35,
    severe: 1.75,
    critical: 2.25,
  },
  
  // Frequency discounts (percentage off recurring price)
  frequencyDiscounts: {
    one_time: 0,
    weekly: 25,
    bi_weekly: 20,
    monthly: 15,
    bi_monthly: 10,
    quarterly: 5,
    semi_annual: 0,
    annual: 0,
    custom: 0,
  },
  
  // Size tiers
  sizeTiers: [
    { minSqFt: 0, maxSqFt: 1000, multiplier: 0.8 },
    { minSqFt: 1001, maxSqFt: 2000, multiplier: 1.0 },
    { minSqFt: 2001, maxSqFt: 3000, multiplier: 1.15 },
    { minSqFt: 3001, maxSqFt: 4000, multiplier: 1.3 },
    { minSqFt: 4001, maxSqFt: 5000, multiplier: 1.45 },
    { minSqFt: 5001, maxSqFt: 7500, multiplier: 1.6 },
    { minSqFt: 7501, maxSqFt: 10000, multiplier: 1.8 },
    { minSqFt: 10001, maxSqFt: Infinity, multiplier: 2.0, additionalFee: 5000 },
  ],
  
  // Access difficulty surcharges
  accessSurcharges: {
    easy: 0,
    moderate: 2500, // $25
    difficult: 5000, // $50
    requires_equipment: 10000, // $100
  },
  
  // Distance-based pricing
  distancePricing: {
    baseMiles: 15,
    perMileCharge: 150, // $1.50 per mile
    maxCharge: 7500, // $75 cap
  },
  
  // Seasonal adjustments
  seasonalAdjustments: [
    { pestType: 'mosquitoes', startMonth: 4, endMonth: 9, multiplier: 1.2, name: 'Mosquito Season' },
    { pestType: 'ants', startMonth: 3, endMonth: 8, multiplier: 1.15, name: 'Ant Season' },
    { pestType: 'wasps', startMonth: 5, endMonth: 9, multiplier: 1.25, name: 'Wasp Season' },
    { pestType: 'termites', startMonth: 3, endMonth: 6, multiplier: 1.1, name: 'Termite Swarm Season' },
    { pestType: 'all', startMonth: 6, endMonth: 8, multiplier: 1.05, name: 'Summer Peak' },
  ],
  
  // Time-based surcharges
  rushSurcharge: 25, // 25% for same-day/next-day
  afterHoursSurcharge: 35, // 35% after hours
  weekendSurcharge: 20, // 20% weekends
};

// ============================================================================
// PRICING CALCULATION ENGINE
// ============================================================================

/**
 * Calculate the price for a service based on all factors
 */
export function calculatePrice(
  factors: PricingFactors,
  matrix: PricingMatrix = DEFAULT_PRICING_MATRIX,
  isRecurring: boolean = false
): CalculatedPrice {
  const adjustments: PriceAdjustment[] = [];
  
  // Get base price for pest type
  const pestPricing = matrix.pestBasePrices[factors.pestType] || matrix.pestBasePrices.general;
  let basePrice = isRecurring ? pestPricing.recurring : pestPricing.oneTime;
  
  // Add per-sqft pricing if applicable
  if (pestPricing.perSqFt && factors.squareFootage > 2000) {
    const additionalSqFt = factors.squareFootage - 2000;
    const sqftCharge = additionalSqFt * pestPricing.perSqFt;
    basePrice += sqftCharge;
    adjustments.push({
      name: 'Square Footage',
      type: 'fixed',
      value: sqftCharge,
      impact: sqftCharge,
      description: `${additionalSqFt} sq ft over base @ $${(pestPricing.perSqFt / 100).toFixed(2)}/sq ft`,
    });
  }
  
  // Property type adjustment
  const propertyMultiplier = matrix.propertyTypeMultipliers[factors.propertyType] || 1.0;
  const propertyTypeAdjustment = Math.round(basePrice * (propertyMultiplier - 1));
  if (propertyTypeAdjustment !== 0) {
    adjustments.push({
      name: 'Property Type',
      type: 'multiplier',
      value: propertyMultiplier,
      impact: propertyTypeAdjustment,
      description: formatPropertyType(factors.propertyType),
    });
  }
  
  // Size tier adjustment
  const sizeTier = matrix.sizeTiers.find(
    tier => factors.squareFootage >= tier.minSqFt && factors.squareFootage <= tier.maxSqFt
  ) || matrix.sizeTiers[0];
  const sizeAdjustment = Math.round(basePrice * (sizeTier.multiplier - 1)) + (sizeTier.additionalFee || 0);
  if (sizeAdjustment !== 0) {
    adjustments.push({
      name: 'Property Size',
      type: 'multiplier',
      value: sizeTier.multiplier,
      impact: sizeAdjustment,
      description: `${factors.squareFootage.toLocaleString()} sq ft`,
    });
  }
  
  // Severity adjustment
  const severityMultiplier = matrix.severityMultipliers[factors.severity] || 1.0;
  const severityAdjustment = Math.round(basePrice * (severityMultiplier - 1));
  if (severityAdjustment !== 0 && factors.severity !== 'light') {
    adjustments.push({
      name: 'Infestation Level',
      type: 'multiplier',
      value: severityMultiplier,
      impact: severityAdjustment,
      description: `${factors.severity.charAt(0).toUpperCase() + factors.severity.slice(1)} infestation`,
    });
  }
  
  // Frequency discount (for recurring services)
  let frequencyDiscount = 0;
  if (isRecurring && factors.frequency !== 'one_time') {
    const discountPercent = matrix.frequencyDiscounts[factors.frequency] || 0;
    if (discountPercent > 0) {
      frequencyDiscount = Math.round(basePrice * discountPercent / 100);
      adjustments.push({
        name: 'Frequency Discount',
        type: 'discount',
        value: discountPercent,
        impact: -frequencyDiscount,
        description: `${discountPercent}% off for ${formatFrequency(factors.frequency)} service`,
      });
    }
  }
  
  // Access difficulty surcharge
  const accessSurcharge = matrix.accessSurcharges[factors.accessDifficulty] || 0;
  if (accessSurcharge > 0) {
    adjustments.push({
      name: 'Access Difficulty',
      type: 'fixed',
      value: accessSurcharge,
      impact: accessSurcharge,
      description: `${factors.accessDifficulty.replace('_', ' ')} access`,
    });
  }
  
  // Distance surcharge
  let distanceSurcharge = 0;
  if (factors.distanceFromBranch > matrix.distancePricing.baseMiles) {
    const extraMiles = factors.distanceFromBranch - matrix.distancePricing.baseMiles;
    distanceSurcharge = Math.min(
      extraMiles * matrix.distancePricing.perMileCharge,
      matrix.distancePricing.maxCharge
    );
    adjustments.push({
      name: 'Travel Distance',
      type: 'fixed',
      value: distanceSurcharge,
      impact: distanceSurcharge,
      description: `${factors.distanceFromBranch} miles (${extraMiles} miles over base)`,
    });
  }
  
  // Seasonal adjustment
  let seasonalAdjustment = 0;
  const currentMonth = new Date().getMonth() + 1;
  const applicableSeasons = matrix.seasonalAdjustments.filter(season => {
    const matchesPest = season.pestType === 'all' || season.pestType === factors.pestType;
    const inSeason = currentMonth >= season.startMonth && currentMonth <= season.endMonth;
    return matchesPest && inSeason;
  });
  
  if (applicableSeasons.length > 0) {
    // Take the highest seasonal multiplier
    const maxSeason = applicableSeasons.reduce((max, s) => s.multiplier > max.multiplier ? s : max);
    seasonalAdjustment = Math.round(basePrice * (maxSeason.multiplier - 1));
    adjustments.push({
      name: 'Seasonal Adjustment',
      type: 'multiplier',
      value: maxSeason.multiplier,
      impact: seasonalAdjustment,
      description: maxSeason.name,
    });
  }
  
  // Rush/time-based surcharges
  let rushSurcharge = 0;
  let timeSurcharge = 0;
  
  if (factors.isRush) {
    rushSurcharge = Math.round(basePrice * matrix.rushSurcharge / 100);
    adjustments.push({
      name: 'Rush Service',
      type: 'multiplier',
      value: matrix.rushSurcharge,
      impact: rushSurcharge,
      description: 'Same-day or next-day service',
    });
  }
  
  if (factors.isAfterHours || factors.isWeekend) {
    const surchargePercent = factors.isAfterHours ? matrix.afterHoursSurcharge : matrix.weekendSurcharge;
    timeSurcharge = Math.round(basePrice * surchargePercent / 100);
    adjustments.push({
      name: factors.isAfterHours ? 'After Hours' : 'Weekend Service',
      type: 'multiplier',
      value: surchargePercent,
      impact: timeSurcharge,
      description: factors.isAfterHours ? 'After regular business hours' : 'Weekend service',
    });
  }
  
  // Contract length discount
  let contractDiscount = 0;
  if (factors.contractLengthMonths) {
    if (factors.contractLengthMonths >= 24) {
      contractDiscount = Math.round(basePrice * 0.15);
      adjustments.push({
        name: 'Long-Term Contract',
        type: 'discount',
        value: 15,
        impact: -contractDiscount,
        description: `${factors.contractLengthMonths} month contract (15% off)`,
      });
    } else if (factors.contractLengthMonths >= 12) {
      contractDiscount = Math.round(basePrice * 0.10);
      adjustments.push({
        name: 'Annual Contract',
        type: 'discount',
        value: 10,
        impact: -contractDiscount,
        description: `${factors.contractLengthMonths} month contract (10% off)`,
      });
    }
  }
  
  // Multi-unit discount
  let multiUnitDiscount = 0;
  if (factors.numberOfUnits && factors.numberOfUnits > 1) {
    const discountPercent = Math.min(factors.numberOfUnits * 5, 30); // 5% per unit, max 30%
    multiUnitDiscount = Math.round(basePrice * discountPercent / 100);
    adjustments.push({
      name: 'Multi-Unit Discount',
      type: 'discount',
      value: discountPercent,
      impact: -multiUnitDiscount,
      description: `${factors.numberOfUnits} units (${discountPercent}% off)`,
    });
  }
  
  // Calculate totals
  const subtotal = basePrice + propertyTypeAdjustment + sizeAdjustment + severityAdjustment +
                   accessSurcharge + distanceSurcharge + seasonalAdjustment + rushSurcharge + timeSurcharge;
  
  const totalDiscounts = frequencyDiscount + contractDiscount + multiUnitDiscount;
  const suggestedPrice = Math.max(subtotal - totalDiscounts, Math.round(basePrice * 0.5)); // Min 50% of base
  
  // Calculate visits per year and annual value
  const visitsPerYear = getVisitsPerYear(factors.frequency);
  const pricePerVisit = isRecurring ? suggestedPrice : suggestedPrice;
  const annualValue = isRecurring ? pricePerVisit * visitsPerYear : suggestedPrice;
  
  return {
    basePrice,
    propertyTypeAdjustment,
    sizeAdjustment,
    severityAdjustment,
    frequencyDiscount: -frequencyDiscount,
    accessSurcharge,
    distanceSurcharge,
    seasonalAdjustment,
    rushSurcharge,
    timeSurcharge,
    contractDiscount: -contractDiscount,
    multiUnitDiscount: -multiUnitDiscount,
    subtotal,
    suggestedPrice,
    pricePerVisit,
    annualValue,
    visitsPerYear,
    adjustments,
  };
}

/**
 * Calculate prices for all three tiers (Good/Better/Best)
 */
export function calculateTieredOptions(
  factors: PricingFactors,
  packages: ServicePackage[],
  matrix: PricingMatrix = DEFAULT_PRICING_MATRIX
): TieredQuoteOption[] {
  const basicPackage = packages.find(p => p.tier === 'basic');
  const standardPackage = packages.find(p => p.tier === 'standard');
  const premiumPackage = packages.find(p => p.tier === 'premium');
  
  const options: TieredQuoteOption[] = [];
  
  // Calculate for each tier
  [
    { tier: 'basic' as const, pkg: basicPackage, recommended: false },
    { tier: 'standard' as const, pkg: standardPackage, recommended: true },
    { tier: 'premium' as const, pkg: premiumPackage, recommended: false },
  ].forEach(({ tier, pkg, recommended }) => {
    if (!pkg) return;
    
    // Adjust factors based on package
    const tierFactors: PricingFactors = {
      ...factors,
      frequency: pkg.frequency,
    };
    
    const price = calculatePrice(tierFactors, matrix, pkg.frequency !== 'one_time');
    
    // Apply package base price if set
    const finalPrice: CalculatedPrice = pkg.basePrice
      ? { ...price, suggestedPrice: pkg.basePrice + price.sizeAdjustment }
      : price;
    
    options.push({
      tier,
      name: pkg.name,
      package: pkg,
      calculatedPrice: finalPrice,
      isRecommended: recommended,
      comparisonPoints: [],
    });
  });
  
  // Build comparison points
  if (options.length > 0) {
    const comparisonFeatures = [
      'Interior treatment',
      'Exterior treatment',
      'Guaranteed response time',
      'Free re-treatments',
      'Termite monitoring',
      'Rodent control',
      'Seasonal pest surge coverage',
      '24/7 emergency service',
    ];
    
    options.forEach(option => {
      option.comparisonPoints = comparisonFeatures.map(feature => ({
        feature,
        basic: option.package.tier === 'basic' ? checkFeatureIncluded(option.package, feature) : false,
        standard: option.package.tier === 'standard' ? checkFeatureIncluded(option.package, feature) : false,
        premium: option.package.tier === 'premium' ? checkFeatureIncluded(option.package, feature) : false,
      }));
    });
  }
  
  return options;
}

/**
 * Generate a quick estimate from property assessment
 */
export function generateQuickEstimate(
  assessment: Partial<PropertyAssessment>,
  pestType: PestType = 'general',
  frequency: ServiceFrequency = 'quarterly',
  matrix: PricingMatrix = DEFAULT_PRICING_MATRIX
): CalculatedPrice {
  const factors: PricingFactors = {
    propertyType: assessment.propertyType || 'single_family',
    squareFootage: assessment.squareFootage || 2000,
    pestType,
    severity: assessment.pestFindings?.[0]?.severity || 'light',
    frequency,
    accessDifficulty: assessment.accessDifficulty || 'easy',
    distanceFromBranch: assessment.distanceFromBranch || 0,
    isRush: false,
    isAfterHours: false,
    isWeekend: false,
    numberOfUnits: assessment.numberOfUnits,
  };
  
  return calculatePrice(factors, matrix, frequency !== 'one_time');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getVisitsPerYear(frequency: ServiceFrequency): number {
  const visitsMap: Record<ServiceFrequency, number> = {
    one_time: 1,
    weekly: 52,
    bi_weekly: 26,
    monthly: 12,
    bi_monthly: 6,
    quarterly: 4,
    semi_annual: 2,
    annual: 1,
    custom: 4, // Default to quarterly
  };
  return visitsMap[frequency] || 1;
}

function formatPropertyType(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    single_family: 'Single Family Home',
    multi_family: 'Multi-Family',
    apartment: 'Apartment',
    condo: 'Condominium',
    townhouse: 'Townhouse',
    mobile_home: 'Mobile Home',
    commercial_office: 'Commercial Office',
    commercial_retail: 'Retail',
    commercial_restaurant: 'Restaurant',
    commercial_warehouse: 'Warehouse',
    commercial_industrial: 'Industrial',
    commercial_medical: 'Medical Facility',
    agricultural: 'Agricultural',
    other: 'Other',
  };
  return labels[type] || type;
}

function formatFrequency(frequency: ServiceFrequency): string {
  const labels: Record<ServiceFrequency, string> = {
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
  return labels[frequency] || frequency;
}

function checkFeatureIncluded(pkg: ServicePackage, feature: string): boolean | string {
  // Check if feature is in package features
  const lowerFeature = feature.toLowerCase();
  return pkg.features.some(f => f.toLowerCase().includes(lowerFeature)) ||
         pkg.guarantees.some(g => g.toLowerCase().includes(lowerFeature));
}

// ============================================================================
// FORMATTERS
// ============================================================================

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function formatPriceBreakdown(price: CalculatedPrice): string {
  let breakdown = `Base Price: ${formatCurrency(price.basePrice)}\n`;
  
  price.adjustments.forEach(adj => {
    const sign = adj.impact >= 0 ? '+' : '';
    breakdown += `${adj.name}: ${sign}${formatCurrency(adj.impact)} (${adj.description})\n`;
  });
  
  breakdown += `\nTotal: ${formatCurrency(price.suggestedPrice)}`;
  
  if (price.visitsPerYear > 1) {
    breakdown += `\nAnnual Value: ${formatCurrency(price.annualValue)} (${price.visitsPerYear} visits/year)`;
  }
  
  return breakdown;
}

// ============================================================================
// DEFAULT SERVICE PACKAGES
// ============================================================================

export const DEFAULT_SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'pkg-basic',
    name: 'Basic Protection',
    tier: 'basic',
    description: 'Essential pest control for common household pests. Quarterly exterior perimeter treatment to keep pests out.',
    shortDescription: 'Quarterly exterior treatment',
    services: [
      {
        serviceId: 'svc-general-quarterly',
        name: 'Quarterly Perimeter Treatment',
        description: 'Exterior treatment around the foundation and entry points',
        frequency: 'quarterly',
        isIncluded: true,
      },
    ],
    basePrice: 9900, // $99/quarter
    frequency: 'quarterly',
    coveredPests: ['ants', 'spiders', 'roaches', 'silverfish', 'earwigs', 'crickets'],
    excludedPests: ['termites', 'bed_bugs', 'mice', 'rats', 'wildlife'],
    features: [
      'Quarterly exterior treatment',
      'Entry point sealing',
      'Spider web removal',
      'Satisfaction guarantee',
    ],
    guarantees: [
      'Free re-treatment within 30 days if pests return',
    ],
    isPopular: false,
    color: '#1976d2',
    isActive: true,
  },
  {
    id: 'pkg-standard',
    name: 'Home Shield',
    tier: 'standard',
    description: 'Comprehensive protection with interior and exterior treatments. Our most popular plan for complete home coverage.',
    shortDescription: 'Monthly interior & exterior protection',
    services: [
      {
        serviceId: 'svc-general-monthly',
        name: 'Monthly Pest Control',
        description: 'Full interior and exterior treatment',
        frequency: 'monthly',
        isIncluded: true,
      },
      {
        serviceId: 'svc-rodent-monitoring',
        name: 'Rodent Monitoring',
        description: 'Exterior bait stations and monitoring',
        frequency: 'monthly',
        isIncluded: true,
      },
    ],
    basePrice: 7900, // $79/month
    frequency: 'monthly',
    coveredPests: ['ants', 'spiders', 'roaches', 'silverfish', 'earwigs', 'crickets', 'mice', 'wasps', 'fleas', 'ticks'],
    excludedPests: ['termites', 'bed_bugs'],
    features: [
      'Monthly interior & exterior treatment',
      'Rodent monitoring stations',
      'Wasp nest removal',
      'Spider web removal',
      'Entry point sealing',
      '48-hour response guarantee',
      'Free re-treatments between visits',
    ],
    guarantees: [
      'Pest-free guarantee',
      'Unlimited free re-treatments',
      '48-hour response time',
    ],
    isPopular: true,
    color: '#4caf50',
    isActive: true,
  },
  {
    id: 'pkg-premium',
    name: 'Total Defense',
    tier: 'premium',
    description: 'Ultimate protection including termite monitoring, rodent exclusion, and priority 24/7 service. Peace of mind for your biggest investment.',
    shortDescription: 'Complete protection including termites',
    services: [
      {
        serviceId: 'svc-general-monthly',
        name: 'Monthly Pest Control',
        description: 'Full interior and exterior treatment',
        frequency: 'monthly',
        isIncluded: true,
      },
      {
        serviceId: 'svc-termite-monitoring',
        name: 'Termite Monitoring System',
        description: 'Sentricon or similar bait station system',
        frequency: 'quarterly',
        isIncluded: true,
      },
      {
        serviceId: 'svc-rodent-exclusion',
        name: 'Rodent Exclusion',
        description: 'Comprehensive exclusion and monitoring',
        frequency: 'monthly',
        isIncluded: true,
      },
      {
        serviceId: 'svc-mosquito-seasonal',
        name: 'Seasonal Mosquito Control',
        description: 'Monthly treatment during mosquito season',
        frequency: 'monthly',
        isIncluded: true,
        isOptional: false,
      },
    ],
    basePrice: 14900, // $149/month
    frequency: 'monthly',
    coveredPests: ['ants', 'spiders', 'roaches', 'silverfish', 'earwigs', 'crickets', 'mice', 'rats', 'wasps', 'fleas', 'ticks', 'termites', 'mosquitoes', 'centipedes'],
    features: [
      'Monthly interior & exterior treatment',
      'Termite monitoring system',
      'Complete rodent exclusion',
      'Seasonal mosquito control',
      'Priority 24/7 emergency service',
      'Same-day response',
      'Transferable to new owners',
      'Annual termite inspection report',
    ],
    guarantees: [
      'Complete pest-free guarantee',
      '$1 million termite damage warranty',
      'Same-day emergency response',
      'Unlimited service calls',
      'Price lock guarantee',
    ],
    isPopular: false,
    color: '#9c27b0',
    isActive: true,
  },
];

