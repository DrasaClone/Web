import { initUI, initDarkMode } from './ui.js';
import { initAnimations } from './animations.js';
import { AudioEngine } from './audio.js';
import { TransitionManager } from './transitions.js';
import { LoadingScreen } from './loading.js';
import { initSakura } from './sakura.js';
import { initStarryNight } from './starry-night.js';
import { timeSinceYear, markEggFound, getEggProgress } from './utils.js';

const LOADING_MESSAGES = [
    'Đang mở lại ký ức...',
    'Ép hoa vào trang giấy...',
    'Thắp nến trên bàn học...',
    'Viết lại những dòng thư...',
    'Gom nhặt kỷ niệm...'
];

// ─── Hero Entrance Animations ───
function initHeroAnimations() {
    // Staggered entrance for hero elements
    const title = document.getElementById('hero-title');
    const subtitle = document.getElementById('hero-subtitle');
    const description = document.getElementById('hero-description');
    const divider = document.getElementById('hero-divider');
    const buttons = document.querySelectorAll('.hero-btn');
    const scrollIndicator = document.getElementById('scroll-indicator');
    const audioBtn = document.getElementById('audio-toggle');

    // Set initial states
    const elements = [subtitle, title, divider, description, ...buttons, audioBtn, scrollIndicator].filter(Boolean);
    gsap.set(elements, { opacity: 0, y: 30 });

    // Build staggered timeline
    const tl = gsap.timeline({ delay: 0.2 });
    
    tl.to(subtitle, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
      .to(title, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, '-=0.3')
      .to(divider, { 
          opacity: 1, 
          y: 0, 
          scaleX: 1, 
          duration: 0.6, 
          ease: "power2.out",
          transformOrigin: 'center center'
      }, '-=0.4')
      .to(description, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, '-=0.3')
      .to(buttons, { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          ease: "back.out(1.7)",
          stagger: 0.12
      }, '-=0.3')
      .to(audioBtn, { opacity: 0.4, y: 0, duration: 0.4, ease: "power2.out" }, '-=0.2')
      .to(scrollIndicator, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, '-=0.1');
}

// ─── Floating Orbs Animation ───
function initOrbsAnimation() {
    const orbs = document.querySelectorAll('.orb');
    if (!orbs.length) return;

    orbs.forEach((orb, i) => {
        const xDrift = (i % 2 === 0 ? 1 : -1) * (30 + Math.random() * 40);
        const yDrift = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 30);
        
        gsap.to(orb, {
            x: xDrift,
            y: yDrift,
            scale: 1.1 + Math.random() * 0.3,
            duration: 4 + Math.random() * 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.8
        });
    });
}

