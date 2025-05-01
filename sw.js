const CACHE = 'app-cache-v1';
const FILES = [
  '/', '/index.html', '/chat.html', '/social.html', '/profile.html',
  '/groups.html', '/calls.html',
  '/style.css', '/config.js', '/utils.js', '/auth.js', '/theme.js',
  '/app.js','/chat.js','/social.js','/groups.js','/profile.js','/calls.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
