import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const HRDashboard = lazy(() => import('./pages/HRDashboard'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const PayrollPage = lazy(() => import('./pages/PayrollPage'));

const hrRoutes: RouteObject[] = [
  {
    path: 'hr',
    children: [
      { index: true, element: <HRDashboard /> },
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'payroll', element: <PayrollPage /> },
    ],
  },
];

export default hrRoutes;
