// ─── ✨ FIREFLIES CANVAS (Đom đóm — Auth Page) ───
export function initFireflies() {
    const canvas = document.getElementById('fireflies-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const isMobile = window.innerWidth < 768;
    const dpr = window.devicePixelRatio || 1;

    let w, h;

    function resize() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    let resizeRAF = null;
    window.addEventListener('resize', () => {
        if (resizeRAF === null) {
            resizeRAF = requestAnimationFrame(() => {
                resize();
                resizeRAF = null;
            });
        }
    });

    // ─── Create fireflies ───
    const count = isMobile ? 15 : 30;
    const fireflies = [];

    for (let i = 0; i < count; i++) {
        fireflies.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            // Wander steering: slowly drift toward a target point
            targetX: Math.random() * w,
            targetY: Math.random() * h,
            targetTimer: 100 + Math.random() * 200, // frames until new target
            targetCounter: Math.floor(Math.random() * 300),
            // Glow properties
            glowSize: 4 + Math.random() * 8,         // outer glow radius
            coreSize: 1 + Math.random() * 1.5,        // bright core radius
            blinkSpeed: 0.6 + Math.random() * 1.2,    // blink frequency
            blinkPhase: Math.random() * Math.PI * 2,  // blink phase offset
            // Color: warm yellow → golden → green-gold
            hue: 48 + Math.random() * 20,              // 48-68 (yellow to green-gold)
            sat: 75 + Math.random() * 18,              // 75-93
            light: 62 + Math.random() * 18,             // 62-80
            alpha: 0.4 + Math.random() * 0.4,          // base opacity
            // Subtle horizontal drift (breeze)
            breezePhase: Math.random() * Math.PI * 2,
            breezeAmp: 0.08 + Math.random() * 0.12,
        });
    }

    let time = 0;

    function draw() {
        time += 0.016; // ~60fps step

        // ─── Clear with very subtle trail ───
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < fireflies.length; i++) {
            const f = fireflies[i];

            // ── Wander toward target ──
            f.targetCounter++;
            if (f.targetCounter > f.targetTimer) {
                f.targetX = Math.random() * w;
                f.targetY = Math.random() * h;
                f.targetTimer = 100 + Math.random() * 200;
                f.targetCounter = 0;
            }

            // Steer toward target
            const dx = f.targetX - f.x;
            const dy = f.targetY - f.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 1) {
                const steerForce = 0.002;
                f.vx += (dx / dist) * steerForce;
                f.vy += (dy / dist) * steerForce;
            }

            // Damping (friction)
            f.vx *= 0.97;
            f.vy *= 0.97;

            // Subtle breeze oscillation
            const breeze = Math.sin(time * 0.5 + f.breezePhase) * f.breezeAmp;
            f.vx += breeze * 0.01;

            // Clamp speed
            const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
            const maxSpeed = 0.5;
            if (speed > maxSpeed) {
                f.vx = (f.vx / speed) * maxSpeed;
                f.vy = (f.vy / speed) * maxSpeed;
            }

            // Update position
            f.x += f.vx;
            f.y += f.vy;

            // Wrap around edges with padding (so they fade in/out naturally)
            const pad = 60;
            if (f.x < -pad) f.x = w + pad;
            if (f.x > w + pad) f.x = -pad;
            if (f.y < -pad) f.y = h + pad;
            if (f.y > h + pad) f.y = -pad;

            // ── Blink calculation ──
            const blink = Math.sin(time * f.blinkSpeed + f.blinkPhase) * 0.5 + 0.5;
            // Ease-in-out for more natural glow transition
            const glowIntensity = blink * blink * (3 - 2 * blink); // smoothstep
            const alpha = f.alpha * (0.08 + glowIntensity * 0.92);

            // ── Skip nearly invisible fireflies ──
            if (alpha < 0.01) continue;

            // ── Draw outer glow ──
            const glowR = f.glowSize * (0.6 + glowIntensity * 0.4);
            const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowR);
            const hue = f.hue;
            const sat = f.sat;
            const light = f.light;
            glow.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, ${alpha * 0.35})`);
            glow.addColorStop(0.3, `hsla(${hue + 5}, ${sat - 8}%, ${light + 5}%, ${alpha * 0.18})`);
            glow.addColorStop(0.6, `hsla(${hue + 10}, ${sat - 15}%, ${light + 8}%, ${alpha * 0.06})`);
            glow.addColorStop(1, `hsla(${hue + 15}, ${sat - 20}%, ${light + 10}%, 0)`);
            ctx.fillStyle = glow;
            ctx.fillRect(f.x - glowR, f.y - glowR, glowR * 2, glowR * 2);

            // ── Draw bright core ──
            const coreR = f.coreSize * (0.8 + glowIntensity * 0.2);
            ctx.beginPath();
            ctx.arc(f.x, f.y, coreR, 0, Math.PI * 2);
            const coreAlpha = alpha * (0.5 + glowIntensity * 0.5);
            ctx.fillStyle = `hsla(${hue - 3}, ${sat + 5}%, ${light + 10}%, ${coreAlpha})`;
            ctx.fill();

            // ── Tiny white-hot center (the actual "lightbulb") ──
            if (glowIntensity > 0.3) {
                const centerR = coreR * 0.3;
                const centerAlpha = (glowIntensity - 0.3) * 1.4 * alpha;
                ctx.beginPath();
                ctx.arc(f.x, f.y, centerR, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(50, 20%, 98%, ${centerAlpha})`;
                ctx.fill();
            }

            // ── Subtle lens flare / light ray (on bright ones) ──
            if (glowIntensity > 0.7 && f.glowSize > 6) {
                const flareAlpha = (glowIntensity - 0.7) * 0.3 * alpha;
                const flareLen = glowR * 1.6;
                ctx.globalAlpha = flareAlpha;
                ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light + 15}%, 1)`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(f.x - flareLen, f.y);
                ctx.lineTo(f.x + flareLen, f.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(f.x, f.y - flareLen);
                ctx.lineTo(f.x, f.y + flareLen);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }

        requestAnimationFrame(draw);
    }

    draw();
}
