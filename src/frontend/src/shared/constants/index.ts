// Application constants

export const APP_NAME = "April's Pest Control CRM";
export const APP_VERSION = '0.1.0';
export const COMPANY_NAME = 'CompassIQ';
export const POWERED_BY = 'Powered by CompassIQ';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  CUSTOMERS: '/customers',
  JOBS: '/jobs',
  TECHNICIANS: '/technicians',
  INVOICES: '/invoices',
  INVENTORY: '/inventory',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SALES: '/sales',
  OPERATIONS: '/operations',
  HR: '/hr',
  FINANCE: '/finance',
  MARKETING: '/marketing',
  CUSTOMER_SERVICE: '/customer-service',
  INVENTORY: '/inventory',
  COMPLIANCE: '/compliance',
  ADMIN: '/admin',
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
};

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};
