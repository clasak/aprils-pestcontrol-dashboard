/**
 * Pest Control CRM - Dynamic Pricing Types
 * 
 * These types power the intelligent pricing engine that automatically
 * adjusts quotes based on property characteristics, pest severity,
 * service frequency, and other factors.
 */

// ============================================================================
// PROPERTY ASSESSMENT
// ============================================================================

export type PropertyType = 
  | 'single_family'
  | 'multi_family'
  | 'apartment'
  | 'condo'
  | 'townhouse'
  | 'mobile_home'
  | 'commercial_office'
  | 'commercial_retail'
  | 'commercial_restaurant'
  | 'commercial_warehouse'
  | 'commercial_industrial'
  | 'commercial_medical'
  | 'agricultural'
  | 'other';

export type InfestationSeverity = 'none' | 'light' | 'moderate' | 'severe' | 'critical';

export type AccessDifficulty = 'easy' | 'moderate' | 'difficult' | 'requires_equipment';

export interface PropertyAssessment {
  id: string;
  contactId: string;
  
  // Property Details
  propertyType: PropertyType;
  squareFootage: number;
  lotSizeAcres?: number;
  stories: number;
  yearBuilt?: number;
  numberOfUnits?: number;
  
  // Structure Features
  hasBasement: boolean;
  hasCrawlSpace: boolean;
  hasAttic: boolean;
  hasGarage: boolean;
  hasPool: boolean;
  hasSprinklerSystem: boolean;
  
  // Risk Factors
  moistureIssues: boolean;
  woodToGroundContact: boolean;
  vegetationTouchingStructure: boolean;
  standingWater: boolean;
  foodStorageType: 'residential' | 'commercial_kitchen' | 'warehouse' | 'none';
  nearWaterSource: boolean;
  
  // Current Pest Activity
  pestFindings: PestFinding[];
  
  // Access & Location
  accessDifficulty: AccessDifficulty;
  distanceFromBranch?: number; // miles
  requiresSpecialEquipment: boolean;
  specialEquipmentNotes?: string;
  
  // Service Address (if different from contact)
  serviceAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Documentation
  photos: InspectionPhoto[];
  diagrams: SiteDiagram[];
  notes: string;
  
  // Assessment Info
  assessedAt: string;
  assessedBy: string;
  
  // Recommendations
  recommendedServices: string[];
  recommendedFrequency: ServiceFrequency;
  urgencyLevel: 'routine' | 'soon' | 'urgent' | 'emergency';
  estimatedCost?: number;
}

export interface PestFinding {
  id: string;
  pestType: PestType;
  severity: InfestationSeverity;
  locations: string[];
  evidenceType: ('live_pests' | 'droppings' | 'damage' | 'nests' | 'tracks' | 'other')[];
  photos?: string[];
  notes?: string;
}

export interface InspectionPhoto {
  id: string;
  url: string;
  thumbnail?: string;
  caption: string;
  location: string;
  timestamp: string;
  tags?: string[];
}

export interface SiteDiagram {
  id: string;
  name: string;
  imageUrl: string;
  annotations?: DiagramAnnotation[];
  createdAt: string;
}

export interface DiagramAnnotation {
  id: string;
  type: 'pest_activity' | 'treatment_zone' | 'entry_point' | 'bait_station' | 'note';
  x: number;
  y: number;
  label: string;
  color?: string;
}

// ============================================================================
// PEST TYPES & TREATMENTS
// ============================================================================

export type PestType = 
  | 'ants'
  | 'roaches'
  | 'spiders'
  | 'termites'
  | 'bed_bugs'
  | 'mice'
  | 'rats'
  | 'mosquitoes'
  | 'fleas'
  | 'ticks'
  | 'wasps'
  | 'bees'
  | 'silverfish'
  | 'centipedes'
  | 'earwigs'
  | 'crickets'
  | 'flies'
  | 'gnats'
  | 'moths'
  | 'beetles'
  | 'scorpions'
  | 'raccoons'
  | 'squirrels'
  | 'birds'
  | 'snakes'
  | 'other_wildlife'
  | 'general';

export type ServiceFrequency = 
  | 'one_time'
  | 'weekly'
  | 'bi_weekly'
  | 'monthly'
  | 'bi_monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'annual'
  | 'custom';

export type TreatmentMethod =
  | 'spray'
  | 'bait'
  | 'trap'
  | 'fumigation'
  | 'heat'
  | 'exclusion'
  | 'removal'
  | 'monitoring'
  | 'granular'
  | 'dust'
  | 'aerosol';

