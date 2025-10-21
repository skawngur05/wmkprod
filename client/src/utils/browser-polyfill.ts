/**
 * This patch fixes the console errors related to "PC plat undefined" and
 * uncaught promise rejections by adding a global error handler for navigator.platform
 * which is a deprecated API that some parts of the application are still using.
 */

// Add a global error handler for uncaught Promise rejections
window.addEventListener('unhandledrejection', function(event) {
  // Safely log the error without causing additional errors
  const reason = event.reason ? 
    (typeof event.reason === 'string' ? 
      event.reason : 
      (event.reason.message || JSON.stringify(event.reason, null, 2))) 
    : 'Unknown rejection reason';
  
  console.error('Caught unhandled promise rejection:', reason);
  
  // Prevent the default browser behavior (which would log the error)
  event.preventDefault();
});

// Create a polyfill for navigator.platform if it's undefined
if (typeof navigator.platform === 'undefined') {
  // Use Object.defineProperty to safely add the platform property
  try {
    Object.defineProperty(navigator, 'platform', { 
      get: function() { 
        // Return a safe default value based on userAgent
        const ua = navigator.userAgent.toLowerCase();
        if (/windows/.test(ua)) return 'Win32';
        if (/macintosh|mac os x/.test(ua)) return 'MacIntel';
        if (/linux/.test(ua)) return 'Linux';
        if (/android/.test(ua)) return 'Android';
        if (/iphone|ipad|ipod/.test(ua)) return 'iOS';
        return 'Unknown';
      },
      configurable: true 
    });
    console.log('Added polyfill for navigator.platform');
  } catch (e) {
    console.error('Failed to polyfill navigator.platform:', e);
  }
}
