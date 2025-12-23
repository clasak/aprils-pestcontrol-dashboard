/**
 * CSV Parser Utility
 * 
 * Provides functions for parsing CSV files, detecting field mappings,
 * and transforming data for import into Supabase tables.
 */

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  preview: Record<string, string>[];
  errors: string[];
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone' | 'url';
  required: boolean;
  aliases?: string[]; // Alternative names for auto-mapping
}

export interface ImportTarget {
  id: string;
  name: string;
  description: string;
  fields: FieldDefinition[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  transform?: 'none' | 'trim' | 'lowercase' | 'uppercase' | 'phone' | 'email' | 'date' | 'number';
  defaultValue?: string;
}

// Import target definitions
export const IMPORT_TARGETS: ImportTarget[] = [
  {
    id: 'leads',
    name: 'Leads',
    description: 'Import potential customers',
    fields: [
      { name: 'first_name', label: 'First Name', type: 'string', required: false, aliases: ['firstname', 'fname', 'first'] },
      { name: 'last_name', label: 'Last Name', type: 'string', required: false, aliases: ['lastname', 'lname', 'last', 'surname'] },
      { name: 'email', label: 'Email', type: 'email', required: false, aliases: ['email_address', 'e-mail'] },
      { name: 'phone', label: 'Phone', type: 'phone', required: false, aliases: ['phone_number', 'telephone', 'tel', 'mobile'] },
      { name: 'company_name', label: 'Company', type: 'string', required: false, aliases: ['company', 'business', 'organization'] },
      { name: 'job_title', label: 'Job Title', type: 'string', required: false, aliases: ['title', 'position', 'role'] },
      { name: 'lead_source', label: 'Lead Source', type: 'string', required: true, aliases: ['source', 'how_heard', 'referral_source'] },
      { name: 'lead_source_detail', label: 'Source Detail', type: 'string', required: false, aliases: ['source_detail', 'campaign'] },
      { name: 'address_line1', label: 'Address', type: 'string', required: false, aliases: ['address', 'street', 'street_address'] },
      { name: 'city', label: 'City', type: 'string', required: false },
      { name: 'state', label: 'State', type: 'string', required: false, aliases: ['province', 'region'] },
      { name: 'postal_code', label: 'ZIP/Postal Code', type: 'string', required: false, aliases: ['zip', 'zipcode', 'zip_code', 'postcode'] },
      { name: 'property_type', label: 'Property Type', type: 'string', required: false, aliases: ['type', 'building_type'] },
      { name: 'property_size_sqft', label: 'Property Size (sqft)', type: 'number', required: false, aliases: ['sqft', 'square_feet', 'size'] },
      { name: 'pest_types', label: 'Pest Types', type: 'string', required: false, aliases: ['pests', 'pest_type', 'problem'] },
      { name: 'urgency', label: 'Urgency', type: 'string', required: false, aliases: ['priority'] },
      { name: 'estimated_value', label: 'Estimated Value', type: 'number', required: false, aliases: ['value', 'amount'] },
      { name: 'notes', label: 'Notes', type: 'string', required: false, aliases: ['comments', 'description', 'details'] },
    ],
  },
  {
    id: 'contacts',
    name: 'Contacts',
    description: 'Import customer contacts',
    fields: [
      { name: 'first_name', label: 'First Name', type: 'string', required: true, aliases: ['firstname', 'fname', 'first'] },
      { name: 'last_name', label: 'Last Name', type: 'string', required: true, aliases: ['lastname', 'lname', 'last', 'surname'] },
      { name: 'email', label: 'Email', type: 'email', required: false, aliases: ['email_address', 'e-mail'] },
      { name: 'phone', label: 'Phone', type: 'phone', required: false, aliases: ['phone_number', 'telephone', 'tel'] },
      { name: 'mobile', label: 'Mobile', type: 'phone', required: false, aliases: ['cell', 'cellphone', 'mobile_phone'] },
      { name: 'job_title', label: 'Job Title', type: 'string', required: false, aliases: ['title', 'position', 'role'] },
      { name: 'department', label: 'Department', type: 'string', required: false, aliases: ['dept'] },
      { name: 'address_line1', label: 'Address', type: 'string', required: false, aliases: ['address', 'street'] },
      { name: 'city', label: 'City', type: 'string', required: false },
      { name: 'state', label: 'State', type: 'string', required: false, aliases: ['province', 'region'] },
      { name: 'postal_code', label: 'ZIP/Postal Code', type: 'string', required: false, aliases: ['zip', 'zipcode', 'zip_code'] },
      { name: 'lead_source', label: 'Lead Source', type: 'string', required: false, aliases: ['source'] },
      { name: 'is_primary', label: 'Is Primary', type: 'boolean', required: false, aliases: ['primary', 'main_contact'] },
      { name: 'is_decision_maker', label: 'Is Decision Maker', type: 'boolean', required: false, aliases: ['decision_maker', 'dm'] },
    ],
  },
  {
    id: 'accounts',
    name: 'Accounts',
    description: 'Import business accounts',
    fields: [
      { name: 'name', label: 'Account Name', type: 'string', required: true, aliases: ['account_name', 'company_name', 'business_name'] },
      { name: 'industry', label: 'Industry', type: 'string', required: false, aliases: ['sector', 'business_type'] },
      { name: 'website', label: 'Website', type: 'url', required: false, aliases: ['url', 'web'] },
      { name: 'phone', label: 'Phone', type: 'phone', required: false, aliases: ['phone_number', 'telephone'] },
      { name: 'address_line1', label: 'Address', type: 'string', required: false, aliases: ['address', 'street'] },
      { name: 'address_line2', label: 'Address Line 2', type: 'string', required: false, aliases: ['suite', 'unit'] },
      { name: 'city', label: 'City', type: 'string', required: false },
      { name: 'state', label: 'State', type: 'string', required: false, aliases: ['province', 'region'] },
      { name: 'postal_code', label: 'ZIP/Postal Code', type: 'string', required: false, aliases: ['zip', 'zipcode'] },
      { name: 'country', label: 'Country', type: 'string', required: false },
      { name: 'annual_revenue', label: 'Annual Revenue', type: 'number', required: false, aliases: ['revenue'] },
      { name: 'employee_count', label: 'Employee Count', type: 'number', required: false, aliases: ['employees', 'headcount'] },
      { name: 'account_type', label: 'Account Type', type: 'string', required: false, aliases: ['type', 'customer_type'] },
    ],
  },
  {
    id: 'opportunities',
    name: 'Opportunities',
    description: 'Import sales opportunities',
    fields: [
      { name: 'name', label: 'Opportunity Name', type: 'string', required: true, aliases: ['opportunity_name', 'deal_name', 'title'] },
      { name: 'description', label: 'Description', type: 'string', required: false, aliases: ['details', 'notes'] },
      { name: 'stage', label: 'Stage', type: 'string', required: false, aliases: ['pipeline_stage', 'status'] },
      { name: 'amount', label: 'Amount', type: 'number', required: false, aliases: ['value', 'deal_value', 'total'] },
      { name: 'expected_close_date', label: 'Expected Close Date', type: 'date', required: false, aliases: ['close_date', 'est_close'] },
      { name: 'service_type', label: 'Service Type', type: 'string', required: false, aliases: ['service', 'product'] },
      { name: 'service_frequency', label: 'Service Frequency', type: 'string', required: false, aliases: ['frequency', 'schedule'] },
      { name: 'contract_length_months', label: 'Contract Length (months)', type: 'number', required: false, aliases: ['contract_length', 'term'] },
      { name: 'service_address_line1', label: 'Service Address', type: 'string', required: false, aliases: ['address'] },
      { name: 'service_city', label: 'Service City', type: 'string', required: false, aliases: ['city'] },
      { name: 'service_state', label: 'Service State', type: 'string', required: false, aliases: ['state'] },
      { name: 'service_postal_code', label: 'Service ZIP', type: 'string', required: false, aliases: ['zip', 'postal_code'] },
      { name: 'property_type', label: 'Property Type', type: 'string', required: false },
      { name: 'pest_types', label: 'Pest Types', type: 'string', required: false, aliases: ['pests'] },
      { name: 'next_step', label: 'Next Step', type: 'string', required: false, aliases: ['next_action'] },
      { name: 'competitor', label: 'Competitor', type: 'string', required: false, aliases: ['competition'] },
    ],
  },
];

/**
 * Parse a CSV file into structured data
 */
export async function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = parseCSVString(text);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Parse CSV string into structured data
 */
export function parseCSVString(text: string): CSVParseResult {
  const errors: string[] = [];
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length === 0) {
    return { headers: [], rows: [], rowCount: 0, preview: [], errors: ['Empty file'] };
  }
  
