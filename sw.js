// 注意：快取名稱已從 v2 變更為 v3，這是最終的強制更新
const CACHE_NAME = 'installment-tracker-v3'; 
const urlsToCache = [
    // PWA 核心檔案
    '/index.html', 
    '/manifest.json',
    '/sw.js',
    // 應用程式圖標 
    '/icon-192.png', 
    '/icon-512.png' 
];

// 安裝：快取所有應用程式核心文件
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing v3...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache files during install:', error);
            })
    );
});

// 啟用：清理舊的快取版本 (所有非 v3 的快取都會被刪除)
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 請求：從快取中返回資產，如果快取中沒有，則嘗試網路
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return; 

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