// ─── Hero Card Float ───
function initCardFloat() {
    const card = document.querySelector('.hero-card');
    if (!card) return;

    gsap.to(card, {
        y: -6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
}

// ─── ✨ Anime Sparkle Particles ───
function initAnimeSparkles() {
    const heroCard = document.querySelector('.hero-card');
    if (!heroCard) return;

    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'anime-sparkle-container';
    heroCard.style.position = 'relative';
    heroCard.appendChild(sparkleContainer);

    const emojis = ['✨', '💖', '⭐', '🌸', '🌟'];
    
    for (let i = 0; i < 12; i++) {
        const el = document.createElement('div');
        el.className = 'anime-sparkle';
        el.textContent = emojis[i % emojis.length];
        el.style.cssText = `
            position: absolute;
            font-size: ${0.4 + Math.random() * 0.6}rem;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: 0;
            pointer-events: none;
            filter: blur(0.5px);
        `;
        sparkleContainer.appendChild(el);

        const xDrift = (Math.random() - 0.5) * 30;
        const yDrift = (Math.random() - 0.5) * 30;

        gsap.to(el, {
            opacity: 0.4 + Math.random() * 0.4,
            x: xDrift,
            y: yDrift,
            scale: 1.2 + Math.random() * 0.5,
            duration: 2 + Math.random() * 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: Math.random() * 4
        });
    }
}

// ─── 🌈 Pastel Rainbow Floating Bar ───
function initRainbowAccent() {
    const divider = document.getElementById('hero-divider');
    if (!divider) return;

    // Create a pastel rainbow glow underneath the divider
    const glow = document.createElement('div');
    glow.className = 'rainbow-glow';
    glow.style.cssText = `
        width: 80px;
        height: 6px;
        margin: -4px auto 0;
        border-radius: 50%;
        filter: blur(8px);
        background: linear-gradient(90deg, #FF8AB8, #A5D6A7, #81D4FA, #CE93D8, #FFD54F, #FF8AB8);
        background-size: 200% 100%;
        opacity: 0;
        pointer-events: none;
    `;
    divider.parentNode?.insertBefore(glow, divider.nextSibling);

    // Fade in after divider entrance, then loop rainbow shift
    gsap.to(glow, { opacity: 0.3, duration: 0.6, delay: 0.8, ease: 'power2.out' });
    
    gsap.to(glow, {
        backgroundPosition: '200% 0',
        duration: 4,
        repeat: -1,
        ease: 'none',
        delay: 0.8
    });
}

// ─── 🥚 EASTER EGG 1: Konami Code ───
function initKonamiCode() {
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let index = 0;

    document.addEventListener('keydown', (e) => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        const expected = konami[index].length === 1 ? konami[index].toLowerCase() : konami[index];

        if (key === expected) {
            index++;
            if (index === konami.length) {
                index = 0;
                triggerKonamiEaster();
            }
        } else {
            index = 0;
        }
    });
}

function triggerKonamiEaster() {
    markEggFound('konami');
    // Toast notification
    const toast = document.getElementById('toast-container');
    if (toast) {
        const msg = document.createElement('div');
        msg.className = 'toast show';
        msg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(0);background:rgba(255,138,184,0.95);color:#fff;padding:16px 32px;border-radius:50px;font-size:1rem;font-weight:600;z-index:50000;box-shadow:0 10px 30px rgba(255,138,184,0.3);text-align:center';
        msg.textContent = '🎉 KONAMI CODE ACTIVATED! 🌸 Cơn mưa hoa anh đào! 🎉';
        toast.appendChild(msg);
        gsap.from(msg, { scale: 0, duration: 0.5, ease: 'back.out(2)' });
        setTimeout(() => {
            gsap.to(msg, { opacity: 0, y: -30, duration: 0.5, onComplete: () => msg.remove() });
        }, 3500);
    }

    // Sakura explosion — spawn many petals at once
    const sakuraContainer = document.getElementById('sakura-container');
    if (sakuraContainer) {
        const count = 60;
        for (let i = 0; i < count; i++) {
            const petal = document.createElement('div');
            petal.className = 'sakura-petal';
            const size = 8 + Math.random() * 16;
            const x = Math.random() * window.innerWidth;
            petal.style.cssText = `
                position:absolute;
                width:${size}px;
                height:${size}px;
                left:${x}px;
                top:-20px;
                background:${['#ffc0cb', '#ffb7c5', '#ffaabb', '#ff9eb5', '#ff8ab8'][Math.floor(Math.random() * 5)]};
                border-radius: 100% 0 100% 0;
                opacity: ${0.6 + Math.random() * 0.4};
                transform: rotate(${Math.random() * 360}deg);
            `;
            sakuraContainer.appendChild(petal);

            gsap.to(petal, {
                y: window.innerHeight + 50,
                x: (Math.random() - 0.5) * 200,
                rotation: Math.random() * 720,
                duration: 5 + Math.random() * 5,
                delay: Math.random() * 0.5,
                ease: 'power1.in',
                onComplete: () => petal.remove()
            });
        }
    }

    // Screen shake effect
    const app = document.getElementById('app');
    if (app) {
        gsap.to(app, {
            x: '+=5',
            duration: 0.05,
            repeat: 10,
            yoyo: true,
            ease: 'none',
            onComplete: () => gsap.set(app, { x: 0 })
        });
    }
}

// ─── 🥚 EASTER EGG 2: Title Click Counter ───
function initTitleClickEgg() {
    const title = document.getElementById('hero-title');
    if (!title) return;
    
    let clickCount = 0;
    const CLICKS_NEEDED = 5;
    const messages = [
        '🌷', '🌻', '🌺', '🌸', '✨'  // progressive reveals
    ];
    
    title.addEventListener('click', (e) => {
        clickCount++;
        
        // Progressive feedback on each click
        if (clickCount < CLICKS_NEEDED) {
            const emoji = messages[clickCount - 1] || '✨';
            
            // Spawn a floating emoji near the click position
            const float = document.createElement('div');
            float.textContent = emoji;
            float.style.cssText = `
                position:fixed;
                left:${e.clientX}px;
                top:${e.clientY}px;
                font-size:2rem;
                pointer-events:none;
                z-index:50000;
            `;
            document.body.appendChild(float);
            
            gsap.to(float, {
                y: -60,
                opacity: 0,
                scale: 1.5,
                duration: 1,
                ease: 'power2.out',
                onComplete: () => float.remove()
            });
        }
        
        if (clickCount >= CLICKS_NEEDED) {
            clickCount = 0;
            triggerConfetti();
        }
        
        // Reset after 3s of inactivity
        clearTimeout(title._clickTimer);
        title._clickTimer = setTimeout(() => { clickCount = 0; }, 3000);
    });
}

function triggerConfetti() {
    markEggFound('title-click');
    const colors = ['#FF8AB8', '#A5D6A7', '#FFD54F', '#81D4FA', '#CE93D8', '#FFAB91'];
    
    // Toast
    const toast = document.getElementById('toast-container');
    if (toast) {
        const msg = document.createElement('div');
        msg.className = 'toast show';
        msg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(0);background:rgba(62,39,35,0.95);color:#fff;padding:14px 28px;border-radius:50px;font-size:0.9rem;font-weight:500;z-index:50000;box-shadow:0 10px 30px rgba(0,0,0,0.2);text-align:center';
        msg.innerHTML = '🌸 <strong>Bạn đã khám phá ra điều bí mật!</strong> 🌸';
        toast.appendChild(msg);
        setTimeout(() => {
            gsap.to(msg, { opacity: 0, y: -30, duration: 0.5, onComplete: () => msg.remove() });
        }, 3000);
    }

    // Confetti burst
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:45000;overflow:hidden';
    document.body.appendChild(container);

    for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 6 + Math.random() * 8;
        const isCircle = Math.random() > 0.5;
        const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
        const startY = window.innerHeight / 2;
        
        piece.style.cssText = `
            position:absolute;
            left:${startX}px;
            top:${startY}px;
            width:${size}px;
            height:${isCircle ? size : size * 2}px;
            background:${color};
            border-radius:${isCircle ? '50%' : '2px'};
            opacity:1;
        `;
        container.appendChild(piece);
        
        gsap.to(piece, {
            x: (Math.random() - 0.5) * window.innerWidth * 1.2,
            y: window.innerHeight + 100,
            rotation: Math.random() * 720 - 360,
            opacity: 0,
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.3,
            ease: 'power2.out',
            onComplete: () => {
                piece.remove();
                if (container.children.length === 0) container.remove();
            }
        });
    }

}

// ─── 🥚 EASTER EGG 3: Divider Hover Magic ───
function initDividerEgg() {
    const divider = document.getElementById('hero-divider');
    if (!divider) return;
    
    let hoverCount = 0;
    const messages = ['✨', '🌸', '💫', '⭐', '🎋'];
    
    divider.addEventListener('mouseenter', () => {
        hoverCount++;
        const emoji = messages[(hoverCount - 1) % messages.length];
        
        // Spawn a little sparkling effect
        const sparkle = document.createElement('div');
        sparkle.textContent = emoji;
        sparkle.style.cssText = `
            position:absolute;
            top:-30px;
            left:50%;
            transform:translateX(-50%);
            font-size:1.5rem;
            pointer-events:none;
            z-index:100;
        `;
        divider.style.position = 'relative';
        divider.appendChild(sparkle);
        
        gsap.to(sparkle, {
            y: -30,
            opacity: 0,
            scale: 2,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => sparkle.remove()
        });
        
        // Pulse animation — animate opacity instead of backgroundColor (divider now uses gradient)
        gsap.fromTo(divider, 
            { scaleX: 1, opacity: 0.6 },
            { scaleX: 1.5, opacity: 1, duration: 0.3, ease: 'power2.out', 
              onComplete: () => gsap.to(divider, { scaleX: 1, opacity: 0.6, duration: 0.3 }) 
            }
        );
        
        if (hoverCount >= 7) {
            hoverCount = 0;
            markEggFound('divider-hover');
            // Secret message!
            const note = document.getElementById('sticky-note');
            if (note) {
                const originalText = note.querySelector('.sticky-note-text');
                if (originalText) {
                    originalText.textContent = '🌈 Bạn thật kiên nhẫn! Cảm ơn vì đã khám phá! 🌈';
                    gsap.fromTo(note, { scale: 1 }, { scale: 1.15, duration: 0.3, yoyo: true, repeat: 1 });
                    setTimeout(() => {
                        if (originalText) originalText.textContent = '💬 Click vào đây để xem điều thú vị!';
                    }, 4000);
                }
            }
        }
    });
}

