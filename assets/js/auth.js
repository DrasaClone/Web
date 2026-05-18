import { initAnimations } from './animations.js';
import { initUI, initDarkMode } from './ui.js';
import { FirebaseService } from './firebase-service.js';
import { TransitionManager } from './transitions.js';
import { showToast } from './toast.js';
import { LoadingScreen } from './loading.js';
import { initStarryNight } from './starry-night.js';
import { initFireflies } from './fireflies.js';
import Cursor from './cursor.js';
import URLParams from './url-params.js';

const LOADING_MESSAGES = [
    'Đang mở cửa ký ức...',
    'Chuẩn bị trang lưu bút...',
    'Thắp nến trên bàn học...',
    'Viết lại những dòng thư...'
];

// ─── EmailJS Configuration ───
// Sign up free at https://www.emailjs.com/ (200 emails/month)
// Then create a service, an email template with {{code}} variable,
// and paste your keys below:
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'i8etT_DGuIhpy7jAw',
    SERVICE_ID: 'service_yrucm9e',
    TEMPLATE_ID: 'template_8hqfsrr'
};
// Template should have: subject "Mã xác nhận đăng nhập | Ký Ức Trong Veo"
// and body containing {{code}} somewhere.
// For testing without EmailJS, the code is shown in console.log.

// Initialize EmailJS once at load time
if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY) {
    try { emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY); } catch (e) { console.warn('EmailJS init failed:', e); }
}

let otpTimerInterval = null;
let otpCode = null;
let pendingEmail = null;