  // Parse headers
  const headers = parseCSVLine(lines[0]);
  
  // Parse rows
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length !== headers.length) {
      errors.push(`Row ${i}: Expected ${headers.length} columns, got ${values.length}`);
      continue;
    }
    
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    
    rows.push(row);
  }
  
  return {
    headers,
    rows,
    rowCount: rows.length,
    preview: rows.slice(0, 5),
    errors,
  };
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true;
      } else if (char === ',') {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  
  // Push last field
  result.push(current.trim());
  
  return result;
}

/**
 * Auto-detect field mappings based on column names
 */
export function autoDetectMappings(
  sourceHeaders: string[],
  targetFields: FieldDefinition[]
): FieldMapping[] {
  return sourceHeaders.map(header => {
    const normalizedHeader = normalizeFieldName(header);
    
    // Try to find a matching target field
    let matchedField: FieldDefinition | undefined;
    
    // First, try exact match on name
    matchedField = targetFields.find(f => 
      normalizeFieldName(f.name) === normalizedHeader
    );
    
    // Then, try match on label
    if (!matchedField) {
      matchedField = targetFields.find(f => 
        normalizeFieldName(f.label) === normalizedHeader
      );
    }
    
    // Finally, try aliases
    if (!matchedField) {
      matchedField = targetFields.find(f => 
        f.aliases?.some(alias => normalizeFieldName(alias) === normalizedHeader)
      );
    }
    
    return {
      sourceField: header,
      targetField: matchedField?.name || '',
      required: matchedField?.required || false,
      transform: getDefaultTransform(matchedField?.type),
    };
  });
}

