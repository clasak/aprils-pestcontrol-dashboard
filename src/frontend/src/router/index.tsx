import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layouts
import { MainLayout, AuthLayout } from '@shared/layouts';
import { LoadingSpinner } from '@shared/components';

// Auth pages
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@modules/auth';

// Module routes
import dashboardRoutes from '@modules/dashboards/routes';
import salesRoutes from '@modules/sales/routes';
import operationsRoutes from '@modules/operations/routes';
import hrRoutes from '@modules/hr/routes';
import financeRoutes from '@modules/finance/routes';
import marketingRoutes from '@modules/marketing/routes';
import customerServiceRoutes from '@modules/customer-service/routes';
import inventoryRoutes from '@modules/inventory/routes';
import complianceRoutes from '@modules/compliance/routes';
import adminRoutes from '@modules/admin/routes';

// Protected Route wrapper component
const ProtectedRoute = () => {
  // DEV MODE: Set mock token for development without backend
  // Remove this in production
  const DEV_MODE = true;
  if (DEV_MODE && !localStorage.getItem('auth_token')) {
    localStorage.setItem('auth_token', 'dev_mock_token');
  }

  // Check for auth token
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth/login" replace />;
  }
  
  return <Outlet />;
};

// Public Route wrapper - redirects to dashboard if already authenticated
const PublicRoute = () => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

// Wrapper component for Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
    {children}
  </Suspense>
);

// 404 Not Found page
const NotFoundPage = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    padding: '20px',
  }}>
    <h1 style={{ fontSize: '4rem', margin: 0, color: '#1976d2' }}>404</h1>
    <h2 style={{ margin: '10px 0' }}>Page Not Found</h2>
    <p style={{ color: '#666', marginBottom: '20px' }}>
      The page you're looking for doesn't exist or has been moved.
    </p>
    <a
      href="/"
      style={{
        padding: '10px 20px',
        backgroundColor: '#1976d2',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
      }}
    >
      Go to Dashboard
    </a>
  </div>
);

const router = createBrowserRouter([
  // Public auth routes
  {
    path: '/auth',
    element: (
      <SuspenseWrapper>
        <PublicRoute />
      </SuspenseWrapper>
    ),
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
          {
            path: 'forgot-password',
            element: <ForgotPasswordPage />,
          },
          {
            index: true,
            element: <Navigate to="login" replace />,
          },
        ],
      },
    ],
  },

  // Protected main app routes
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <ProtectedRoute />
      </SuspenseWrapper>
    ),
    children: [
      {
        element: <MainLayout />,
        children: [
          ...dashboardRoutes,
          ...salesRoutes,
          ...operationsRoutes,
          ...hrRoutes,
          ...financeRoutes,
          ...marketingRoutes,
          ...customerServiceRoutes,
          ...inventoryRoutes,
          ...complianceRoutes,
          ...adminRoutes,
        ],
      },
    ],
  },

  // 404 Not Found
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
