/**
 * Service Worker para o app Constância
 * Gerencia cache e notificações push
 */

const CACHE_NAME = 'constancia-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepta requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se disponível, senão busca na rede
        return response || fetch(event.request);
      })
  );
});

// Escuta notificações push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Hora de treinar!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'treinar', title: '🏋️ Treinar Agora' },
      { action: 'depois', title: '⏰ Lembrar Depois' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('🔥 Constância', options)
  );
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'treinar') {
    event.waitUntil(
      clients.openWindow('/workouts')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
