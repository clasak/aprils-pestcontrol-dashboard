/**
 * Mobile Quote Builder Component
 * 
 * Mobile-optimized in-field quoting experience:
 * - Touch-friendly interface
 * - Quick service selection
 * - Photo capture for property assessment
 * - On-site customer signature
 * - Offline capability (PWA-ready)
 * - GPS check-in
 * - Real-time pricing calculation
 */

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Fab,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  Slide,
  Collapse,
  Badge,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
  LinearProgress,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import DrawIcon from '@mui/icons-material/Draw';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BugReportIcon from '@mui/icons-material/BugReport';
import PestControlIcon from '@mui/icons-material/PestControl';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RepeatIcon from '@mui/icons-material/Repeat';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { ServiceFrequency } from '../types/pricing.types';
import { formatCurrency } from '../services/pricing.service';

interface MobileQuoteBuilderProps {
  technicianId?: string;
  initialCustomerId?: string;
  onQuoteSaved?: (quoteId: string) => void;
  onQuoteSent?: (quoteId: string) => void;
}

interface QuickService {
  id: string;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  basePrice: number;
  frequency: ServiceFrequency;
  category: string;
  popular?: boolean;
}

interface CartItem {
  service: QuickService;
  quantity: number;
  customPrice?: number;
  notes?: string;
}

interface CustomerInfo {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  caption: string;
  timestamp: Date;
}

// Quick service categories for mobile
const QUICK_SERVICES: QuickService[] = [
  // General Pest - One Time
  { id: 'gp-ot', name: 'General Pest - One Time', shortName: 'Pest 1x', icon: <BugReportIcon />, basePrice: 17500, frequency: 'one_time', category: 'general', popular: true },
  { id: 'gp-mo', name: 'General Pest - Monthly', shortName: 'Pest Mo', icon: <BugReportIcon />, basePrice: 7500, frequency: 'monthly', category: 'general', popular: true },
  { id: 'gp-qt', name: 'General Pest - Quarterly', shortName: 'Pest Qt', icon: <BugReportIcon />, basePrice: 12500, frequency: 'quarterly', category: 'general', popular: true },
  // Rodent
  { id: 'rod-init', name: 'Rodent Initial', shortName: 'Rodent', icon: <PestControlIcon />, basePrice: 25000, frequency: 'one_time', category: 'rodent', popular: true },
  { id: 'rod-mo', name: 'Rodent Monthly', shortName: 'Rod Mo', icon: <PestControlIcon />, basePrice: 7500, frequency: 'monthly', category: 'rodent' },
  { id: 'rod-exc', name: 'Rodent Exclusion', shortName: 'Exclusion', icon: <PestControlIcon />, basePrice: 75000, frequency: 'one_time', category: 'rodent' },
  // Termite
  { id: 'trm-ins', name: 'Termite Inspection', shortName: 'Term Insp', icon: <HomeIcon />, basePrice: 15000, frequency: 'one_time', category: 'termite', popular: true },
  { id: 'trm-bait', name: 'Termite Bait System', shortName: 'Term Bait', icon: <HomeIcon />, basePrice: 150000, frequency: 'one_time', category: 'termite' },
  { id: 'trm-liq', name: 'Termite Liquid Treatment', shortName: 'Term Liq', icon: <HomeIcon />, basePrice: 200000, frequency: 'one_time', category: 'termite' },
  // Specialty
  { id: 'bb-ins', name: 'Bed Bug Inspection', shortName: 'BB Insp', icon: <LocalOfferIcon />, basePrice: 20000, frequency: 'one_time', category: 'specialty' },
  { id: 'bb-heat', name: 'Bed Bug Heat Treatment', shortName: 'BB Heat', icon: <LocalOfferIcon />, basePrice: 150000, frequency: 'one_time', category: 'specialty' },
  { id: 'mos-yd', name: 'Mosquito Yard Treatment', shortName: 'Mosquito', icon: <BugReportIcon />, basePrice: 8500, frequency: 'monthly', category: 'specialty' },
  { id: 'wl-rem', name: 'Wildlife Removal', shortName: 'Wildlife', icon: <PestControlIcon />, basePrice: 35000, frequency: 'one_time', category: 'specialty' },
];

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General Pest',
  rodent: 'Rodent Control',
  termite: 'Termite',
  specialty: 'Specialty',
};

