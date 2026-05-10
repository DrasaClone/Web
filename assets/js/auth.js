import { initAnimations } from './animations.js';
import { initUI } from './ui.js';
import { FirebaseService } from './firebase-service.js';
import { TransitionManager } from './transitions.js';

async function initAuth() {
    // 1. Loading Screen
    const loadingBar = document.getElementById('loading-bar');
    if (loadingBar) await gsap.to(loadingBar, { scaleX: 1, duration: 1, ease: "power2.inOut" });
    await gsap.to('#loading-screen', { opacity: 0, duration: 0.5, pointerEvents: 'none' });

    // 2. Render UI
    initUI('auth-template');
    initAnimations();
    TransitionManager.init();

    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            try {
                await FirebaseService.loginWithGoogle();
                TransitionManager.navigate('myclass.html');
            } catch (error) {
                console.error("Login failed:", error);
                alert("Đăng nhập thất bại, cậu thử lại nhé!");
            }
        });
    }

    FirebaseService.onAuthChange((user) => {
        if (user) {
            // Đã đăng nhập, có thể tự động chuyển hướng nếu muốn
        }
    });
}

initAuth();
