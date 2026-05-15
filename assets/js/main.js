import { initUI, initDarkMode } from './ui.js';
import { initAnimations } from './animations.js';
import { AudioEngine } from './audio.js';
import { TransitionManager } from './transitions.js';
import { LoadingScreen } from './loading.js';

const LOADING_MESSAGES = [
    'Đang mở lại ký ức...',
    'Ép hoa vào trang giấy...',
    'Thắp nến trên bàn học...',
    'Viết lại những dòng thư...'
];

async function initMain() {
    await LoadingScreen.show(LOADING_MESSAGES);

    initUI('hero-template');
    initDarkMode();
    initAnimations();
    TransitionManager.init();

    // Audio Control
    const audioBtn = document.getElementById('audio-toggle');
    const audioIcon = document.getElementById('audio-icon');
    const audioText = document.getElementById('audio-text');

    if (audioBtn) {
        let isPlaying = false;
        audioBtn.addEventListener('click', () => {
            if (!isPlaying) {
                AudioEngine.playBackground();
                audioIcon.textContent = '🔊';
                audioText.textContent = 'Nhạc đang phát';
                isPlaying = true;
            } else {
                AudioEngine.fadeOutBackground();
                audioIcon.textContent = '🔇';
                audioText.textContent = 'Bật âm thanh';
                isPlaying = false;
            }
        });
    }
}

initMain();
