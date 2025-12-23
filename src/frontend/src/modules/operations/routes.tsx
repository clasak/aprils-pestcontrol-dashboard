import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const OperationsDashboard = lazy(() => import('./pages/OperationsDashboard'));
const OperationsManagerDashboard = lazy(() => import('./pages/OperationsManagerDashboard'));
const TechnicianDashboard = lazy(() => import('./pages/TechnicianDashboard'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const DispatchPage = lazy(() => import('./pages/DispatchPage'));
const RoutesPage = lazy(() => import('./pages/RoutesPage'));

const operationsRoutes: RouteObject[] = [
  {
    path: 'operations',
    children: [
      {
        index: true,
        element: <OperationsDashboard />,
      },
      {
        path: 'manager',
        element: <OperationsManagerDashboard />,
      },
      {
        path: 'technician',
        element: <TechnicianDashboard />,
      },
      {
        path: 'schedule',
        element: <SchedulePage />,
      },
      {
        path: 'dispatch',
        element: <DispatchPage />,
      },
      {
        path: 'routes',
        element: <RoutesPage />,
      },
    ],
  },
];

export default operationsRoutes;
