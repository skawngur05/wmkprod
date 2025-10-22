import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/mobile-tables.css"; // Import mobile table styles
import "./styles/calendar.css"; // Import calendar responsive styles
import "./styles/animations.css"; // Import custom animations
// Cache bust - force rebuild after table structure changes: 1760342112583

// Development cache busting - force reload if schema version changes
if (import.meta.env.DEV) {
  const devCacheKey = 'dev-cache-buster';
  const currentVersion = '1.0.0'; // Increment this to force a cache clear
  const cachedVersion = localStorage.getItem(devCacheKey);
  
  if (cachedVersion && cachedVersion !== currentVersion) {
    // Clear all possible caches
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear service worker caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Save new version before reload to prevent loop
    localStorage.setItem(devCacheKey, currentVersion);
    
    // Force a hard reload
    window.location.reload();
  } else if (!cachedVersion) {
    // First load, just save the version
    localStorage.setItem(devCacheKey, currentVersion);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
