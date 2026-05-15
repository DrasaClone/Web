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

    const count = Math.min(30, Math.floor(window.innerWidth / 40));
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        const size = 2 + Math.random() * 3;
        dot.style.cssText = `
            position:absolute;
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:rgba(255,138,184,0.15);
            left:${Math.random() * 100}%;
            top:${Math.random() * 100}%;
            opacity:${0.2 + Math.random() * 0.5};
        `;
        particleContainer.appendChild(dot);

        gsap.to(dot, {
            y: -20 - Math.random() * 30,
            opacity: 0,
            duration: 4 + Math.random() * 6,
            repeat: -1,
            delay: Math.random() * 5,
            ease: "power1.out"
        });
    }
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
