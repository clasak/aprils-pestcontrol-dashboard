import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const CustomerServiceDashboard = lazy(() => import('./pages/CustomerServiceDashboard'));
const TicketsPage = lazy(() => import('./pages/TicketsPage'));

const customerServiceRoutes: RouteObject[] = [
  {
    path: 'customer-service',
    children: [
      { index: true, element: <CustomerServiceDashboard /> },
      { path: 'tickets', element: <TicketsPage /> },
    ],
  },
];

export default customerServiceRoutes;
