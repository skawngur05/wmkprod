// Application version for cache busting
export const APP_VERSION = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Function to check if a new version is available
export const checkForUpdates = async () => {
  try {
    const response = await fetch('/api/version?' + Date.now());
    if (response.ok) {
      const data = await response.json();
      if (data.version !== APP_VERSION) {
        return true; // New version available
      }
    }
  } catch (error) {
    console.log('Version check failed:', error);
  }
  return false;
};

// Force app reload with cache clearing
export const forceAppReload = () => {
  // Clear various caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Clear local storage cache if any
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('react-query-')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Force reload with cache busting
  window.location.href = window.location.href + '?v=' + Date.now();
};
