/**
 * CSV Importer Component
 * 
 * A multi-step wizard for importing CSV data with field mapping.
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  Tooltip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  AutoFixHigh as AutoMapIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import {
  parseCSV,
  autoDetectMappings,
  applyMappings,
  IMPORT_TARGETS,
  CSVParseResult,
  FieldMapping,
  ImportTarget,
} from '../utils/csvParser';
import { supabase } from '../../../lib/supabase';

interface CSVImporterProps {
  onComplete?: (result: ImportResult) => void;
  onCancel?: () => void;
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

const STEPS = ['Upload File', 'Select Target', 'Map Fields', 'Review & Import'];

export const CSVImporter: React.FC<CSVImporterProps> = ({ onComplete, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<ImportTarget | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  // Handle file drop
  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile?.type === 'text/csv' || droppedFile?.name.endsWith('.csv')) {
      await processFile(droppedFile);
    } else {
      setError('Please upload a CSV file');
    }
  }, []);

  // Handle file input change
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  }, []);

  // Process uploaded file
  const processFile = async (uploadedFile: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await parseCSV(uploadedFile);
      setFile(uploadedFile);
      setParseResult(result);
      
      if (result.errors.length > 0) {
        setError(`Found ${result.errors.length} parsing errors`);
      }
      
      setActiveStep(1);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle target selection
  const handleSelectTarget = (target: ImportTarget) => {
    setSelectedTarget(target);
    
    if (parseResult) {
      // Auto-detect mappings
      const detectedMappings = autoDetectMappings(parseResult.headers, target.fields);
      setMappings(detectedMappings);
    }
    
    setActiveStep(2);
  };

  // Update mapping for a field
  const handleMappingChange = (sourceField: string, targetField: string) => {
    setMappings(prev => 
      prev.map(m => 
        m.sourceField === sourceField 
          ? { ...m, targetField, required: selectedTarget?.fields.find(f => f.name === targetField)?.required || false }
          : m
      )
    );
  };

  // Update transform for a field
  const handleTransformChange = (sourceField: string, transform: FieldMapping['transform']) => {
    setMappings(prev => 
      prev.map(m => 
        m.sourceField === sourceField ? { ...m, transform } : m
      )
    );
  };

  // Auto-map fields again
  const handleAutoMap = () => {
    if (parseResult && selectedTarget) {
      const detectedMappings = autoDetectMappings(parseResult.headers, selectedTarget.fields);
      setMappings(detectedMappings);
    }
  };

  // Check if all required fields are mapped
  const getMissingRequiredFields = (): string[] => {
    if (!selectedTarget) return [];
    
    const mappedTargets = mappings.filter(m => m.targetField).map(m => m.targetField);
    const requiredFields = selectedTarget.fields.filter(f => f.required);
    
    return requiredFields
      .filter(f => !mappedTargets.includes(f.name))
      .map(f => f.label);
  };

  // Perform the import
  const handleImport = async () => {
    if (!parseResult || !selectedTarget) return;
    
    setIsLoading(true);
    setError(null);
    setImportProgress(0);
    
    try {
      // Apply mappings to get transformed data
      const { data, errors: mappingErrors } = applyMappings(
        parseResult.rows,
        mappings,
        selectedTarget.fields
      );
      
      if (mappingErrors.length > 10) {
        setError(`Too many errors (${mappingErrors.length}). Please fix your data and try again.`);
        setIsLoading(false);
        return;
      }
      
      // Import in batches
      const batchSize = 100;
      let imported = 0;
      let failed = 0;
      const allErrors: string[] = [...mappingErrors];
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from(selectedTarget.id)
          .insert(batch);
        
        if (insertError) {
          failed += batch.length;
          allErrors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`);
        } else {
          imported += batch.length;
        }
        
        setImportProgress(Math.round(((i + batch.length) / data.length) * 100));
      }
      
      const result: ImportResult = {
        success: failed === 0,
        imported,
        failed,
        errors: allErrors,
      };
      
      setImportResult(result);
      setActiveStep(3);
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the importer
  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    setSelectedTarget(null);
    setMappings([]);
    setImportResult(null);
    setError(null);
    setActiveStep(0);
  };

  const missingRequired = getMissingRequiredFields();

  return (
    <Paper sx={{ p: 3 }}>
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Step 1: Upload File */}
      {activeStep === 0 && (
        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.default',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop your CSV file here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                or click to browse
              </Typography>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input">
                <Button variant="contained" component="span">
                  Choose File
                </Button>
              </label>
            </>
          )}
        </Box>
      )}

      {/* Step 2: Select Target */}
      {activeStep === 1 && parseResult && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>{file?.name}</strong> - {parseResult.rowCount} rows, {parseResult.headers.length} columns
            </Typography>
          </Alert>

          <Typography variant="h6" gutterBottom>
            What type of data are you importing?
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {IMPORT_TARGETS.map((target) => (
              <Grid item xs={12} sm={6} md={3} key={target.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: selectedTarget?.id === target.id ? 2 : 0,
                    borderColor: 'primary.main',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => handleSelectTarget(target)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      {target.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {target.fields.filter(f => f.required).length} required fields
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {target.fields.length} total fields
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleReset}>
              Back
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 3: Map Fields */}
      {activeStep === 2 && parseResult && selectedTarget && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Map Fields
            </Typography>
            <Button
              startIcon={<AutoMapIcon />}
              onClick={handleAutoMap}
              size="small"
            >
              Auto-detect
            </Button>
          </Box>

          {missingRequired.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Missing required fields: {missingRequired.join(', ')}
            </Alert>
          )}

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>CSV Column</TableCell>
                  <TableCell>Sample Data</TableCell>
                  <TableCell>Map To</TableCell>
                  <TableCell>Transform</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mappings.map((mapping) => {
                  const sampleValue = parseResult.preview[0]?.[mapping.sourceField] || '';
                  const targetField = selectedTarget.fields.find(f => f.name === mapping.targetField);
                  
                  return (
                    <TableRow key={mapping.sourceField}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {mapping.sourceField}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                          {sampleValue || '(empty)'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={mapping.targetField}
                            onChange={(e) => handleMappingChange(mapping.sourceField, e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>Skip this column</em>
                            </MenuItem>
                            {selectedTarget.fields.map((field) => (
                              <MenuItem key={field.name} value={field.name}>
                                {field.label}
                                {field.required && <Chip label="Required" size="small" color="error" sx={{ ml: 1 }} />}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={mapping.transform || 'none'}
                            onChange={(e) => handleTransformChange(mapping.sourceField, e.target.value as FieldMapping['transform'])}
                            disabled={!mapping.targetField}
                          >
                            <MenuItem value="none">None</MenuItem>
                            <MenuItem value="trim">Trim whitespace</MenuItem>
                            <MenuItem value="lowercase">Lowercase</MenuItem>
                            <MenuItem value="uppercase">Uppercase</MenuItem>
                            {targetField?.type === 'phone' && <MenuItem value="phone">Format phone</MenuItem>}
                            {targetField?.type === 'email' && <MenuItem value="email">Normalize email</MenuItem>}
                            {targetField?.type === 'date' && <MenuItem value="date">Parse date</MenuItem>}
                            {targetField?.type === 'number' && <MenuItem value="number">Parse number</MenuItem>}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Preview Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PreviewIcon fontSize="small" />
              Preview (first 5 rows)
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {mappings.filter(m => m.targetField).map((mapping) => (
                      <TableCell key={mapping.targetField}>
                        {selectedTarget.fields.find(f => f.name === mapping.targetField)?.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parseResult.preview.map((row, idx) => (
                    <TableRow key={idx}>
                      {mappings.filter(m => m.targetField).map((mapping) => (
                        <TableCell key={mapping.targetField}>
                          {row[mapping.sourceField] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setActiveStep(1)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={missingRequired.length > 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Importing...
                </>
              ) : (
                `Import ${parseResult.rowCount} Records`
              )}
            </Button>
          </Box>

          {isLoading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={importProgress} />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {importProgress}% complete
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Step 4: Results */}
      {activeStep === 3 && importResult && (
        <Box sx={{ textAlign: 'center' }}>
          {importResult.success ? (
            <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          ) : (
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          )}
          
          <Typography variant="h5" gutterBottom>
            {importResult.success ? 'Import Complete!' : 'Import Completed with Errors'}
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                <Typography variant="h4" color="success.main">
                  {importResult.imported}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Successfully imported
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, bgcolor: importResult.failed > 0 ? 'error.50' : 'grey.100' }}>
                <Typography variant="h4" color={importResult.failed > 0 ? 'error.main' : 'text.disabled'}>
                  {importResult.failed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {importResult.errors.length > 0 && (
            <Box sx={{ mt: 3, maxHeight: 200, overflow: 'auto' }}>
              <Alert severity="warning">
                <Typography variant="subtitle2" gutterBottom>
                  Errors ({importResult.errors.length}):
                </Typography>
                {importResult.errors.slice(0, 10).map((err, idx) => (
                  <Typography key={idx} variant="body2">
                    • {err}
                  </Typography>
                ))}
                {importResult.errors.length > 10 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    ... and {importResult.errors.length - 10} more
                  </Typography>
                )}
              </Alert>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={handleReset} sx={{ mr: 2 }}>
              Import Another File
            </Button>
            {onCancel && (
              <Button variant="contained" onClick={onCancel}>
                Done
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default CSVImporter;

