import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const MarketingDashboard = lazy(() => import('./pages/MarketingDashboard'));
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));

const marketingRoutes: RouteObject[] = [
  {
    path: 'marketing',
    children: [
      { index: true, element: <MarketingDashboard /> },
      { path: 'campaigns', element: <CampaignsPage /> },
    ],
  },
];

export default marketingRoutes;
