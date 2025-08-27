// Tên cache
const CACHE_NAME = 'chat-app-cache-v1';
// Các file cần cache
const urlsToCache = [
  '/',
  '/private.html' // Hoặc đường dẫn chính xác đến file html của bạn
  // Bạn có thể thêm các link CSS, JS, ảnh tĩnh khác ở đây
];

// Cài đặt service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Lắng nghe sự kiện fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Nếu tìm thấy trong cache, trả về
        if (response) {
          return response;
        }
        // Nếu không, fetch từ mạng
        return fetch(event.request);
      }
    )
  );
});

// Kích hoạt service worker
self.addEventListener('activate', event => {
  var cacheWhitelist = [CACHE_NAME];
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

// Lắng nghe sự kiện push notification
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'https://www.gstatic.com/images/branding/product/1x/firebase_512dp.png',
    badge: 'https://www.gstatic.com/images/branding/product/1x/firebase_512dp.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
