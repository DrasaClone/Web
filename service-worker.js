// Khi nâng cấp sw thì nâng v1.2 lên các số khác để cập nhật
// service-worker.js

const CACHE_NAME = 'ma-tran-giao-tiep-v1.2';
// Các tệp cần thiết để ứng dụng chạy offline
const urlsToCache = [
  './',
  './index.html',
  './old.html'
  // Khi bạn có các file css, js riêng, hãy thêm chúng vào đây
  // './style.css',
  // './main.js'
];

// 1. Cài đặt Service Worker và lưu cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and added core files');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Kích hoạt service worker mới ngay lập tức
});

// 2. Lấy dữ liệu từ cache khi offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Nếu có trong cache thì trả về, không thì fetch từ network
        return response || fetch(event.request);
      })
  );
});

// 3. Xóa các cache cũ khi có phiên bản mới
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