// ─── 🥚 EASTER EGG 5: Cursor Sparkle Trail ───
function initCursorTrail() {
    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-trail-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99998;';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });
    
    const particles = [];
    const MAX_PARTICLES = 30;
    const COLORS = ['#FF8AB8', '#A5D6A7', '#FFD54F', '#81D4FA', '#CE93D8', '#FFAB91', '#fff'];
    
    document.addEventListener('mousemove', (e) => {
        if (particles.length > MAX_PARTICLES) return;
        
        for (let i = 0; i < 3; i++) {
            particles.push({
                x: e.clientX + (Math.random() - 0.5) * 4,
                y: e.clientY + (Math.random() - 0.5) * 4,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2 - 1,
                size: 2 + Math.random() * 4,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                life: 1,
                decay: 0.015 + Math.random() * 0.02
            });
        }
    });
    
    function animateTrail() {
        ctx.clearRect(0, 0, w, h);
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            ctx.globalAlpha = p.life * 0.6;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
        
        requestAnimationFrame(animateTrail);
    }
    animateTrail();
}

// ─── 🥚 EASTER EGG 6: Time-Based Greeting ───
function initTimeGreeting() {
    const hour = new Date().getHours();
    let greeting, emoji;
    
    if (hour < 6) {
        greeting = 'Khuya rồi, chưa ngủ sao?';
        emoji = '🌙';
    } else if (hour < 10) {
        greeting = 'Chào buổi sáng! Cà phê chưa?';
        emoji = '☀️';
    } else if (hour < 12) {
        greeting = 'Ngày mới tốt lành!';
        emoji = '🌸';
    } else if (hour < 14) {
        greeting = 'Giờ nghỉ trưa — nhớ ăn cơm nhé!';
        emoji = '🍱';
    } else if (hour < 17) {
        greeting = 'Xế chiều, nhớ uống nước!';
        emoji = '🍵';
    } else if (hour < 19) {
        greeting = 'Hoàng hôn buông, chiều đẹp ghê!';  
        emoji = '🌅';
    } else if (hour < 22) {
        greeting = 'Tối rồi — cùng nhau ôn lại kỷ niệm nhé!'; 
        emoji = '🌆';
    } else {
        greeting = 'Khuya khoắt rồi mai còn đi học không?'; 
        emoji = '🌌';
    }
    
    // Inject into header quietly
    const quote = document.getElementById('hero-quote');
    if (quote && !quote.dataset.timeGreeted) {
        quote.dataset.timeGreeted = 'true';
        // Add time greeting after a delay
        setTimeout(() => {
            const timeEl = document.createElement('p');
            timeEl.className = 'font-handwriting text-xs text-muted/30 mt-1';
            timeEl.textContent = `${emoji} ${greeting}`;
            quote.after(timeEl);
            gsap.from(timeEl, { opacity: 0, y: -5, duration: 0.5 });
        }, 4000);
    }
}

// ─── 🥚 EASTER EGG 7: Secret "HeLi" Command ───
let heliBuffer = '';
function initHeliCommand() {
    document.addEventListener('keydown', (e) => {
        heliBuffer += e.key;
        if (heliBuffer.length > 10) heliBuffer = heliBuffer.slice(-10);
        heliBuffer = heliBuffer.toLowerCase();
        
        if (heliBuffer.includes('heli')) {
            heliBuffer = '';
            triggerHeliMode();
        }
    });
}

function triggerHeliMode() {
    markEggFound('heli');
    // 🚁 Helicopter mode — rainbow flip everything!
    showToast('🚁 HELI MODE ACTIVATED! 🌈');
    
    const style = document.createElement('style');
    style.id = 'heli-mode-style';
    style.textContent = `
        @keyframes heliSpin {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(90deg) scale(1.1); }
            50% { transform: rotate(180deg) scale(1); }
            75% { transform: rotate(270deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
        }
        .heli-mode {
            animation: heliSpin 0.5s ease-in-out !important;
            filter: hue-rotate(90deg) !important;
        }
        .heli-mode-all {
            filter: hue-rotate(90deg) !important;
            transition: filter 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Apply rainbow hue rotation to everything
    document.querySelectorAll('.liquid-glass, .member-card, .wildcard-card, h1, h2, button').forEach(el => {
        el.classList.add('heli-mode');
    });
    
    // Add rainbow border
    document.querySelectorAll('.liquid-glass').forEach(el => {
        el.style.borderImage = 'linear-gradient(90deg, #FF8AB8, #FFD54F, #A5D6A7, #81D4FA, #CE93D8) 1';
    });
    
    // Auto-disable after 5 seconds
    setTimeout(() => {
        const styleEl = document.getElementById('heli-mode-style');
        if (styleEl) styleEl.remove();
        document.querySelectorAll('.heli-mode').forEach(el => el.classList.remove('heli-mode'));
        document.querySelectorAll('.liquid-glass').forEach(el => {
            el.style.borderImage = '';
        });
        showToast('🌈 HELI MODE đã kết thúc!');
    }, 5000);
}

// ─── 🥚 EASTER EGG 8: Mascot Floating Helper ───
let mascotVisible = false;
let mascotTimer = null;

function initMascotHelper() {
    // Create mascot after a while
    setTimeout(() => {
        if (mascotVisible) return;
        showMascot();
    }, 15000); // 15 seconds after page load
    
    // Also show after scrolling
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > window.innerHeight * 0.3 && !mascotVisible) {
            showMascot();
        }
        lastScrollY = currentScroll;
    }, { once: true });
}

function showMascot() {
    if (mascotVisible) return;
    mascotVisible = true;
    markEggFound('mascot');
    
    const mascot = document.createElement('div');
    mascot.id = 'mascot-helper';
    mascot.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 45000;
        cursor: pointer;
        user-select: none;
        pointer-events: auto;
    `;
    
    const tips = [
        '🌸 Click vào tiêu đề 5 lần để xem điều bí mật!',
        '✨ Gõ "heli" để xem phép màu!',
        '🎮 Thử Konami Code: ↑↑↓↓←→←→BA',
        '📱 Dùng "Gửi yêu cầu" để đăng nhập từ điện thoại!',
        '🔢 Chưa có tài khoản? Dùng mã OTP để vào!',
        '🎵 Mỗi người có một bài nhạc riêng — khám phá thử!',
        '🏆 Wildcard là "số áo" của bạn — chọn màu bạn thích!',
        '🧠 Trả lời quiz để xem ai hiểu bạn nhất!'
    ];
    
    const currentTip = tips[Math.floor(Math.random() * tips.length)];
    
    mascot.innerHTML = `
        <div class="relative">
            <div class="text-4xl animate-bounce">🦊</div>
            <div class="absolute bottom-full right-0 mb-2 w-56 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-[#FF8AB8]/20"
                 style="border-radius: 16px 4px 16px 16px;">
                <p class="font-body text-xs text-[#3E2723]/80 leading-relaxed">
                    ${currentTip}
                </p>
                <div class="absolute -bottom-1 right-3 w-3 h-3 bg-white/90 transform rotate-45"></div>
            </div>
            <button class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF5757]/20 text-[#FF5757] text-[10px] flex items-center justify-center hover:bg-[#FF5757]/40 transition-all">
                ✕
            </button>
        </div>
    `;
    
    document.body.appendChild(mascot);
    gsap.from(mascot, { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2)' });
    
    // Close button
    mascot.querySelector('button').onclick = (e) => {
        e.stopPropagation();
        dismissMascot();
    };
    
    // Click mascot to show another tip
    mascot.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const newTip = tips[Math.floor(Math.random() * tips.length)];
        const bubble = mascot.querySelector('.font-body');
        if (bubble) {
            gsap.to(bubble, {
                opacity: 0,
                y: -5,
                duration: 0.15,
                onComplete: () => {
                    bubble.textContent = newTip;
                    gsap.to(bubble, { opacity: 1, y: 0, duration: 0.3 });
                }
            });
        }
        // Reset auto-dismiss timer
        clearTimeout(mascotTimer);
        mascotTimer = setTimeout(dismissMascot, 30000);
    });
    
    // Auto-dismiss after 30s
    mascotTimer = setTimeout(dismissMascot, 30000);
}

