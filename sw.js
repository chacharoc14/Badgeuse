const CACHE = 'badgeuse-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// INSTALL
self.addEventListener('install', e => {

  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
  );

  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', e => {

  e.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys
          .filter(k => k !== CACHE)
          .map(k => caches.delete(k))

      )
    )
  );

  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', e => {

  e.respondWith(

    caches.match(e.request)

      .then(cached => {

        // retourne le cache si dispo
        if(cached) return cached;

        // sinon fetch réseau
        return fetch(e.request)
          .then(res => {

            // copie réponse
            const copy = res.clone();

            // sauvegarde cache
            caches.open(CACHE)
              .then(cache => cache.put(e.request, copy));

            return res;
          })

          // fallback offline
          .catch(() => caches.match('./index.html'));
      })
  );
});
