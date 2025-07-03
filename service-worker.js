// service-worker.js

// Tăng phiên bản cache để buộc cập nhật
const CACHE_NAME = 'matran-cache-v1.7'; 
const START_URL = './index.html';

// Danh sách các file cốt lõi
const CORE_ASSETS = [
  './', 
  START_URL,
  './old.html',
  // Thêm các file tĩnh khác nếu có, ví dụ icon nếu bạn host riêng
  'https://www.gstatic.com/images/branding/product/1x/firebase_192dp.png', // Cache luôn icon
  'https://www.gstatic.com/images/branding/product/1x/firebase_512dp.png'
];


// --- 1. GIAI ĐOẠN CÀI ĐẶT ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching core assets on install');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});


// --- 2. GIAI ĐOẠN KÍCH HOẠT ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});


// --- 3. GIAI ĐOẠN FETCH (QUAN TRỌNG NHẤT) ---
// Sử dụng chiến lược "Stale-While-Revalidate"
self.addEventListener('fetch', event => {
  // Chỉ xử lý các yêu cầu GET
  if (event.request.method !== 'GET') return;
  
  // Bỏ qua các yêu cầu đến Firebase và các dịch vụ bên thứ 3 để tránh lỗi
  const requestUrl = new URL(event.request.url);
  if (requestUrl.hostname.includes('firebase') || requestUrl.hostname.includes('pubnub') || requestUrl.hostname.includes('googleapis') || requestUrl.hostname.includes('facebook')) {
    return; 
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request)
        .then(cachedResponse => {
          // Lấy yêu cầu mới từ mạng song song
          const fetchPromise = fetch(event.request).then(networkResponse => {
            // Nếu thành công, cập nhật cache
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });

          // Trả về bản cache ngay lập tức (nếu có), hoặc chờ fetch thành công
          return cachedResponse || fetchPromise;
        })
    })
  );
});

// Sự kiện click vào thông báo
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(START_URL));
});