function dismissMascot() {
    const mascot = document.getElementById('mascot-helper');
    if (mascot) {
        gsap.to(mascot, {
            scale: 0,
            opacity: 0,
            duration: 0.4,
            ease: 'back.in(2)',
            onComplete: () => {
                mascot.remove();
                mascotVisible = false;
            }
        });
    }
}

// ─── 🥚 EASTER EGG 9: 🦊 Corner Fox — 5-click Secret Menu ───
let _foxClickCount = 0;
let _foxClickTimer = null;
let _foxMenuOpen = false;

function initFoxCornerEgg() {
    // Create the fox icon fixed at bottom-right corner
    const fox = document.createElement('div');
    fox.id = 'corner-fox';
    fox.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 40000;
        font-size: 1.4rem;
        cursor: pointer;
        user-select: none;
        opacity: 0.25;
        transition: opacity 0.3s ease, transform 0.3s ease;
        line-height: 1;
        pointer-events: auto;
    `;
    fox.textContent = '🦊';
    fox.title = '🦊';
    document.body.appendChild(fox);

    // Show on hover
    fox.addEventListener('mouseenter', () => {
        gsap.to(fox, { opacity: 0.6, scale: 1.15, duration: 0.2, ease: 'power2.out' });
    });
    fox.addEventListener('mouseleave', () => {
        if (_foxMenuOpen) return;
        gsap.to(fox, { opacity: 0.25, scale: 1, duration: 0.3, ease: 'power2.out' });
    });

    // Click handler — 5 clicks to unlock
    fox.addEventListener('click', (e) => {
        e.stopPropagation();
        _foxClickCount++;

        // Visual feedback per click
        const progress = _foxClickCount / 5;
        const scale = 1 + progress * 0.3;
        gsap.to(fox, {
            scale: scale,
            opacity: 0.25 + progress * 0.75,
            duration: 0.2,
            ease: 'power2.out'
        });

        // Spawn sparkle on each click
        const sparkleEmojis = ['✨', '🌟', '💫', '⭐', '🔥'];
        for (let i = 0; i < 3; i++) {
            const s = document.createElement('div');
            s.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
            s.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 40001;
                font-size: ${0.8 + Math.random() * 0.6}rem;
                left: ${e.clientX + (Math.random() - 0.5) * 40}px;
                top: ${e.clientY + (Math.random() - 0.5) * 40}px;
            `;
            document.body.appendChild(s);
            gsap.to(s, {
                y: -40 - Math.random() * 30,
                x: (Math.random() - 0.5) * 30,
                opacity: 0,
                scale: 1.5,
                duration: 0.6 + Math.random() * 0.4,
                ease: 'power2.out',
                onComplete: () => s.remove()
            });
        }

        // Show counter toast on click 3+
        if (_foxClickCount === 3) {
            showToast('🦊 Còn ' + (5 - _foxClickCount) + ' lần nữa...');
        } else if (_foxClickCount === 4) {
            showToast('🦊 Một lần cuối! 👀');
        }

        // Unlock at 5 clicks!
        if (_foxClickCount >= 5) {
            _foxClickCount = 0;
            clearTimeout(_foxClickTimer);
            _foxClickTimer = null;
            openSecretMenu();
            return;
        }

        // Reset after 3s of inactivity
        clearTimeout(_foxClickTimer);
        _foxClickTimer = setTimeout(() => {
            _foxClickCount = 0;
            gsap.to(fox, { opacity: 0.25, scale: 1, duration: 0.5, ease: 'power2.out' });
        }, 3000);
    });

    // Fade in the fox after page load
    setTimeout(() => {
        gsap.to(fox, { opacity: 0.25, duration: 0.8, ease: 'power2.out' });
    }, 2000);
}

