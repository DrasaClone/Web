// Khi nâng cấp sw thì nâng v1.2 lên các số khác để cập nhật
// service-worker.js

// service-worker.js

const CACHE_NAME = 'matran-cache-v1.5'; // Rất quan trọng: Đổi số phiên bản
const START_URL = './index.html';

// Danh sách các file cốt lõi cần để ứng dụng khởi động
const PRECACHE_ASSETS = [
  './', // Cache cả thư mục gốc
  START_URL,
  './old.html'
  // './css/style.css',  // Bỏ comment nếu có file riêng
  // './js/main.js'    // Bỏ comment nếu có file riêng
];

// --- GIAI ĐOẠN 1: CÀI ĐẶT (INSTALL) ---
// Tải trước các file cốt lõi vào cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching core assets.');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Kích hoạt ngay lập tức
  );
});


// --- GIAI ĐOẠN 2: KÍCH HOẠT (ACTIVATE) ---
// Dọn dẹp các cache cũ không cần thiết
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Giành quyền kiểm soát ngay lập tức
  );
});


// --- GIAI ĐOẠN 3: XỬ LÝ YÊU CẦU MẠNG (FETCH) ---
// Đây là phần quan trọng nhất để trình duyệt công nhận là có thể cài đặt
self.addEventListener('fetch', event => {
  // Bỏ qua các yêu cầu không phải GET (vd: POST lên Firebase)
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Chiến lược: Ưu tiên lấy từ mạng trước (Network First)
  // Phù hợp cho ứng dụng chat để luôn có dữ liệu mới
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Nếu lấy từ mạng thành công, lưu bản mới nhất vào cache
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          console.log('[Service Worker] Fetched and cached new data:', event.request.url);
          return networkResponse;
        });
      })
      .catch(() => {
        // Nếu lấy từ mạng thất bại (offline), thì tìm trong cache
        console.log('[Service Worker] Network failed, trying to get from cache:', event.request.url);
        return caches.match(event.request);
      })
  );
});

// Sự kiện để hiển thị thông báo cục bộ (đã có từ trước)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(START_URL));
});
