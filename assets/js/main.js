import { initUI, initDarkMode } from './ui.js';
import { initAnimations } from './animations.js';
import { AudioEngine } from './audio.js';
import { TransitionManager } from './transitions.js';
import { LoadingScreen } from './loading.js';

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

// ─── Ambient Particle Field ───
function initParticles() {
    const app = document.getElementById('app');
    if (!app) return;

    // Add subtle floating dots
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden';
    app.parentNode?.insertBefore(particleContainer, app);

    const count = Math.min(40, Math.floor(window.innerWidth / 30));
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        const size = 2 + Math.random() * 4;
        const isPink = Math.random() > 0.5;
        dot.style.cssText = `
            position:absolute;
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:${isPink ? 'rgba(255,138,184,0.15)' : 'rgba(165,214,167,0.12)'};
            left:${Math.random() * 100}%;
            top:${Math.random() * 100}%;
            opacity:${0.2 + Math.random() * 0.5};
        `;
        particleContainer.appendChild(dot);

        gsap.to(dot, {
            y: -20 - Math.random() * 40,
            x: (Math.random() - 0.5) * 20,
            opacity: 0,
            duration: 4 + Math.random() * 6,
            repeat: -1,
            delay: Math.random() * 6,
            ease: "sine.out"
        });
    }
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
        
        // Pulse animation
        gsap.fromTo(divider, 
            { scaleX: 1, backgroundColor: 'rgba(255,138,184,0.4)' },
            { scaleX: 1.5, backgroundColor: 'rgba(255,138,184,0.8)', duration: 0.3, ease: 'power2.out', 
              onComplete: () => gsap.to(divider, { scaleX: 1, backgroundColor: 'rgba(255,138,184,0.4)', duration: 0.3 }) 
            }
        );
        
        if (hoverCount >= 7) {
            hoverCount = 0;
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
    initParticles();
    
    // Initialize Easter Eggs
    initKonamiCode();
    initTitleClickEgg();
    initDividerEgg();
    initStickyNoteEgg();

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