// ============================================================================
// PRICING ENGINE
// ============================================================================

export interface PricingMatrix {
  // Base prices by pest type (in cents)
  pestBasePrices: Record<PestType, {
    inspection: number;
    oneTime: number;
    recurring: number;
    perSqFt?: number;
  }>;
  
  // Property type multipliers
  propertyTypeMultipliers: Record<PropertyType, number>;
  
  // Severity multipliers
  severityMultipliers: Record<InfestationSeverity, number>;
  
  // Frequency discounts (percentage off)
  frequencyDiscounts: Record<ServiceFrequency, number>;
  
  // Size tiers (sqft thresholds)
  sizeTiers: SizeTier[];
  
  // Access difficulty surcharges (in cents)
  accessSurcharges: Record<AccessDifficulty, number>;
  
  // Distance-based pricing
  distancePricing: {
    baseMiles: number; // Free travel within this
    perMileCharge: number; // Cents per mile beyond base
    maxCharge: number; // Cap on travel charges
  };
  
  // Seasonal adjustments
  seasonalAdjustments: SeasonalAdjustment[];
  
  // Time-based pricing
  rushSurcharge: number; // Percentage for same-day/next-day
  afterHoursSurcharge: number; // Percentage for after hours
  weekendSurcharge: number; // Percentage for weekends
}

export interface SizeTier {
  minSqFt: number;
  maxSqFt: number;
  multiplier: number;
  additionalFee?: number;
}

export interface SeasonalAdjustment {
  pestType: PestType | 'all';
  startMonth: number; // 1-12
  endMonth: number;
  multiplier: number;
  name: string; // e.g., "Summer mosquito season"
}

export interface PricingFactors {
  propertyType: PropertyType;
  squareFootage: number;
  pestType: PestType;
  severity: InfestationSeverity;
  frequency: ServiceFrequency;
  accessDifficulty: AccessDifficulty;
  distanceFromBranch: number;
  isRush: boolean;
  isAfterHours: boolean;
  isWeekend: boolean;
  contractLengthMonths?: number;
  numberOfUnits?: number;
}

export interface CalculatedPrice {
  basePrice: number;
  
  // Individual adjustments
  propertyTypeAdjustment: number;
  sizeAdjustment: number;
  severityAdjustment: number;
  frequencyDiscount: number;
  accessSurcharge: number;
  distanceSurcharge: number;
  seasonalAdjustment: number;
  rushSurcharge: number;
  timeSurcharge: number;
  contractDiscount: number;
  multiUnitDiscount: number;
  
  // Totals
  subtotal: number;
  suggestedPrice: number;
  
  // Per-visit and annual values
  pricePerVisit: number;
  annualValue: number;
  visitsPerYear: number;
  
  // Breakdown for display
  adjustments: PriceAdjustment[];
  
  // Profit analysis
  estimatedCost?: number;
  estimatedMargin?: number;
  marginPercent?: number;
}

export interface PriceAdjustment {
  name: string;
  type: 'multiplier' | 'fixed' | 'discount';
  value: number;
  impact: number; // In cents
  description?: string;
}

// ============================================================================
// SERVICE PACKAGES & TIERS
// ============================================================================

export interface ServicePackage {
  id: string;
  name: string;
  tier: 'basic' | 'standard' | 'premium' | 'custom';
  description: string;
  shortDescription: string;
  
  // Included services
  services: PackageService[];
  
  // Pricing
  basePrice: number;
  frequency: ServiceFrequency;
  pricePerSqFt?: number;
  setupFee?: number;
  
  // Value props
  savings?: number; // Compared to individual services
  savingsPercent?: number;
  
  // Coverage
  coveredPests: PestType[];
  excludedPests?: PestType[];
  
  // Features
  features: string[];
  guarantees: string[];
  
  // Display
  isPopular?: boolean;
  color?: string;
  icon?: string;
  
  // Availability
  isActive: boolean;
  propertyTypes?: PropertyType[];
  minSqFt?: number;
  maxSqFt?: number;
}

export interface PackageService {
  serviceId: string;
  name: string;
  description: string;
  frequency: ServiceFrequency;
  isIncluded: boolean;
  isOptional?: boolean;
  additionalCost?: number;
}

export interface TieredQuoteOption {
  tier: 'basic' | 'standard' | 'premium';
  name: string;
  package: ServicePackage;
  calculatedPrice: CalculatedPrice;
  isRecommended: boolean;
  comparisonPoints: ComparisonPoint[];
}

export interface ComparisonPoint {
  feature: string;
  basic: boolean | string;
  standard: boolean | string;
  premium: boolean | string;
}