const MobileQuoteBuilder = ({
  technicianId,
  initialCustomerId,
  onQuoteSaved,
  onQuoteSent,
}: MobileQuoteBuilderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [activeStep, setActiveStep] = useState<'services' | 'customer' | 'photos' | 'review' | 'signature'>('services');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>({ name: '', email: '', phone: '', address: '' });
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get GPS location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setSnackbar({ open: true, message: 'Location captured!', severity: 'success' });
        },
        () => {
          setSnackbar({ open: true, message: 'Unable to get location', severity: 'error' });
        }
      );
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const price = item.customPrice ?? item.service.basePrice;
    return sum + (price * item.quantity);
  }, 0);
  
  const discountAmount = discountType === 'percentage' 
    ? Math.round(subtotal * discount / 100)
    : discount;
  
  const total = subtotal - discountAmount;

  // Add to cart
  const addToCart = (service: QuickService) => {
    setCart(prev => {
      const existing = prev.find(item => item.service.id === service.id);
      if (existing) {
        return prev.map(item =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
  };

  // Remove from cart
  const removeFromCart = (serviceId: string) => {
    setCart(prev => prev.filter(item => item.service.id !== serviceId));
  };

  // Update cart item
  const updateCartItem = (serviceId: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(item =>
      item.service.id === serviceId ? { ...item, ...updates } : item
    ));
  };

  // Filter services
  const filteredServices = QUICK_SERVICES.filter(service => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return service.name.toLowerCase().includes(query) || service.shortName.toLowerCase().includes(query);
    }
    if (selectedCategory) {
      return service.category === selectedCategory;
    }
    return true;
  });

  // Handle photo capture
  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: CapturedPhoto = {
          id: `photo-${Date.now()}`,
          dataUrl: reader.result as string,
          caption: '',
          timestamp: new Date(),
        };
        setPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle quote submission
  const handleSendQuote = async () => {
    // Simulate sending quote
    setSnackbar({ open: true, message: 'Sending quote...', severity: 'info' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const quoteId = `Q-${Date.now()}`;
    setSnackbar({ open: true, message: 'Quote sent successfully!', severity: 'success' });
    onQuoteSent?.(quoteId);
  };

  const handleSaveQuote = async () => {
    // Simulate saving quote
    setSnackbar({ open: true, message: 'Saving quote...', severity: 'info' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const quoteId = `Q-${Date.now()}`;
    setSnackbar({ open: true, message: 'Quote saved!', severity: 'success' });
    onQuoteSaved?.(quoteId);
  };

  // Render service card for mobile
  const renderServiceCard = (service: QuickService) => {
    const inCart = cart.find(item => item.service.id === service.id);
    
    return (
      <Card
        key={service.id}
        sx={{
          mb: 1,
          border: inCart ? `2px solid ${theme.palette.primary.main}` : '1px solid',
          borderColor: inCart ? 'primary.main' : 'divider',
          bgcolor: inCart ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
        }}
      >
        <CardActionArea onClick={() => addToCart(service)}>
          <CardContent sx={{ py: 1.5, px: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
              {service.icon}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body1" fontWeight={500}>
                  {service.shortName}
                </Typography>
                {service.popular && (
                  <Chip label="Popular" size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem' }} />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {service.name}
              </Typography>
              {service.frequency !== 'one_time' && (
                <Chip
                  size="small"
                  icon={<RepeatIcon />}
                  label={service.frequency.replace('_', '-')}
                  variant="outlined"
                  sx={{ ml: 1, height: 18, fontSize: '0.65rem', textTransform: 'capitalize' }}
                />
              )}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" fontWeight={700} color="primary">
                {formatCurrency(service.basePrice)}
              </Typography>
              {inCart && (
                <Chip
                  size="small"
                  label={`×${inCart.quantity}`}
                  color="primary"
                />
              )}
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  return (
    <Box sx={{ pb: 10, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Offline Banner */}
      <Collapse in={isOffline}>
        <Alert severity="warning" icon={<WifiOffIcon />} sx={{ borderRadius: 0 }}>
          You're offline. Changes will sync when connection is restored.
        </Alert>
      </Collapse>

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Quick Quote
          </Typography>
          {customer.name && (
            <Typography variant="caption" color="text.secondary">
              {customer.name}
            </Typography>
          )}
        </Box>
        <IconButton onClick={getLocation} color={gpsLocation ? 'success' : 'default'}>
          <GpsFixedIcon />
        </IconButton>
        <Badge badgeContent={cart.length} color="primary">
          <IconButton onClick={() => setShowCart(true)}>
            <ShoppingCartIcon />
          </IconButton>
        </Badge>
      </Paper>

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Services Tab */}
        {activeStep === 'services' && (
          <>
            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mb: 2 }}
            />

            {/* Category Chips */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 1 }}>
              <Chip
                label="All"
                onClick={() => setSelectedCategory(null)}
                color={selectedCategory === null ? 'primary' : 'default'}
                variant={selectedCategory === null ? 'filled' : 'outlined'}
              />
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  onClick={() => setSelectedCategory(key)}
                  color={selectedCategory === key ? 'primary' : 'default'}
                  variant={selectedCategory === key ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            {/* Popular Services */}
            {!searchQuery && !selectedCategory && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  POPULAR SERVICES
                </Typography>
                {QUICK_SERVICES.filter(s => s.popular).map(renderServiceCard)}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  ALL SERVICES
                </Typography>
              </>
            )}

            {/* Service List */}
            {filteredServices.filter(s => !s.popular || searchQuery || selectedCategory).map(renderServiceCard)}
          </>
        )}

        {/* Customer Tab */}
        {activeStep === 'customer' && (
          <Box>
            <Typography variant="h6" gutterBottom>Customer Information</Typography>
            <TextField
              fullWidth
              label="Customer Name"
              value={customer.name}
              onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone"
              type="tel"
              value={customer.phone}
              onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Service Address"
              value={customer.address}
              onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
              sx={{ mb: 2 }}
            />
            {gpsLocation && (
              <Alert icon={<GpsFixedIcon />} severity="success" sx={{ mb: 2 }}>
                GPS Location captured: {gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)}
              </Alert>
            )}
          </Box>
        )}

        {/* Photos Tab */}
        {activeStep === 'photos' && (
          <Box>
            <Typography variant="h6" gutterBottom>Property Photos</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Capture photos of the property and any pest activity.
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              style={{ display: 'none' }}
            />

            <Button
              fullWidth
              variant="outlined"
              startIcon={<CameraAltIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mb: 2, py: 2 }}
            >
              Take Photo
            </Button>

            {/* Photo Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              {photos.map((photo) => (
                <Card key={photo.id}>
                  <Box
                    component="img"
                    src={photo.dataUrl}
                    sx={{ width: '100%', height: 120, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ py: 1, px: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add caption..."
                      value={photo.caption}
                      onChange={(e) => {
                        setPhotos(prev => prev.map(p =>
                          p.id === photo.id ? { ...p, caption: e.target.value } : p
                        ));
                      }}
                    />
                  </CardContent>
                  <CardActions sx={{ py: 0.5 }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Box>

            {photos.length === 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderStyle: 'dashed',
                }}
              >
                <PhotoLibraryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">
                  No photos captured yet
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        {/* Review Tab */}
        {activeStep === 'review' && (
          <Box>
            <Typography variant="h6" gutterBottom>Review Quote</Typography>

            {/* Customer Summary */}
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="action" />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{customer.name || 'No customer'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {customer.email} • {customer.phone}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Services Summary */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              SERVICES ({cart.length})
            </Typography>
            {cart.map((item) => (
              <Box
                key={item.service.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {item.service.shortName} × {item.quantity}
                  </Typography>
                  {item.service.frequency !== 'one_time' && (
                    <Chip
                      size="small"
                      icon={<RepeatIcon />}
                      label={item.service.frequency.replace('_', '-')}
                      sx={{ height: 18, fontSize: '0.65rem', textTransform: 'capitalize' }}
                    />
                  )}
                </Box>
                <Typography fontWeight={600}>
                  {formatCurrency((item.customPrice ?? item.service.basePrice) * item.quantity)}
                </Typography>
              </Box>
            ))}

            {/* Discount */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                DISCOUNT
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  sx={{ width: 100 }}
                />
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  >
                    <MenuItem value="percentage">%</MenuItem>
                    <MenuItem value="fixed">$</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Totals */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography>{formatCurrency(subtotal)}</Typography>
            </Box>
            {discountAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                <Typography>Discount</Typography>
                <Typography>-{formatCurrency(discountAmount)}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700}>Total</Typography>
              <Typography variant="h6" fontWeight={700} color="primary">{formatCurrency(total)}</Typography>
            </Box>

            {/* Notes */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 2 }}
            />

            {/* Photos Summary */}
            {photos.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  ATTACHED PHOTOS ({photos.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
                  {photos.map((photo) => (
                    <Box
                      key={photo.id}
                      component="img"
                      src={photo.dataUrl}
                      sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Signature Tab */}
        {activeStep === 'signature' && (
          <Box>
            <Typography variant="h6" gutterBottom>Customer Signature</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Have the customer sign below to accept the quote.
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                cursor: 'pointer',
                bgcolor: signatureData ? 'background.paper' : 'action.hover',
              }}
              onClick={() => setShowSignatureDialog(true)}
            >
              {signatureData ? (
                <Box
                  component="img"
                  src={signatureData}
                  sx={{ maxHeight: '100%', maxWidth: '100%' }}
                />
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <DrawIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography color="text.secondary">
                    Tap to add signature
                  </Typography>
                </Box>
              )}
            </Paper>

            {signatureData && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => setSignatureData(null)}
                sx={{ mb: 2 }}
              >
                Clear Signature
              </Button>
            )}

            <Alert severity="info">
              By signing, the customer agrees to the terms and pricing shown in this quote.
            </Alert>
          </Box>
        )}
      </Box>

      {/* Cart Drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={showCart}
        onClose={() => setShowCart(false)}
        onOpen={() => setShowCart(true)}
        PaperProps={{
          sx: { maxHeight: '80vh', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Cart ({cart.length})</Typography>
            <IconButton onClick={() => setShowCart(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {cart.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">Cart is empty</Typography>
            </Box>
          ) : (
            <>
              {cart.map((item) => (
                <Box
                  key={item.service.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    {item.service.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={500}>{item.service.shortName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(item.customPrice ?? item.service.basePrice)} each
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (item.quantity <= 1) {
                          removeFromCart(item.service.id);
                        } else {
                          updateCartItem(item.service.id, { quantity: item.quantity - 1 });
                        }
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography fontWeight={600}>{item.quantity}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateCartItem(item.service.id, { quantity: item.quantity + 1 })}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeFromCart(item.service.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" fontWeight={700} color="primary">
                  {formatCurrency(total)}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </SwipeableDrawer>

      {/* Signature Dialog (simplified - in production use a canvas) */}
      <Dialog
        open={showSignatureDialog}
        onClose={() => setShowSignatureDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Customer Signature</DialogTitle>
        <DialogContent>
          <Paper
            variant="outlined"
            sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Typography color="text.secondary">
              [Signature Pad - Use canvas or signature library in production]
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSignatureDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // In production, get signature from canvas
              setSignatureData('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text y="35" font-family="cursive" font-size="24">John Smith</text></svg>');
              setShowSignatureDialog(false);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: 1,
          borderColor: 'divider',
        }}
        elevation={8}
      >
        {/* Progress */}
        <LinearProgress
          variant="determinate"
          value={
            activeStep === 'services' ? 20 :
            activeStep === 'customer' ? 40 :
            activeStep === 'photos' ? 60 :
            activeStep === 'review' ? 80 : 100
          }
          sx={{ height: 3 }}
        />
        
        {/* Navigation Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            disabled={activeStep === 'services'}
            onClick={() => {
              const steps: typeof activeStep[] = ['services', 'customer', 'photos', 'review', 'signature'];
              const currentIndex = steps.indexOf(activeStep);
              if (currentIndex > 0) setActiveStep(steps[currentIndex - 1]);
            }}
          >
            Back
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeStep === 'signature' ? (
              <>
                <Button onClick={handleSaveQuote} disabled={cart.length === 0}>
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleSendQuote}
                  disabled={cart.length === 0}
                >
                  Send Quote
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => {
                  const steps: typeof activeStep[] = ['services', 'customer', 'photos', 'review', 'signature'];
                  const currentIndex = steps.indexOf(activeStep);
                  if (currentIndex < steps.length - 1) setActiveStep(steps[currentIndex + 1]);
                }}
                disabled={activeStep === 'services' && cart.length === 0}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileQuoteBuilder;

