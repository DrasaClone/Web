import { AudioEngine } from './audio.js';

export const TransitionManager = {
    overlay: document.getElementById('page-overlay'),
    
    init() {
        // Setup all links for smooth transition
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto')) {
                    e.preventDefault();
                    this.navigate(href);
                }
            });
        });
    },

    navigate(url) {
        AudioEngine.playFlip();
        
        // Flag cho trang đích: bỏ qua loading screen
        try {
            sessionStorage.setItem('skip_loading', 'true');
            // Lưu scroll position để khôi phục nếu quay lại
            sessionStorage.setItem('scroll_y', String(window.scrollY));
        } catch {}

        gsap.to('#page-overlay', {
            opacity: 1,
            duration: 0.4,
            ease: "power2.inOut",
            onStart: () => {
                this.overlay.style.pointerEvents = 'auto';
            },
            onComplete: () => {
                window.location.href = url;
            }
        });
    }
};
