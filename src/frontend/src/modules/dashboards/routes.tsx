import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const RoleBasedHome = lazy(() => import('./pages/RoleBasedHome'));
const MainDashboard = lazy(() => import('./pages/MainDashboard'));
const ExecutiveDashboard = lazy(() => import('./pages/ExecutiveDashboard'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

const dashboardRoutes: RouteObject[] = [
  {
    path: '/',
    element: <RoleBasedHome />,
  },
  {
    path: 'dashboard',
    children: [
      {
        index: true,
        element: <RoleBasedHome />,
      },
      {
        path: 'main',
        element: <MainDashboard />,
      },
      {
        path: 'executive',
        element: <ExecutiveDashboard />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
    ],
  },
];

export default dashboardRoutes;
