import { initAnimations } from './animations.js';
import { initUI, initDarkMode } from './ui.js';
import { FirebaseService } from './firebase-service.js';
import { TransitionManager } from './transitions.js';
import { showToast } from './toast.js';
import { LoadingScreen } from './loading.js';

const LOADING_MESSAGES = [
    'Đang mở cửa ký ức...',
    'Chuẩn bị trang lưu bút...',
    'Thắp nến trên bàn học...',
    'Viết lại những dòng thư...'
];

async function initAuth() {
    await LoadingScreen.show(LOADING_MESSAGES);

    initUI('auth-template');
    initDarkMode();
    initAnimations();
    TransitionManager.init();

    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) {
        // Store the original logo HTML to preserve it during loading
        const btnLogo = loginBtn.querySelector('img');
        const origLogoHTML = btnLogo ? btnLogo.outerHTML : '<img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="24" />';

        // Wrap the button text in a dedicated span for independent manipulation
        const setupBtnStructure = () => {
            const textSpan = loginBtn.querySelector('#btn-text');
            if (!textSpan) {
                // First-time setup: wrap existing text in #btn-text
                const textNodes = Array.from(loginBtn.childNodes).filter(n => n.nodeType === 3 || (n.nodeType === 1 && !n.matches('img')));
                const textContent = textNodes.map(n => n.textContent || '').join('').trim() || 'Kết nối với Google';
                textNodes.forEach(n => n.remove());
                const span = document.createElement('span');
                span.id = 'btn-text';
                span.className = 'font-heading italic text-lg text-muted';
                span.textContent = textContent;
                loginBtn.appendChild(span);
            }
        };
        setupBtnStructure();

        loginBtn.addEventListener('click', async () => {
            loginBtn.disabled = true;
            // Only change the text, keep the logo visible
            const textSpan = loginBtn.querySelector('#btn-text');
            const logoImg = loginBtn.querySelector('img');

            // Preserve logo, replace text with loading state
            if (textSpan) {
                textSpan.textContent = 'Đang kết nối...';
            }
            // Ensure spinner is added without removing the logo
            const existingSpinner = loginBtn.querySelector('.loading-spinner');
            if (!existingSpinner) {
                const spinner = document.createElement('span');
                spinner.className = 'loading-spinner inline-block animate-spin';
                spinner.textContent = '⏳';
                if (logoImg) {
                    logoImg.after(spinner);
                } else {
                    loginBtn.prepend(spinner);
                }
            }

            try {
                await FirebaseService.loginWithGoogle();
                TransitionManager.navigate('myclass.html');
            } catch (error) {
                console.error("Login failed:", error);
                if (error.code !== 'auth/popup-closed-by-user') {
                    showToast("Đăng nhập thất bại, cậu thử lại nhé! 😅");
                }
                // Restore button — restore original HTML structure
                loginBtn.disabled = false;
                loginBtn.innerHTML = `${origLogoHTML}<span id="btn-text" class="font-heading italic text-lg text-muted">Kết nối với Google</span>`;
            }
        });
    }

    // If already logged in, redirect silently
    FirebaseService.onAuthChange((user) => {
        if (user) {
            TransitionManager.navigate('myclass.html');
        }
    });
}

initAuth();
