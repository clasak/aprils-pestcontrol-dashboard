import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load pages for code splitting
const SalesDashboardPage = lazy(() => import('./pages/SalesDashboardPage'));
const SalesManagerDashboard = lazy(() => import('./pages/SalesManagerDashboard'));
const AccountExecutiveDashboard = lazy(() => import('./pages/AccountExecutiveDashboard'));
const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const ContactDetailPage = lazy(() => import('./pages/ContactDetailPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const LeadDetailPage = lazy(() => import('./pages/LeadDetailPage'));
const PipelinePage = lazy(() => import('./pages/PipelinePage'));
const DealDetailPage = lazy(() => import('./pages/DealDetailPage'));
const QuotesPage = lazy(() => import('./pages/QuotesPage'));

const salesRoutes: RouteObject[] = [
  {
    path: 'sales',
    children: [
      {
        index: true,
        element: <SalesDashboardPage />,
      },
      {
        path: 'team',
        element: <SalesManagerDashboard />,
      },
      {
        path: 'my-dashboard',
        element: <AccountExecutiveDashboard />,
      },
      {
        path: 'contacts',
        element: <ContactsPage />,
      },
      {
        path: 'contacts/:id',
        element: <ContactDetailPage />,
      },
      {
        path: 'leads',
        element: <LeadsPage />,
      },
      {
        path: 'leads/:id',
        element: <LeadDetailPage />,
      },
      {
        path: 'pipeline',
        element: <PipelinePage />,
      },
      {
        path: 'pipeline/:id',
        element: <DealDetailPage />,
      },
      {
        path: 'quotes',
        element: <QuotesPage />,
      },
    ],
  },
];

export default salesRoutes;
