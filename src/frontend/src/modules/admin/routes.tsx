import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ImportPage = lazy(() => import('./pages/ImportPage'));

const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'import', element: <ImportPage /> },
    ],
  },
];

export default adminRoutes;
