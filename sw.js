const CACHE_NAME = 'installment-tracker-v3'; // 版本號提高，強制重新安裝
const urlsToCache = [
    './', // 快取應用程式的根目錄 (重要修正)
    'index.html', 
    'manifest.json',
    'sw.js',
    'icon-192.png', 
    'icon-512.png', 
    // 快取外部資源，確保離線模式下樣式不會失效
    'https://cdn.tailwindcss.com' 
];

// 安裝：快取所有應用程式核心文件
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// 啟用：清理舊的快取版本
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 請求：從快取中返回資產，如果快取中沒有，則嘗試網路
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});