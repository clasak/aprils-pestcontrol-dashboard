import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const ComplianceDashboard = lazy(() => import('./pages/ComplianceDashboard'));
const CertificationsPage = lazy(() => import('./pages/CertificationsPage'));

const complianceRoutes: RouteObject[] = [
  {
    path: 'compliance',
    children: [
      { index: true, element: <ComplianceDashboard /> },
      { path: 'certifications', element: <CertificationsPage /> },
    ],
  },
];

export default complianceRoutes;
