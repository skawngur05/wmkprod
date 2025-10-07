import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile devices including Safari mobile
 * This is more reliable than CSS media queries for browser-specific detection
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      try {
        // Check for mobile viewport
        const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const isMobileViewport = viewportWidth < 768;
        
        // Check user agent for mobile devices
        const userAgent = navigator.userAgent.toLowerCase();
        
        // Mobile OS detection
        const isAndroid = /android/.test(userAgent);
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isWindowsPhone = /windows phone/.test(userAgent);
        
        // Any mobile OS
        const isMobileOS = isAndroid || isIOS || isWindowsPhone;
        
        // Any mobile-specific terms in user agent
        const hasMobileTerms = /mobile|phone|tablet|opera mini|iemobile/.test(userAgent);
        
        // Special check for iOS Safari
        const isIOSSafari = isIOS && /safari/.test(userAgent) && !/chrome/.test(userAgent);
        
        // Set as mobile if ANY of these conditions are true
        const result = isMobileViewport || isMobileOS || hasMobileTerms || isIOSSafari;
        setIsMobile(result);
        
        // Debug logging only in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Mobile detection:', { 
            userAgent, 
            isMobileViewport, 
            isAndroid,
            isIOS,
            isWindowsPhone,
            hasMobileTerms,
            isIOSSafari,
            result
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in mobile detection:', error);
        }
        // Default to non-mobile if detection fails
        setIsMobile(false);
      }
    };

    // Check on mount
    checkMobile();
    
    // Add listener for resize events
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}
