import { initUI } from './ui.js';
import { initAnimations } from './animations.js';
import { AudioEngine } from './audio.js';
import { TransitionManager } from './transitions.js';

async function initMain() {
    // 1. Loading Screen Simulation
    const loadingBar = document.getElementById('loading-bar');
    await gsap.to(loadingBar, { scaleX: 1, duration: 1.5, ease: "power2.inOut" });
    await gsap.to('#loading-screen', { opacity: 0, duration: 0.5, pointerEvents: 'none' });

    // 2. Initialize UI
    initUI('hero-template');
    initAnimations();
    TransitionManager.init();

    // 3. Audio Control
    const audioBtn = document.getElementById('audio-toggle');
    const audioIcon = document.getElementById('audio-icon');
    const audioText = document.getElementById('audio-text');

    let isPlaying = false;
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            if (!isPlaying) {
                AudioEngine.playBackground();
                audioIcon.textContent = '🔊';
                audioText.textContent = 'Nhạc đang phát';
                isPlaying = true;
            } else {
                AudioEngine.audio.pause();
                audioIcon.textContent = '🔇';
                audioText.textContent = 'Bật âm thanh';
                isPlaying = false;
            }
        });
    }
}

initMain();
