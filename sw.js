// 注意：快取名稱已從 v1 變更為 v2，以強制更新
const CACHE_NAME = 'installment-tracker-v2';
const urlsToCache = [
    // PWA 核心檔案
    '/index.html', 
    '/manifest.json',
    '/sw.js',
    // 應用程式圖標 (必須要快取，即使圖標是空的)
    '/icon-192.png', 
    '/icon-512.png' 
    // 註冊時建議快取所有靜態資源，例如 Tailwind CDN 
    // 但因為 Tailwind 是 CDN，所以不用列出，瀏覽器會自行處理。
];

// 安裝：快取所有應用程式核心文件
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing v2...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// 啟用：清理舊的快取版本 (所有非 v2 的快取都會被刪除)
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
// 由於 index.html 總是被快取，這就是問題的根源
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
