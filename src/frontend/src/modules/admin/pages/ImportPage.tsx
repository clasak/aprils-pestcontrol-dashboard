/**
 * Import Page
 * 
 * Admin page for importing data via CSV files.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Upload as UploadIcon,
  History as HistoryIcon,
  Help as HelpIcon,
  CheckCircle as CheckIcon,
  CloudDownload as DownloadIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import CSVImporter from '../components/CSVImporter';
import { IMPORT_TARGETS, generateTemplate } from '../utils/csvParser';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export const ImportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [lastImport, setLastImport] = useState<{
    target: string;
    count: number;
    date: Date;
  } | null>(null);

  const handleImportComplete = (result: any) => {
    if (result.success) {
      setLastImport({
        target: 'records',
        count: result.imported,
        date: new Date(),
      });
    }
  };

  const handleDownloadTemplate = (targetId: string) => {
    const target = IMPORT_TARGETS.find(t => t.id === targetId);
    if (!target) return;

    const template = generateTemplate(target);
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetId}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link component={RouterLink} to="/admin" underline="hover" color="inherit">
            Admin
          </Link>
          <Typography color="text.primary">Import Data</Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight={600}>
          Import Data
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Import leads, contacts, accounts, and opportunities from CSV files
        </Typography>
      </Box>

      {/* Success Alert */}
      {lastImport && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setLastImport(null)}
        >
          Successfully imported {lastImport.count} {lastImport.target}!
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<UploadIcon />} 
            label="Import" 
            iconPosition="start"
          />
          <Tab 
            icon={<DownloadIcon />} 
            label="Templates" 
            iconPosition="start"
          />
          <Tab 
            icon={<HelpIcon />} 
            label="Help" 
            iconPosition="start"
          />
        </Tabs>

        {/* Import Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <CSVImporter 
              onComplete={handleImportComplete}
            />
          </Box>
        </TabPanel>

        {/* Templates Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Download CSV Templates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Download pre-formatted CSV templates for each data type to ensure proper formatting.
            </Typography>

            <Grid container spacing={3}>
              {IMPORT_TARGETS.map((target) => (
                <Grid item xs={12} sm={6} md={3} key={target.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {target.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {target.description}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                        {target.fields.length} fields ({target.fields.filter(f => f.required).length} required)
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadTemplate(target.id)}
                        fullWidth
                      >
                        Download Template
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Help Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Import Guide
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Getting Started
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Prepare your CSV file"
                      secondary="Ensure your file has headers in the first row and data in subsequent rows"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Select your data type"
                      secondary="Choose whether you're importing leads, contacts, accounts, or opportunities"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Map your fields"
                      secondary="Match your CSV columns to the corresponding database fields"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Review and import"
                      secondary="Preview your data and complete the import"
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Best Practices
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <HelpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Use UTF-8 encoding"
                      secondary="Save your CSV file with UTF-8 encoding to support special characters"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <HelpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Start with a small batch"
                      secondary="Test with 10-20 records before importing your full dataset"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <HelpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Check required fields"
                      secondary="Make sure all required fields have values for each row"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <HelpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Use consistent date formats"
                      secondary="Use YYYY-MM-DD or MM/DD/YYYY format for dates"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Supported File Formats
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • CSV (Comma Separated Values) - .csv extension<br />
              • Maximum file size: 10MB<br />
              • Maximum rows per import: 10,000<br />
              • Encoding: UTF-8 (recommended), ASCII
            </Typography>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Tip:</strong> If you're importing from Excel, save your file as "CSV UTF-8 (Comma delimited)" 
                to ensure proper formatting and character encoding.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ImportPage;

