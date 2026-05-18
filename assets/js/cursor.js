// ─── ✨ Anime Cursor System ───
// Thay thế chuột mặc định bằng cursor anime có hiệu ứng
// Click animation: ripple burst
// Hover animation: glow + scale

const Cursor = (() => {
    let initialized = false;
    let cursorEl = null;
    let glowEl = null;
    let rippleContainer = null;
    let trailCanvas = null;
    let trailCtx = null;
    let trailParticles = [];
    const TRAIL_COLORS = ['#FF8AB8', '#A5D6A7', '#FFD54F', '#81D4FA', '#CE93D8', '#FFAB91'];

    // ─── DOM Setup ───
    function setupDOM() {
        if (initialized) return;
        initialized = true;

        // Cursor chính — hình trái tim/sparkle
        cursorEl = document.createElement('div');
        cursorEl.id = 'anime-cursor';
        cursorEl.innerHTML = '✨';
        cursorEl.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 99999;
            font-size: 20px;
            line-height: 1;
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
            will-change: transform, opacity;
            filter: drop-shadow(0 0 6px rgba(255, 138, 184, 0.4));
            transition: opacity 0.3s ease;
            user-select: none;
        `;
        document.body.appendChild(cursorEl);

        // Glow (vầng sáng theo chuột)
        glowEl = document.createElement('div');
        glowEl.id = 'anime-cursor-glow';
        glowEl.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 99998;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 138, 184, 0.15), transparent 70%);
            transform: translate(-50%, -50%);
            will-change: transform, opacity;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(glowEl);

        // Container cho ripple effect
        rippleContainer = document.createElement('div');
        rippleContainer.id = 'anime-ripple-container';
        rippleContainer.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 99997;
            overflow: hidden;
        `;
        document.body.appendChild(rippleContainer);

        // Tiny trail canvas (vệt sao siêu nhẹ nếu cursor trail chưa có)
        trailCanvas = document.createElement('canvas');
        trailCanvas.id = 'cursor-trail-mini';
        trailCanvas.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 99996;
        `;
        document.body.appendChild(trailCanvas);
        trailCtx = trailCanvas.getContext('2d');

        resizeTrailCanvas();
        window.addEventListener('resize', resizeTrailCanvas);
    }

    function resizeTrailCanvas() {
        if (!trailCanvas) return;
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
    }

    // ─── Mouse Tracking ───
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let isVisible = false;
    let isClicking = false;

    function onMouseMove(e) {
        targetX = e.clientX;
        targetY = e.clientY;

        if (!isVisible) {
            isVisible = true;
            gsap.to(cursorEl, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
            gsap.to(glowEl, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        }

        // Tiny trail particles
        if (trailCtx && Math.random() > 0.3) {
            trailParticles.push({
                x: e.clientX + (Math.random() - 0.5) * 6,
                y: e.clientY + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5 - 0.3,
                size: 1.5 + Math.random() * 2.5,
                color: TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)],
                life: 1,
                decay: 0.02 + Math.random() * 0.025
            });
            if (trailParticles.length > 25) trailParticles.splice(0, trailParticles.length - 25);
        }

        // Check hover state
        checkHover(e.target);
    }

    // ─── Hover Detection ───
    let currentState = 'default';
    const INTERACTIVE_SELECTORS = 'a, button, input, textarea, select, [onclick], .cursor-pointer, .hero-btn, .gallery-thumb, .sticker-item, .member-card, .wildcard-card, .status-reaction-btn, .emoji-option, .quiz-retry-btn, .quiz-option, #corner-fox, #mascot-helper, .sticky-note';

    function checkHover(target) {
        const interactive = target.closest(INTERACTIVE_SELECTORS);
        if (interactive) {
            setCursorState('pointer');
        } else if (target.closest('input[type="text"], input[type="email"], textarea')) {
            setCursorState('text');
        } else {
            setCursorState('default');
        }
    }

    // ─── Cursor States ───
    const STATES = {
        default: {
            icon: '✨',
            glowSize: 30,
            glowColor: 'rgba(255, 138, 184, 0.15)',
            cursorScale: 1,
            glowOpacity: 1
        },
        pointer: {
            icon: '🌟',
            glowSize: 45,
            glowColor: 'rgba(255, 182, 193, 0.25)',
            cursorScale: 1.25,
            glowOpacity: 1
        },
        text: {
            icon: '✏️',
            glowSize: 35,
            glowColor: 'rgba(165, 214, 167, 0.2)',
            cursorScale: 0.9,
            glowOpacity: 0.8
        },
        click: {
            icon: '💫',
            glowSize: 50,
            glowColor: 'rgba(255, 213, 79, 0.3)',
            cursorScale: 1.4,
            glowOpacity: 1
        }
    };

    let stateTimer = null;

    function setCursorState(state) {
        if (currentState === state) return;
        currentState = state;
        const s = STATES[state] || STATES.default;

        // Icon change with animation
        if (cursorEl.textContent !== s.icon) {
            gsap.to(cursorEl, {
                scale: 0.3,
                duration: 0.1,
                onComplete: () => {
                    cursorEl.textContent = s.icon;
                    gsap.to(cursorEl, { scale: s.cursorScale, duration: 0.2, ease: 'back.out(2)' });
                }
            });
        } else {
            gsap.to(cursorEl, { scale: s.cursorScale, duration: 0.2, ease: 'power2.out' });
        }

        // Glow
        gsap.to(glowEl, {
            width: s.glowSize,
            height: s.glowSize,
            opacity: s.glowOpacity,
            duration: 0.25,
            ease: 'power2.out'
        });
        glowEl.style.background = `radial-gradient(circle, ${s.glowColor}, transparent 70%)`;

        // Auto-reset to default after 300ms for 'click' state
        if (state === 'click') {
            clearTimeout(stateTimer);
            stateTimer = setTimeout(() => {
                currentState = 'default';
                setCursorState('default');
            }, 300);
        }
    }

    // ─── Click Ripple Effect ───
    function onClickRipple(e) {
        // Set cursor to click state
        setCursorState('click');

        const x = e.clientX;
        const y = e.clientY;

        // ── Ripple 1: Expanding ring ──
        const ring = document.createElement('div');
        ring.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            border: 2px solid rgba(255, 138, 184, 0.5);
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
            pointer-events: none;
        `;
        rippleContainer.appendChild(ring);

        gsap.to(ring, {
            scale: 8,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => ring.remove()
        });

        // ── Ripple 2: Sparkle burst ──
        const sparkleEmojis = ['✨', '⭐', '💫', '🌟', '🌸'];
        for (let i = 0; i < 5; i++) {
            const spark = document.createElement('div');
            spark.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
            spark.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                font-size: ${0.5 + Math.random() * 0.8}rem;
                pointer-events: none;
                transform: translate(-50%, -50%);
                will-change: transform, opacity;
            `;
            rippleContainer.appendChild(spark);

            const angle = Math.random() * Math.PI * 2;
            const dist = 15 + Math.random() * 30;
            gsap.to(spark, {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist - 10,
                opacity: 0,
                scale: 0.3,
                rotation: Math.random() * 360 - 180,
                duration: 0.4 + Math.random() * 0.3,
                ease: 'power2.out',
                onComplete: () => spark.remove()
            });
        }

        // ── Ripple 3: Tiny particle dots ──
        const dotColors = ['#FF8AB8', '#FFD54F', '#A5D6A7', '#81D4FA', '#CE93D8'];
        for (let i = 0; i < 8; i++) {
            const dot = document.createElement('div');
            const size = 2 + Math.random() * 3;
            dot.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: ${dotColors[Math.floor(Math.random() * dotColors.length)]};
                pointer-events: none;
                box-shadow: 0 0 4px ${dotColors[0]}88;
            `;
            rippleContainer.appendChild(dot);

            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 45;
            gsap.to(dot, {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                opacity: 0,
                scale: 0,
                duration: 0.5 + Math.random() * 0.4,
                ease: 'power2.out',
                onComplete: () => dot.remove()
            });
        }
    }

    // ─── Animation Loop (smooth follow) ───
    function animateLoop() {
        // Smooth follow
        mouseX += (targetX - mouseX) * 0.25;
        mouseY += (targetY - mouseY) * 0.25;

        if (cursorEl) {
            cursorEl.style.left = mouseX + 'px';
            cursorEl.style.top = mouseY + 'px';
        }
        if (glowEl) {
            glowEl.style.left = mouseX + 'px';
            glowEl.style.top = mouseY + 'px';
        }

        // Trail animation
        if (trailCtx) {
            trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
            for (let i = trailParticles.length - 1; i >= 0; i--) {
                const p = trailParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                if (p.life <= 0) {
                    trailParticles.splice(i, 1);
                    continue;
                }
                trailCtx.globalAlpha = p.life * 0.4;
                trailCtx.fillStyle = p.color;
                trailCtx.beginPath();
                trailCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                trailCtx.fill();
            }
            trailCtx.globalAlpha = 1;
        }

        requestAnimationFrame(animateLoop);
    }

    // ─── Init ───
    function init() {
        if (initialized) return;

        // Check if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // Skip custom cursor
        }

        // Check if touch device (mobile/tablet)
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            return; // Skip custom cursor on touch devices
        }

        setupDOM();
        document.documentElement.classList.add('cursor-active');

        // Mouse events
        document.addEventListener('mousemove', onMouseMove, { passive: true });

        // Click with debounce
        document.addEventListener('mousedown', (e) => {
            // Don't trigger on scrollbar or right-click
            if (e.button !== 0) return;
            onClickRipple(e);
        });

        // Mouse leave — hide cursor
        document.addEventListener('mouseleave', () => {
            if (cursorEl) gsap.to(cursorEl, { opacity: 0, duration: 0.2 });
            if (glowEl) gsap.to(glowEl, { opacity: 0, duration: 0.2 });
            isVisible = false;
        });

        document.addEventListener('mouseenter', () => {
            if (cursorEl) gsap.to(cursorEl, { opacity: 1, duration: 0.3 });
            if (glowEl) gsap.to(glowEl, { opacity: 1, duration: 0.3 });
            isVisible = true;
        });

        // Start animation loop
        mouseX = window.innerWidth / 2;
        mouseY = window.innerHeight / 2;
        targetX = mouseX;
        targetY = mouseY;
        animateLoop();

        // Clean up trail canvas periodically
        setInterval(() => {
            if (trailParticles.length > 50) {
                trailParticles.splice(0, trailParticles.length - 50);
            }
        }, 10000);
    }

    // ─── Destroy ───
    function destroy() {
        if (!initialized) return;
        initialized = false;
        document.removeEventListener('mousemove', onMouseMove);

        if (cursorEl) { cursorEl.remove(); cursorEl = null; }
        if (glowEl) { glowEl.remove(); glowEl = null; }
        if (rippleContainer) { rippleContainer.remove(); rippleContainer = null; }
        if (trailCanvas) { trailCanvas.remove(); trailCanvas = null; trailCtx = null; }
        trailParticles = [];
    }

    return { init, destroy };
})();

export default Cursor;
