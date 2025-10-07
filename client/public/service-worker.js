// This is a basic service worker that provides caching for a better mobile experience

// IMPORTANT: This timestamp gets replaced during build process for proper cache busting
const CACHE_VERSION = '{{BUILD_TIMESTAMP}}'; // Will be replaced by build process
const CACHE_NAME = `wmk-crm-cache-v${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // CSS and JS assets are dynamically hashed by the build process
  // and will be precached when requested the first time
];

// Install event - precaches resources and forces activation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing with cache version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating with cache version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Force the service worker to claim all clients
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when available but always try network first for HTML
self.addEventListener('fetch', (event) => {
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension:')) {
    return;
  }

  // For HTML files, always try network first to get fresh content
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response since it can only be used once
          const responseClone = response.clone();
          
          // Update cache with fresh content
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
          
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Don't cache API calls or chrome-extension URLs
                const url = event.request.url;
                if (!url.includes('/api/') && !url.startsWith('chrome-extension:')) {
                  try {
                    cache.put(event.request, responseToCache);
                  } catch (error) {
                    console.error('Cache put error:', error);
                  }
                }
              });

            return response;
          }
        );
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
