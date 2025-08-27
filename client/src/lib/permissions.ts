import { User } from '@shared/schema';

// Define all available permissions
export const PERMISSIONS = {
  DASHBOARD: 'dashboard',
  LEADS: 'leads',
  ADD_LEAD: 'add_lead',
  FOLLOWUPS: 'followups',
  SAMPLE_BOOKLETS: 'sample_booklets',
  INSTALLATIONS: 'installations',
  REPORTS: 'reports',
  ADMIN_PANEL: 'admin_panel',
  USER_MANAGEMENT: 'user_management',
  SYSTEM_SETTINGS: 'system_settings'
} as const;

// Route to permission mapping
export const ROUTE_PERMISSIONS: Record<string, string> = {
  '/dashboard': PERMISSIONS.DASHBOARD,
  '/leads': PERMISSIONS.LEADS,
  '/add-lead': PERMISSIONS.ADD_LEAD,
  '/followups': PERMISSIONS.FOLLOWUPS,
  '/sample-booklets': PERMISSIONS.SAMPLE_BOOKLETS,
  '/installations': PERMISSIONS.INSTALLATIONS,
  '/reports': PERMISSIONS.REPORTS,
  '/admin': PERMISSIONS.ADMIN_PANEL,
  '/admin/users': PERMISSIONS.USER_MANAGEMENT,
  '/user-management': PERMISSIONS.USER_MANAGEMENT,
  '/admin/installers': PERMISSIONS.ADMIN_PANEL,
  '/admin/lead-origins': PERMISSIONS.ADMIN_PANEL,
  '/admin/email-templates': PERMISSIONS.ADMIN_PANEL,
  '/admin/smtp-settings': PERMISSIONS.SYSTEM_SETTINGS,
  '/admin/activity': PERMISSIONS.ADMIN_PANEL,
};

/**
 * Check if user has permission for a specific route
 */
export function hasPermission(user: User | null, route: string): boolean {
  if (!user) return false;
  
  // Admin and administrator roles have all permissions
  if (user.role === 'admin' || user.role === 'administrator') {
    return true;
  }
  
  // Get required permission for the route
  const requiredPermission = ROUTE_PERMISSIONS[route];
  
  // If no specific permission is required, allow access
  if (!requiredPermission) return true;
  
  // Check if user has the required permission
  return Array.isArray(user.permissions) && user.permissions.includes(requiredPermission) || false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  
  // Admin and administrator roles have all permissions
  if (user.role === 'admin' || user.role === 'administrator') {
    return true;
  }
  
  return permissions.some(permission => 
    Array.isArray(user.permissions) && user.permissions.includes(permission) || false
  );
}

/**
 * Get navigation items based on user permissions
 */
export function getNavigationItems(user: User | null) {
  if (!user) return [];
  
  const allItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', testId: 'nav-dashboard', permission: PERMISSIONS.DASHBOARD },
    { path: '/leads', icon: 'fas fa-users', label: 'Leads', testId: 'nav-leads', permission: PERMISSIONS.LEADS },
    { path: '/add-lead', icon: 'fas fa-user-plus', label: 'Add Lead', testId: 'nav-add-lead', permission: PERMISSIONS.ADD_LEAD },
    { path: '/followups', icon: 'fas fa-calendar-check', label: 'Follow-ups', testId: 'nav-followups', permission: PERMISSIONS.FOLLOWUPS },
    { path: '/sample-booklets', icon: 'fas fa-book', label: 'Sample Booklets', testId: 'nav-sample-booklets', permission: PERMISSIONS.SAMPLE_BOOKLETS },
    { path: '/installations', icon: 'fas fa-tools', label: 'Installations', testId: 'nav-installations', permission: PERMISSIONS.INSTALLATIONS },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports', testId: 'nav-reports', permission: PERMISSIONS.REPORTS },
  ];
  
  const adminItems = [
    { path: '/admin', icon: 'fas fa-shield-alt', label: 'Admin Dashboard', testId: 'nav-admin-dashboard', permission: PERMISSIONS.ADMIN_PANEL },
    { path: '/admin/users', icon: 'fas fa-users-cog', label: 'User Management', testId: 'nav-admin-users', permission: PERMISSIONS.USER_MANAGEMENT },
    { path: '/admin/installers', icon: 'fas fa-user-cog', label: 'Installers', testId: 'nav-admin-installers', permission: PERMISSIONS.ADMIN_PANEL },
    { path: '/admin/email-templates', icon: 'fas fa-mail-bulk', label: 'Email Templates', testId: 'nav-admin-email-templates', permission: PERMISSIONS.ADMIN_PANEL },
    { path: '/admin/smtp-settings', icon: 'fas fa-server', label: 'SMTP Settings', testId: 'nav-admin-smtp', permission: PERMISSIONS.SYSTEM_SETTINGS },
    { path: '/admin/activity', icon: 'fas fa-history', label: 'Activity Log', testId: 'nav-admin-activity', permission: PERMISSIONS.ADMIN_PANEL },
  ];
  
  // Filter items based on permissions
  const userItems = allItems.filter(item => hasPermission(user, item.path));
  const filteredAdminItems = adminItems.filter(item => hasPermission(user, item.path));
  
  return {
    core: userItems,
    admin: filteredAdminItems
  };
}