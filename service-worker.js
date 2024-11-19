// service-worker.js
const CACHE_NAME = 'palette-v1';
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
  "/js/firebaseDB.js",
  "/js/indexedDB.js",
  "/js/sync.js",
  "/img/icons-48.png",
  "/img/icons-96.png",
  "/img/boy_499x500.png",
];

self.addEventListener("install", async (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", async (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/index.html');
      });
    }).catch((error) => {
      console.error('Fetch failed:', error);
      throw error;
    })
  );
});