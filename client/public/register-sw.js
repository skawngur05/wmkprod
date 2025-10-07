// This script registers the service worker for offline support and PWA functionality

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register the service worker normally without aggressive unregistration
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Check for updates periodically but don't force immediate reloads
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New content available - will be used on next page load');
                // Don't auto-reload, let user navigate naturally
              }
            });
          }
        });
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