// ============================================================================
// QUOTE CONFIGURATION
// ============================================================================

export interface QuoteLineItemConfig {
  id: string;
  serviceTypeId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: 'each' | 'sqft' | 'linear_ft' | 'hour' | 'visit';
  
  // Pricing
  discountPercent?: number;
  discountAmount?: number;
  isTaxable: boolean;
  taxRate?: number;
  
  // Frequency
  frequency: ServiceFrequency;
  isRecurring: boolean;
  
  // Dynamic pricing factors used
  pricingFactors?: Partial<PricingFactors>;
  
  // Options
  isOptional: boolean;
  isSelected: boolean;
  
  // Calculated
  subtotal: number;
  total: number;
  annualValue?: number;
}

export interface QuoteConfiguration {
  // Customer & Property
  contactId: string;
  propertyAssessment?: PropertyAssessment;
  
  // Selected Package (if using packages)
  selectedPackageId?: string;
  selectedTier?: 'basic' | 'standard' | 'premium' | 'custom';
  
  // Line Items
  lineItems: QuoteLineItemConfig[];
  
  // Pricing Summary
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  
  // Recurring values
  monthlyValue?: number;
  annualValue?: number;
  setupFee?: number;
  
  // Service details
  serviceFrequency: ServiceFrequency;
  contractLengthMonths?: number;
  startDate?: string;
  
  // Terms
  validUntil: string;
  paymentTerms: string;
  guarantees: string[];
  
  // Approval
  requiresApproval: boolean;
  approvalReason?: string;
  
  // Notes
  internalNotes?: string;
  customerNotes?: string;
  
  // Documentation
  attachedPhotos?: string[];
  attachedDiagrams?: string[];
}

// ============================================================================
// QUOTE TRACKING & ANALYTICS
// ============================================================================

export interface QuoteActivity {
  id: string;
  quoteId: string;
  type: 'created' | 'sent' | 'viewed' | 'downloaded' | 'accepted' | 'rejected' | 'revised' | 'expired' | 'followed_up';
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface QuoteMetrics {
  quoteId: string;
  
  // Time metrics
  createdAt: string;
  sentAt?: string;
  firstViewedAt?: string;
  lastViewedAt?: string;
  respondedAt?: string;
  
  // Engagement
  viewCount: number;
  uniqueViews: number;
  totalViewDuration?: number; // seconds
  downloadCount: number;
  
  // Outcome
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  daysToResponse?: number;
  daysOpen?: number;
  
  // Follow-ups
  followUpCount: number;
  lastFollowUpAt?: string;
  nextFollowUpAt?: string;
}

export interface QuoteAnalyticsSummary {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  
  // Volume
  quotesCreated: number;
  quotesSent: number;
  quotesAccepted: number;
  quotesRejected: number;
  quotesExpired: number;
  
  // Values
  totalQuotedValue: number;
  totalAcceptedValue: number;
  averageQuoteValue: number;
  averageDealSize: number;
  
  // Rates
  conversionRate: number;
  viewRate: number;
  acceptanceRate: number;
  
  // Timing
  averageTimeToSend: number; // hours
  averageTimeToView: number; // hours
  averageTimeToAccept: number; // days
  
  // By category
  byServiceType: Record<string, { count: number; value: number; rate: number }>;
  byPropertyType: Record<PropertyType, { count: number; value: number; rate: number }>;
  byRep: Record<string, { count: number; value: number; rate: number }>;
}

// ============================================================================
// APPROVAL WORKFLOW
// ============================================================================

export interface ApprovalRule {
  id: string;
  name: string;
  priority: number;
  isActive: boolean;
  
  // Conditions
  conditions: ApprovalCondition[];
  
  // Required approvers
  approverRoles: string[];
  approverUserIds?: string[];
  
  // Settings
  autoApprove: boolean;
  escalationHours?: number;
  escalateTo?: string[];
}

export interface ApprovalCondition {
  field: 'discountPercent' | 'discountAmount' | 'totalAmount' | 'marginPercent' | 'customField';
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'between';
  value: number | [number, number];
  customFieldName?: string;
}

export interface ApprovalRequest {
  id: string;
  quoteId: string;
  requestedBy: string;
  requestedAt: string;
  
  // Rule that triggered
  triggeredRuleId: string;
  triggerReason: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  
  // Decision
  decidedBy?: string;
  decidedAt?: string;
  decision?: 'approved' | 'rejected';
  decisionNotes?: string;
  
  // Escalation
  escalatedAt?: string;
  escalatedTo?: string;
}

