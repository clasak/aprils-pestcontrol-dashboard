import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const InventoryDashboard = lazy(() => import('./pages/InventoryDashboard'));
const StockPage = lazy(() => import('./pages/StockPage'));

const inventoryRoutes: RouteObject[] = [
  {
    path: 'inventory',
    children: [
      { index: true, element: <InventoryDashboard /> },
      { path: 'stock', element: <StockPage /> },
    ],
  },
];

export default inventoryRoutes;
