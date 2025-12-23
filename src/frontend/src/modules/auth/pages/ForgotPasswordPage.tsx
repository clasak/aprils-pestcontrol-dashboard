import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const { resetPassword, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    if (!email) {
      setValidationError('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    if (validationError) {
      setValidationError(null);
    }
    
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await resetPassword(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setSubmitError(result.error || 'Failed to send reset email');
    }
  };

  if (success) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 3 }}>
          Password reset email sent!
        </Alert>
        <Typography variant="body1" paragraph>
          We've sent a password reset link to <strong>{email}</strong>.
          Please check your inbox and follow the instructions.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          If you don't see the email, check your spam folder.
        </Typography>
        <Button
          component={RouterLink}
          to="/auth/login"
          fullWidth
          variant="contained"
          size="large"
          startIcon={<ArrowBackIcon />}
        >
          Back to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Forgot Password?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          name="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={handleChange}
          error={!!validationError}
          helperText={validationError}
          disabled={loading}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component={RouterLink}
          to="/auth/login"
          variant="body2"
          underline="hover"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
        >
          <ArrowBackIcon fontSize="small" />
          Back to Login
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