async function initAuth() {
    await LoadingScreen.show(LOADING_MESSAGES);

    initUI('auth-template');
    initDarkMode();
    initStarryNight();
    initFireflies();
    initAnimations();
    TransitionManager.init();

    // ═══════════════ GOOGLE POPUP ═══════════════
    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) {
        const btnLogo = loginBtn.querySelector('img');
        const origLogoHTML = btnLogo ? btnLogo.outerHTML : '<img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="24" />';

        const setupBtnStructure = () => {
            const textSpan = loginBtn.querySelector('#btn-text');
            if (!textSpan) {
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
            const textSpan = loginBtn.querySelector('#btn-text');
            const logoImg = loginBtn.querySelector('img');
            if (textSpan) textSpan.textContent = 'Đang kết nối...';
            const existingSpinner = loginBtn.querySelector('.loading-spinner');
            if (!existingSpinner) {
                const spinner = document.createElement('span');
                spinner.className = 'loading-spinner inline-block animate-spin';
                spinner.textContent = '⏳';
                if (logoImg) logoImg.after(spinner);
                else loginBtn.prepend(spinner);
            }
            try {
                const loginPromise = FirebaseService.loginWithGoogle();
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('auth/timeout')), 20000));
                // Silence both promises upfront to prevent "Uncaught (in promise)"
                // from the losing promise that rejects after the race is already settled
                loginPromise.catch(() => {});
                timeout.catch(() => {});

                await Promise.race([loginPromise, timeout]);
                TransitionManager.navigate('myclass.html');
            } catch (error) {
                console.error("Login failed:", error);
                if (error.code === 'auth/popup-blocked') showToast("Trình duyệt đã chặn popup! Thử dùng 'Đăng nhập qua chuyển hướng' 🔓");
                else if (error.code === 'auth/popup-closed-by-user') {}
                else if (error.code === 'auth/unauthorized-domain') showToast("Domain chưa được ủy quyền! 🔧");
                else if (error.code === 'auth/operation-not-allowed') showToast("Google Sign-In chưa được bật! 🔧");
                else if (error.message === 'auth/timeout') showToast("Kết nối Firebase quá lâu! 🌐");
                else showToast("Đăng nhập thất bại, thử lại nhé! 😅");
                loginBtn.disabled = false;
                loginBtn.innerHTML = `${origLogoHTML}<span id="btn-text" class="font-heading italic text-lg text-muted">Kết nối với Google</span>`;
            }
        });
    }

    // ═══════════════ GOOGLE REDIRECT (cho mobile) ═══════════════
    const redirectBtn = document.getElementById('google-redirect-btn');
    if (redirectBtn) {
        redirectBtn.addEventListener('click', () => {
            FirebaseService.loginWithGoogleRedirect();
        });
    }

    // ═══════════════ EMAIL METHOD TABS ═══════════════
    const emailTabs = document.querySelectorAll('.email-tab');
    let currentEmailMethod = 'magic-link'; // 'magic-link' or 'otp'

    emailTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            emailTabs.forEach(t => {
                t.classList.remove('active', 'bg-white/60', 'text-muted');
                t.classList.add('text-muted/40');
            });
            tab.classList.add('active', 'bg-white/60', 'text-muted');
            tab.classList.remove('text-muted/40');
            currentEmailMethod = tab.dataset.method;

            // Show/hide appropriate boxes
            const magicBox = document.getElementById('magic-link-box');
            const otpBox = document.getElementById('otp-box');
            const sendBtn = document.getElementById('send-email-btn');

            if (currentEmailMethod === 'magic-link') {
                if (magicBox) magicBox.classList.remove('hidden');
                if (otpBox) otpBox.classList.add('hidden');
                if (sendBtn) sendBtn.textContent = 'Gửi link ✉️';
            } else {
                if (magicBox) magicBox.classList.add('hidden');
                if (otpBox) otpBox.classList.remove('hidden');
                if (sendBtn) sendBtn.textContent = 'Gửi mã 🔢';
            }
        });
    });

    // ═══════════════ EMAIL INPUT + SEND BUTTON ═══════════════
    const emailInput = document.getElementById('email-input');
    const sendBtn = document.getElementById('send-email-btn');
    const confirmBox = document.getElementById('email-confirm-box');
    const sentEmailSpan = document.getElementById('sent-email');

    if (sendBtn && emailInput) {
        sendBtn.addEventListener('click', async () => {
            const email = emailInput.value.trim();
            if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                showToast('Hãy nhập email hợp lệ! 📧');
                return;
            }

            sendBtn.disabled = true;
            sendBtn.textContent = '⏳ Đang gửi...';

            if (currentEmailMethod === 'magic-link') {
                // ─── Send Magic Link via Firebase ───
                try {
                    localStorage.setItem('magicLinkEmail', email);
                    await FirebaseService.sendMagicLink(email);
                    if (sentEmailSpan) sentEmailSpan.textContent = email;
                    if (confirmBox) {
                        confirmBox.classList.remove('hidden');
                        gsap.from(confirmBox, { opacity: 0, y: 10, duration: 0.3 });
                    }
                    showToast('✉️ Link đã gửi! Kiểm tra email của bạn');
                } catch (err) {
                    console.error('Send magic link error:', err);
                    if (err.code === 'auth/invalid-email') showToast('Email không hợp lệ! 📧');
                    else if (err.code === 'auth/too-many-requests') showToast('Gửi quá nhiều lần, thử lại sau! ⏳');
                    else showToast('Không thể gửi link, thử lại! 😅');
                } finally {
                    sendBtn.disabled = false;
                    sendBtn.textContent = 'Gửi link ✉️';
                }

            } else {
                // ─── Send OTP Code ───
                try {
                    pendingEmail = email;

                    // Generate OTP code and store in Firebase
                    const code = await FirebaseService.generateOTP(email);
                    otpCode = code;

                    // Try to send via EmailJS
                    let emailSent = false;
                    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY) {
                        try {
                            await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
                                to_email: email,
                                code: code,
                                site_name: 'Ký Ức Trong Veo'
                            });
                            emailSent = true;
                        } catch (e) {
                            console.warn('EmailJS send failed:', e);
                        }
                    }

                    if (emailSent) {
                        showToast('🔢 Mã OTP đã gửi! Kiểm tra email của bạn');
                    } else {
                        // Fallback: show code in console for development/testing
                        console.log(`%c🔐 OTP Code for ${email}: ${code}`, 'font-size:18px; font-weight:bold; color:#FF8AB8;');
                        showToast(`🔢 Mã OTP: ${code} (đã log trong console)`);
                    }

                    // Start resend timer
                    startOTPTimer();

                    // Focus OTP input
                    const otpInput = document.getElementById('otp-input');
                    if (otpInput) {
                        otpInput.value = '';
                        otpInput.focus();
                    }

                    // Update status text
                    const statusText = document.getElementById('otp-status-text');
                    if (statusText) {
                        statusText.textContent = `📧 Mã 6 số đã gửi đến ${email}`;
                    }

                } catch (err) {
                    console.error('Send OTP error:', err);
                    showToast('Gửi mã thất bại, thử lại! 😅');
                } finally {
                    sendBtn.disabled = false;
                    if (currentEmailMethod === 'magic-link') {
                        sendBtn.textContent = 'Gửi link ✉️';
                    } else {
                        sendBtn.textContent = 'Gửi lại 🔢';
                    }
                }
            }
        });

        // Enter key
        emailInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendBtn.click();
        });
    }

    // ═══════════════ OTP: Verify Code ═══════════════
    const otpInput = document.getElementById('otp-input');
    const verifyBtn = document.getElementById('verify-otp-btn');

    if (verifyBtn && otpInput) {
        // Auto-submit when 6 digits entered
        otpInput.addEventListener('input', () => {
            otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, 6);
            if (otpInput.value.length === 6) {
                verifyBtn.click();
            }
        });

        otpInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') verifyBtn.click();
        });

        verifyBtn.addEventListener('click', async () => {
            const code = otpInput.value.trim();
            if (code.length !== 6) {
                showToast('Hãy nhập đủ 6 số! 🔢');
                return;
            }
            if (!pendingEmail) {
                showToast('Hãy gửi mã trước! 📧');
                return;
            }

            verifyBtn.disabled = true;
            verifyBtn.textContent = '⏳ Đang xác thực...';

            try {
                // 1. Verify OTP code against Firebase RTDB
                const emailKey = await FirebaseService.verifyOTP(pendingEmail, code);

                if (!emailKey) {
                    showToast('Mã không đúng hoặc đã hết hạn! Thử lại 🔢');
                    otpInput.value = '';
                    otpInput.focus();
                    verifyBtn.disabled = false;
                    verifyBtn.textContent = 'Xác nhận ✅';
                    return;
                }

                // 2. Code is valid — sign in anonymously + store verified email
                await FirebaseService.signInWithVerifiedEmail(pendingEmail, emailKey);

                showToast('✅ Đăng nhập thành công!');
                clearOTPTimer();
                TransitionManager.navigate('myclass.html');

            } catch (err) {
                console.error('OTP verify/signin error:', err);
                if (err.code === 'auth/too-many-requests') {
                    showToast('Thử lại quá nhiều lần, chờ một chút! ⏳');
                } else {
                    showToast('Xác thực thất bại! Thử lại 😅');
                }
                otpInput.value = '';
                otpInput.focus();
            } finally {
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Xác nhận ✅';
            }
        });
    }

    // ═══════════════ OTP: Resend Code ═══════════════
    const resendBtn = document.getElementById('resend-otp-btn');
    if (resendBtn) {
        resendBtn.addEventListener('click', () => {
            if (sendBtn && !sendBtn.disabled) {
                sendBtn.click();
            }
        });
    }

    // ═══════════════ CROSS-DEVICE REQUEST ═══════════════
    const crossDeviceBtn = document.getElementById('cross-device-btn');
    const crossDeviceWaiting = document.getElementById('cross-device-waiting');
    const crossDeviceEmail = document.getElementById('cross-device-email');
    const crossDeviceTimer = document.getElementById('cross-device-timer');
    const crossDeviceStatus = document.getElementById('cross-device-status');
    const cancelCrossDevice = document.getElementById('cancel-cross-device');
    
    let pendingRequestId = null;
    let crossDeviceTimerInterval = null;
    let crossDeviceUnsub = null;
    
    function showCrossDeviceWaiting(email) {
        if (crossDeviceWaiting) {
            crossDeviceWaiting.classList.remove('hidden');
            if (crossDeviceEmail) crossDeviceEmail.textContent = email;
            if (crossDeviceTimer) crossDeviceTimer.textContent = '60';
            if (crossDeviceStatus) crossDeviceStatus.classList.add('hidden');
            gsap.from(crossDeviceWaiting, { opacity: 0, y: 10, duration: 0.3 });
            
            // Start countdown
            let seconds = 60;
            clearInterval(crossDeviceTimerInterval);
            crossDeviceTimerInterval = setInterval(() => {
                seconds--;
                if (crossDeviceTimer) crossDeviceTimer.textContent = String(seconds);
                if (seconds <= 0) {
                    clearInterval(crossDeviceTimerInterval);
                    handleCrossDeviceTimeout();
                }
            }, 1000);
            
            // Start listening for approval/denial
            if (pendingRequestId) {
                crossDeviceUnsub = FirebaseService.onLoginRequestChange(pendingRequestId, (data) => {
                    if (!data) return;
                    if (data.status === 'approved') {
                        handleCrossDeviceApproved();
                    } else if (data.status === 'denied') {
                        handleCrossDeviceDenied();
                    } else if (data.status === 'expired') {
                        handleCrossDeviceTimeout();
                    }
                });
            }
        }
    }
    
    function handleCrossDeviceApproved() {
        clearInterval(crossDeviceTimerInterval);
        if (crossDeviceUnsub) { crossDeviceUnsub(); crossDeviceUnsub = null; }
        if (crossDeviceStatus) {
            crossDeviceStatus.classList.remove('hidden');
            crossDeviceStatus.innerHTML = '<p class="font-body text-sm text-[#A5D6A7] font-bold">✅ Đã xác nhận! Đang đăng nhập...</p>';
        }
        if (crossDeviceTimer) crossDeviceTimer.textContent = '0';
        showToast('✅ Đã xác nhận từ thiết bị khác!');
        
        // Sign in anonymously + store pending email as verified
        setTimeout(async () => {
            if (pendingEmail) {
                try {
                    const emailKey = btoa(pendingEmail.trim().toLowerCase()).replace(/[^a-zA-Z0-9]/g, '_');
                    await FirebaseService.signInWithVerifiedEmail(pendingEmail, emailKey);
                    TransitionManager.navigate('myclass.html');
                } catch (err) {
                    console.error('Cross-device sign-in error:', err);
                    showToast('Đăng nhập thất bại, thử lại! 😅');
                }
            }
        }, 500);
    }
    
    function handleCrossDeviceDenied() {
        clearInterval(crossDeviceTimerInterval);
        if (crossDeviceUnsub) { crossDeviceUnsub(); crossDeviceUnsub = null; }
        if (crossDeviceStatus) {
            crossDeviceStatus.classList.remove('hidden');
            crossDeviceStatus.innerHTML = '<p class="font-body text-sm text-[#FF5757] font-bold">❌ Yêu cầu đã bị từ chối từ thiết bị khác.</p>';
        }
        showToast('Yêu cầu bị từ chối! 😅');
        resetCrossDevice();
    }
    
    function handleCrossDeviceTimeout() {
        if (crossDeviceUnsub) { crossDeviceUnsub(); crossDeviceUnsub = null; }
        if (crossDeviceStatus) {
            crossDeviceStatus.classList.remove('hidden');
            crossDeviceStatus.innerHTML = '<p class="font-body text-sm text-muted/50 font-bold">⏰ Yêu cầu đã hết hạn. Hãy thử lại hoặc dùng cách khác.</p>';
        }
        resetCrossDevice();
    }
    
    function resetCrossDevice() {
        pendingRequestId = null;
        if (crossDeviceBtn) crossDeviceBtn.disabled = false;
    }
    
    if (crossDeviceBtn) {
        crossDeviceBtn.addEventListener('click', async () => {
            const email = emailInput?.value?.trim();
            if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                showToast('Hãy nhập email hợp lệ trước! 📧');
                return;
            }
            
            crossDeviceBtn.disabled = true;
            crossDeviceBtn.innerHTML = '<span class="inline-block animate-spin">⏳</span> Đang gửi yêu cầu...';
            
            try {
                pendingEmail = email;
                pendingRequestId = await FirebaseService.createLoginRequest(email);
                showCrossDeviceWaiting(email);
                crossDeviceBtn.innerHTML = '📱 Đã gửi — chờ xác nhận...';
            } catch (err) {
                console.error('Create login request error:', err);
                showToast('Gửi yêu cầu thất bại! 😅');
                crossDeviceBtn.disabled = false;
                crossDeviceBtn.innerHTML = '<span>📱</span><span>Gửi yêu cầu đến thiết bị khác</span>';
            }
        });
    }
    
    if (cancelCrossDevice) {
        cancelCrossDevice.addEventListener('click', () => {
            clearInterval(crossDeviceTimerInterval);
            if (crossDeviceUnsub) { crossDeviceUnsub(); crossDeviceUnsub = null; }
            if (crossDeviceWaiting) crossDeviceWaiting.classList.add('hidden');
            resetCrossDevice();
            crossDeviceBtn.innerHTML = '<span>📱</span><span>Gửi yêu cầu đến thiết bị khác</span>';
        });
    }

    // ═══════════════ MAGIC LINK HANDLER ═══════════════
    async function handleMagicLink() {
        if (FirebaseService.isMagicLink(window.location.href)) {
            const email = localStorage.getItem('magicLinkEmail');
            if (email) {
                try {
                    await FirebaseService.handleMagicLinkSignIn(email, window.location.href);
                    localStorage.removeItem('magicLinkEmail');
                    showToast('✉️ Đăng nhập bằng email thành công!');
                    TransitionManager.navigate('myclass.html');
                } catch (err) {
                    console.error('Magic link sign-in error:', err);
                    showToast('Link đăng nhập không hợp lệ hoặc đã hết hạn! 😅');
                }
            }
        }
    }

    // ═══════════════ GOOGLE REDIRECT RESULT HANDLER ═══════════════
    async function handleRedirectResult() {
        try {
            const result = await FirebaseService.handleRedirectResult();
            if (result?.user) {
                showToast('✅ Đăng nhập thành công!');
                TransitionManager.navigate('myclass.html');
            }
        } catch (err) {
            console.error('Redirect result error:', err);
        }
    }

    // Run handlers on page load
    handleRedirectResult();
    handleMagicLink();

    // If already logged in, redirect silently
    FirebaseService.onAuthChange((user) => {
        if (user) {
            TransitionManager.navigate('myclass.html');
        }
    });

    // ═══════════════ URL PARAMS: OTP Auto-fill + Magic Link ═══════════════
    if (URLParams.hasParams()) {
        const linkType = URLParams.detectLinkType();

        if (linkType === 'otp') {
            const email = URLParams.getEmail();
            const otp = URLParams.getOTP();
            const expired = URLParams.isLinkExpired();

            if (email && otp && !expired) {
                // Auto-fill email input
                if (emailInput) {
                    emailInput.value = email;
                    pendingEmail = email;
                    emailInput.classList.add('url-param-filled');
                }

                // Auto-fill OTP + verify after a short delay (để DOM kịp render)
                setTimeout(() => {
                    if (otpInput) {
                        otpInput.value = otp;
                        otpInput.classList.add('url-param-filled');
                        // Highlight effect
                        showToast('🔗 Đã phát hiện mã từ link! Đang xác thực...');
                        // Auto-trigger verify
                        setTimeout(() => verifyBtn?.click(), 300);
                    }
                    // Clean URL sau khi xử lý (xoá tham số khỏi address bar)
                    setTimeout(() => URLParams.cleanURL(), 5000);
                }, 800);
            } else if (expired) {
                showToast('⏰ Link đã hết hạn! Hãy gửi mã mới.');
                setTimeout(() => URLParams.cleanURL(), 3000);
            }
        } else if (linkType === 'magic-link') {
            // Magic link đã được xử lý bởi Firebase ở handleMagicLink() bên trên
            // Chỉ clean URL
            setTimeout(() => URLParams.cleanURL(), 2000);
        }
    }

    // ✨ Khởi tạo cursor anime
    if (!localStorage.getItem('cursor_disabled')) {
        Cursor.init();
    }
}

