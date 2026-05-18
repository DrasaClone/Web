import { AudioEngine } from './audio.js';

export const TransitionManager = {
    overlay: document.getElementById('page-overlay'),
    
    init() {
        // Setup all links for smooth transition
        // (opacity is handled by initAnimations() + LoadingScreen)
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('http')) {
                    e.preventDefault();
                    this.navigate(href);
                }
            });
        });
    },

    navigate(url) {
        AudioEngine.playFlip(); // Hiệu ứng âm thanh lật trang
        gsap.to('#page-overlay', {
            opacity: 1,
            duration: 0.6,
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
