// ─── Loading Screen Utility ───
// v2 — Bỏ loading screen khi điều hướng nội bộ, hỗ trợ bfcache (back button)

/**
 * Wait for a GSAP tween to complete with explicit Promise wrapper
 */
function waitForTween(tween) {
    return new Promise((resolve) => {
        if (!tween) return resolve();
        if (tween.progress() >= 1) return resolve();
        tween.eventCallback('onComplete', resolve);
    });
}

export const LoadingScreen = {
    /**
     * Run loading animation with cycle messages
     * @param {string[]} messages - Array of messages to cycle through
     * @param {number} duration - Total loading bar duration in seconds
     * @returns {Promise} Resolves when loading animation completes
     */
    async show(messages, duration = 2) {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) return;

        // ── Kiểm tra: có cần skip loading không?
        let shouldSkip = false;

        // 1. Nếu là bfcache restore (back button) → skip ngay
        if ('getEntriesByType' in performance) {
            const nav = performance.getEntriesByType('navigation')[0];
            if (nav && nav.type === 'back_forward') {
                shouldSkip = true;
            }
        }

        // 2. Nếu được flag từ TransitionManager → skip
        if (!shouldSkip) {
            try {
                if (sessionStorage.getItem('skip_loading') === 'true') {
                    shouldSkip = true;
                    sessionStorage.removeItem('skip_loading');
                }
            } catch {}
        }

        // 3. pageshow event listener cho bfcache (dự phòng)
        // Xử lý trong init() riêng bên dưới

        if (shouldSkip) {
            // Ẩn loading screen ngay lập tức, không animation
            loadingScreen.style.display = 'none';
            loadingScreen.style.opacity = '0';
            const app = document.getElementById('app');
            if (app) app.style.opacity = '1';
            
            // Vẫn phải init page-overlay để TransitionManager dùng sau
            const overlay = document.getElementById('page-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
            }

            // Khôi phục scroll position nếu có
            try {
                const savedScroll = sessionStorage.getItem('scroll_y');
                if (savedScroll) {
                    sessionStorage.removeItem('scroll_y');
                    requestAnimationFrame(() => {
                        window.scrollTo(0, parseInt(savedScroll, 10) || 0);
                    });
                }
            } catch {}

            return;
        }

        // ── Xoá flag skip nếu còn sót (khi vào trang trực tiếp) ──
        try { sessionStorage.removeItem('skip_loading'); } catch {}

        // ── Loading bình thường ──
        const loadingTitle = loadingScreen.querySelector('h1');
        const loadingBar = document.getElementById('loading-bar');

        // Cycle through messages
        if (loadingTitle && messages?.length) {
            messages.forEach((msg, i) => {
                setTimeout(() => {
                    gsap.to(loadingTitle, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            loadingTitle.textContent = msg;
                            gsap.to(loadingTitle, { opacity: 1, duration: 0.3 });
                        }
                    });
                }, i * 400);
            });
        }

        // Animate loading bar
        if (loadingBar) {
            const barTween = gsap.to(loadingBar, {
                scaleX: 1,
                duration,
                ease: "power2.inOut"
            });
            await waitForTween(barTween);
        }

        // Fade out loading screen
        await new Promise((resolve) => {
            gsap.to(loadingScreen, {
                opacity: 0,
                scale: 1.05,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    const app = document.getElementById('app');
                    if (app) app.style.opacity = '1';
                    loadingScreen.style.display = 'none';
                    resolve();
                }
            });
        });
    }
};

// ─── pageshow handler (bfcache restore) ───
// Chạy ngay khi script load để bắt sự kiện trước
(function initBfcacheHandler() {
    window.addEventListener('pageshow', (event) => {
        // Nếu page được restore từ bfcache (back/forward)
        if (event.persisted) {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
                loadingScreen.style.opacity = '0';
            }
            const app = document.getElementById('app');
            if (app) app.style.opacity = '1';
            const overlay = document.getElementById('page-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
            }
        }
    });
})();
