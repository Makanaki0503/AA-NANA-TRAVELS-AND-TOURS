// Service Worker for AA Nana Travels and Tours
const CACHE_NAME = 'aa-nana-travels-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline access
const urlsToCache = [
    '/',
    '/index.html',
    '/about.html',
    '/services.html',
    '/packages.html',
    '/contact.html',
    '/booking.html',
    '/privacy-policy.html',
    '/terms-and-conditions.html',
    '/disclaimer.html',
    '/404.html',
    '/style.css',
    '/script.js',
    '/offline.html'
];

// Install event - cache files
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching files...');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip analytics and tracking
    if (requestUrl.pathname.includes('analytics') || 
        requestUrl.pathname.includes('gtag') ||
        requestUrl.pathname.includes('facebook')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached response if found
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        
                        // Cache the fetched response
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // If offline and page not found, show offline page
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Push notification event (optional)
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/favicon-32x32.png',
        badge: '/favicon-16x16.png',
        vibrate: [200, 100, 200],
        data: {
            url: event.data.json().url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('AA Nana Travels', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});