import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tabs,
  Tab,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { LoadingSpinner, ConfirmDialog } from '@shared/components';
import { Contact, contactsApi } from '../services/contacts.api';
import { ContactForm } from '../components';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    residential: '#4caf50',
    commercial: '#2196f3',
    property_manager: '#9c27b0',
    referral_partner: '#ff9800',
    vendor: '#607d8b',
    other: '#757575',
  };
  return colors[type] || colors.other;
};

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  const colors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    active: 'success',
    inactive: 'warning',
    do_not_contact: 'error',
  };
  return colors[status] || 'default';
};

const ContactDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadContact = async () => {
      if (!id) {
        setError('Contact ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await contactsApi.getById(id);
        setContact(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load contact');
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, [id]);

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditSuccess = (updatedContact: Contact) => {
    setContact(updatedContact);
    setShowEditForm(false);
  };

  const handleDelete = async () => {
    if (!contact) return;

    setDeleteLoading(true);
    try {
      await contactsApi.delete(contact.id);
      navigate('/sales/contacts');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete contact');
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading contact..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/sales/contacts')}>
          Back to Contacts
        </Button>
      </Box>
    );
  }

  if (!contact) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Contact not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/sales/contacts')} sx={{ mt: 2 }}>
          Back to Contacts
        </Button>
      </Box>
    );
  }

  const fullName = `${contact.firstName} ${contact.lastName}`;
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
  const address = [contact.addressLine1, contact.city, contact.state, contact.postalCode]
    .filter(Boolean)
    .join(', ');

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/sales/contacts')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            {fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contact Details
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEdit}
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Contact Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: getTypeColor(contact.type),
                  fontSize: '2rem',
                  mb: 2,
                }}
              >
                {initials}
              </Avatar>
              <Typography variant="h6">{fullName}</Typography>
              {contact.title && (
                <Typography variant="body2" color="text.secondary">
                  {contact.title}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={contact.type.replace('_', ' ')}
                  size="small"
                  sx={{ bgcolor: getTypeColor(contact.type), color: 'white' }}
                />
                <Chip
                  label={contact.status.replace('_', ' ')}
                  size="small"
                  color={getStatusColor(contact.status)}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <List dense>
              {contact.email && (
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={
                      <a href={`mailto:${contact.email}`} style={{ color: 'inherit' }}>
                        {contact.email}
                      </a>
                    }
                  />
                </ListItem>
              )}
              {contact.phone && (
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={
                      <a href={`tel:${contact.phone}`} style={{ color: 'inherit' }}>
                        {contact.phone}
                      </a>
                    }
                  />
                </ListItem>
              )}
              {contact.mobilePhone && (
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mobile"
                    secondary={contact.mobilePhone}
                  />
                </ListItem>
              )}
              {address && (
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Address" secondary={address} />
                </ListItem>
              )}
              {contact.companyName && (
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Company" secondary={contact.companyName} />
                </ListItem>
              )}
            </List>

            {contact.tags && contact.tags.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {contact.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Details & Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0 }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab icon={<PersonIcon />} iconPosition="start" label="Details" />
              <Tab icon={<HomeIcon />} iconPosition="start" label="Property" />
              <Tab icon={<HistoryIcon />} iconPosition="start" label="Activity" />
              <Tab icon={<NoteAddIcon />} iconPosition="start" label="Notes" />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {/* Details Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Lead Source
                        </Typography>
                        <Typography variant="body1">
                          {contact.leadSource || 'Not specified'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Referral Source
                        </Typography>
                        <Typography variant="body1">
                          {contact.referralSource || 'Not specified'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Preferred Contact Method
                        </Typography>
                        <Typography variant="body1">
                          {contact.preferredContactMethod || 'Any'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Best Time to Contact
                        </Typography>
                        <Typography variant="body1">
                          {contact.bestContactTime || 'Not specified'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Created
                        </Typography>
                        <Typography variant="body1">
                          {new Date(contact.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Property Tab */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Property Type
                        </Typography>
                        <Typography variant="body1">
                          {contact.propertyType || 'Not specified'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Property Size
                        </Typography>
                        <Typography variant="body1">
                          {contact.propertySizeSqft
                            ? `${contact.propertySizeSqft.toLocaleString()} sq ft`
                            : 'Not specified'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Lot Size
                        </Typography>
                        <Typography variant="body1">
                          {contact.lotSizeAcres
                            ? `${contact.lotSizeAcres} acres`
                            : 'Not specified'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Year Built
                        </Typography>
                        <Typography variant="body1">
                          {contact.yearBuilt || 'Not specified'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Activity Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    Activity tracking coming soon
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Calls, emails, meetings, and notes will appear here
                  </Typography>
                </Box>
              </TabPanel>

              {/* Notes Tab */}
              <TabPanel value={tabValue} index={3}>
                {contact.notes ? (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {contact.notes}
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <NoteAddIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">No notes yet</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                      sx={{ mt: 2 }}
                    >
                      Add Notes
                    </Button>
                  </Box>
                )}
              </TabPanel>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Form Dialog */}
      <ContactForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleEditSuccess}
        contact={contact}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Contact"
        message={`Are you sure you want to delete ${fullName}? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </Box>
  );
};

export default ContactDetailPage;

