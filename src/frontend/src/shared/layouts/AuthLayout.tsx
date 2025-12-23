import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';

const AuthLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, #0d1b2a 0%, #1b3a4b 50%, #065a60 100%)`,
      }}
    >
      {/* Left Panel - Branding (hidden on mobile) */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            color: 'white',
          }}
        >
          <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
            <Box
              component="img"
              src="/compassiq-logo.png"
              alt="CompassIQ"
              sx={{
                height: 60,
                width: 'auto',
                mb: 3,
              }}
            />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              April's Pest Control
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
              Enterprise CRM Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
              {[
                'Complete sales pipeline management',
                'AI-powered lead scoring',
                'Route optimization for technicians',
                'EPA compliance built-in',
                'Mobile-first design',
              ].map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                    }}
                  >
                    ✓
                  </Box>
                  <Typography variant="body1">{feature}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Right Panel - Auth Form */}
      <Box
        sx={{
          flex: isMobile ? 1 : 'none',
          width: isMobile ? '100%' : 480,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Container maxWidth="sm" sx={{ width: '100%' }}>
          <Paper
            elevation={8}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              bgcolor: 'background.paper',
            }}
          >
            {/* Mobile Logo */}
            {isMobile && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  component="img"
                  src="/compassiq-logo.png"
                  alt="CompassIQ"
                  sx={{
                    height: 40,
                    width: 'auto',
                    mb: 1,
                  }}
                />
                <Typography variant="h6" fontWeight={600}>
                  April's Pest Control
                </Typography>
              </Box>
            )}
            <Outlet />
          </Paper>

          {/* Footer with CompassIQ Branding */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              mt: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: isMobile ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.7)',
              }}
            >
              <Typography variant="caption">
                Powered by
              </Typography>
              <Box
                component="img"
                src="/compassiq-logo.svg"
                alt="CompassIQ"
                sx={{
                  height: 14,
                  width: 'auto',
                  filter: 'brightness(0) invert(1)',
                  opacity: 0.9,
                }}
              />
              <Typography variant="caption" fontWeight={600}>
                CompassIQ
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: isMobile ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.5)',
              }}
            >
              © {new Date().getFullYear()} All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthLayout;
