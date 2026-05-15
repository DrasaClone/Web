// ─── Loading Screen Utility ───
// Deduplicated from main.js, auth.js, class.js

/**
 * Wait for a GSAP tween to complete with explicit Promise wrapper
 * (More reliable than relying on GSAP's .then() in all versions)
 */
function waitForTween(tween) {
    return new Promise((resolve) => {
        if (!tween) return resolve();
        // If tween already completed (edge case), resolve immediately
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

        // Fade out loading screen — use explicit Promise for reliability
        await new Promise((resolve) => {
            gsap.to(loadingScreen, {
                opacity: 0,
                scale: 1.05,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    // Ensure the page content is visible
                    const app = document.getElementById('app');
                    if (app) app.style.opacity = '1';
                    // Hide loading screen completely so it doesn't block interaction
                    loadingScreen.style.display = 'none';
                    resolve();
                }
            });
        });
    }
};
