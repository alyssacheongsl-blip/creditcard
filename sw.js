// 核心步驟：將快取名稱升級到 V4，以強制瀏覽器認為這是一個全新的應用程式版本
const CACHE_NAME = 'installment-tracker-v4';

// 應用程式需要快取的靜態資源列表
// 這裡包含了所有 PWA 運行所必需的本地檔案
const urlsToCache = [
    // PWA 核心檔案
    './index.html', 
    './manifest.json',
    './sw.js',
    // 應用程式圖標 (請確保這些檔案存在於您的根目錄)
    './icon-192.png', 
    './icon-512.png' 
    // 注意：外部資源如 Tailwind CDN 不應在此處快取
];

// 安裝事件：當 Service Worker 首次安裝時，快取所有核心檔案
self.addEventListener('install', (event) => {
    console.log(`Service Worker: Installing ${CACHE_NAME}...`);
    // 立即跳過等待，以便在舊 Service Worker 仍然活躍時啟動
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // 嘗試將所有核心 URL 加入快取
                return cache.addAll(urlsToCache)
                    .then(() => {
                        console.log(`Service Worker: All core files for ${CACHE_NAME} successfully cached.`);
                    })
                    .catch((error) => {
                        // 如果有任何檔案載入失敗，我們仍然嘗試繼續
                        console.error('Service Worker: Failed to cache some files:', error);
                        // 即使失敗，我們也不會拒絕安裝，以確保 Service Worker 能夠啟動
                    });
            })
    );
});

// 啟用事件：清理所有舊的快取版本
self.addEventListener('activate', (event) => {
    console.log(`Service Worker: Activating ${CACHE_NAME} and cleaning old caches...`);
    
    // 立即要求客戶端控制 (強制更新頁面)
    event.waitUntil(self.clients.claim()); 

    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 如果快取名稱不在白名單 (即不是 v4)，則刪除
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 請求事件：用於離線模式 (Cache-First 策略)
self.addEventListener('fetch', (event) => {
    // 只有處理 GET 請求
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        // 1. 嘗試從快取中查找匹配的資源
        caches.match(event.request).then((response) => {
            // 2. 如果找到匹配的快取，則直接返回快取結果
            if (response) {
                return response;
            }
            
            // 3. 如果快取中沒有，則向網路發出請求
            return fetch(event.request).catch((error) => {
                // 4. 如果網路請求失敗 (例如離線或 DNS 錯誤)
                console.log('Fetch failed; returning offline placeholder:', error);
                // 這裡可以選擇返回一個離線頁面，但對於單頁應用程式 (SPA)，我們通常依靠快取的 index.html
                // 因此，我們直接返回快取中的 index.html 作為備用 (如果它是導航請求)
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                // 對於其他資源，例如圖片，我們返回一個錯誤響應
                throw error; 
            });
        })
    );
});