/**
 * Normalize field name for comparison
 */
function normalizeFieldName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Get default transform based on field type
 */
function getDefaultTransform(type?: string): FieldMapping['transform'] {
  switch (type) {
    case 'email':
      return 'email';
    case 'phone':
      return 'phone';
    case 'date':
      return 'date';
    case 'number':
      return 'number';
    default:
      return 'trim';
  }
}

/**
 * Apply mappings and transforms to raw data
 */
export function applyMappings(
  rows: Record<string, string>[],
  mappings: FieldMapping[],
  targetFields: FieldDefinition[]
): { data: Record<string, any>[]; errors: string[] } {
  const errors: string[] = [];
  const data: Record<string, any>[] = [];
  
  const activeMappings = mappings.filter(m => m.targetField);
  
  rows.forEach((row, rowIndex) => {
    const transformedRow: Record<string, any> = {};
    let hasError = false;
    
    activeMappings.forEach(mapping => {
      const rawValue = row[mapping.sourceField] || mapping.defaultValue || '';
      const targetField = targetFields.find(f => f.name === mapping.targetField);
      
      try {
        const transformedValue = transformValue(rawValue, mapping.transform, targetField?.type);
        
        // Check required fields
        if (mapping.required && !transformedValue && transformedValue !== 0 && transformedValue !== false) {
          errors.push(`Row ${rowIndex + 1}: Required field "${mapping.targetField}" is empty`);
          hasError = true;
          return;
        }
        
        if (transformedValue !== null && transformedValue !== undefined && transformedValue !== '') {
          transformedRow[mapping.targetField] = transformedValue;
        }
      } catch (error: any) {
        errors.push(`Row ${rowIndex + 1}, field "${mapping.sourceField}": ${error.message}`);
        hasError = true;
      }
    });
    
    if (!hasError && Object.keys(transformedRow).length > 0) {
      data.push(transformedRow);
    }
  });
  
  return { data, errors };
}

/**
 * Transform a value based on the transform type
 */
function transformValue(
  value: string,
  transform?: FieldMapping['transform'],
  fieldType?: string
): any {
  if (!value || !value.trim()) {
    return null;
  }
  
  let result = value.trim();
  
  switch (transform) {
    case 'trim':
      return result;
      
    case 'lowercase':
      return result.toLowerCase();
      
    case 'uppercase':
      return result.toUpperCase();
      
    case 'phone':
      // Remove all non-numeric characters except + for country code
      return result.replace(/[^\d+]/g, '');
      
    case 'email':
      return result.toLowerCase().trim();
      
    case 'date':
      const date = new Date(result);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${value}`);
      }
      return date.toISOString().split('T')[0];
      
    case 'number':
      // Remove currency symbols and commas
      const numStr = result.replace(/[$,]/g, '');
      const num = parseFloat(numStr);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return num;
      
    default:
      // Apply type-specific transforms
      if (fieldType === 'boolean') {
        return ['true', '1', 'yes', 'y'].includes(result.toLowerCase());
      }
      return result;
  }
}

/**
 * Generate a sample CSV template for a target
 */
export function generateTemplate(target: ImportTarget): string {
  const headers = target.fields.map(f => f.name);
  return headers.join(',') + '\n';
}

/**
 * Validate CSV data against target schema
 */
export function validateData(
  rows: Record<string, string>[],
  mappings: FieldMapping[],
  targetFields: FieldDefinition[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields are mapped
  const mappedTargets = mappings.filter(m => m.targetField).map(m => m.targetField);
  const requiredFields = targetFields.filter(f => f.required);
  
  requiredFields.forEach(field => {
    if (!mappedTargets.includes(field.name)) {
      errors.push(`Required field "${field.label}" is not mapped`);
    }
  });
  
  // Validate sample data
  if (rows.length > 0) {
    const { errors: transformErrors } = applyMappings(rows.slice(0, 10), mappings, targetFields);
    errors.push(...transformErrors);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
