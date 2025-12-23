import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const FinanceDashboard = lazy(() => import('./pages/FinanceDashboard'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));

const financeRoutes: RouteObject[] = [
  {
    path: 'finance',
    children: [
      { index: true, element: <FinanceDashboard /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'payments', element: <PaymentsPage /> },
    ],
  },
];

export default financeRoutes;
