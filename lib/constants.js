export const USER_ROLES = {
  ADMIN: 'Admin',
  ATTORNEY: 'Attorney',
  PARALEGAL: 'Paralegal',
  VIEWER: 'Viewer',
};

export const CUSTOMER_STATUS = [
  'Active',
  'Inactive',
  'Prospective',
  'Former',
];

export const INDUSTRY_TYPES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Education',
  'Construction',
  'Hospitality',
  'Transportation',
  'Energy',
  'Telecommunications',
  'Professional Services',
  'Government',
  'Non-Profit',
  'Other',
];

export const CASE_STATUS = [
  'Open',
  'In Progress',
  'Pending',
  'Closed',
  'Settled',
];

export const CASE_TYPES = [
  'Litigation',
  'Corporate',
  'Real Estate',
  'Intellectual Property',
  'Employment',
  'Family Law',
  'Criminal Defense',
  'Immigration',
  'Tax Law',
  'Environmental',
  'Bankruptcy',
  'Personal Injury',
  'Contract',
  'Mergers & Acquisitions',
  'Other',
];

export const ENGAGEMENT_TYPES = [
  'Consultation',
  'Meeting',
  'Phone Call',
  'Email',
  'Court Appearance',
  'Mediation',
  'Negotiation',
  'Document Review',
  'Client Interview',
  'Follow-up',
];

export const ENGAGEMENT_CHANNELS = [
  'In-Person',
  'Phone',
  'Email',
  'Video Conference',
  'Letter',
  'Text Message',
  'Court',
  'Office Visit',
];

export const ENGAGEMENT_OUTCOMES = [
  'Resolved',
  'Pending',
  'Follow-up Required',
  'No Action',
];

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
  },
  CUSTOMERS: {
    BASE: '/api/customers',
    BY_ID: (id) => `/api/customers/${id}`,
  },
  CASES: {
    BASE: '/api/cases',
    BY_ID: (id) => `/api/cases/${id}`,
    BY_CUSTOMER: (customerId) => `/api/cases/by-customer/${customerId}`,
  },
  ENGAGEMENTS: {
    BASE: '/api/engagements',
    BY_ID: (id) => `/api/engagements/${id}`,
    BY_CUSTOMER: (customerId) => `/api/engagements/by-customer/${customerId}`,
  },
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
  },
  REPORTS: {
    EXPORT: '/api/reports/export',
  },
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to access this resource',
  FORBIDDEN: 'You do not have permission to access this resource',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later',
  NETWORK_ERROR: 'Network error. Please check your connection',
};

export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created',
  UPDATED: 'Successfully updated',
  DELETED: 'Successfully deleted',
  SAVED: 'Successfully saved',
};