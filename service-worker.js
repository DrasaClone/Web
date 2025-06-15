// Tên của bộ nhớ cache
const CACHE_NAME = 'my-pwa-cache-v1';

// Danh sách các file cần được cache lại để hoạt động offline
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Lắng nghe sự kiện 'install'
// Sự kiện này được kích hoạt khi service worker được cài đặt lần đầu
self.addEventListener('install', event => {
  // Chờ cho đến khi quá trình caching hoàn tất
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache); // Thêm tất cả các file trong danh sách vào cache
      })
  );
});

// Lắng nghe sự kiện 'fetch'
// Sự kiện này được kích hoạt mỗi khi có một yêu cầu mạng (ví dụ: tải ảnh, css,...)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Nếu tìm thấy tài nguyên trong cache, trả về nó
        if (response) {
          return response;
        }
        // Nếu không, thực hiện yêu cầu mạng bình thường
        return fetch(event.request);
      }
    )
  );
});