// ─── OTP Timer (60s countdown for resend) ───
function startOTPTimer() {
    clearOTPTimer();
    const timerEl = document.getElementById('otp-timer');
    const resendBtn = document.getElementById('resend-otp-btn');
    if (!timerEl || !resendBtn) return;

    let seconds = 60;
    resendBtn.disabled = true;
    resendBtn.style.opacity = '0.3';
    resendBtn.style.cursor = 'not-allowed';
    timerEl.textContent = `⏱️ Gửi lại sau ${seconds}s`;

    otpTimerInterval = setInterval(() => {
        seconds--;
        timerEl.textContent = `⏱️ Gửi lại sau ${seconds}s`;
        if (seconds <= 0) {
            clearOTPTimer();
            resendBtn.disabled = false;
            resendBtn.style.opacity = '1';
            resendBtn.style.cursor = 'pointer';
            timerEl.textContent = '✅ Có thể gửi lại mã!';
        }
    }, 1000);
}

function clearOTPTimer() {
    if (otpTimerInterval) {
        clearInterval(otpTimerInterval);
        otpTimerInterval = null;
    }
    const timerEl = document.getElementById('otp-timer');
    const resendBtn = document.getElementById('resend-otp-btn');
    if (timerEl) timerEl.textContent = '';
    if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.style.opacity = '1';
        resendBtn.style.cursor = 'pointer';
    }
}

initAuth();
