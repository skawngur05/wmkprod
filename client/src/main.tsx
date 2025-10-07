import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/mobile-tables.css"; // Import mobile table styles
import "./styles/calendar.css"; // Import calendar responsive styles
import "./styles/animations.css"; // Import custom animations

// Development cache busting - force reload if cached version detected
if (import.meta.env.DEV) {
  const devCacheKey = 'dev-cache-buster';
  const currentVersion = Date.now().toString();
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
    
    // Force a hard reload
    window.location.reload();
  }
  
  localStorage.setItem(devCacheKey, currentVersion);
}

createRoot(document.getElementById("root")!).render(<App />);
