// Safari Mobile Diagnostics Script
(function() {
  console.log('[SafariFallback] Initializing Safari diagnostics');
  
  // Debug information
  const debugInfo = {
    userAgent: navigator.userAgent,
    vendor: navigator.vendor,
    platform: navigator.platform,
    appVersion: navigator.appVersion,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    hasMaxTouchPoints: navigator.maxTouchPoints > 1,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    dateTime: new Date().toISOString()
  };
  
  console.log('[SafariFallback] Browser debug info:', debugInfo);
  
  // Log any React errors to help debugging
  window.addEventListener('error', function(event) {
    if (event.error && event.error.message && 
        (event.error.message.includes('React') || 
         event.error.message.includes('Minified React error'))) {
      console.error('[SafariFallback] React error detected:', event.error);
      console.error('[SafariFallback] Component stack:', event.error.componentStack);
    }
  });
  
  // Only continue with diagnostics for dashboard page on Safari iOS
  if (window.location.pathname === '/' && debugInfo.isIOS && debugInfo.isSafari) {
    console.log('[SafariFallback] On dashboard with Safari iOS, monitoring for errors');
    
    // Wait for the page to load
    window.addEventListener('load', function() {
      console.log('[SafariFallback] Page loaded, checking for React rendering');
      
      // Check if React has rendered successfully after a short delay
      setTimeout(function() {
        const rootElement = document.getElementById('root');
        if (!rootElement || rootElement.children.length < 2) {
          console.log('[SafariFallback] React app may not have rendered properly');
          
          // Check for specific components that should be visible
          const businessCalendar = document.querySelector('[data-testid="business-calendar"]');
          const todaysFollowups = document.querySelector('[data-testid="todays-followups"]');
          const recentLeads = document.querySelector('[data-testid="recent-leads"]');
          
          console.log('[SafariFallback] Component check:', {
            businessCalendar: !!businessCalendar,
            todaysFollowups: !!todaysFollowups,
            recentLeads: !!recentLeads
          });
        } else {
          console.log('[SafariFallback] React appears to be rendering properly');
        }
      }, 3000);
    });
  }
  
  console.log('[SafariFallback] Initialization complete');

  // Debug logging function
  function debugLog(message) {
    console.log('[SafariFallback] ' + message);
    var logElement = document.getElementById('debug-log');
    if (logElement) {
      logElement.innerHTML += '<div>' + new Date().toLocaleTimeString() + ': ' + message + '</div>';
      logElement.scrollTop = logElement.scrollHeight;
    }
  }

  // Create fallback UI function
  function createFallbackUI() {
    var body = document.body;
    var content = document.createElement('div');
    content.style.padding = '20px';
    content.style.fontFamily = 'Arial, sans-serif';
    content.style.backgroundColor = '#f8f9fa';
    content.style.minHeight = '100vh';
    
    var title = document.createElement('h1');
    title.innerText = 'Safari Compatibility Mode';
    title.style.color = '#333';
    content.appendChild(title);
    
    var message = document.createElement('p');
    message.innerText = 'The main application may be having trouble loading. This fallback interface provides basic functionality.';
    content.appendChild(message);
    
    // Create debug section
    var debugSection = document.createElement('div');
    debugSection.style.marginTop = '20px';
    debugSection.style.border = '1px solid #ccc';
    debugSection.style.borderRadius = '5px';
    debugSection.style.padding = '10px';
    
    var debugTitle = document.createElement('h3');
    debugTitle.innerText = 'Debug Information';
    debugTitle.style.margin = '0 0 10px 0';
    debugSection.appendChild(debugTitle);
    
    var userAgent = document.createElement('div');
    userAgent.innerHTML = '<strong>User Agent:</strong> ' + navigator.userAgent;
    userAgent.style.fontSize = '12px';
    userAgent.style.marginBottom = '5px';
    debugSection.appendChild(userAgent);
    
    var viewport = document.createElement('div');
    viewport.innerHTML = '<strong>Viewport:</strong> ' + window.innerWidth + 'x' + window.innerHeight;
    viewport.style.fontSize = '12px';
    viewport.style.marginBottom = '5px';
    debugSection.appendChild(viewport);
    
    var debugLogElement = document.createElement('div');
    debugLogElement.id = 'debug-log';
    debugLogElement.style.backgroundColor = '#f8f9fa';
    debugLogElement.style.padding = '5px';
    debugLogElement.style.fontSize = '12px';
    debugLogElement.style.maxHeight = '150px';
    debugLogElement.style.overflow = 'auto';
    debugLogElement.style.border = '1px solid #ddd';
    debugSection.appendChild(debugLogElement);
    
    content.appendChild(debugSection);
    
    // Add refresh button
    var refreshButton = document.createElement('button');
    refreshButton.innerText = 'Refresh Page';
    refreshButton.style.backgroundColor = '#6c757d';
    refreshButton.style.color = 'white';
    refreshButton.style.border = 'none';
    refreshButton.style.borderRadius = '5px';
    refreshButton.style.padding = '10px';
    refreshButton.style.margin = '10px 5px';
    refreshButton.style.width = '100%';
    refreshButton.onclick = function() { window.location.reload(); };
    content.appendChild(refreshButton);
    
    // Log success
    debugLog('Fallback UI created successfully');
  }

  // Detect Safari iOS
  function isIOSSafari() {
    var ua = navigator.userAgent.toLowerCase();
    var isIOS = /iphone|ipad|ipod/.test(ua);
    var isSafari = /safari/.test(ua) && !/chrome/.test(ua);
    return isIOS && isSafari;
  }

  // Execute immediately for Safari
  if (isIOSSafari()) {
    debugLog('iOS Safari detected - initializing fallback mode');
    
    // Set timeout to create fallback UI if React doesn't render
    window.safariTimeout = setTimeout(function() {
      debugLog('React failed to render, creating fallback UI');
      createFallbackUI();
    }, 3000); // 3 second timeout
    
    // Check if we're on the dashboard page
    if (window.location.pathname === '/dashboard' || window.location.pathname === '/') {
      debugLog('On dashboard, pre-emptively creating fallback UI');
      createFallbackUI();
    }
  }

  // Function to cancel fallback if React renders successfully
  window.cancelSafariFallback = function() {
    if (window.safariTimeout) {
      clearTimeout(window.safariTimeout);
      debugLog('React rendered successfully, canceled fallback UI');
    }
  };

})();
