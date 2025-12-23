import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
];

export default adminRoutes;