function openSecretMenu() {
    if (_foxMenuOpen) return;
    _foxMenuOpen = true;

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'secret-menu-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(30, 20, 15, 0.6);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 50000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
    `;
    document.body.appendChild(backdrop);

    // Menu panel
    const panel = document.createElement('div');
    panel.id = 'secret-menu-panel';
    panel.style.cssText = `
        background: rgba(255, 251, 240, 0.97);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 28px;
        padding: 40px 36px;
        max-width: 480px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 25px 60px rgba(0,0,0,0.25);
        border: 1px solid rgba(255, 138, 184, 0.2);
        transform: scale(0.85) translateY(20px);
        opacity: 0;
        position: relative;
    `;

    // Dark mode support
    const styles = document.createElement('style');
    styles.textContent = `
        html.dark #secret-menu-panel {
            background: rgba(40, 32, 28, 0.97);
            border-color: rgba(255, 138, 184, 0.15);
        }
        html.dark #secret-menu-panel .sm-text { color: rgba(248, 220, 220, 0.8); }
        html.dark #secret-menu-panel .sm-muted { color: rgba(248, 220, 220, 0.4); }
        html.dark #secret-menu-panel .sm-border { border-color: rgba(248, 220, 220, 0.08); }
        #secret-menu-panel .sm-text { color: rgba(62, 39, 35, 0.85); }
        #secret-menu-panel .sm-muted { color: rgba(62, 39, 35, 0.45); }
        #secret-menu-panel .sm-border { border-color: rgba(62, 39, 35, 0.08); }
    `;
    document.head.appendChild(styles);

    const EGG_DEFS = [
        { id: 'konami', emoji: '🎮', name: 'Konami Code', desc: '↑↑↓↓←→←→BA' },
        { id: 'title-click', emoji: '👆', name: 'Title Click 5 Lần', desc: 'Click tiêu đề 5 lần' },
        { id: 'divider-hover', emoji: '✨', name: 'Divider Hover', desc: 'Hover divider 7 lần' },
        { id: 'sticky-note', emoji: '💬', name: 'Sticky Note', desc: 'Click sticky note' },
        { id: 'cursor-trail', emoji: '🌟', name: 'Cursor Trail', desc: 'Chuột để lại vệt sao' },
        { id: 'time-greeting', emoji: '⏰', name: 'Time Greeting', desc: 'Lời chào theo giờ' },
        { id: 'heli', emoji: '🚁', name: 'Heli Mode', desc: 'Gõ "heli"' },
        { id: 'mascot', emoji: '🦊', name: 'Mascot Helper', desc: 'Xuất hiện sau 15s' },
        { id: 'vinyl', emoji: '💿', name: 'Vinyl Spin', desc: 'Double-click ảnh đại diện' },
        { id: 'wildcard-party', emoji: '🎉', name: 'Wildcard Party', desc: 'Click 3 wildcard nhanh' },
        { id: 'secret-hi', emoji: '👋', name: 'Secret Hi', desc: 'Gõ "hi"' },
        { id: 'polaroid-rain', emoji: '🌧️', name: 'Polaroid Rain', desc: 'Sao băng tháng 8-12' },
        { id: 'corner-fox', emoji: '🦊', name: 'Corner Fox', desc: 'Click 🦊 5 lần' },
        { id: 'fireworks', emoji: '🎆', name: 'Fireworks!', desc: 'Gõ "pháo" hoặc "fireworks"' },
        { id: 'double-click-hearts', emoji: '💖', name: 'Heart Burst', desc: 'Double-click bất kỳ đâu' },
        { id: 'cat-paws', emoji: '🐱', name: 'Mèo Con', desc: 'Gõ "mèo" hoặc "cat"' }
    ];
    const eggProgress = getEggProgress();
    const foundCount = eggProgress.length;

    panel.innerHTML = `
        <div class="text-center mb-6">
            <button id="sm-close" style="position:absolute;top:16px;right:20px;background:none;border:none;font-size:1.2rem;cursor:pointer;opacity:0.45;transition:opacity 0.2s" 
                    onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.45'">✕</button>
            <div style="font-size:3.5rem;line-height:1;margin-bottom:8px;filter:drop-shadow(0 4px 12px rgba(255,138,184,0.3))">🦊</div>
            <h2 style="font-family:'Fraunces',serif;font-size:1.8rem;font-weight:700;letter-spacing:-0.5px;" class="sm-text">Secret Menu</h2>
            <p style="font-size:0.75rem;" class="sm-muted">🧩 ${foundCount}/${EGG_DEFS.length} Easter eggs đã khám phá</p>
        </div>

        <!-- Stats row -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px;">
            <div style="text-align:center;padding:10px 8px;background:rgba(255,138,184,0.08);border-radius:16px;border:1px solid rgba(255,138,184,0.1)">
                <div style="font-size:0.7rem;" class="sm-muted">Đã tìm thấy</div>
                <div style="font-family:'Fraunces',serif;font-size:1.6rem;font-weight:700;color:#FF8AB8">${foundCount}</div>
            </div>
            <div style="text-align:center;padding:10px 8px;background:rgba(206,147,216,0.08);border-radius:16px;border:1px solid rgba(206,147,216,0.1)">
                <div style="font-size:0.7rem;" class="sm-muted">Còn ẩn</div>
                <div style="font-family:'Fraunces',serif;font-size:1.6rem;font-weight:700;color:#CE93D8">${EGG_DEFS.length - foundCount}</div>
            </div>
            <div style="text-align:center;padding:10px 8px;background:rgba(165,214,167,0.08);border-radius:16px;border:1px solid rgba(165,214,167,0.1)">
                <div style="font-size:0.7rem;" class="sm-muted">Tổng số</div>
                <div style="font-family:'Fraunces',serif;font-size:1.6rem;font-weight:700;color:#A5D6A7">${EGG_DEFS.length}</div>
            </div>
        </div>

        <!-- Easter egg list -->
        <div style="margin-bottom:16px;">
            <div style="font-size:0.7rem;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px;" class="sm-muted">🥚 Danh sách Easter Eggs</div>
            <div style="display:flex;flex-direction:column;gap:4px;">
                ${EGG_DEFS.map(egg => {
                    const found = eggProgress.includes(egg.id);
                    return `
                    <div style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:12px;background:${found ? 'rgba(165,214,167,0.08)' : 'transparent'};border:1px solid ${found ? 'rgba(165,214,167,0.15)' : 'rgba(62,39,35,0.05)'};transition:all 0.2s"
                         class="sm-border">
                        <span style="font-size:1.2rem;opacity:${found ? '1' : '0.4'}">${egg.emoji}</span>
                        <div style="flex:1;min-width:0">
                            <div style="font-size:0.8rem;font-weight:600;" class="sm-text">${egg.name}</div>
                            <div style="font-size:0.6rem;" class="sm-muted">${egg.desc}</div>
                        </div>
                        <span style="font-size:0.55rem;font-weight:700;padding:2px 8px;border-radius:50px;${found ? 'background:rgba(165,214,167,0.2);color:#6BAF8D' : 'background:rgba(206,147,216,0.15);color:#CE93D8'}">
                            ${found ? '✅' : '🔮'}
                        </span>
                    </div>`;
                }).join('')}
            </div>
        </div>

        <!-- Hidden shortcuts -->
        <div style="margin-bottom:8px;">
            <div style="font-size:0.7rem;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px;" class="sm-muted">🔗 Truy cập nhanh</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                <a href="easter.html" style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:14px;background:rgba(255,213,79,0.1);border:1px solid rgba(255,213,79,0.15);text-decoration:none;font-size:0.75rem;font-weight:500;color:inherit;transition:all 0.2s"
                   onmouseover="this.style.background='rgba(255,213,79,0.2)'" onmouseout="this.style.background='rgba(255,213,79,0.1)'">
                    🥚 Trang Easter Eggs
                </a>
                <a href="myclass.html" style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:14px;background:rgba(129,212,250,0.1);border:1px solid rgba(129,212,250,0.15);text-decoration:none;font-size:0.75rem;font-weight:500;color:inherit;transition:all 0.2s"
                   onmouseover="this.style.background='rgba(129,212,250,0.2)'" onmouseout="this.style.background='rgba(129,212,250,0.1)'">
                    🏫 Vào lớp mình
                </a>
                <button id="sm-toggle-trail" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;border-radius:14px;background:rgba(206,147,216,0.1);border:1px solid rgba(206,147,216,0.15);font-size:0.75rem;font-weight:500;cursor:pointer;transition:all 0.2s;color:inherit;width:100%"
                        onmouseover="this.style.background='rgba(206,147,216,0.2)'" onmouseout="this.style.background='rgba(206,147,216,0.1)'">
                    🌟 Tắt/Bật Cursor Trail
                </button>
                <button id="sm-reset-eggs" style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;border-radius:14px;background:rgba(255,87,87,0.08);border:1px solid rgba(255,87,87,0.15);font-size:0.75rem;font-weight:500;cursor:pointer;transition:all 0.2s;color:inherit;width:100%"
                        onmouseover="this.style.background='rgba(255,87,87,0.2)'" onmouseout="this.style.background='rgba(255,87,87,0.08)'">
                    🗑️ Reset tất cả progress
                </button>
            </div>
        </div>

        <div style="text-align:center;margin-top:12px;padding-top:12px;border-top:1px solid" class="sm-border">
            <p style="font-size:0.6rem;" class="sm-muted">🦊 "Càng khám phá, càng nhiều bất ngờ..."</p>
        </div>
    `;

    backdrop.appendChild(panel);

    // Animate in
    gsap.to(backdrop, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.to(panel, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
        delay: 0.05
    });

    // Close handler
    const closeMenu = () => {
        if (!_foxMenuOpen) return;
        _foxMenuOpen = false;
        gsap.to(panel, {
            opacity: 0,
            scale: 0.9,
            y: 20,
            duration: 0.25,
            ease: 'power2.in'
        });
        gsap.to(backdrop, {
            opacity: 0,
            duration: 0.3,
            delay: 0.1,
            ease: 'power2.in',
            onComplete: () => {
                backdrop.remove();
                styles.remove();
                // Reset fox opacity
                const fox = document.getElementById('corner-fox');
                if (fox) gsap.to(fox, { opacity: 0.25, scale: 1, duration: 0.5 });
            }
        });
    };

    panel.querySelector('#sm-close').onclick = closeMenu;
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeMenu();
    });

    // Toggle cursor trail
    const trailBtn = panel.querySelector('#sm-toggle-trail');
    trailBtn.onclick = () => {
        const canvas = document.getElementById('cursor-trail-canvas');
        if (canvas) {
            const hidden = canvas.style.display === 'none';
            canvas.style.display = hidden ? '' : 'none';
            trailBtn.innerHTML = hidden 
                ? '🌟 Tắt Cursor Trail'
                : '✨ Bật Cursor Trail';
            showToast(hidden ? '🌟 Cursor Trail đã bật!' : '🌙 Cursor Trail đã tắt');
        }
    };

    // Reset all egg progress
    const resetBtn = panel.querySelector('#sm-reset-eggs');
    resetBtn.onclick = () => {
        const confirmed = confirm(`Xóa tất cả progress Easter egg? Tất cả ${EGG_DEFS.length} egg sẽ reset về trạng thái chưa khám phá.`);
        if (!confirmed) return;
        
        try {
            localStorage.removeItem('kyuc_egg_progress');
        } catch {}
        showToast('\ud83d\uddd1\ufe0f \u0110\u00e3 reset t\u1ea5t c\u1ea3 egg progress!');
        closeMenu();
    };

    markEggFound('corner-fox');
    // Show fox toast
    showToast('🦊 Secret Menu đã mở! 🎉');
}

// ─── 🥚 EASTER EGG 12: 🌧️ Polaroid Rain (Sao băng tháng 8-12) ───
let _polaroidRainTriggered = false;

function initPolaroidRainEgg() {
    document.addEventListener('polaroid-rain', () => {
        if (!_polaroidRainTriggered) {
            _polaroidRainTriggered = true;
            markEggFound('polaroid-rain');
            showToast('🌧️ Polaroid Rain! Sao băng mang theo những tấm ảnh kỷ niệm...');
        }
        triggerPolaroidRain();
    });
}

function triggerPolaroidRain() {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:49996;overflow:hidden';
    document.body.appendChild(container);

    const count = 8 + Math.floor(Math.random() * 5);
    const photoColors = ['#FF8AB8', '#A5D6A7', '#FFD54F', '#81D4FA', '#CE93D8', '#FFAB91', '#B39DDB', '#90CAF9', '#EF9A9A', '#FFF59D'];

    for (let i = 0; i < count; i++) {
        const polaroid = document.createElement('div');
        const color = photoColors[Math.floor(Math.random() * photoColors.length)];
        const size = 40 + Math.random() * 30;
        const startX = Math.random() * window.innerWidth;

        polaroid.style.cssText = `
            position:absolute;
            left:${startX}px;
            top:-60px;
            width:${size}px;
            height:${size * 1.25}px;
            background:#fff;
            border-radius:3px;
            padding:4px 4px 18px 4px;
            box-shadow:0 2px 10px rgba(0,0,0,0.12);
            pointer-events:none;
            will-change:transform,opacity;
        `;

        // The "photo" part inside the polaroid
        const photo = document.createElement('div');
        photo.style.cssText = `
            width:100%;
            height:calc(100% - 14px);
            background:${color};
            border-radius:2px;
            opacity:0.8;
        `;
        polaroid.appendChild(photo);
        container.appendChild(polaroid);

        const targetY = window.innerHeight + 100;
        const wobble = Math.sin(i * 1.5) * 25;

        gsap.to(polaroid, {
            y: targetY,
            x: wobble,
            rotation: Math.random() * 15 - 7.5,
            opacity: 0.85,
            duration: 4 + Math.random() * 3,
            delay: i * 0.12,
            ease: 'power1.in',
            onComplete: () => {
                gsap.to(polaroid, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        polaroid.remove();
                        if (container.children.length === 0) container.remove();
                    }
                });
            }
        });
    }

    // Clean up after max time
    setTimeout(() => {
        if (container.parentNode) container.remove();
    }, 10000);
}

// ─── 🥚 EASTER EGG 14: 🎆 Fireworks Command ───
let fwBuffer = '';
function initFireworksCommand() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key.length !== 1 || !key.match(/[a-z0-9]/)) { fwBuffer = ''; return; }
        fwBuffer = (fwBuffer + key).slice(-10);
        if (fwBuffer.includes('pháo') || fwBuffer.includes('fireworks')) {
            fwBuffer = '';
            triggerFireworks();
        }
    });
}

function triggerFireworks() {
    markEggFound('fireworks');
    showToast('🎆 FIREWORKS! 🎆');

    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:49999;overflow:hidden';
    document.body.appendChild(container);

    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6BDF', '#FF9F43', '#A29BFE', '#FD79A8'];
    const burstCount = 6 + Math.floor(Math.random() * 4);
    let remaining = 0;

    for (let b = 0; b < burstCount; b++) {
        const cx = window.innerWidth * (0.15 + Math.random() * 0.7);
        const cy = window.innerHeight * (0.1 + Math.random() * 0.5);
        const partCount = 40 + Math.floor(Math.random() * 30);
        const mainColor = colors[Math.floor(Math.random() * colors.length)];
        remaining += partCount;

        setTimeout(() => {
            // Flash at burst point
            const flash = document.createElement('div');
            flash.style.cssText = `
                position:fixed;left:${cx - 4}px;top:${cy - 4}px;
                width:8px;height:8px;border-radius:50%;
                background:#fff;box-shadow:0 0 30px 10px ${mainColor};
                pointer-events:none;z-index:50000;
            `;
            container.appendChild(flash);
            gsap.to(flash, { scale: 8, opacity: 0, duration: 0.3, ease: 'power2.out', onComplete: () => flash.remove() });

            for (let i = 0; i < partCount; i++) {
                const p = document.createElement('div');
                const size = 3 + Math.random() * 5;
                const isCircle = Math.random() > 0.4;
                const color = Math.random() > 0.3 ? mainColor : colors[Math.floor(Math.random() * colors.length)];
                p.style.cssText = `
                    position:fixed;left:${cx}px;top:${cy}px;
                    width:${size}px;height:${isCircle ? size : size * 2.5}px;
                    background:${color};border-radius:${isCircle ? '50%' : '2px'};
                    box-shadow:0 0 4px ${color}66;
                    pointer-events:none;z-index:50001;
                `;
                container.appendChild(p);

                const angle = (Math.PI * 2 * i) / partCount + (Math.random() - 0.5) * 0.5;
                const dist = 60 + Math.random() * 140;
                const gravity = 80 + Math.random() * 60;

                gsap.to(p, {
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist + gravity,
                    opacity: 0,
                    scale: 0.3,
                    rotation: Math.random() * 720 - 360,
                    duration: 1 + Math.random() * 0.8,
                    delay: Math.random() * 0.08,
                    ease: 'power2.out',
                    onComplete: () => {
                        p.remove();
                        if (container.children.length === 0) container.remove();
                    }
                });
            }
        }, b * 350);
    }

    // Clean up after all bursts
    setTimeout(() => {
        if (container.parentNode) container.remove();
    }, 5000);
}

// ─── 🥚 EASTER EGG 15: 💖 Double-click Heart Burst ───
function initDoubleClickHearts() {
    document.addEventListener('dblclick', (e) => {
        // Don't trigger on interactive elements
        if (e.target.closest('a, button, input, textarea, [onclick], .wildcard-card, .member-card, .sticker-item, #corner-fox, #mascot-helper')) return;
        
        markEggFound('double-click-hearts');
        const heartEmojis = ['❤️', '💖', '💗', '💕', '💘', '💝', '🩷', '♥️'];
        const x = e.clientX;
        const y = e.clientY;

        // Burst of hearts
        for (let i = 0; i < 12; i++) {
            const heart = document.createElement('div');
            heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            heart.style.cssText = `
                position:fixed;left:${x}px;top:${y}px;
                font-size:${0.8 + Math.random() * 1.4}rem;
                pointer-events:none;z-index:49998;
                filter:drop-shadow(0 2px 4px rgba(255,0,100,0.15));
                will-change:transform,opacity;
            `;
            document.body.appendChild(heart);

            const angle = Math.random() * Math.PI * 2;
            const dist = 40 + Math.random() * 80;
            gsap.to(heart, {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist - 40 - Math.random() * 40,
                opacity: 0,
                scale: 1.5 + Math.random() * 0.5,
                rotation: Math.random() * 360 - 180,
                duration: 0.8 + Math.random() * 0.8,
                ease: 'power2.out',
                onComplete: () => heart.remove()
            });
        }

        // Sparkle particles
        const colors = ['#FF6B9D', '#FF8AB8', '#FFB3D9', '#FFD1DC', '#FF4081'];
        for (let i = 0; i < 8; i++) {
            const spark = document.createElement('div');
            const size = 3 + Math.random() * 4;
            spark.style.cssText = `
                position:fixed;left:${x + (Math.random() - 0.5) * 10}px;top:${y + (Math.random() - 0.5) * 10}px;
                width:${size}px;height:${size}px;
                border-radius:50%;
                background:${colors[Math.floor(Math.random() * colors.length)]};
                box-shadow:0 0 6px ${colors[Math.floor(Math.random() * colors.length)]};
                pointer-events:none;z-index:49999;
            `;
            document.body.appendChild(spark);

            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 50;
            gsap.to(spark, {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                opacity: 0,
                scale: 0,
                duration: 0.5 + Math.random() * 0.5,
                ease: 'power2.out',
                onComplete: () => spark.remove()
            });
        }
    });
}

// ─── 🥚 EASTER EGG 16: 🐾 Cat Paw Prints ───
let catBuffer = '';
function initCatPawsCommand() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key.length !== 1 || !key.match(/[a-z0-9]/)) { catBuffer = ''; return; }
        catBuffer = (catBuffer + key).slice(-5);
        if (catBuffer.includes('mèo') || catBuffer.includes('cat')) {
            catBuffer = '';
            triggerCatPaws();
        }
    });
}

function triggerCatPaws() {
    markEggFound('cat-paws');
    showToast('🐱 Mèo! Mèo! 🐱');

    const catEmojis = ['🐱', '😺', '😸', '🐾', '😻', '😽', '🙀'];

    // Reuse a single AudioContext for all meows in this burst
    let meowCtx = null;
    try {
        meowCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {}

    // Spawn cats scattered across the screen
    for (let i = 0; i < 20; i++) {
        const cat = document.createElement('div');
        cat.textContent = Math.random() > 0.5 ? '🐾' : catEmojis[Math.floor(Math.random() * catEmojis.length)];
        const fromSize = 0.8 + Math.random() * 1.6;
        cat.style.cssText = `
            position:fixed;
            left:${Math.random() * window.innerWidth}px;
            top:${Math.random() * window.innerHeight}px;
            font-size:${fromSize}rem;
            pointer-events:none;z-index:49997;
            opacity:0;
            filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1));
            will-change:transform,opacity;
        `;
        document.body.appendChild(cat);

        gsap.to(cat, {
            opacity: 0.9,
            scale: 1.2,
            duration: 0.4,
            ease: 'back.out(2)',
            delay: Math.random() * 0.4,
            onComplete: () => {
                // Meow sound effect using shared AudioContext
                if (meowCtx) {
                    try {
                        const osc = meowCtx.createOscillator();
                        const gain = meowCtx.createGain();
                        osc.connect(gain);
                        gain.connect(meowCtx.destination);
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(600 + Math.random() * 400, meowCtx.currentTime);
                        osc.frequency.exponentialRampToValueAtTime(1200, meowCtx.currentTime + 0.05);
                        osc.frequency.exponentialRampToValueAtTime(800, meowCtx.currentTime + 0.1);
                        gain.gain.setValueAtTime(0.08, meowCtx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, meowCtx.currentTime + 0.15);
                        osc.start(meowCtx.currentTime);
                        osc.stop(meowCtx.currentTime + 0.15);
                    } catch {}
                }

                // Fade out after a moment
                gsap.to(cat, {
                    opacity: 0,
                    y: -20,
                    scale: 0.5,
                    duration: 0.6,
                    delay: 2 + Math.random() * 2,
                    ease: 'power2.in',
                    onComplete: () => cat.remove()
                });
            }
        });
    }

    // Close AudioContext after all meows are done
    if (meowCtx) {
        setTimeout(() => {
            try { meowCtx.close(); } catch {}
        }, 1500);
    }

    // Random paw prints trailing across the bottom
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const paw = document.createElement('div');
            paw.textContent = '🐾';
            paw.style.cssText = `
                position:fixed;
                font-size:${1 + Math.random() * 1.2}rem;
                pointer-events:none;z-index:49996;
                opacity:0;
                filter:blur(${Math.random() * 1}px);
                will-change:transform,opacity;
            `;
            document.body.appendChild(paw);

            const startX = -30;
            const startY = window.innerHeight * 0.75 + Math.random() * window.innerHeight * 0.2;
            const endX = window.innerWidth + 30;
            const wobble = Math.sin(i * 1.2) * 40;

            gsap.set(paw, { left: startX, top: startY });
            gsap.to(paw, {
                left: endX,
                top: startY + wobble,
                opacity: 0.7,
                rotation: Math.random() * 40 - 20,
                duration: 2.5 + Math.random() * 1.5,
                ease: 'power1.inOut',
                onComplete: () => {
                    gsap.to(paw, { opacity: 0, duration: 0.5, onComplete: () => paw.remove() });
                }
            });
        }, i * 200);
    }
}

// ─── 🥚 EASTER EGG 4: Sticky Note Secrets ───
function initStickyNoteEgg() {
    const note = document.getElementById('sticky-note');
    if (!note) return;
    
    const quotes = [
        '🍃 "Thanh xuân như một cơn mưa rào..."',
        '📖 "Dù từng bị cảm lạnh vì mưa, vẫn muốn đắm mình trong cơn mưa ấy một lần nữa."',
        '🌸 "Ký ức là thứ duy nhất thời gian không thể xóa nhòa."',
        '💌 "Nơi này giữ hộ cậu những điều quý giá nhất."',
        '🎵 "Bài hát nào cũng có hồi kết, nhưng thanh xuân thì không."',
        '🌙 "Cảm ơn cậu vì đã ghé thăm ký ức của chúng mình."',
        '☕ "Một tách trà, một cuốn lưu bút, cả một bầu trời kỷ niệm."',
        '✨ "Những điều đẹp đẽ nhất thường đến từ những điều giản dị nhất."'
    ];
    
    let quoteIndex = 0;
    const textEl = note.querySelector('.sticky-note-text');
    
    note.addEventListener('click', () => {
        if (!textEl) return;
        
        // Cycle through quotes
        quoteIndex = (quoteIndex + 1) % quotes.length;
        
        gsap.to(textEl, {
            opacity: 0,
            y: -10,
            duration: 0.2,
            onComplete: () => {
                textEl.textContent = quotes[quoteIndex];
                gsap.to(textEl, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: 'back.out(2)'
                });
            }
        });
        
        markEggFound('sticky-note');
        // Play subtle sound
        try { 
            const snd = new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3');
            snd.volume = 0.15;
            snd.play().catch(() => {});
        } catch(e) {}
    });
}

async function initMain() {
    await LoadingScreen.show(LOADING_MESSAGES);

    initUI('hero-template');
    initDarkMode();
    initAnimations();
    TransitionManager.init();

    // Hero-specific animations (after template is in DOM)
    initHeroAnimations();
    initOrbsAnimation();
    initCardFloat();
    initSakura();
    initStarryNight();
    initAnimeSparkles();
    initRainbowAccent();
    
    // Auto-mark always-active eggs at load
    markEggFound('cursor-trail');
    markEggFound('time-greeting');

    // Initialize Easter Eggs
    initKonamiCode();
    initTitleClickEgg();
    initDividerEgg();
    initStickyNoteEgg();
    initCursorTrail();
    initTimeGreeting();
    initHeliCommand();
    initMascotHelper();
    initFoxCornerEgg();
    initFireworksCommand();
    initDoubleClickHearts();
    initCatPawsCommand();
    initPolaroidRainEgg();

    // ⏳ Graduation Year Counter
    function updateGradCounter() {
        const el = document.getElementById('grad-counter');
        if (!el) return;
        const info = timeSinceYear(2026);
        el.textContent = `${info.years} năm, ${info.months} tháng`;
    }
    updateGradCounter();
    setInterval(updateGradCounter, 60000); // Update every minute

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
