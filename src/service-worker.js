const CACHE_NAME = 'game-logger-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/styles/main.css',
  '/src/script.js',
  '/manifest.json',
  // Add paths to your icons here, ensure they match manifest.json and are in assets/icons/
  // It's better to list them individually or use a build tool to generate this list.
  // For simplicity, I'll assume a few common ones. You should update this.
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/tubiao.png',
  '/assets/icons/icon-384x384.png',
  '/assets/icons/icon-512x512.png',
  'https://via.placeholder.com/400x200.png?text=Zelda+TotK', // Example placeholder, real images should be local or cached strategically
  'https://via.placeholder.com/400x200.png?text=Elden+Ring',
  'https://via.placeholder.com/150x100.png?text=Cyberpunk+2077',
  'https://via.placeholder.com/150x100.png?text=God+of+War',
  'https://via.placeholder.com/150x100.png?text=Starfield',
  'https://via.placeholder.com/300x150.png?text=点击上传游戏封面图片',
  'https://via.placeholder.com/80x80.png?text=N/A',
  'https://via.placeholder.com/80x80.png?text=Game+1' // From HTML example
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all URLs to cache, but be careful with external URLs like via.placeholder.com
        // It's better to cache them on first fetch (network falling back to cache) or use a more robust strategy
        // For simplicity in this example, we add them. If any fail, the SW install fails.
        return cache.addAll(urlsToCache.map(url => new Request(url, { mode: 'no-cors' })))
          .catch(error => {
            console.error('Failed to cache one or more resources during install:', error);
            // Optionally, you can decide not to fail the entire installation
            // For example, by caching essential files first and then non-essential ones
          });
      })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_IMAGE_DATA_URL') {
    const { id, dataUrl } = event.data;
    // Construct a unique, cacheable URL for the image data.
    // This URL doesn't need to be accessible over the network, it's just a key for the cache.
    const requestUrl = `${self.location.origin}/user-uploaded-images/game-${id}.png`;

    event.waitUntil(
      // Fetch the Data URL content to get a Response object
      fetch(dataUrl)
        .then(response => response.blob()) // Convert to blob to correctly store image data
        .then(blob => {
          // Create a new Response object with the blob and appropriate headers
          const headers = { 'Content-Type': blob.type };
          const responseToCache = new Response(blob, { headers });

          return caches.open(CACHE_NAME).then(cache => {
            console.log(`Service Worker: Caching user image ${requestUrl}`);
            // Use a Request object as the key for the cache
            return cache.put(new Request(requestUrl), responseToCache);
          });
        })
        .catch(error => {
          console.error('Service Worker: Failed to cache user image.', error);
        })
    );
  }
});

self.addEventListener('fetch', event => {
  // Exclude chrome-extension URLs from being handled by this fetch listener
  if (event.request.url.startsWith('chrome-extension://')) {
    return; // Let the browser handle it
  }

  // Handle user-uploaded images specifically
  if (event.request.url.includes('/user-uploaded-images/')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // If a user-uploaded image is not in cache, it means it wasn't properly cached or the URL is wrong.
        // We don't attempt to fetch it from network as these are synthetic URLs.
        // Return a 404 or a placeholder if desired.
        // For simplicity, returning a 404.
        return new Response('', { status: 404, statusText: 'Not Found In Cache' });
      })
    );
    return; // Important to return here to not proceed with generic caching logic
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache GET requests. Other methods (POST, PUT, etc.) are not typically cached.
                if (event.request.method === 'GET') {
                    // Use no-cors for opaque responses (like images from via.placeholder.com)
                    // but be aware of the limitations (cannot inspect content).
                    // For your own assets, this is not needed.
                    const cacheRequest = event.request.url.includes('via.placeholder.com') 
                                       ? new Request(event.request.url, { mode: 'no-cors' })
                                       : event.request;
                    cache.put(cacheRequest, responseToCache);
                }
              });

            return response;
          }
        ).catch(error => {
            console.error('Fetch failed; returning offline page instead.', error);
            // Optionally, return a fallback offline page if the request is for an HTML page
            // if (event.request.mode === 'navigate') {
            //   return caches.match('/offline.html');
            // }
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});