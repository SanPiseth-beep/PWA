const CACHE_NAME = 'pallete-v1';

const urlsToCache = [
  "/index.html",
  "/pages/about.html",
  "/pages/contact.html",
  "/pages/howto.html",
  "/css/materialize.min.css",
  "/js/materialize.min.js",
  "/js/ui.js",
  "/js/palette.js",
  "/js/about.js",
  "/img/icons-48.png",
  "/img/icons-96.png",
  "/img/boy_499x500.png",
];

// Install event
self.addEventListener("install", async (event) => {
  console.log("Service worker: Installing...");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log("Service worker: caching files");
      await cache.addAll(urlsToCache);
    })()
  );
});

// Activate event
self.addEventListener("activate", async (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Deleting old Cache");
            await caches.delete(cache);
          }
        })
      );
    })()
  );
});

// Fetch event
self.addEventListener("fetch", async (event) => {
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        console.error("Fetch failed, returning offline page:", error);
        // Optionally, return an offline page here if available in the cache
      }
    })()
  );
});