// ─── Loading Screen Utility ───
// Deduplicated from main.js, auth.js, class.js

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
            await gsap.to(loadingBar, {
                scaleX: 1,
                duration,
                ease: "power2.inOut"
            });
        }

        // Fade out loading screen
        return new Promise((resolve) => {
            gsap.to(loadingScreen, {
                opacity: 0,
                scale: 1.05,
                duration: 0.6,
                ease: "power2.inOut",
                pointerEvents: 'none',
                onComplete: resolve
            });
        });
    }
};
