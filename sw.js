// Her güncellemede bu versiyonu artırın
const CACHE_NAME = 'kbb-servis-v3';

// Install: cache sadece ikonlar (HTML her zaman network'ten gelsin)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(['./icon-192.png', './icon-512.png', './manifest.json']))
  );
  self.skipWaiting();
});

// Activate: ESKİ cache'leri sil
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

// Fetch: HTML/JS için NETWORK FIRST (her zaman güncel), ikonlar için cache
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // HTML ve JS: network first, fallback cache
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('.js')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          // Başarılıysa cache'e yaz ve döndür
          if (r && r.status === 200) {
            const clone = r.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Diğerleri (ikonlar, manifest): cache first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
