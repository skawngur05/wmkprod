// A utility to help with cache busting
import { queryClient } from '@/lib/queryClient';

// The version number that changes whenever we deploy new code
export const APP_VERSION = Date.now().toString();

// Force refresh all API data - call this when user navigates to critical pages
export const forceRefreshData = (username?: string) => {
  // Clear cached data for key endpoints
  queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
  queryClient.invalidateQueries({ queryKey: ['/api/followups'] });
  queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
  queryClient.invalidateQueries({ queryKey: ['/api/installations'] });
  
  // Also clear cache with username pattern
  if (username) {
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats', username] });
    queryClient.invalidateQueries({ queryKey: ['/api/followups', username] });
    queryClient.invalidateQueries({ queryKey: ['/api/leads', username] });
    queryClient.invalidateQueries({ queryKey: ['/api/installations', username] });
  }
  
  // If there's any browser-level caching, this will help
  if (typeof window !== 'undefined') {
    try {
      // Clear application cache if available
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    } catch (e) {
      console.error('Error clearing caches:', e);
    }
  }
};

// Headers to prevent caching
export const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// Add cache busting param to URL
export const addCacheBuster = (url: string) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}nocache=${Date.now()}`;
};
