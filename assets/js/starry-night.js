// ─── 🌌 VAN GOGH STARRY NIGHT CANVAS (Shared Module) ───
export function initStarryNight() {
    const canvas = document.getElementById('starry-night');
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
        invalidateCachedGradients(); // invalidate + rebuild resize-dependent caches
    }
    resize();
    let resizeRafId = null;
    window.addEventListener('resize', () => {
        if (resizeRafId === null) {
            resizeRafId = requestAnimationFrame(() => {
                resize();
                resizeRafId = null;
            });
        }
    });

    // ─── Stars (fewer on mobile) ───
    const stars = [];
    const starCount = isMobile ? 80 : 180;
    for (let i = 0; i < starCount; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h;
        const sr = 0.5 + Math.random() * 2.5;
        stars.push({
            x: sx, y: sy, r: sr,
            alpha: 0.3 + Math.random() * 0.7,
            speed: 0.002 + Math.random() * 0.012,
            phase: Math.random() * Math.PI * 2,
            hueOffset: Math.random() * 360,
            // Pre-cached glow gradient (created once, reused every frame)
            glowGrad: sr > 1.5 ? ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 5) : null
        });
        if (stars[stars.length - 1].glowGrad) {
            stars[stars.length - 1].glowGrad.addColorStop(0, 'hsla(210, 70%, 65%, 1)');
            stars[stars.length - 1].glowGrad.addColorStop(1, 'hsla(225, 55%, 50%, 0)');
        }
    }

    // ─── 🌠 Shooting Stars ───
    let shootingStars = [];
    let shootTimer = 2 + Math.random() * 4;
    let horizonStars = [];
    let horizonStarTimer = 1 + Math.random() * 2;

    function spawnShootingStar() {
        const startX = Math.random() * w;
        const startY = Math.random() * h * 0.35;
        const angle = Math.PI * 0.2 + Math.random() * Math.PI * 0.2;
        const speed = 6 + Math.random() * 6;
        shootingStars.push({
            x: startX, y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            length: 40 + Math.random() * 40,
            width: 1.5 + Math.random() * 0.5,
        });

        // 🌧️ Polaroid Rain: during Aug-Dec, shooting stars may trigger polaroid effect
        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        if (month >= 8 && month <= 12 && Math.random() < 0.15) {
            setTimeout(() => document.dispatchEvent(new CustomEvent('polaroid-rain')), 0);
        }
    }

    // ─── 🌠 Meteor Shower ───
    let meteorTimer = 300; // seconds until next shower (5 min)
    let meteorPhase = 'idle'; // 'idle' | 'burst' | 'drizzle' | 'cooldown'
    let meteorBurstsLeft = 0;
    let meteorDrizzleLeft = 0;
    let meteorBurstTimer = 0;
    let meteorRadiantX = 0;
    let meteorRadiantY = 0;
    let meteorFlashAlpha = 0;

    function spawnMeteorStar(rx, ry) {
        const angle = Math.PI * 0.12 + Math.random() * Math.PI * 0.18;
        const speed = 10 + Math.random() * 10;
        const offsetX = (Math.random() - 0.5) * w * 0.18;
        const startX = rx + offsetX;
        const startY = ry + (Math.random() - 0.5) * h * 0.06;
        shootingStars.push({
            x: startX, y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.3,
            length: 70 + Math.random() * 70,
            width: 2.5 + Math.random() * 1.2,
        });

        // 🌧️ Each meteor can also trigger polaroid rain
        const now = new Date();
        const month = now.getMonth() + 1;
        if (month >= 8 && month <= 12 && Math.random() < 0.12) {
            setTimeout(() => document.dispatchEvent(new CustomEvent('polaroid-rain')), 0);
        }
    }

    // ─── Twinkling sparkles (dynamic positions) ───
    const sparkles = [];
    const sparkleCount = isMobile ? 8 : 20;
    for (let i = 0; i < sparkleCount; i++) {
        sparkles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: 1 + Math.random() * 3,
            alpha: 0,
            maxAlpha: 0.6 + Math.random() * 0.4,
            life: 0,
            maxLife: 100 + Math.random() * 200,
            speed: 0.5 + Math.random() * 1.5
        });
    }

    // ─── Moon Properties ───
    let moonX = w * 0.82;
    let moonY = h * 0.12;
    const moonR = Math.min(45, w * 0.04);

    // ─── Moonbeam parameters (golden rays from moon) ───
    const moonbeams = [
        { angle: 0.60 * Math.PI, length: 1.3, startW: 4, endW: 18, speed: 0.15, phaseOff: 0 },
        { angle: 0.68 * Math.PI, length: 1.1, startW: 3, endW: 14, speed: 0.12, phaseOff: 1.2 },
        { angle: 0.75 * Math.PI, length: 1.2, startW: 5, endW: 20, speed: 0.18, phaseOff: 0.6 },
        { angle: 0.82 * Math.PI, length: 1.0, startW: 3, endW: 12, speed: 0.13, phaseOff: 2.1 },
        { angle: 0.90 * Math.PI, length: 0.8, startW: 2, endW: 10, speed: 0.10, phaseOff: 3.0 },
    ];

    // ─── Village at the foot of the hill ───
    let village = null;

    // ─── Lavender field data ───
    let lavenderStalks = null;
    let lavenderGrass = null;
    let lavenderDew = null;
    let lavenderFlowers = null;
    let pinkFlowers = null;
    let creamFlowers = null;
    let lavenderLastW = 0;

    // ─── Fireflies ───
    let fireflies = null;

    // ─── Sakura trees + falling petals ───
    let sakuraTrees = null;
    let sakuraPetals = null;
    let birdsAtDawn = null;
    let birdsForeground = null;

    let time = 0;
    let frame = 0;

    // ─── 🏎️ Cached static gradients (performance: recreate on resize only) ───
    const cachedGradients = { sky: null, skyOverlay: null, moonGlow: null, moonBody: null, sunlightWash: null, sunHill: null, hillLayers: [], fogLayers: [], moonbeams: [] };
    function invalidateCachedGradients() {
        cachedGradients.sky = null;
        cachedGradients.moonGlow = null;
        cachedGradients.moonBody = null;
        cachedGradients.sunlightWash = null;
        cachedGradients.skyOverlay = null;
        cachedGradients.sunHill = null;
        //── Rebuild static resize-dependent gradients ──
        // Hill gradients (3 layers, static per resize)
        const hillLayers = isMobile ? 2 : 3;
        cachedGradients.hillLayers = [];
        for (let i = 0; i < hillLayers; i++) {
            const hillBaseY = h * (0.70 + i * 0.025);
            const grad = ctx.createLinearGradient(0, hillBaseY - 30, 0, hillBaseY + 40 + i * 15);
            const hillHue = 215 + i * 10;
            const hillLight = 14 - i * 3;
            const hillAlpha = 0.42 - i * 0.08;
            grad.addColorStop(0, `hsla(${hillHue + 10}, 25%, ${hillLight + 4}%, 0)`);
            grad.addColorStop(0.3, `hsla(${hillHue + 5}, 22%, ${hillLight + 2}%, ${hillAlpha * 0.7})`);
            grad.addColorStop(0.6, `hsla(${hillHue}, 20%, ${hillLight}%, ${hillAlpha})`);
            grad.addColorStop(1, `hsla(${hillHue - 5}, 18%, ${hillLight - 2}%, ${hillAlpha * 0.9})`);
            cachedGradients.hillLayers.push({ grad, baseAlpha: hillAlpha });
        }
        // Fog gradients (3 layers, static per resize)
        const fogLayers = isMobile ? 2 : 3;
        cachedGradients.fogLayers = [];
        for (let i = 0; i < fogLayers; i++) {
            const fogY = h * (0.82 + i * 0.06);
            const fogH = h * (0.1 + i * 0.04);
            const grad = ctx.createLinearGradient(0, fogY - 15, 0, fogY + fogH);
            const hue = 230 + i * 12;
            const light = 35 - i * 5;
            grad.addColorStop(0, `hsla(${hue}, 25%, ${light + 10}%, 0)`);
            grad.addColorStop(0.3, `hsla(${hue}, 20%, ${light + 5}%, 0.6)`);
            grad.addColorStop(0.6, `hsla(${hue + 10}, 18%, ${light}%, 1)`);
            grad.addColorStop(1, `hsla(${hue + 20}, 15%, ${light - 5}%, 1.2)`);
            cachedGradients.fogLayers.push({ grad, fogY });
        }
        // Moonbeam gradients (5 beams, geometry fixed per resize)
        const maxDist = Math.sqrt(w * w + h * h);
        cachedGradients.moonbeams = [];
        for (const b of moonbeams) {
            const dirX = Math.cos(b.angle);
            const dirY = Math.sin(b.angle);
            const perpX = -dirY;
            const perpY = dirX;
            const beamLen = maxDist * b.length;
            const farEndX = moonX + dirX * beamLen;
            const farEndY = moonY + dirY * beamLen;
            const grad = ctx.createLinearGradient(moonX, moonY, farEndX, farEndY);
            grad.addColorStop(0, 'hsla(46, 60%, 75%, 0.06)');
            grad.addColorStop(0.15, 'hsla(46, 55%, 70%, 0.045)');
            grad.addColorStop(0.35, 'hsla(350, 40%, 62%, 0.021)');
            grad.addColorStop(0.6, 'hsla(340, 35%, 55%, 0.0072)');
            grad.addColorStop(1, 'hsla(330, 30%, 48%, 0)');
            cachedGradients.moonbeams.push({
                grad,
                startW: b.startW,
                endW: b.endW,
                dirX, dirY, perpX, perpY, beamLen,
                speed: b.speed,
                phaseOff: b.phaseOff,
            });
        }
        village = null; // force village rebuild (gradients depend on house geometry)
        sakuraTrees = null; // force tree rebuild (edge glow depends on tree dimensions)
    }

    function draw() {
        time += 0.006;
        frame++;

        // === 1. GRADIENT SKY (Deep Starry Night palette) ===
        if (!cachedGradients.sky) {
            const gradient = ctx.createLinearGradient(0, 0, w * 0.3, h);
            gradient.addColorStop(0, '#070d24');
            gradient.addColorStop(0.25, '#0c1538');
            gradient.addColorStop(0.5, '#12204a');
            gradient.addColorStop(0.7, '#182a55');
            gradient.addColorStop(0.78, '#201e4a');   // blue → purple blend (mượt hơn)
            gradient.addColorStop(0.85, '#2a1e3a');   // subtle sakura pink-purple
            gradient.addColorStop(0.93, '#2a1828');   // warm pinkish horizon
            gradient.addColorStop(1, '#1a1018');       // deep warm base
            cachedGradients.sky = gradient;
        }
        ctx.fillStyle = cachedGradients.sky;
        ctx.fillRect(0, 0, w, h);

        // ── 🌙 Moon glow (cached — must init before aurora's lighter block which uses it) ──
        if (!cachedGradients.moonGlow) {
            const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 4);
            moonGlow.addColorStop(0, 'hsla(46, 80%, 75%, 0.18)');
            moonGlow.addColorStop(0.3, 'hsla(46, 70%, 70%, 0.08)');
            moonGlow.addColorStop(0.6, 'hsla(46, 60%, 65%, 0.03)');
            moonGlow.addColorStop(1, 'hsla(46, 50%, 60%, 0)');
            cachedGradients.moonGlow = moonGlow;
        }
        // === 🌅 SUNRISE CYCLE (Very slow — full cycle every ~52s) ===
        const sunPhase = Math.sin(time * 0.002); // -1 to 1, full cycle ~52s
        // Sun visible when sunPhase > -0.35 (covers ~65% of cycle)
        const sunProgress = Math.max(0, Math.min(1, (sunPhase + 0.35) / 0.65));
        const sunVisibility = Math.pow(sunProgress, 0.5); // ease-in rising
        const sunDim = 1 - sunVisibility * 0.95; // stars dim by up to 95%
        const sunX = w * 0.35; // opposite the moon (left-center horizon)
        const sunBaseY = h * 0.75; // below horizon (hidden behind hills)
        const sunPeakY = h * 0.28; // fully risen
        const sunY = sunBaseY - (sunBaseY - sunPeakY) * sunVisibility;
        const sunR = Math.min(38, w * 0.035);
        // ── ☀️ SKY OVERLAY (Deep night → light morning sky transition) ──
        if (!cachedGradients.skyOverlay) {
            const so = ctx.createLinearGradient(0, 0, w * 0.3, h);
            so.addColorStop(0, 'hsla(205, 70%, 65%, 1)');         // light clear blue at zenith
            so.addColorStop(0.25, 'hsla(200, 60%, 58%, 0.75)');   // soft blue upper sky
            so.addColorStop(0.5, 'hsla(195, 55%, 52%, 0.45)');    // mid blue
            so.addColorStop(0.7, 'hsla(35, 70%, 60%, 0.25)');     // warm peach mid-low
            so.addColorStop(0.85, 'hsla(28, 80%, 58%, 0.15)');    // golden near horizon
            so.addColorStop(1, 'hsla(25, 85%, 50%, 0.08)');       // deep orange at bottom
            cachedGradients.skyOverlay = so;
        }
        if (sunVisibility > 0.01) {
            const skyBlend = Math.pow(sunVisibility, 0.7) * 0.6;
            ctx.globalAlpha = skyBlend;
            ctx.fillStyle = cachedGradients.skyOverlay;
            ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = 1;
        }

        // === 2. 🌌 AURORA BOREALIS ===
        const auroraLayers = isMobile ? [
            { hue: 200, sat: 85, light: 60, height: 0.2, speed: 0.3, amp: 35, freq: 0.008, phase: 0 },
            { hue: 220, sat: 75, light: 55, height: 0.3, speed: 0.25, amp: 30, freq: 0.01, phase: 2.5 },
        ] : [
            { hue: 195, sat: 85, light: 60, height: 0.18, speed: 0.35, amp: 50, freq: 0.007, phase: 0 },
            { hue: 215, sat: 80, light: 55, height: 0.26, speed: 0.28, amp: 42, freq: 0.009, phase: 2.1 },
            { hue: 235, sat: 65, light: 50, height: 0.16, speed: 0.4, amp: 38, freq: 0.011, phase: 4.2 },
            { hue: 180, sat: 90, light: 50, height: 0.22, speed: 0.22, amp: 58, freq: 0.005, phase: 1.3 },
        ];

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = sunDim; // dim aurora as sun rises

        for (const layer of auroraLayers) {
            const baseY = h * layer.height;
            const bandHeight = h * 0.2;
            const segments = 150;
            const timeShift = time * layer.speed;
            const hueShift = Math.sin(time * 0.08 + layer.phase) * 15;
            const lightShift = Math.sin(time * 0.12 + layer.phase * 1.3) * 8;

            // Build ribbon path: top edge (wave) → bottom edge (wave offset)
            ctx.beginPath();

            // Top edge: complex wave
            for (let i = 0; i <= segments; i++) {
                const x = (i / segments) * w;
                const wave1 = Math.sin(x * layer.freq + timeShift + layer.phase) * layer.amp;
                const wave2 = Math.sin(x * layer.freq * 2.3 + timeShift * 0.5 + layer.phase * 1.7) * layer.amp * 0.28;
                const wave3 = Math.sin(x * layer.freq * 0.4 + timeShift * 1.3 + layer.phase * 0.5) * layer.amp * 0.15;
                const y = baseY + wave1 + wave2 + wave3;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            // Bottom edge: wider, slower wave offset
            for (let i = segments; i >= 0; i--) {
                const x = (i / segments) * w;
                const wave1 = Math.sin(x * layer.freq * 0.7 + timeShift * 0.8 + layer.phase + 1) * layer.amp * 0.55;
                const wave2 = Math.sin(x * layer.freq * 2 + timeShift * 0.4 + layer.phase * 1.3) * layer.amp * 0.15;
                const wave3 = Math.sin(x * layer.freq * 0.3 + timeShift * 1.1 + layer.phase * 0.7) * layer.amp * 0.1;
                const y = baseY + bandHeight + wave1 + wave2 + wave3;
                ctx.lineTo(x, y);
            }

            ctx.closePath();

            // Vertical gradient for the band (fading top and bottom)
            const grad = ctx.createLinearGradient(0, baseY - layer.amp * 1.5, 0, baseY + bandHeight + layer.amp * 1.5);
            const currHue = layer.hue + hueShift;
            const sat = layer.sat;
            const light = layer.light + lightShift;
            grad.addColorStop(0, `hsla(${currHue + 15}, ${sat}%, ${light + 12}%, 0)`);
            grad.addColorStop(0.12, `hsla(${currHue + 8}, ${sat}%, ${light + 6}%, ${isMobile ? 0.18 : 0.22})`);
            grad.addColorStop(0.35, `hsla(${currHue}, ${sat}%, ${light}%, ${isMobile ? 0.25 : 0.32})`);
            grad.addColorStop(0.55, `hsla(${currHue - 5}, ${sat - 8}%, ${light - 4}%, ${isMobile ? 0.18 : 0.22})`);
            grad.addColorStop(0.78, `hsla(${currHue - 12}, ${sat - 15}%, ${light - 8}%, ${isMobile ? 0.08 : 0.1})`);
            grad.addColorStop(1, `hsla(${currHue - 20}, ${sat - 20}%, ${light - 12}%, 0)`);

            ctx.fillStyle = grad;
            ctx.fill();
        }

        ctx.globalAlpha = 1.0; // reset for moon glow & moonbeams

        // ── 🌙 Moon glow (additive in lighter mode) ──
        ctx.fillStyle = cachedGradients.moonGlow;
        ctx.fillRect(moonX - moonR * 4, moonY - moonR * 4, moonR * 8, moonR * 8);

        // ── 🌙 MOONBEAMS (Golden rays streaming from the moon) — cached gradient + globalAlpha ──
        const beamPhase = Math.sin(time * 0.15) * 0.2 + 0.8; // slow pulse 0.6-1.0

        moonbeams.forEach((b, beamIdx) => {
            const cached = cachedGradients.moonbeams[beamIdx];
            const pulse = Math.sin(time * b.speed + b.phaseOff) * 0.15 + 0.85;
            const beamA = 0.06 * pulse * beamPhase;
            const dirX = Math.cos(b.angle);
            const dirY = Math.sin(b.angle);
            const perpX = -dirY;
            const perpY = dirX;
            const maxDist = Math.sqrt(w * w + h * h);
            const beamLen = maxDist * b.length;
            const tip1x = moonX + perpX * b.startW * 0.5;
            const tip1y = moonY + perpY * b.startW * 0.5;
            const tip2x = moonX - perpX * b.startW * 0.5;
            const tip2y = moonY - perpY * b.startW * 0.5;
            const farEndX = moonX + dirX * beamLen;
            const farEndY = moonY + dirY * beamLen;
            const farW = b.endW * (0.7 + Math.sin(time * 0.08 + b.phaseOff) * 0.3);
            const base1x = farEndX + perpX * farW * 0.5;
            const base1y = farEndY + perpY * farW * 0.5;
            const base2x = farEndX - perpX * farW * 0.5;
            const base2y = farEndY - perpY * farW * 0.5;
            ctx.globalAlpha = Math.min(1, beamA / 0.06);
            ctx.fillStyle = cached.grad;
            ctx.beginPath();
            ctx.moveTo(tip1x, tip1y);
            ctx.lineTo(base1x, base1y);
            ctx.lineTo(base2x, base2y);
            ctx.lineTo(tip2x, tip2y);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.restore();

        // === 5. 🌙 THE MOON (Rainbow cycle every 30s) ===
        const moonHue = 46 + Math.sin(time * 0.1) * 4; // golden yellow (42-50), Starry Night palette

        // Glow (cached — initialized before aurora's lighter block above, to avoid null on frame 1)

        // Body (cached)
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
        if (!cachedGradients.moonBody) {
            const moonGrad = ctx.createRadialGradient(moonX - moonR * 0.2, moonY - moonR * 0.2, 0, moonX, moonY, moonR);
            moonGrad.addColorStop(0, 'hsl(46, 85%, 92%)');
            moonGrad.addColorStop(0.5, 'hsl(49, 80%, 82%)');
            moonGrad.addColorStop(1, 'hsl(41, 70%, 60%)');
            cachedGradients.moonBody = moonGrad;
        }
        ctx.fillStyle = cachedGradients.moonBody;
        ctx.fill();

        // Craters (slightly darker hue)
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(moonX - moonR * 0.3, moonY - moonR * 0.25, moonR * 0.2, 0, Math.PI * 2);            ctx.fillStyle = `hsl(35, 50%, 45%)`; // warm brown crater shadow
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX + moonR * 0.25, moonY + moonR * 0.2, moonR * 0.13, 0, Math.PI * 2);            ctx.fillStyle = `hsl(35, 50%, 45%)`; // warm brown crater shadow
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX - moonR * 0.1, moonY + moonR * 0.3, moonR * 0.1, 0, Math.PI * 2);            ctx.fillStyle = `hsl(35, 50%, 45%)`; // warm brown crater shadow
        ctx.fill();
        ctx.globalAlpha = 1;

        // 🌈 Rainbow ring (subtle outer ring opposite to moon body)
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR * 1.15, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${moonHue + 10}, 80%, 75%, 0.12)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // (rendering moved inside the aurora's lighter block above)

        // === 6. 🌠 SHOOTING STARS & METEOR SHOWER ===

        // ─── Meteor Shower Timer ───
        meteorTimer -= 0.016;
        if (meteorPhase === 'idle' && meteorTimer <= 0) {
            // 🌟 Start the meteor shower!
            meteorPhase = 'burst';
            meteorBurstsLeft = isMobile ? 20 : 35;
            meteorBurstTimer = 0.1;
            meteorRadiantX = w * (0.35 + Math.random() * 0.3);
            meteorRadiantY = h * (0.03 + Math.random() * 0.12);
            meteorFlashAlpha = 0.5;
            meteorTimer = 300; // reset for next cycle (5 min)
        }

        // ─── Meteor Shower Burst Phase (rapid firing) ───
        if (meteorPhase === 'burst') {
            const concurrentMax = isMobile ? 8 : 14;
            meteorBurstTimer -= 0.016;
            if (meteorBurstsLeft > 0 && meteorBurstTimer <= 0 && shootingStars.length < concurrentMax) {
                const batchSize = isMobile ? 1 : 2 + Math.floor(Math.random() * 2);
                const spawnCount = Math.min(batchSize, meteorBurstsLeft);
                for (let i = 0; i < spawnCount; i++) {
                    spawnMeteorStar(meteorRadiantX, meteorRadiantY);
                    meteorBurstsLeft--;
                }
                meteorBurstTimer = 0.1 + Math.random() * 0.18;
            }
            if (meteorBurstsLeft <= 0) {
                // Move to drizzle phase
                meteorPhase = 'drizzle';
                meteorDrizzleLeft = isMobile ? 8 : 15;
                meteorBurstTimer = 0.6;
            }
        }

        // ─── Meteor Shower Drizzle Phase (sporadic after-burst) ───
        if (meteorPhase === 'drizzle') {
            meteorBurstTimer -= 0.016;
            if (meteorDrizzleLeft > 0 && meteorBurstTimer <= 0 && shootingStars.length < 6) {
                spawnMeteorStar(meteorRadiantX, meteorRadiantY);
                meteorDrizzleLeft--;
                meteorBurstTimer = 0.5 + Math.random() * 0.8;
            }
            if (meteorDrizzleLeft <= 0) {
                meteorPhase = 'cooldown';
            }
        }

        // ─── Meteor Shower Cooldown (brief pause before normals resume) ───
        if (meteorPhase === 'cooldown') {
            // Wait until all remaining stars fade, then transition back
            if (shootingStars.length === 0) {
                meteorPhase = 'idle';
            }
        }

        // ─── Brief flash at meteor shower start ───
        if (meteorFlashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 248, 220, ${Math.max(0, meteorFlashAlpha)})`; // warm white flash
            ctx.fillRect(0, 0, w, h);
            meteorFlashAlpha -= 0.006;
        }

        // ─── Normal shooting stars (only when no meteor shower) ───
        if (meteorPhase === 'idle') {
            shootTimer -= 0.016;
            if (shootTimer <= 0 && shootingStars.length < 2) {
                spawnShootingStar();
                shootTimer = 4 + Math.random() * 8;
            }
        }

        // ─── Update & render all shooting stars ───
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const s = shootingStars[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.018;

            if (s.life <= 0 || s.x < -100 || s.x > w + 100 || s.y > h + 100) {
                shootingStars.splice(i, 1);
                continue;
            }

            const alpha = s.life * 0.85;
            ctx.save();
            ctx.globalAlpha = Math.max(0, alpha);

            // Trail gradient (golden → blue-teal → transparent, Starry Night palette)
            const grad = ctx.createLinearGradient(
                s.x, s.y,
                s.x - s.vx * s.length * 0.5, s.y - s.vy * s.length * 0.5
            );
            grad.addColorStop(0, `hsla(46, 90%, 98%, ${alpha})`);          // white-gold head
            grad.addColorStop(0.3, `hsla(46, 80%, 80%, ${alpha * 0.55})`);  // golden mid
            grad.addColorStop(0.6, `hsla(210, 60%, 70%, ${alpha * 0.25})`); // blue-teal tail
            grad.addColorStop(1, `hsla(210, 50%, 55%, 0)`);                 // transparent

            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(
                s.x - s.vx * s.length * 0.35,
                s.y - s.vy * s.length * 0.35
            );
            ctx.strokeStyle = grad;
            ctx.lineWidth = s.width;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Bright head glow (white-gold → blue-teal, Starry Night palette)
            const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 14);
            headGlow.addColorStop(0, `hsla(46, 90%, 98%, ${alpha * 0.6})`);     // white-gold
            headGlow.addColorStop(0.3, `hsla(46, 80%, 85%, ${alpha * 0.2})`);
            headGlow.addColorStop(1, `hsla(210, 60%, 70%, 0)`);                  // blue-teal fade
            ctx.beginPath();
            ctx.arc(s.x, s.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = headGlow;
            ctx.fill();

            // Bright head core
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();

            ctx.restore();
        }

        // ─── 🌠 HORIZON SHOOTING STARS (small, near lavender field) ───
        horizonStarTimer -= 0.016;
        if (horizonStarTimer <= 0 && meteorPhase === 'idle' && shootingStars.length < 2) {
            const startX = w * (0.08 + Math.random() * 0.72);
            const startY = h * (0.45 + Math.random() * 0.20);
            const angle = Math.PI * 0.35 + Math.random() * Math.PI * 0.2; // downward-right toward field
            const speed = 4 + Math.random() * 4;
            horizonStars.push({
                x: startX, y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                length: 15 + Math.random() * 20,
                width: 0.8 + Math.random() * 0.4,
                hue: 335 + Math.random() * 25, // pink-gold to match sakura-moonlight
            });
            horizonStarTimer = 2 + Math.random() * 4;
        }

        // Update & render horizon stars
        for (let i = horizonStars.length - 1; i >= 0; i--) {
            const s = horizonStars[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.022;

            if (s.life <= 0 || s.x < -50 || s.x > w + 50 || s.y > h + 50) {
                horizonStars.splice(i, 1);
                continue;
            }

            const alpha = s.life * 0.8;
            ctx.save();
            ctx.globalAlpha = Math.max(0, alpha);

            // Soft pink-gold trail (sakura-toned)
            const grad = ctx.createLinearGradient(
                s.x, s.y,
                s.x - s.vx * s.length * 0.5, s.y - s.vy * s.length * 0.5
            );
            grad.addColorStop(0, `hsla(${s.hue + 10}, 70%, 90%, ${alpha})`);
            grad.addColorStop(0.4, `hsla(${s.hue}, 60%, 75%, ${alpha * 0.5})`);
            grad.addColorStop(1, `hsla(${s.hue - 10}, 50%, 62%, 0)`);

            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(
                s.x - s.vx * s.length * 0.35,
                s.y - s.vy * s.length * 0.35
            );
            ctx.strokeStyle = grad;
            ctx.lineWidth = s.width;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Tiny soft head glow
            const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 8);
            headGlow.addColorStop(0, `hsla(${s.hue + 10}, 80%, 95%, ${alpha * 0.35})`);
            headGlow.addColorStop(1, `hsla(${s.hue}, 60%, 80%, 0)`);
            ctx.beginPath();
            ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = headGlow;
            ctx.fill();

            // Bright core dot (smaller than normal shooting stars)
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${s.hue + 15}, 90%, 98%, ${alpha * 0.6})`;
            ctx.fill();

            ctx.restore();
        }

        // === 7. 🌈 STARS WITH RAINBOW TWINKLE ===
        for (const star of stars) {
            const twinkle = Math.sin(time * star.speed * 50 + star.phase) * 0.5 + 0.5;
            const alpha = star.alpha * (0.2 + twinkle * 0.8) * sunDim;
            const starGoldHue = 46 + Math.sin(time * 0.15 + star.hueOffset) * 6;  // golden 40-52
            const starBlueHue = 210 + Math.sin(time * 0.1 + star.phase) * 15;     // blue-teal halo 195-225

            // Blue-teal glow (Starry Night's luminous halos) — cached!
            if (star.r > 1.5 && star.glowGrad) {
                ctx.save();
                ctx.globalAlpha = alpha * 0.2;
                ctx.fillStyle = star.glowGrad;
                ctx.fillRect(star.x - star.r * 5, star.y - star.r * 5, star.r * 10, star.r * 10);
                ctx.restore();
            }

            // Cross sparkle on brightest stars
            if (star.r > 1.8 && twinkle > 0.7) {
                const crossAlpha = alpha * 0.4 * (twinkle - 0.7) * 3.3;
                ctx.globalAlpha = crossAlpha;
                ctx.beginPath();
                ctx.moveTo(star.x - star.r * 2, star.y);
                ctx.lineTo(star.x + star.r * 2, star.y);
                ctx.moveTo(star.x, star.y - star.r * 2);
                ctx.lineTo(star.x, star.y + star.r * 2);
                ctx.strokeStyle = `hsla(46, 90%, 90%, 1)`; // golden-white cross
                ctx.lineWidth = 0.6;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // Golden star body (Van Gogh's signature yellow)
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${starGoldHue}, 85%, 85%, ${alpha})`;
            ctx.fill();
        }

        // === 8. DYNAMIC SPARKLES ===
        for (const sp of sparkles) {
            sp.life++;
            if (sp.life >= sp.maxLife) {
                sp.x = Math.random() * w;
                sp.y = Math.random() * h;
                sp.life = 0;
                sp.maxLife = 80 + Math.random() * 200;
            }

            const lifeRatio = sp.life / sp.maxLife;
            sp.alpha = Math.sin(lifeRatio * Math.PI) * sp.maxAlpha * sunDim;

            // Float upward slightly
            sp.y -= sp.speed * 0.05;
            if (sp.y < 0) sp.y = h;

            // Gold/white sparkle
            const spSize = sp.size * (0.8 + Math.sin(lifeRatio * Math.PI * 2) * 0.2);
            const spGlow = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, spSize * 3);
            spGlow.addColorStop(0, `rgba(255, 248, 220, ${sp.alpha * 0.5})`);
            spGlow.addColorStop(1, `rgba(255, 248, 220, 0)`);
            ctx.fillStyle = spGlow;
            ctx.fillRect(sp.x - spSize * 3, sp.y - spSize * 3, spSize * 6, spSize * 6);

            ctx.beginPath();
            ctx.arc(sp.x, sp.y, spSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 248, 220, ${sp.alpha * 0.8})`;
            ctx.fill();
        }

        // === 9. 🌫️ GROUND FOG (Depth effect at bottom) — cached gradient + globalAlpha ───
        if (cachedGradients.fogLayers && cachedGradients.fogLayers.length > 0) {
            for (let i = 0; i < cachedGradients.fogLayers.length; i++) {
                const fog = cachedGradients.fogLayers[i];
                const fogBaseAlpha = 0.04 + Math.sin(time * 0.08 + i * 2.3) * 0.015;

                ctx.beginPath();
                ctx.moveTo(0, h);

                const segments = 60;
                for (let s = 0; s <= segments; s++) {
                    const x = (s / segments) * w;
                    const wave = Math.sin(x * 0.004 + time * 0.12 + i * 1.8) * 18
                               + Math.sin(x * 0.009 + time * 0.06 + i * 3.5) * 10;
                    const y = fog.fogY + wave;
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(w, h);
                ctx.closePath();

                ctx.globalAlpha = fogBaseAlpha;
                ctx.fillStyle = fog.grad;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        // === 🌅 SUN RENDERING (Warm golden sunrise behind hills) ===
        if (sunVisibility > 0.01) {
            // ── Horizon sunrise glow ──
            const horizonGlow = ctx.createRadialGradient(sunX, h * 0.74, 0, sunX, h * 0.74, w * 0.35);
            horizonGlow.addColorStop(0, `hsla(25, 85%, 55%, ${0.2 * sunVisibility})`);
            horizonGlow.addColorStop(0.3, `hsla(30, 75%, 50%, ${0.08 * sunVisibility})`);
            horizonGlow.addColorStop(0.6, `hsla(35, 60%, 45%, ${0.03 * sunVisibility})`);
            horizonGlow.addColorStop(1, `hsla(40, 50%, 40%, 0)`);
            ctx.fillStyle = horizonGlow;
            ctx.fillRect(sunX - w * 0.35, h * 0.5, w * 0.7, h * 0.35);

            // ── Sun glow (large soft radial — warm golden) ──
            const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 5);
            sunGlow.addColorStop(0, `hsla(30, 90%, 75%, ${0.25 * sunVisibility})`);
            sunGlow.addColorStop(0.3, `hsla(35, 80%, 65%, ${0.10 * sunVisibility})`);
            sunGlow.addColorStop(0.6, `hsla(40, 65%, 55%, ${0.04 * sunVisibility})`);
            sunGlow.addColorStop(1, `hsla(45, 50%, 45%, 0)`);
            ctx.fillStyle = sunGlow;
            ctx.fillRect(sunX - sunR * 5, sunY - sunR * 5, sunR * 10, sunR * 10);

            // ── Sun body ──
            const sunBodyGrad = ctx.createRadialGradient(sunX - sunR * 0.2, sunY - sunR * 0.2, 0, sunX, sunY, sunR);
            sunBodyGrad.addColorStop(0, 'hsl(35, 95%, 85%)');       // bright golden center
            sunBodyGrad.addColorStop(0.4, 'hsl(30, 90%, 70%)');    // warm orange
            sunBodyGrad.addColorStop(0.7, 'hsl(25, 85%, 55%)');    // deeper orange
            sunBodyGrad.addColorStop(1, 'hsl(20, 80%, 42%)');      // dark orange edge
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
            ctx.fillStyle = sunBodyGrad;
            ctx.fill();

            // ── Soft inner core glow ──
            const coreGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 0.4);
            coreGlow.addColorStop(0, `hsla(45, 100%, 95%, ${0.3 * sunVisibility})`);
            coreGlow.addColorStop(1, `hsla(45, 90%, 85%, 0)`);
            ctx.fillStyle = coreGlow;
            ctx.fillRect(sunX - sunR * 0.4, sunY - sunR * 0.4, sunR * 0.8, sunR * 0.8);

            // ── 🌅 Dawn mist — warm glow spreading across the landscape ──
            const dawnMist = ctx.createRadialGradient(sunX, h * 0.76, 0, sunX, h * 0.76, w * 0.5);
            dawnMist.addColorStop(0, `hsla(30, 70%, 60%, ${0.06 * sunVisibility})`);
            dawnMist.addColorStop(0.3, `hsla(35, 55%, 55%, ${0.03 * sunVisibility})`);
            dawnMist.addColorStop(0.7, `hsla(40, 40%, 48%, ${0.01 * sunVisibility})`);
            dawnMist.addColorStop(1, `hsla(45, 30%, 42%, 0)`);
            ctx.fillStyle = dawnMist;
            ctx.fillRect(sunX - w * 0.5, h * 0.6, w, h * 0.35);
        }

        // ── 🕊️ BIRDS AT DAWN (Silhouettes soaring across the sunrise sky) ──
        if (!birdsAtDawn || Math.abs(lavenderLastW - w) > 50) {
            const numBirds = isMobile ? 6 : 15;
            birdsAtDawn = [];
            for (let i = 0; i < numBirds; i++) {
                birdsAtDawn.push({
                    x: Math.random() * (w + 100) - 50,
                    y: h * (0.08 + Math.random() * 0.22),
                    size: 3 + Math.random() * 4,
                    speed: 0.3 + Math.random() * 0.4,
                    wingFreq: 3 + Math.random() * 3,   // wingbeat speed
                    wingPhase: Math.random() * Math.PI * 2,
                    bobPhase: Math.random() * Math.PI * 2,
                    bobAmp: 4 + Math.random() * 6,       // vertical bobbing
                    dir: Math.random() > 0.5 ? 1 : -1,    // flight direction
                });
            }
        }

        if (sunVisibility > 0.05 && birdsAtDawn) {
            for (const b of birdsAtDawn) {
                // ── Movement ──
                b.x += b.speed * b.dir;
                if (b.dir > 0 && b.x > w + 40) b.x = -40;
                if (b.dir < 0 && b.x < -40) b.x = w + 40;

                // Gentle vertical bob (soaring on thermals)
                const bob = Math.sin(time * 0.3 + b.bobPhase) * b.bobAmp;
                const by = b.y + bob;

                // Wing flap angle: 0 = level, ±peak = full flap
                const wing = Math.sin(time * b.wingFreq + b.wingPhase);
                const wingUp = Math.abs(wing) * b.size * 0.45;
                const birdAlpha = 0.25 + sunVisibility * 0.35;

                // ── Draw bird as simple V-silhouette ──
                const bodyLen = b.size * 0.5;
                ctx.beginPath();

                // Body line
                ctx.moveTo(b.x - bodyLen, by);
                ctx.lineTo(b.x + bodyLen, by);

                // Left wing (upward V)
                ctx.moveTo(b.x, by);
                ctx.lineTo(b.x - b.size * 0.4, by - wingUp);

                // Right wing
                ctx.moveTo(b.x, by);
                ctx.lineTo(b.x + b.size * 0.4, by - wingUp);

                ctx.strokeStyle = `hsla(25, 12%, 8%, ${birdAlpha})`;
                ctx.lineWidth = 0.7 + birdAlpha * 0.6;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }

        // === 🌄 ROLLING HILLS BEHIND THE VILLAGE (Starry Night landscape) ===
        const hillLayers = isMobile ? 2 : 3;

        // ── ☀️ Cached sunrise warm gradient (recreate on resize) ──
        if (!cachedGradients.sunHill) {
            const sg = ctx.createLinearGradient(0, 0, w * 0.40, 0);
            sg.addColorStop(0, 'hsla(25, 80%, 50%, 1)');
            sg.addColorStop(0.3, 'hsla(32, 70%, 58%, 0.55)');
            sg.addColorStop(0.55, 'hsla(38, 55%, 52%, 0.18)');
            sg.addColorStop(1, 'hsla(40, 40%, 48%, 0)');
            cachedGradients.sunHill = sg;
        }

        for (let i = 0; i < hillLayers; i++) {
            const hillBaseY = h * (0.70 + i * 0.025);
            ctx.beginPath();
            ctx.moveTo(0, h);

            const hillSegments = 80;
            for (let s = 0; s <= hillSegments; s++) {
                const x = (s / hillSegments) * w;
                const wave1 = Math.sin(x * 0.003 + i * 1.5 + time * 0.02) * (20 + i * 10);
                const wave2 = Math.sin(x * 0.007 + i * 2.8 + time * 0.015) * (12 - i * 3);
                const wave3 = Math.sin(x * 0.0015 + i * 4.2) * (30 - i * 8);
                const y = hillBaseY + wave1 + wave2 + wave3;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(w, h);
            ctx.closePath();

            // Use cached hill gradient (recreated on resize only)
            if (cachedGradients.hillLayers && cachedGradients.hillLayers[i]) {
                ctx.fillStyle = cachedGradients.hillLayers[i].grad;
            }
            ctx.fill();

            // ── ☀️ Sunrise warm glow on left slopes (facing the rising sun at left-center) ──
            if (sunVisibility > 0.01 && cachedGradients.hillLayers && cachedGradients.hillLayers[i]) {
                const warmAlpha = cachedGradients.hillLayers[i].baseAlpha * 0.35 * sunVisibility;
                ctx.globalAlpha = warmAlpha;
                ctx.fillStyle = cachedGradients.sunHill;
                ctx.fill(); // same path — adds warmth only on left slopes
                ctx.globalAlpha = 1;
            }
        }

        // === 🏘️ VILLAGE AT THE FOOT OF THE HILL (Starry Night style) ===
        if (!village || Math.abs(lavenderLastW - w) > 50) {
            const numHouses = isMobile ? 4 : 8 + Math.floor(Math.random() * 3);
            village = [];
            const baseY = h * (0.74 + Math.random() * 0.03);
            const startX = w * 0.12;

            for (let i = 0; i < numHouses; i++) {
                const isChurch = i === Math.floor(numHouses * 0.4);
                const hw = (6 + Math.random() * 8) * (isChurch ? 1.3 : 1);
                const hh = (8 + Math.random() * 10) * (isChurch ? 2.5 : 1);
                const rh = hh * (0.2 + Math.random() * 0.1);
                village.push({
                    x: startX + (i / numHouses) * w * 0.65 + (Math.random() - 0.5) * 12,
                    baseY,
                    width: hw,
                    height: hh,
                    roofH: rh,
                    isChurch,
                    hue: 220 + Math.random() * 25,
                    light: 10 + Math.random() * 5,
                    hasLight: i % 2 === 0 || isChurch,
                    lightHue: 42 + Math.random() * 10,
                    lightSize: 1.2 + Math.random() * 1.0,
                    phase: Math.random() * Math.PI * 2,
                    hasChimney: !isChurch && Math.random() > 0.55,
                    chimneyW: 1.5 + Math.random() * 1.5,
                    chimneyH: 2 + Math.random() * 3,
                    chimneyOff: (Math.random() - 0.5) * hw * 0.3,
                    // ── 🌸 Sakura petals settled on roof ──
                    roofPetals: (() => {
                        const rp = [];
                        const num = isMobile ? 1 : 1 + (i % 3); // 1-3 petals
                        for (let p = 0; p < num; p++) {
                            rp.push({
                                t: 0.1 + (p / num) * 0.65,
                                offset: (Math.random() - 0.5) * 0.18,
                                size: 0.8 + (p % 2) * 0.5,
                                rot: Math.random() * Math.PI,
                                hue: 333 + (p % 3) * 8,
                                light: 62 + (p % 2) * 18,
                                alpha: 0.25 + (p % 3) * 0.15,
                                phase: Math.random() * Math.PI * 2,
                            });
                        }
                        return rp;
                    })()
                });
            }
            lavenderLastW = w;
        }

        for (const house of village) {
            const hx = house.x;
            const hy = house.baseY;
            const peakX = hx;
            const peakY = hy - house.height - house.roofH;

            // ── House body + pointed roof silhouette ──
            ctx.beginPath();
            ctx.moveTo(hx - house.width * 0.5, hy);
            ctx.lineTo(hx - house.width * 0.5, hy - house.height);
            ctx.lineTo(peakX, peakY);
            ctx.lineTo(hx + house.width * 0.5, hy - house.height);
            ctx.lineTo(hx + house.width * 0.5, hy);
            ctx.closePath();
            ctx.fillStyle = `hsla(${house.hue}, 35%, ${house.light + 2}%, 0.5)`;
            ctx.fill();
            ctx.strokeStyle = `hsla(${house.hue - 10}, 25%, ${house.light + 5}%, 0.12)`;
            ctx.lineWidth = 0.6;
            ctx.stroke();

            // ── 🌑 Left roof slope shadow (away from moonlight — adds 3D depth) ──
            const leftShadowAlpha = 0.18 + (1 - house.light / 15) * 0.12;
            ctx.beginPath();
            ctx.moveTo(peakX, peakY);
            ctx.lineTo(hx - house.width * 0.5, hy - house.height);
            ctx.lineTo(peakX, hy - house.height + house.roofH * 0.35);
            ctx.closePath();
            ctx.fillStyle = `hsla(230, 25%, 6%, ${leftShadowAlpha})`;
            ctx.fill();

            // ── 🌑 Eaves shadow (roof overhang casts dark band on upper wall) ──
            const eaveH = house.height * 0.10;
            const eavesAlpha = 0.15 + (1 - house.light / 15) * 0.10;
            ctx.beginPath();
            ctx.moveTo(hx - house.width * 0.5, hy - house.height);
            ctx.lineTo(hx + house.width * 0.5, hy - house.height);
            ctx.lineTo(hx + house.width * 0.5, hy - house.height + eaveH);
            ctx.lineTo(hx - house.width * 0.5, hy - house.height + eaveH);
            ctx.closePath();
            ctx.fillStyle = `hsla(220, 20%, 5%, ${eavesAlpha})`;
            ctx.fill();

            // ── 🌙 Moonlight reflection on right roof slope (moon at top-right) ──
            const roofReflect = Math.sin(time * 0.15 + house.phase) * 0.3 + 0.7;
            // Right roof slope: peak → bottom-right corner (catches moonlight)
            const roofGrad = ctx.createLinearGradient(
                peakX, peakY,
                hx + house.width * 0.5, hy - house.height
            );
            const roofEdgeY = hy - house.height;
            roofGrad.addColorStop(0, `hsla(46, 55%, 82%, ${0.375 * roofReflect})`);  // brighter gold at peak (×1.5)
            roofGrad.addColorStop(0.3, `hsla(46, 48%, 74%, ${0.18 * roofReflect})`);
            roofGrad.addColorStop(0.6, `hsla(350, 38%, 67%, ${0.075 * roofReflect})`);
            roofGrad.addColorStop(0.8, `hsla(340, 32%, 60%, ${0.03 * roofReflect})`);  // extended spread
            roofGrad.addColorStop(1, `hsla(330, 28%, 55%, 0)`);

            ctx.beginPath();
            ctx.moveTo(peakX, peakY);
            ctx.lineTo(hx + house.width * 0.5, roofEdgeY);
            ctx.lineTo(peakX, roofEdgeY + house.roofH * 0.75);  // extended coverage (was 0.5)
            ctx.closePath();
            ctx.fillStyle = roofGrad;
            ctx.fill();

            // ── ✨ Roof peak glow (moonlit ridge highlight) ──
            const peakGlow = Math.sin(time * 0.12 + house.phase * 1.2) * 0.25 + 0.75;
            const peakGrad = ctx.createRadialGradient(peakX, peakY, 0, peakX, peakY, house.width * 0.3);
            peakGrad.addColorStop(0, `hsla(46, 65%, 85%, ${0.3 * peakGlow})`);   // ×1.5
            peakGrad.addColorStop(0.3, `hsla(46, 55%, 78%, ${0.12 * peakGlow})`);
            peakGrad.addColorStop(1, `hsla(46, 45%, 70%, 0)`);
            ctx.fillStyle = peakGrad;
            ctx.fillRect(
                peakX - house.width * 0.3, peakY - house.width * 0.15,
                house.width * 0.6, house.width * 0.4
            );

            // ── Tiny bright sparkle at the very tip (where moonlight catches the ridge) ──
            const tipSparkle = Math.sin(time * 0.9 + house.phase * 0.7) * 0.4 + 0.6;
            if (tipSparkle > 0.7) {
                const tipAlpha = (tipSparkle - 0.7) * 3.3;
                // Tiny glow
                const tipGlow = ctx.createRadialGradient(peakX, peakY, 0, peakX, peakY, house.width * 0.12);
                tipGlow.addColorStop(0, `hsla(50, 90%, 95%, ${0.45 * tipAlpha})`); // ×1.5
                tipGlow.addColorStop(1, `hsla(50, 80%, 85%, 0)`);
                ctx.fillStyle = tipGlow;
                ctx.fillRect(
                    peakX - house.width * 0.15, peakY - house.width * 0.15,
                    house.width * 0.30, house.width * 0.30
                );
                // Bright core dot
                ctx.beginPath();
                ctx.arc(peakX, peakY, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(50, 100%, 98%, ${0.9 * tipAlpha})`;
                ctx.fill();
            }                // ── 🌸 Pink moonlight glint sweeping across right roof slope (specular sheen on tiles) ──
                const glintPos = (Math.sin(time * 0.35 + house.phase * 0.6) * 0.7 + 0.5); // cycles 0-1.2
                if (glintPos >= 0 && glintPos <= 1) {
                    // Position along the right roof slope (peak=0, bottom-right=1)
                    const gx = peakX + (hx + house.width * 0.5 - peakX) * glintPos;
                    const gy = peakY + (roofEdgeY - peakY) * glintPos;
                    // Glint intensity: strongest in middle of sweep
                    const gIntensity = Math.pow(Math.sin(glintPos * Math.PI), 0.8);
                    const gRadius = house.width * 0.08;

                    // Pink-white glow (sakura moonlight) — ×1.5 alpha + wider radius
                    const glintGlow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gRadius * 2.5);
                    glintGlow.addColorStop(0, `hsla(345, 60%, 90%, ${0.45 * gIntensity})`);
                    glintGlow.addColorStop(0.4, `hsla(340, 50%, 82%, ${0.15 * gIntensity})`);
                    glintGlow.addColorStop(1, `hsla(340, 40%, 75%, 0)`);
                    ctx.fillStyle = glintGlow;
                    ctx.fillRect(gx - gRadius * 2.5, gy - gRadius * 2.5, gRadius * 5, gRadius * 5);

                    // Core bright dot
                    ctx.beginPath();
                    ctx.arc(gx, gy, gRadius * 0.35, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(350, 70%, 94%, ${0.75 * gIntensity})`;
                    ctx.fill();
                }

                // ── 🌸 Settled sakura petals on roof ──
                if (house.roofPetals) {
                    for (const rp of house.roofPetals) {
                        const rpx = peakX + (hx + house.width * 0.5 - peakX) * rp.t + rp.offset * house.width;
                        const rpy = peakY + (roofEdgeY - peakY) * rp.t + Math.sin(time * 0.4 + rp.phase) * 0.6;
                        const rRot = rp.rot + Math.sin(time * 0.25 + rp.phase) * 0.04;
                        const rustle = Math.sin(time * 0.35 + rp.phase) * 0.15 + 0.85;

                        ctx.save();
                        ctx.translate(rpx, rpy);
                        ctx.rotate(rRot);
                        // Petal body (small pink ellipse lying on the roof)
                        ctx.beginPath();
                        ctx.ellipse(0, 0, rp.size * 0.5, rp.size * 0.25, 0, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${rp.hue}, 60%, ${rp.light}%, ${rp.alpha * rustle})`;
                        ctx.fill();
                        // Subtle pink glow (moonlit reflection on settled petal)
                        ctx.beginPath();
                        ctx.ellipse(0, 0, rp.size * 0.8, rp.size * 0.4, 0, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${rp.hue + 5}, 50%, ${rp.light + 10}%, ${rp.alpha * 0.1 * rustle})`;
                        ctx.fill();
                        ctx.restore();
                    }
                }

                // ── Chimney + rising smoke ──
                if (house.hasChimney) {
                const chX = hx + house.chimneyOff;
                const chTop = peakY;

                // Tiny chimney structure
                ctx.fillStyle = `hsla(${house.hue + 5}, 28%, ${house.light + 4}%, 0.5)`;
                ctx.fillRect(chX - house.chimneyW * 0.5, chTop - house.chimneyH, house.chimneyW, house.chimneyH);

                // Rising smoke puffs (golden-white wisps, drifting in moonlight)
                const numPuffs = 3;
                for (let p = 0; p < numPuffs; p++) {
                    const puffPhase = time * 0.45 + house.phase + p * 2.1;
                    const puffProgress = Math.sin(puffPhase) * 0.5 + 0.5;
                    const puffH = puffProgress * 10; // rise up to 10px
                    const puffDrift = Math.sin(puffPhase * 0.8 + house.phase * 0.5) * 3;
                    const puffAlpha = Math.sin(puffProgress * Math.PI) * 0.12;
                    const puffSize = 0.6 + puffProgress * 0.8;

                    ctx.beginPath();
                    ctx.arc(chX + puffDrift, chTop - house.chimneyH - puffH, puffSize, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(46, 30%, 78%, ${puffAlpha})`;
                    ctx.fill();
                }
            }

            // ── Church steeple ──
            if (house.isChurch) {
                ctx.beginPath();
                ctx.moveTo(peakX - house.width * 0.12, peakY);
                ctx.lineTo(peakX, peakY - house.roofH * 0.6);
                ctx.lineTo(peakX + house.width * 0.12, peakY);
                ctx.closePath();
                ctx.fillStyle = `hsla(${house.hue}, 30%, ${house.light + 3}%, 0.55)`;
                ctx.fill();

                // Tiny cross on top
                const crossY = peakY - house.roofH * 0.6;
                ctx.beginPath();
                ctx.moveTo(peakX - 1.5, crossY);
                ctx.lineTo(peakX + 1.5, crossY);
                ctx.moveTo(peakX, crossY - 3);
                ctx.lineTo(peakX, crossY + 1.5);
                ctx.strokeStyle = `hsla(${house.hue - 5}, 20%, ${house.light + 12}%, 0.15)`;
                ctx.lineWidth = 0.4;
                ctx.stroke();
            }

            // ── Warm glowing window ──
            if (house.hasLight) {
                const winX = hx;
                const winY = hy - house.height * 0.4;
                const winGlow = Math.sin(time * 0.5 + house.phase) * 0.3 + 0.7;

                // Soft window glow
                const winG = ctx.createRadialGradient(winX, winY, 0, winX, winY, house.lightSize * 4);
                winG.addColorStop(0, `hsla(${house.lightHue}, 80%, 80%, ${0.12 * winGlow})`);
                winG.addColorStop(0.3, `hsla(${house.lightHue}, 70%, 70%, ${0.06 * winGlow})`);
                winG.addColorStop(1, `hsla(${house.lightHue}, 60%, 60%, 0)`);
                ctx.fillStyle = winG;
                ctx.fillRect(winX - house.lightSize * 4, winY - house.lightSize * 4, house.lightSize * 8, house.lightSize * 8);

                // Tiny window pane
                const winW = house.width * 0.12;
                const winH = house.width * 0.12;
                ctx.fillStyle = `hsla(${house.lightHue}, 85%, 85%, ${0.25 * winGlow})`;
                ctx.fillRect(winX - winW * 0.5, winY - winH * 0.5, winW, winH);

                // ── 🫨 Window light spilling onto the ground (warm pool below) ──
                const groundY = hy;
                const beamTopW = house.width * 0.15;
                const beamBotW = house.width * 0.5;

                // Light cone from window down to ground
                const beamGrad = ctx.createLinearGradient(0, winY, 0, groundY);
                beamGrad.addColorStop(0, `hsla(${house.lightHue}, 80%, 80%, ${0.06 * winGlow})`);
                beamGrad.addColorStop(0.4, `hsla(${house.lightHue}, 70%, 70%, ${0.03 * winGlow})`);
                beamGrad.addColorStop(1, `hsla(${house.lightHue}, 60%, 60%, 0)`);

                ctx.beginPath();
                ctx.moveTo(winX - beamTopW * 0.5, winY);
                ctx.lineTo(winX + beamTopW * 0.5, winY);
                ctx.lineTo(winX + beamBotW * 0.5, groundY);
                ctx.lineTo(winX - beamBotW * 0.5, groundY);
                ctx.closePath();
                ctx.fillStyle = beamGrad;
                ctx.fill();

                // Warm glow pool on the ground surface (elliptical puddle of light)
                const groundPool = ctx.createRadialGradient(winX, groundY, 0, winX, groundY, house.width * 0.35);
                groundPool.addColorStop(0, `hsla(${house.lightHue}, 70%, 75%, ${0.05 * winGlow})`);
                groundPool.addColorStop(0.4, `hsla(${house.lightHue}, 60%, 68%, ${0.025 * winGlow})`);
                groundPool.addColorStop(1, `hsla(${house.lightHue}, 50%, 60%, 0)`);
                ctx.fillStyle = groundPool;
                ctx.fillRect(winX - house.width * 0.35, groundY - house.width * 0.08, house.width * 0.7, house.width * 0.16);
            }
        }

        // === 10. 🌸 SAKURA TREES (Cherry blossoms in moonlight) ===
        if (!sakuraTrees || Math.abs(lavenderLastW - w) > 50) {
            const num = isMobile ? 2 : 3;
            sakuraTrees = [];
            sakuraPetals = [];
            for (let i = 0; i < num; i++) {
                const treeX = w * (0.06 + i * 0.10);
                const treeBaseY = h * (0.78 + Math.random() * 0.06);
                const treeHeight = h * (0.20 + Math.random() * 0.07);
                const canopyW = w * (0.055 + Math.random() * 0.02);

                // Canopy layers: overlapping fluffy ellipses
                const numLayers = isMobile ? 3 : 5;
                const layers = [];
                for (let l = 0; l < numLayers; l++) {
                    const t = 0.1 + (l / numLayers) * 0.75;
                    const cy = treeBaseY - treeHeight * t;
                    const spread = canopyW * (0.3 + Math.sin(t * Math.PI) * 0.7);
                    const layerH = canopyW * (0.15 + Math.random() * 0.12);
                    layers.push({
                        cx: treeX + (Math.random() - 0.5) * spread * 0.25,
                        cy: cy + (Math.random() - 0.5) * layerH * 0.3,
                        rx: spread * 0.5,
                        ry: layerH * 0.5,
                        hue: 330 + Math.random() * 20,
                        sat: 55 + Math.random() * 10,
                        light: 50 + Math.random() * 20,
                        alpha: 0.30 + Math.random() * 0.20,
                    });
                }

                // Blossom clusters (tiny pink dots)
                const numBlossoms = isMobile ? 15 : 35;
                const blossoms = [];
                for (let b = 0; b < numBlossoms; b++) {
                    const t = Math.random();
                    const cy = treeBaseY - treeHeight * t;
                    const spread = canopyW * Math.sin(t * Math.PI) * 0.45;
                    const bx = treeX + (Math.random() - 0.5) * spread * 2;
                    const by = cy + (Math.random() - 0.5) * spread * 0.12;
                    const bSize = 1.0 + Math.random() * 1.8;
                    const glowG = ctx.createRadialGradient(bx, by, 0, bx, by, bSize * 2.5);
                    const bhue = 335 + Math.random() * 15;
                    const bsat = 75 + Math.random() * 20;
                    const blight = 68 + Math.random() * 22;
                    glowG.addColorStop(0, `hsla(${bhue}, ${bsat}%, ${blight}%, 1)`);
                    glowG.addColorStop(1, `hsla(${bhue}, ${bsat}%, ${blight}%, 0)`);
                    blossoms.push({
                        x: bx,
                        y: by,
                        size: bSize,
                        hue: bhue,
                        sat: bsat,
                        light: blight,
                        alpha: 0.3 + Math.random() * 0.3,
                        phase: Math.random() * Math.PI * 2,
                        glowGrad: glowG,
                    });
                }

                sakuraTrees.push({
                    x: treeX,
                    baseY: treeBaseY,
                    height: treeHeight,
                    canopyW,
                    layers,
                    blossoms,
                    swayPhase: Math.random() * Math.PI * 2,
                    swaySpeed: 0.07 + Math.random() * 0.04,
                    trunkHue: 25 + Math.random() * 10,
                });

                // ── Generate falling sakura petals for this tree ──
                const numPetals = isMobile ? 12 : 25;
                for (let p = 0; p < numPetals; p++) {
                    sakuraPetals.push({
                        x: treeX + (Math.random() - 0.5) * canopyW * 1.2,
                        y: treeBaseY - treeHeight * (0.1 + Math.random() * 0.8),
                        size: 1.2 + Math.random() * 1.8,
                        width: 1.5 + Math.random() * 1.0,
                        rot: Math.random() * Math.PI * 2,
                        rotSpeed: (Math.random() - 0.5) * 0.03,
                        fallSpeed: 0.10 + Math.random() * 0.18,
                        drift: (Math.random() - 0.5) * 0.15,
                        swayPhase: Math.random() * Math.PI * 2,
                        swaySpeed: 0.2 + Math.random() * 0.25,
                        alpha: 0.25 + Math.random() * 0.3,
                        hue: 330 + Math.random() * 18,
                        light: 65 + Math.random() * 20,
                        treeX: treeX,
                        treeBaseY: treeBaseY,
                        treeHeight: treeHeight,
                    });
                }
            }
            lavenderLastW = w;
        }

        for (const tree of sakuraTrees) {
            const sway = Math.sin(time * tree.swaySpeed + tree.swayPhase) * 2.5;
            const baseX = tree.x + sway;

            // ── Trunk ──
            ctx.beginPath();
            ctx.moveTo(baseX, tree.baseY);
            ctx.quadraticCurveTo(
                baseX + sway * 0.5, tree.baseY - tree.height * 0.35,
                baseX + sway * 0.3, tree.baseY - tree.height * 0.9
            );
            ctx.lineWidth = 1.5 + Math.sin(tree.swayPhase) * 0.5;
            ctx.strokeStyle = `hsla(${tree.trunkHue}, 30%, 15%, 0.5)`;
            ctx.lineCap = 'round';
            ctx.stroke();

            // ── 🌸 Ambient pink glow behind the canopy ──
            const ambientGlowPhase = Math.sin(time * 0.06 + tree.swayPhase) * 0.2 + 0.8;
            const ambientGlow = ctx.createRadialGradient(
                baseX + sway * 0.2, tree.baseY - tree.height * 0.4, 0,
                baseX + sway * 0.2, tree.baseY - tree.height * 0.4, tree.canopyW * 1.4
            );
            ambientGlow.addColorStop(0, `hsla(340, 50%, 60%, ${0.08 * ambientGlowPhase})`);
            ambientGlow.addColorStop(0.5, `hsla(345, 45%, 55%, ${0.035 * ambientGlowPhase})`);
            ambientGlow.addColorStop(1, `hsla(350, 40%, 50%, 0)`);
            ctx.fillStyle = ambientGlow;
            ctx.fillRect(
                baseX - tree.canopyW * 1.4, tree.baseY - tree.height - tree.canopyW * 0.5,
                tree.canopyW * 2.8, tree.height + tree.canopyW
            );

            // ── Canopy layers (fluffy pink ellipses) ──
            for (const layer of tree.layers) {
                const lx = layer.cx + sway * 0.3;
                const ly = layer.cy;
                const layerPulse = Math.sin(time * 0.08 + tree.swayPhase + layer.cx) * 0.05 + 0.95;

                ctx.beginPath();
                ctx.ellipse(lx, ly, layer.rx * layerPulse, layer.ry, 0, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${layer.hue}, ${layer.sat || 55}%, ${layer.light}%, ${layer.alpha})`;
                ctx.fill();
            }

            // ── 🌙 Golden mist at the base (moonlight through fog) ──
            const mistPhase = Math.sin(time * 0.07 + tree.swayPhase) * 0.3 + 0.7;
            const mistWidth = tree.canopyW * (3.0 + Math.sin(time * 0.05 + tree.swayPhase + 1) * 0.5);
            const mistHeight = tree.height * 0.18;
            const mistGrad = ctx.createRadialGradient(
                baseX, tree.baseY, 0,
                baseX, tree.baseY - mistHeight * 0.3, mistWidth
            );
            mistGrad.addColorStop(0, `hsla(46, 50%, 70%, ${0.05 * mistPhase})`);
            mistGrad.addColorStop(0.25, `hsla(46, 40%, 65%, ${0.03 * mistPhase})`);
            mistGrad.addColorStop(0.5, `hsla(46, 30%, 58%, ${0.015 * mistPhase})`);
            mistGrad.addColorStop(0.75, `hsla(46, 25%, 52%, ${0.006 * mistPhase})`);
            mistGrad.addColorStop(1, `hsla(46, 20%, 45%, 0)`);
            ctx.fillStyle = mistGrad;
            ctx.fillRect(
                baseX - mistWidth, tree.baseY - mistHeight * 1.2,
                mistWidth * 2, mistHeight * 1.8
            );

            // ── 🌙 Second mist layer — wider & thinner ──
            const mistPhase2 = Math.sin(time * 0.05 + tree.swayPhase + 1.5) * 0.25 + 0.75;
            const mistWidth2 = tree.canopyW * (4.5 + Math.sin(time * 0.04 + tree.swayPhase + 2) * 1.0);
            const mistHeight2 = tree.height * 0.30;
            const mistGrad2 = ctx.createRadialGradient(
                baseX, tree.baseY, 0,
                baseX, tree.baseY - mistHeight2 * 0.3, mistWidth2
            );
            mistGrad2.addColorStop(0, `hsla(46, 35%, 68%, ${0.020 * mistPhase2})`);
            mistGrad2.addColorStop(0.3, `hsla(46, 28%, 62%, ${0.012 * mistPhase2})`);
            mistGrad2.addColorStop(0.55, `hsla(340, 25%, 58%, ${0.007 * mistPhase2})`);   // teal → hồng
            mistGrad2.addColorStop(0.8, `hsla(335, 20%, 52%, ${0.003 * mistPhase2})`);
            mistGrad2.addColorStop(1, `hsla(330, 15%, 45%, 0)`);
            ctx.fillStyle = mistGrad2;
            ctx.fillRect(
                baseX - mistWidth2, tree.baseY - mistHeight2 * 1.3,
                mistWidth2 * 2, mistHeight2 * 2
            );

            // ── ✨ Blossom clusters (tiny pink glowing dots, gradient cached) ──
            for (const b of tree.blossoms) {
                const bx = b.x + sway * 0.3;
                const by = b.y;
                const bGlow = Math.sin(time * 0.5 + b.phase) * 0.2 + 0.8;
                const bAlpha = b.alpha * bGlow;

                // Cached glow gradient + globalAlpha for pulse
                ctx.globalAlpha = bAlpha * 0.25;
                ctx.fillStyle = b.glowGrad;
                ctx.fillRect(bx - b.size * 2.5, by - b.size * 2.5, b.size * 5, b.size * 5);
                ctx.globalAlpha = 1;

                // Core dot
                ctx.beginPath();
                ctx.arc(bx, by, b.size * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${b.hue + 5}, ${b.sat + 5}%, ${b.light + 8}%, ${bAlpha * 0.5})`;
                ctx.fill();
            }

            // ── 🌙 Moonlight edge glow on the right side ──
            const moonGlowPhase = Math.sin(time * 0.1) * 0.4 + 0.6;
            const edgeGrad = ctx.createLinearGradient(
                baseX + tree.canopyW * 0.2, tree.baseY - tree.height,
                baseX + tree.canopyW * 0.6, tree.baseY
            );
            edgeGrad.addColorStop(0, `hsla(355, 45%, 70%, ${0.035 * moonGlowPhase})`);
            edgeGrad.addColorStop(0.3, `hsla(350, 40%, 65%, ${0.020 * moonGlowPhase})`);
            edgeGrad.addColorStop(0.6, `hsla(345, 35%, 60%, ${0.008 * moonGlowPhase})`);
            edgeGrad.addColorStop(1, `hsla(340, 30%, 55%, 0)`);

            ctx.beginPath();
            ctx.ellipse(baseX + tree.canopyW * 0.35, tree.baseY - tree.height * 0.4, tree.canopyW * 0.25, tree.height * 0.35, -0.2, 0, Math.PI * 2);
            ctx.fillStyle = edgeGrad;
            ctx.fill();

            // ── Van Gogh brushstrokes (pink layered strokes for sakura canopy texture) ──
            ctx.save();
            const numLayers = isMobile ? 3 : 5;
            for (let layer = 0; layer < numLayers; layer++) {
                const t = 0.15 + (layer / numLayers) * 0.7;
                const ly = tree.baseY - tree.height * t;
                const spread = tree.canopyW * Math.sin(t * Math.PI) * 0.4;
                const numStrokes = isMobile ? 2 : 4;

                for (let s = 0; s < numStrokes; s++) {
                    const frac = (s / (numStrokes - 1)) * 2 - 1;
                    const sx = baseX + frac * spread + sway * 0.3;
                    const sy = ly;
                    const strokeLen = 4 + (1 - t) * 8;
                    const ex = sx + (Math.sin(t * 3 + s * 0.8 + tree.swayPhase) * 1.5);
                    const ey = sy - strokeLen;

                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(ex, ey);

                    const hueVar = 340 + (s % 2) * 10 + t * 8;
                    const lightVar = 48 + (s % 3) * 8 + t * 12;
                    ctx.strokeStyle = `hsla(${hueVar}, 60%, ${lightVar}%, 0.28)`;
                    ctx.lineWidth = 1.5 + (numStrokes - s) * 0.5;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            }

            // ── ✨ Starlight sparkles on canopy (reflecting the night sky) ──
            const numStarlights = isMobile ? 3 : 6;
            for (let i = 0; i < numStarlights; i++) {
                const t = 0.05 + (i / numStarlights) * 0.25;
                const ly = tree.baseY - tree.height * t;
                const spread = tree.canopyW * Math.sin(t * Math.PI) * 0.4;
                const side = (i % 2 === 0) ? 1 : -1;
                const sx = baseX + side * spread + sway * 0.3;

                const starlightPhase = time * 1.5 + i * 2.1 + tree.swayPhase;
                const starlightA = (Math.sin(starlightPhase) * 0.5 + 0.5) * 0.6;
                const slSize = 0.8 + starlightA * 1.0;

                // Tiny glow
                const slGlow = ctx.createRadialGradient(sx, ly, 0, sx, ly, slSize * 3);
                slGlow.addColorStop(0, `hsla(350, 70%, 85%, ${0.12 * starlightA})`);
                slGlow.addColorStop(1, `hsla(350, 60%, 75%, 0)`);
                ctx.fillStyle = slGlow;
                ctx.fillRect(sx - slSize * 3, ly - slSize * 3, slSize * 6, slSize * 6);

                // Core dot
                ctx.beginPath();
                ctx.arc(sx, ly, slSize * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(350, 85%, 88%, ${0.4 * starlightA})`;
                ctx.fill();
            }

            ctx.restore();
        }

        // === 🌸 FALLING SAKURA PETALS (spring wind carrying petals) ===

        // ── 🌬️ Spring wind gust system ──
        // Gentle base wind + periodic stronger gusts, deterministic (no Math.random)
        const windBase = Math.sin(time * 0.12) * 0.25 + 0.25;             // 0–0.5, gentle baseline
        const windSurge = Math.pow(Math.max(0, Math.sin(time * 0.04 + Math.sin(time * 0.015) * 0.8)), 6) * 2.5;
        const windStrength = Math.min(1, windBase + windSurge);            // 0–1, occasional gusts
        const windDir = Math.sin(time * 0.07 + Math.sin(time * 0.02) * 0.5) > 0 ? 1 : -1;

        // ── 🌬️ Wind streak particles (visible wind ribbons carrying sakura petals) ──
        if (windStrength > 0.15) {
            const numStreaks = isMobile ? 6 : 18;
            ctx.save();
            for (let i = 0; i < numStreaks; i++) {
                const phase = i / numStreaks;
                const streakSpeed = 0.35 + (i % 4) * 0.10;
                const sx = ((time * streakSpeed * windDir + phase * Math.PI * 2) % (w + 120)) - 60;
                const sy = h * (0.45 + Math.sin(i * 2.1 + time * 0.03) * 0.28);
                const streakLen = 18 + (i % 5) * 8;
                const sAlpha = 0.025 + (i % 3) * 0.015;

                // Main streak — soft pink wind ribbon
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + windDir * streakLen, sy + Math.sin(time * 0.15 + i * 1.3) * 4);
                ctx.strokeStyle = `hsla(${338 + (i % 3) * 10}, 42%, 70%, ${sAlpha * windStrength})`;
                ctx.lineWidth = 0.6 + windStrength * 0.5;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Secondary fainter streak offset slightly (layered wind flow)
                if (i % 2 === 0) {
                    ctx.beginPath();
                    ctx.moveTo(sx + windDir * 5, sy + 4);
                    ctx.lineTo(sx + windDir * (streakLen + 8), sy + 4 + Math.sin(time * 0.12 + i * 1.8) * 2);
                    ctx.strokeStyle = `hsla(328, 32%, 76%, ${sAlpha * 0.4 * windStrength})`;
                    ctx.lineWidth = 0.3;
                    ctx.stroke();
                }

                // Tiny pink dot at the tip (like a petal caught in the wind streak)
                if (i % 3 === 0 && windStrength > 0.4) {
                    const tipX = sx + windDir * (streakLen + 2);
                    const tipY = sy + Math.sin(time * 0.15 + i * 1.3) * 4;
                    ctx.beginPath();
                    ctx.arc(tipX, tipY, 0.6 + windStrength * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(345, 50%, 72%, ${0.15 * windStrength})`;
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        // ── Petal update + render ──
        if (sakuraPetals) {
            for (let i = sakuraPetals.length - 1; i >= 0; i--) {
                const p = sakuraPetals[i];

                // Wind influence: drift horizontally, lift slightly, tumble faster
                const windDrift = windDir * windStrength * 0.8;
                const windLift = windStrength * 0.05;
                const tumble = windStrength * 0.025 * windDir;

                // Fall with sway + wind
                const sway = Math.sin(time * p.swaySpeed + p.swayPhase) * 1.5;
                p.x += p.drift + sway * 0.03 + windDrift;
                p.y += p.fallSpeed - windLift;
                p.rot += p.rotSpeed + tumble;

                // Subtle twinkle
                const twinkle = Math.sin(time * 0.7 + p.swayPhase + i) * 0.25 + 0.75;

                // Reset when blown off-screen or below tree base
                const resetY = p.treeBaseY + 20;
                const treeTop = p.treeBaseY - p.treeHeight;
                if (p.y > resetY || p.x < -30 || p.x > w + 30) {
                    p.x = p.treeX + (Math.random() - 0.5) * (p.treeHeight * 0.12);
                    p.y = treeTop + Math.random() * p.treeHeight * 0.15;
                    p.rot = Math.random() * Math.PI * 2;
                }

                // Draw petal as a small oval
                const petalW = p.size;
                const petalH = p.width * 0.6;
                const petalA = p.alpha * twinkle;

                ctx.beginPath();
                ctx.ellipse(p.x, p.y, petalW * 0.5, petalH * 0.5, p.rot, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 65%, ${p.light}%, ${petalA})`;
                ctx.fill();

                // Subtle pink glow (moonlight on petal)
                if (petalA > 0.15) {
                    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, petalW * 1.5);
                    glow.addColorStop(0, `hsla(345, 45%, 75%, ${petalA * 0.08})`);
                    glow.addColorStop(1, `hsla(345, 40%, 65%, 0)`);
                    ctx.fillStyle = glow;
                    ctx.fillRect(p.x - petalW * 1.5, p.y - petalW * 1.5, petalW * 3, petalW * 3);
                }
            }
        }

        // === 11. 🌸 LAVENDER FIELD (Van Gogh style) ===
        // Initialize on first draw or when canvas width changes significantly
        if (!lavenderStalks || Math.abs(lavenderLastW - w) > 50) {
            const num = isMobile ? 60 : 140;
            lavenderStalks = [];
            for (let i = 0; i < num; i++) {
                const x = Math.random() * (w + 60) - 30;
                const baseY = h * (0.80 + Math.random() * 0.17);
                const height = 18 + Math.random() * 48;
                const stalk = {
                    x, baseY, height,
                    hue: 255 + Math.random() * 35,
                    sat: 55 + Math.random() * 25,
                    light: 40 + Math.random() * 25,
                    stemHue: 105 + Math.random() * 30,
                    stemLight: 28 + Math.random() * 14,
                    stemW: 0.8 + Math.random() * 1.0,
                    swayPhase: Math.random() * Math.PI * 2,
                    swaySpeed: 0.2 + Math.random() * 0.18,
                    strokes: []
                };
                const numStrokes = 4 + (i % 5);
                for (let j = 0; j < numStrokes; j++) {
                    const angle = j * 1.3 + (i & 3) * 0.6;
                    const dist = 1.5 + (j % 4) * 2.0;
                    stalk.strokes.push({
                        dx: Math.cos(angle) * dist,
                        dy: Math.sin(angle * 0.6) * dist * 0.5 - 2 + (j % 3) * 1.5,
                        len: 3 + (j % 3) * 1.5,
                        ang: angle + 0.3 + (j % 3) * 0.3,
                        wid: 1.5 + (j % 2) * 1.0,
                        hOff: (j % 3) * 10,
                        sOff: (j % 2) * 12,
                        lOff: (j % 3) * 8
                    });
                }
                // Small leaf on lower third (~33% of stalks)
                if (i % 3 === 0) {
                    stalk.leafSide = (i % 2 === 0) ? 1 : -1;
                    stalk.leafY = 0.25 + Math.random() * 0.25;
                    stalk.leafLen = 4 + Math.random() * 6;
                }
                lavenderStalks.push(stalk);
            }
            lavenderLastW = w;
        }

        ctx.save();

        // ── 🌅 Sunrise warm glow on left side of lavender field (facing the rising sun) ──
        // Drawn behind stalks so warm light naturally illuminates them from below
        if (sunVisibility > 0.01 && cachedGradients.sunHill) {
            const lavWarmAlpha = 0.08 * sunVisibility;
            ctx.globalAlpha = lavWarmAlpha;
            ctx.fillStyle = cachedGradients.sunHill;
            ctx.fillRect(0, h * 0.78, w * 0.45, h * 0.22);
            ctx.globalAlpha = 1.0; // reset
        }

        for (let i = 0; i < lavenderStalks.length; i++) {
            const stalk = lavenderStalks[i];
            const sway = Math.sin(time * stalk.swaySpeed + stalk.swayPhase) * 3.5;
            const swayAngle = Math.sin(time * stalk.swaySpeed * 0.7 + stalk.swayPhase + 1) * 0.05;

            const stemEndX = stalk.x + sway;
            const stemEndY = stalk.baseY - stalk.height;

            // ── Green stem ──
            ctx.beginPath();
            ctx.moveTo(stalk.x, stalk.baseY);
            ctx.quadraticCurveTo(
                stalk.x + sway * 0.3, stalk.baseY - stalk.height * 0.4,
                stemEndX, stemEndY
            );
            ctx.strokeStyle = `hsla(${stalk.stemHue}, 40%, ${stalk.stemLight}%, 0.5)`;
            ctx.lineWidth = stalk.stemW;
            ctx.lineCap = 'round';
            ctx.stroke();

            // ── Small leaf on stem (some stalks) ──
            if (stalk.leafSide) {
                const leafY = stalk.baseY - stalk.height * stalk.leafY;
                const leafProgress = stalk.leafY;
                const leafBaseX = stalk.x + sway * leafProgress * 0.3;
                const leafAngle = stalk.leafSide * (0.4 + Math.sin(time * 0.15 + stalk.swayPhase) * 0.1);
                ctx.beginPath();
                ctx.moveTo(leafBaseX, leafY);
                ctx.quadraticCurveTo(
                    leafBaseX + Math.cos(leafAngle) * stalk.leafLen * 0.6,
                    leafY - Math.sin(leafAngle) * stalk.leafLen * 0.3,
                    leafBaseX + Math.cos(leafAngle) * stalk.leafLen,
                    leafY - Math.sin(leafAngle) * stalk.leafLen * 0.2
                );
                ctx.strokeStyle = `hsla(${stalk.stemHue + 10}, 45%, ${stalk.stemLight + 5}%, 0.3)`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }

            // ── Flower brushstrokes (Van Gogh style clusters) ──
            for (const stroke of stalk.strokes) {
                const px = stemEndX + stroke.dx * (1 + Math.sin(time * 0.08 + stalk.swayPhase) * 0.04);
                const py = stemEndY + stroke.dy;
                const rot = stroke.ang + swayAngle * 0.5;

                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(
                    px + Math.cos(rot) * stroke.len,
                    py + Math.sin(rot) * stroke.len
                );
                ctx.strokeStyle = `hsla(${stalk.hue + stroke.hOff}, ${55 + stroke.sOff}%, ${40 + stroke.lOff}%, 0.5)`;
                ctx.lineWidth = stroke.wid;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }

        // ── Grass blades at the very base for natural blending ──
        if (!lavenderGrass || Math.abs(lavenderLastW - w) > 50) {
            const num = isMobile ? 20 : 50;
            lavenderGrass = [];
            for (let i = 0; i < num; i++) {
                lavenderGrass.push({
                    x: Math.random() * (w + 20) - 10,
                    baseY: h * (0.94 + Math.random() * 0.05),
                    height: 6 + Math.random() * 18,
                    width: 0.7 + (i % 3) * 0.3,
                    hue: 85 + Math.random() * 30,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.15 + Math.random() * 0.15,
                    side: (Math.random() > 0.5) ? 1 : -1
                });
            }
            lavenderLastW = w;
        }

        for (const g of lavenderGrass) {
            const sway = Math.sin(time * g.speed + g.phase) * 2;
            ctx.beginPath();
            ctx.moveTo(g.x, g.baseY);
            ctx.quadraticCurveTo(
                g.x + sway * 0.3 + g.side * 3, g.baseY - g.height * 0.4,
                g.x + sway + g.side * 5, g.baseY - g.height
            );
            ctx.strokeStyle = `hsla(${g.hue}, 35%, 25%, 0.3)`;
            ctx.lineWidth = g.width;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // ── Small yellow wildflowers scattered among lavender (Van Gogh's stars-on-ground) ──
        if (!lavenderFlowers || Math.abs(lavenderLastW - w) > 50) {
            const num = isMobile ? 20 : 50;
            lavenderFlowers = [];
            for (let i = 0; i < num; i++) {
                const stalkIdx = Math.floor(Math.random() * (lavenderStalks ? lavenderStalks.length : 140));
                const stalk = lavenderStalks ? lavenderStalks[Math.min(stalkIdx, lavenderStalks.length - 1)] : null;
                // Position near a stalk or randomly in the field
                const x = stalk ? stalk.x + (Math.random() - 0.5) * 20 : Math.random() * w;
                const baseY = h * (0.85 + Math.random() * 0.12);
                const stalkRef = stalk || { swayPhase: Math.random() * 6.28, swaySpeed: 0.25 };
                lavenderFlowers.push({
                    x, baseY,
                    size: 1.5 + Math.random() * 2,
                    hue: 40 + Math.random() * 20,          // warm yellow-gold
                    sat: 75 + Math.random() * 15,
                    light: 55 + Math.random() * 20,
                    alpha: 0.35 + Math.random() * 0.3,
                    phase: Math.random() * Math.PI * 2,
                    // 3-4 tiny strokes forming a star-like flower
                    petals: 3 + (i % 2),
                    petalLen: 2 + Math.random() * 2.5,
                    swayPhase: stalkRef.swayPhase + (Math.random() - 0.5) * 0.5,
                    swaySpeed: stalkRef.swaySpeed * (0.8 + Math.random() * 0.4)
                });
            }

            // ── Pink wildflowers (sakura-inspired, scattered among lavender) ──
            const numPink = isMobile ? 10 : 28;
            pinkFlowers = [];
            for (let i = 0; i < numPink; i++) {
                const stalkIdx = Math.floor(Math.random() * (lavenderStalks ? lavenderStalks.length : 140));
                const stalk = lavenderStalks ? lavenderStalks[Math.min(stalkIdx, lavenderStalks.length - 1)] : null;
                const x = stalk ? stalk.x + (Math.random() - 0.5) * 25 : Math.random() * w;
                const baseY = h * (0.82 + Math.random() * 0.14);
                const stalkRef = stalk || { swayPhase: Math.random() * 6.28, swaySpeed: 0.25 };
                const numPetals = 3 + (i % 3); // 3-5 petals
                const petalData = [];
                for (let p = 0; p < numPetals; p++) {
                    petalData.push({
                        angOff: Math.random() * 0.3,
                        lenOff: 0.7 + Math.random() * 0.6,
                        wOff: 0.5 + Math.random() * 0.5,
                        hOff: (Math.random() - 0.5) * 8,
                        sOff: (Math.random() - 0.5) * 12,
                    });
                }
                pinkFlowers.push({
                    x, baseY,
                    size: 1.2 + Math.random() * 1.5,
                    hue: 330 + Math.random() * 20,          // pink sakura hues
                    sat: 65 + Math.random() * 20,
                    light: 62 + Math.random() * 18,
                    alpha: 0.45 + Math.random() * 0.3,
                    phase: Math.random() * Math.PI * 2,
                    numPetals,
                    petalData,
                    swayPhase: stalkRef.swayPhase + (Math.random() - 0.5) * 0.5,
                    swaySpeed: stalkRef.swaySpeed * (0.7 + Math.random() * 0.4)
                });
            }

            // ── 🤍 Cream-white wildflowers (soft contrast against purple lavender) ──
            const numCream = isMobile ? 6 : 16;
            creamFlowers = [];
            for (let i = 0; i < numCream; i++) {
                const stalkIdx = Math.floor(Math.random() * (lavenderStalks ? lavenderStalks.length : 140));
                const stalk = lavenderStalks ? lavenderStalks[Math.min(stalkIdx, lavenderStalks.length - 1)] : null;
                const x = stalk ? stalk.x + (Math.random() - 0.5) * 28 : Math.random() * w;
                const baseY = h * (0.83 + Math.random() * 0.14);
                const stalkRef = stalk || { swayPhase: Math.random() * 6.28, swaySpeed: 0.25 };
                creamFlowers.push({
                    x, baseY,
                    size: 1.6 + Math.random() * 1.5,
                    hue: 42 + Math.random() * 12,           // warm cream hue
                    sat: 12 + Math.random() * 18,            // very low saturation
                    light: 75 + Math.random() * 13,           // high lightness (cream/white)
                    alpha: 0.5 + Math.random() * 0.3,
                    phase: Math.random() * Math.PI * 2,
                    petals: 4 + (i % 3),                     // 4-6 petals (star/daisy shape)
                    petalLen: 1.5 + Math.random() * 2.5,
                    swayPhase: stalkRef.swayPhase + (Math.random() - 0.5) * 0.4,
                    swaySpeed: stalkRef.swaySpeed * (0.7 + Math.random() * 0.4)
                });
            }

            // ── 💧 Dew sparkles on lavender stems (tiny moonlight glints on leaves) ──
            const numDew = isMobile ? 20 : 48;
            lavenderDew = [];
            for (let i = 0; i < numDew; i++) {
                const stalkIdx = Math.floor(Math.random() * (lavenderStalks ? lavenderStalks.length : 140));
                const stalk = lavenderStalks ? lavenderStalks[Math.min(stalkIdx, lavenderStalks.length - 1)] : null;
                if (!stalk) continue;
                const t = 0.08 + Math.random() * 0.75; // position along stem (0=top, 1=base)
                const dewX = stalk.x + (Math.random() - 0.5) * 4;
                const dewY = stalk.baseY - stalk.height * t;
                lavenderDew.push({
                    x: dewX,
                    y: dewY,
                    size: 0.5 + Math.random() * 0.8,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.4 + Math.random() * 0.5,
                    hue: 46 + Math.random() * 14,        // golden-white (moonlight reflection)
                    sat: 18 + Math.random() * 22,
                    light: 78 + Math.random() * 18,
                    alpha: 0.3 + Math.random() * 0.35,
                    side: (Math.random() > 0.5) ? 1 : -1,
                });
            }
            lavenderLastW = w;
        }

        for (const f of lavenderFlowers) {
            const sway = Math.sin(time * f.swaySpeed + f.swayPhase) * 2;
            const fx = f.x + sway;
            const fy = f.baseY;
            const flowerGlow = (Math.sin(time * 0.3 + f.phase) * 0.15 + 0.85);

            // Soft glow around the flower
            const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.size * 4);
            glow.addColorStop(0, `hsla(${f.hue}, ${f.sat}%, ${f.light}%, ${f.alpha * 0.15 * flowerGlow})`);
            glow.addColorStop(1, `hsla(${f.hue}, ${f.sat}%, ${f.light}%, 0)`);
            ctx.fillStyle = glow;
            ctx.fillRect(fx - f.size * 4, fy - f.size * 4, f.size * 8, f.size * 8);

            // Petals as short Van Gogh brushstrokes
            for (let p = 0; p < f.petals; p++) {
                const a = (p / f.petals) * Math.PI * 2 + Math.sin(time * 0.05 + f.phase) * 0.08;
                const px = fx + Math.cos(a) * f.size * 0.4;
                const py = fy + Math.sin(a) * f.size * 0.4;
                const ex = fx + Math.cos(a) * (f.size * 0.4 + f.petalLen);
                const ey = fy + Math.sin(a) * (f.size * 0.4 + f.petalLen);

                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(ex, ey);
                ctx.strokeStyle = `hsla(${f.hue + p * 5}, ${f.sat}%, ${f.light + p * 3}%, ${f.alpha * flowerGlow})`;
                ctx.lineWidth = 1.2 + p * 0.3;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            // Bright center dot
            ctx.beginPath();
            ctx.arc(fx, fy, f.size * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${f.hue}, ${f.sat + 10}%, ${f.light + 10}%, ${f.alpha * 0.7 * flowerGlow})`;
            ctx.fill();

            // ✨ Moonlight sparkle on a petal tip (golden glint catching the moon)
            const sparkleA = Math.sin(time * 0.9 + f.phase) * 0.5 + 0.5;
            if (sparkleA > 0.5) {
                const sparkAngle = Math.sin(time * 0.05 + f.phase) * 0.5 + 0.6; // rightward petal (toward moon)
                const sx = fx + Math.cos(sparkAngle) * (f.size * 0.3 + f.petalLen * 0.8);
                const sy = fy + Math.sin(sparkAngle) * (f.size * 0.3 + f.petalLen * 0.8);
                const sIntensity = (sparkleA - 0.5) * 2;

                const sparkGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 3 + f.size * 0.3);
                sparkGlow.addColorStop(0, `hsla(50, 90%, 95%, ${0.4 * sIntensity})`);
                sparkGlow.addColorStop(0.3, `hsla(46, 80%, 85%, ${0.15 * sIntensity})`);
                sparkGlow.addColorStop(1, `hsla(46, 60%, 75%, 0)`);
                ctx.fillStyle = sparkGlow;
                ctx.fillRect(sx - 4, sy - 4, 8, 8);

                // Tiny bright core dot
                ctx.beginPath();
                ctx.arc(sx, sy, 0.5 + sIntensity * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(50, 100%, 98%, ${0.7 * sIntensity})`;
                ctx.fill();
            }

            // 🌿 Morning dew drops glistening on petals (giọt sương sớm long lanh)
            for (let d = 0; d < 2; d++) {
                const dewPetal = (Math.floor(f.phase * 5) + d * 2) % f.petals;
                const dewAngle = (dewPetal / f.petals) * Math.PI * 2 + Math.sin(time * 0.02 + f.phase + d) * 0.06 + 0.15;
                const dewDist = f.size * 0.3 + f.petalLen * (0.5 + d * 0.35);
                const dx = fx + Math.cos(dewAngle) * dewDist;
                const dy = fy + Math.sin(dewAngle) * dewDist;
                const dewR = 0.7 + d * 0.6;
                const dewGlint = Math.sin(time * 0.6 + f.phase + d * 1.8) * 0.3 + 0.7;

                // Dew drop body (transparent sphere with subtle shimmer)
                const dewGrad = ctx.createRadialGradient(dx - dewR * 0.2, dy - dewR * 0.2, 0, dx, dy, dewR);
                dewGrad.addColorStop(0, `hsla(50, 30%, 92%, ${0.06 * dewGlint})`);
                dewGrad.addColorStop(0.5, `hsla(50, 20%, 85%, ${0.12 * dewGlint})`);
                dewGrad.addColorStop(0.85, `hsla(50, 15%, 78%, ${0.08 * dewGlint})`);
                dewGrad.addColorStop(1, `hsla(50, 10%, 72%, 0)`);
                ctx.beginPath();
                ctx.arc(dx, dy, dewR, 0, Math.PI * 2);
                ctx.fillStyle = dewGrad;
                ctx.fill();

                // Rim light — ánh trăng hắt vào mép giọt nước
                const rimAngle = 0.5; // top-right (moon direction)
                const rimX = dx + Math.cos(rimAngle) * dewR * 0.55;
                const rimY = dy + Math.sin(rimAngle) * dewR * 0.55;
                ctx.beginPath();
                ctx.arc(rimX, rimY, dewR * 0.28, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(50, 60%, 95%, ${0.25 * dewGlint})`;
                ctx.fill();

                // Specular highlight — chấm trắng nhỏ đặc trưng của giọt nước
                ctx.beginPath();
                ctx.arc(dx - dewR * 0.2, dy - dewR * 0.25, dewR * 0.12, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(55, 80%, 99%, ${0.45 * dewGlint})`;
                ctx.fill();
            }
        }

        // ── 🌸 Pink wildflowers (delicate sakura-like blossoms in the field) ──
        if (pinkFlowers) {
            for (const f of pinkFlowers) {
                const sway = Math.sin(time * f.swaySpeed + f.swayPhase) * 1.8;
                const fx = f.x + sway;
                const fy = f.baseY;
                const flowerGlow = (Math.sin(time * 0.28 + f.phase) * 0.15 + 0.85);

                // Soft pink glow around the flower
                const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.size * 3.5);
                glow.addColorStop(0, `hsla(${f.hue}, ${f.sat}%, ${f.light}%, ${f.alpha * 0.12 * flowerGlow})`);
                glow.addColorStop(1, `hsla(${f.hue + 10}, ${f.sat - 10}%, ${f.light + 5}%, 0)`);
                ctx.fillStyle = glow;
                ctx.fillRect(fx - f.size * 3.5, fy - f.size * 3.5, f.size * 7, f.size * 7);

                // Petals as delicate brushstrokes
                for (let p = 0; p < f.numPetals; p++) {
                    const pd = f.petalData[p];
                    const baseAngle = (p / f.numPetals) * Math.PI * 2 + Math.sin(time * 0.04 + f.phase + pd.angOff * 0.5) * 0.06;
                    const petalLen = f.size * 0.3 + pd.lenOff * f.size * 0.5;
                    const petalW = 0.8 + pd.wOff * 0.6;

                    // Petal stroke (outward from center)
                    const px = fx + Math.cos(baseAngle) * f.size * 0.2;
                    const py = fy + Math.sin(baseAngle) * f.size * 0.2;
                    const ex = fx + Math.cos(baseAngle) * (f.size * 0.2 + petalLen);
                    const ey = fy + Math.sin(baseAngle) * (f.size * 0.2 + petalLen) + pd.hOff * 0.3;

                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(ex, ey);
                    ctx.strokeStyle = `hsla(${f.hue + pd.hOff}, ${f.sat + pd.sOff}%, ${f.light + p * 3}%, ${f.alpha * 0.7 * flowerGlow})`;
                    ctx.lineWidth = petalW;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Secondary tiny accent stroke (double petal line for sakura-like delicacy)
                    if (p % 2 === 0) {
                        const ax = px + Math.cos(baseAngle + 0.3) * 1.2;
                        const ay = py + Math.sin(baseAngle + 0.3) * 0.8;
                        ctx.beginPath();
                        ctx.moveTo(ax, ay);
                        ctx.lineTo(
                            ax + Math.cos(baseAngle) * petalLen * 0.5,
                            ay + Math.sin(baseAngle) * petalLen * 0.5 + pd.hOff * 0.2
                        );
                        ctx.strokeStyle = `hsla(${f.hue + pd.hOff + 5}, ${f.sat + pd.sOff - 8}%, ${f.light + 8}%, ${f.alpha * 0.3 * flowerGlow})`;
                        ctx.lineWidth = petalW * 0.5;
                        ctx.stroke();
                    }
                }

                // Bright pink center dot
                ctx.beginPath();
                ctx.arc(fx, fy, f.size * 0.22, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${f.hue + 5}, ${f.sat + 8}%, ${f.light + 10}%, ${f.alpha * 0.6 * flowerGlow})`;
                ctx.fill();

                // ✨ Moonlight sparkle on a pink petal tip (soft pink-white glint)
                const sparkleA = Math.sin(time * 1.0 + f.phase) * 0.5 + 0.5;
                if (sparkleA > 0.55) {
                    const sparkAngle = Math.sin(time * 0.04 + f.phase + 0.3) * 0.5 + 0.7;
                    const sx = fx + Math.cos(sparkAngle) * (f.size * 0.25 + f.size * 0.6);
                    const sy = fy + Math.sin(sparkAngle) * (f.size * 0.25 + f.size * 0.6);
                    const sIntensity = (sparkleA - 0.55) * 2.2;

                    const sparkGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 2.5 + f.size * 0.3);
                    sparkGlow.addColorStop(0, `hsla(345, 60%, 92%, ${0.35 * sIntensity})`);
                    sparkGlow.addColorStop(0.3, `hsla(340, 50%, 85%, ${0.12 * sIntensity})`);
                    sparkGlow.addColorStop(1, `hsla(340, 40%, 78%, 0)`);
                    ctx.fillStyle = sparkGlow;
                    ctx.fillRect(sx - 3.5, sy - 3.5, 7, 7);

                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.4 + sIntensity * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(350, 60%, 94%, ${0.6 * sIntensity})`;
                    ctx.fill();
                }

                // 🌿 Morning dew drops glistening on pink petals
                for (let d = 0; d < 2; d++) {
                    const dewPetal = (Math.floor(f.phase * 5) + d * 2) % f.numPetals;
                    const dewAngle = (dewPetal / f.numPetals) * Math.PI * 2 + Math.sin(time * 0.02 + f.phase + d) * 0.06 + 0.15;
                    const dewDist = f.size * 0.3 + f.size * 0.5 * (0.5 + d * 0.35);
                    const dx = fx + Math.cos(dewAngle) * dewDist;
                    const dy = fy + Math.sin(dewAngle) * dewDist;
                    const dewR = 0.7 + d * 0.6;
                    const dewGlint = Math.sin(time * 0.6 + f.phase + d * 1.8) * 0.3 + 0.7;

                    const dewGrad = ctx.createRadialGradient(dx - dewR * 0.2, dy - dewR * 0.2, 0, dx, dy, dewR);
                    dewGrad.addColorStop(0, `hsla(340, 20%, 90%, ${0.06 * dewGlint})`);
                    dewGrad.addColorStop(0.5, `hsla(340, 15%, 84%, ${0.12 * dewGlint})`);
                    dewGrad.addColorStop(0.85, `hsla(340, 10%, 78%, ${0.08 * dewGlint})`);
                    dewGrad.addColorStop(1, `hsla(340, 8%, 72%, 0)`);
                    ctx.beginPath();
                    ctx.arc(dx, dy, dewR, 0, Math.PI * 2);
                    ctx.fillStyle = dewGrad;
                    ctx.fill();

                    // Rim light — pink-white halo from moonlight
                    const rimAngle = 0.5;
                    const rimX = dx + Math.cos(rimAngle) * dewR * 0.55;
                    const rimY = dy + Math.sin(rimAngle) * dewR * 0.55;
                    ctx.beginPath();
                    ctx.arc(rimX, rimY, dewR * 0.28, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(350, 40%, 93%, ${0.25 * dewGlint})`;
                    ctx.fill();

                    // Specular highlight
                    ctx.beginPath();
                    ctx.arc(dx - dewR * 0.2, dy - dewR * 0.25, dewR * 0.12, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(355, 50%, 98%, ${0.45 * dewGlint})`;
                    ctx.fill();
                }
            }
        }

        // ── 🤍 Cream-white wildflowers (soft luminous contrast in moonlight) ──
        if (creamFlowers) {
            for (const f of creamFlowers) {
                const sway = Math.sin(time * f.swaySpeed + f.swayPhase) * 1.8;
                const fx = f.x + sway;
                const fy = f.baseY;
                const flowerGlow = (Math.sin(time * 0.25 + f.phase) * 0.12 + 0.88);

                // Soft warm glow (creamy moonlight reflection)
                const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.size * 3);
                glow.addColorStop(0, `hsla(${f.hue}, ${f.sat}%, ${f.light}%, ${f.alpha * 0.1 * flowerGlow})`);
                glow.addColorStop(1, `hsla(${f.hue + 5}, ${f.sat - 5}%, ${f.light + 5}%, 0)`);
                ctx.fillStyle = glow;
                ctx.fillRect(fx - f.size * 3, fy - f.size * 3, f.size * 6, f.size * 6);

                // Petals radiating outward (daisy-star shape)
                for (let p = 0; p < f.petals; p++) {
                    const a = (p / f.petals) * Math.PI * 2 + Math.sin(time * 0.04 + f.phase + p * 0.5) * 0.06;
                    const px = fx + Math.cos(a) * f.size * 0.25;
                    const py = fy + Math.sin(a) * f.size * 0.25;
                    const ex = fx + Math.cos(a) * (f.size * 0.25 + f.petalLen);
                    const ey = fy + Math.sin(a) * (f.size * 0.25 + f.petalLen);

                    // Main petal stroke
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(ex, ey);
                    ctx.strokeStyle = `hsla(${f.hue + p * 3}, ${f.sat + 5}%, ${f.light + p * 2}%, ${f.alpha * 0.75 * flowerGlow})`;
                    ctx.lineWidth = 1.1 + p * 0.2;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Secondary finer stroke (delicate petal edge)
                    if (p % 2 === 0) {
                        const aOff = a + 0.25;
                        ctx.beginPath();
                        ctx.moveTo(
                            px + Math.cos(aOff) * 0.8,
                            py + Math.sin(aOff) * 0.6
                        );
                        ctx.lineTo(
                            ex + Math.cos(aOff) * 0.8 * f.petalLen * 0.3,
                            ey + Math.sin(aOff) * 0.6 * f.petalLen * 0.3
                        );
                        ctx.strokeStyle = `hsla(${f.hue + 8}, ${f.sat + 8}%, ${f.light + 5}%, ${f.alpha * 0.3 * flowerGlow})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }

                // Creamy center dot
                ctx.beginPath();
                ctx.arc(fx, fy, f.size * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${f.hue + 5}, ${f.sat + 15}%, ${f.light + 8}%, ${f.alpha * 0.7 * flowerGlow})`;
                ctx.fill();

                // Tiny white highlight at center
                ctx.beginPath();
                ctx.arc(fx - 0.3, fy - 0.3, f.size * 0.08, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(50, 20%, 98%, ${f.alpha * 0.3 * flowerGlow})`;
                ctx.fill();

                // ✨ Moonlight sparkle on cream petal tip (bright white-glint)
                const sparkleA = Math.sin(time * 0.85 + f.phase) * 0.5 + 0.5;
                if (sparkleA > 0.5) {
                    const sparkAngle = Math.sin(time * 0.06 + f.phase + 0.5) * 0.4 + 0.65;
                    const sx = fx + Math.cos(sparkAngle) * (f.size * 0.25 + f.petalLen * 0.7);
                    const sy = fy + Math.sin(sparkAngle) * (f.size * 0.25 + f.petalLen * 0.7);
                    const sIntensity = (sparkleA - 0.5) * 2;

                    const sparkGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 3 + f.size * 0.3);
                    sparkGlow.addColorStop(0, `hsla(55, 30%, 99%, ${0.45 * sIntensity})`);
                    sparkGlow.addColorStop(0.3, `hsla(50, 25%, 90%, ${0.18 * sIntensity})`);
                    sparkGlow.addColorStop(1, `hsla(50, 20%, 82%, 0)`);
                    ctx.fillStyle = sparkGlow;
                    ctx.fillRect(sx - 4, sy - 4, 8, 8);

                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.5 + sIntensity * 0.6, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(55, 30%, 100%, ${0.8 * sIntensity})`;
                    ctx.fill();
                }

                // 🌿 Morning dew drops on cream petals (giọt sương long lanh trên hoa trắng)
                for (let d = 0; d < 2; d++) {
                    const dewPetal = (Math.floor(f.phase * 5) + d * 2) % f.petals;
                    const dewAngle = (dewPetal / f.petals) * Math.PI * 2 + Math.sin(time * 0.02 + f.phase + d) * 0.06 + 0.15;
                    const dewDist = f.size * 0.25 + f.petalLen * (0.5 + d * 0.35);
                    const dx = fx + Math.cos(dewAngle) * dewDist;
                    const dy = fy + Math.sin(dewAngle) * dewDist;
                    const dewR = 0.7 + d * 0.6;
                    const dewGlint = Math.sin(time * 0.6 + f.phase + d * 1.8) * 0.3 + 0.7;

                    const dewGrad = ctx.createRadialGradient(dx - dewR * 0.2, dy - dewR * 0.2, 0, dx, dy, dewR);
                    dewGrad.addColorStop(0, `hsla(50, 15%, 95%, ${0.06 * dewGlint})`);
                    dewGrad.addColorStop(0.5, `hsla(50, 10%, 90%, ${0.12 * dewGlint})`);
                    dewGrad.addColorStop(0.85, `hsla(50, 8%, 85%, ${0.08 * dewGlint})`);
                    dewGrad.addColorStop(1, `hsla(50, 5%, 80%, 0)`);
                    ctx.beginPath();
                    ctx.arc(dx, dy, dewR, 0, Math.PI * 2);
                    ctx.fillStyle = dewGrad;
                    ctx.fill();

                    // Rim light — bright white edge from moonlight
                    const rimAngle = 0.5;
                    const rimX = dx + Math.cos(rimAngle) * dewR * 0.55;
                    const rimY = dy + Math.sin(rimAngle) * dewR * 0.55;
                    ctx.beginPath();
                    ctx.arc(rimX, rimY, dewR * 0.28, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(55, 25%, 97%, ${0.25 * dewGlint})`;
                    ctx.fill();

                    // Specular highlight
                    ctx.beginPath();
                    ctx.arc(dx - dewR * 0.2, dy - dewR * 0.25, dewR * 0.12, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(55, 30%, 100%, ${0.45 * dewGlint})`;
                    ctx.fill();
                }
            }
        }

        // ── 💧 Dew sparkles on lavender stems (tiny moonlight glints on leaves/stems) ──
        if (lavenderDew) {
            for (const d of lavenderDew) {
                const twinkle = Math.sin(time * d.speed + d.phase) * 0.4 + 0.6;
                const dAlpha = d.alpha * twinkle;

                // Tiny radial glow
                const dGlow = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size * 2.5);
                dGlow.addColorStop(0, `hsla(${d.hue}, ${d.sat}%, ${d.light}%, ${dAlpha * 0.2})`);
                dGlow.addColorStop(0.4, `hsla(${d.hue + 5}, ${d.sat - 5}%, ${d.light + 5}%, ${dAlpha * 0.06})`);
                dGlow.addColorStop(1, `hsla(${d.hue + 10}, ${d.sat - 10}%, ${d.light + 8}%, 0)`);
                ctx.fillStyle = dGlow;
                ctx.fillRect(d.x - d.size * 2.5, d.y - d.size * 2.5, d.size * 5, d.size * 5);

                // Bright core dot (moonlight catching the dew)
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.size * 0.35, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${d.hue + 8}, ${d.sat + 10}%, ${d.light + 10}%, ${dAlpha * 0.55})`;
                ctx.fill();

                // Specular highlight (tiny bright spot, signature of a water droplet)
                const highlightAngle = 0.4; // top-right (moon direction)
                const hlx = d.x + Math.cos(highlightAngle) * d.size * 0.25;
                const hly = d.y + Math.sin(highlightAngle) * d.size * 0.25;
                ctx.beginPath();
                ctx.arc(hlx, hly, d.size * 0.12, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${d.hue + 12}, 40%, 100%, ${dAlpha * 0.5})`;
                ctx.fill();
            }
        }

        ctx.restore();

        // === 🌾 WIND WAVES ACROSS LAVENDER FIELD (Van Gogh's gusting wind) ===
        ctx.save();
        const numWindWaves = isMobile ? 6 : 14;
        const windTime = time * 0.4;

        for (let i = 0; i < numWindWaves; i++) {
            // Each wave sweeps across the field with its own speed and position
            const basePhase = i / numWindWaves;
            const waveSpeed = 0.08 + (i % 3) * 0.035;
            const waveX = ((windTime * waveSpeed + basePhase) % 1) * (w + 80) - 40;
            const waveY = h * (0.78 + Math.sin(i * 1.7 + time * 0.06) * 0.06);

            // Wave amplitude and spread
            const ampY = 8 + (i % 4) * 6;
            const spreadX = 50 + (i % 3) * 20;

            ctx.beginPath();
            // Flowing S-curve: start from one side, arc across, fade out
            const startX = waveX - spreadX * 0.5;
            const startY = waveY + Math.sin(windTime * 0.3 + i * 0.5) * ampY * 0.3;
            const midX = waveX;
            const midY = waveY + Math.sin(windTime * 0.5 + i * 1.2) * ampY;
            const endX = waveX + spreadX * 0.5;
            const endY = waveY + Math.sin(windTime * 0.7 + i * 2.0 + 1.5) * ampY * 0.5;

            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(
                (startX + midX) * 0.5, (startY + midY) * 0.5 + Math.sin(time * 0.08 + i * 0.9) * 3,
                midX, midY
            );
            ctx.quadraticCurveTo(
                (midX + endX) * 0.5, (midY + endY) * 0.5 + Math.sin(time * 0.1 + i * 1.5) * 2,
                endX, endY
            );

            // Wind wave alpha: peaks in center, fades at edges
            const waveAlpha = 0.08 + (i % 5) * 0.025;
            const windHue = (i % 2 === 0) ? 42 + (i % 4) * 6 : 338 + (i % 3) * 10;  // gold/pink xen kẽ
            const windSat = 40 + (i % 3) * 15;
            const windLight = 55 + (i % 5) * 8;
            ctx.strokeStyle = `hsla(${windHue}, ${windSat}%, ${windLight}%, ${waveAlpha})`;
            ctx.lineWidth = 1.2 + (i % 3) * 0.8;
            ctx.lineCap = 'round';
            ctx.stroke();

            // ── Second thinner accent stroke slightly offset (Van Gogh's layered strokes) ──
            if (i % 2 === 0) {
                const offX = Math.sin(i * 1.3) * 4;
                const offY = Math.cos(i * 2.1) * 3;
                ctx.beginPath();
                ctx.moveTo(startX + offX, startY + offY);
                ctx.quadraticCurveTo(
                    (startX + midX) * 0.5 + offX, (startY + midY) * 0.5 + offY + 1,
                    midX + offX, midY + offY
                );
                ctx.quadraticCurveTo(
                    (midX + endX) * 0.5 + offX, (midY + endY) * 0.5 + offY,
                    endX + offX, endY + offY
                );
                ctx.strokeStyle = `hsla(${windHue + 10}, ${windSat - 10}%, ${windLight + 5}%, ${waveAlpha * 0.5})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        // ── Companion wind wisps (fainter, wider waves between the main ones) ──
        const numWisps = isMobile ? 4 : 10;
        for (let i = 0; i < numWisps; i++) {
            const basePhase = i / numWisps + 0.3;
            const wispSpeed = 0.06 + (i % 2) * 0.04;
            const wx = ((windTime * wispSpeed + basePhase) % 1) * (w + 60) - 30;
            const wy = h * (0.81 + Math.sin(i * 2.3 + time * 0.04) * 0.04);
            const wAmp = 5 + (i % 3) * 4;
            const wSpread = 30 + (i % 2) * 15;

            ctx.beginPath();
            ctx.moveTo(wx - wSpread * 0.5, wy + Math.sin(time * 0.2 + i) * wAmp * 0.2);
            ctx.quadraticCurveTo(
                wx, wy + Math.sin(time * 0.3 + i * 1.1) * wAmp,
                wx + wSpread * 0.5, wy + Math.sin(time * 0.4 + i * 2.2) * wAmp * 0.3
            );
            ctx.strokeStyle = `hsla(195, 30%, 50%, ${0.03 + (i % 3) * 0.015})`; // cool blue-teal wisps
            ctx.lineWidth = 0.6 + (i % 2) * 0.4;
            ctx.stroke();
        }

        ctx.restore();

        // === 🌙 MOONLIGHT WASH OVER LAVENDER FIELD (cached, pulse via globalAlpha) ===
        const moonWashPhase = Math.sin(time * 0.1) * 0.35 + 0.65;
        ctx.save();
        if (!cachedGradients.moonlightWash) {
            const washGlow = ctx.createRadialGradient(
                w * 0.75, h * 0.15, 0,       // from moon area (top-right)
                w * 0.4, h * 0.85, w * 0.55  // spreading toward bottom-left
            );
            washGlow.addColorStop(0, 'hsla(46, 50%, 72%, 0.10)');
            washGlow.addColorStop(0.2, 'hsla(46, 42%, 65%, 0.070)');      // 0.10 * 0.7
            washGlow.addColorStop(0.4, 'hsla(350, 35%, 58%, 0.040)');     // 0.10 * 0.4
            washGlow.addColorStop(0.65, 'hsla(340, 30%, 55%, 0.015)');    // 0.10 * 0.15
            washGlow.addColorStop(1, 'hsla(330, 25%, 50%, 0)');
            cachedGradients.moonlightWash = washGlow;
        }
        ctx.globalAlpha = moonWashPhase; // pulse the entire wash layer
        ctx.fillStyle = cachedGradients.moonlightWash;
        ctx.fillRect(0, h * 0.65, w, h * 0.35);
        ctx.restore();

        // === 🌅 EXPANDED DAWN MIST (Sương sớm bao phủ đồi — warm mist over hills) ===
        if (sunVisibility > 0.01) {
            const dawnMistLayers = isMobile ? 2 : 3;
            for (let i = 0; i < dawnMistLayers; i++) {
                const mistY = h * (0.68 + i * 0.05);
                ctx.beginPath();
                ctx.moveTo(0, h);
                const segments = 80;
                for (let s = 0; s <= segments; s++) {
                    const x = (s / segments) * w;
                    const wave = Math.sin(x * 0.0025 + time * 0.05 + i * 1.3) * 22
                               + Math.sin(x * 0.006 + time * 0.035 + i * 2.8) * 10;
                    const y = mistY + wave;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                const mistFade = Math.pow(Math.max(0, 1 - sunVisibility), 0.6);
                const mistAlpha = (0.35 - i * 0.10) * mistFade;
                const grad = ctx.createLinearGradient(0, mistY - 15, 0, h);
                const pulse = Math.sin(time * 0.03 + i * 1.1) * 0.12 + 0.88;
                grad.addColorStop(0, `hsla(28, 50%, 52%, ${0.020 * mistAlpha * pulse})`);
                grad.addColorStop(0.25, `hsla(32, 55%, 55%, ${0.040 * mistAlpha * pulse})`);
                grad.addColorStop(0.5, `hsla(35, 45%, 50%, ${0.035 * mistAlpha * pulse})`);
                grad.addColorStop(0.75, `hsla(38, 35%, 46%, ${0.025 * mistAlpha * pulse})`);
                grad.addColorStop(1, `hsla(40, 25%, 42%, ${0.015 * mistAlpha * pulse})`);
                ctx.fillStyle = grad;
                ctx.fill();
            }
        }

        // === 12. ✨ FIREFLIES (đom đóm trên cánh đồng lavender) ===
        // Initialize on first draw or on significant resize
        if (!fireflies) {
            const num = isMobile ? 12 : 30;
            fireflies = [];
            for (let i = 0; i < num; i++) {
                fireflies.push({
                    x: Math.random() * w,
                    y: h * (0.50 + Math.random() * 0.38),  // 50-88% height
                    tx: Math.random() * w,
                    ty: h * (0.50 + Math.random() * 0.38),
                    size: 1.5 + Math.random() * 2,
                    hue: 45 + Math.random() * 10,          // pure golden yellow (Starry Night palette)
                    speed: 0.15 + Math.random() * 0.2,
                    pulseSpeed: 0.8 + Math.random() * 1.2,
                    pulsePhase: Math.random() * Math.PI * 2,
                    floatPhase: Math.random() * Math.PI * 2,
                    floatAmp: 3 + Math.random() * 5
                });
            }
        }

        ctx.save();

        // Update & render fireflies
        for (const f of fireflies) {
            // ── Wander toward target ──
            const dx = f.tx - f.x;
            const dy = f.ty - f.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 5) {
                // Pick new target within the lower-middle area
                f.tx = Math.random() * w;
                f.ty = h * (0.50 + Math.random() * 0.38);
            } else {
                f.x += (dx / dist) * f.speed;
                f.y += (dy / dist) * f.speed;
            }

            // ── Gentle float oscillation ──
            const floatOff = Math.sin(time * 0.5 + f.floatPhase) * f.floatAmp;

            // ── Glow pulse ──
            const pulse = Math.sin(time * f.pulseSpeed + f.pulsePhase) * 0.35 + 0.65;
            const glowRadius = f.size * (3 + pulse * 2);
            const glowAlpha = 0.15 * pulse;

            const fx = f.x;
            const fy = f.y + floatOff;

            // Soft glow
            const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowRadius);
            glow.addColorStop(0, `hsla(${f.hue}, 85%, 75%, ${glowAlpha})`);
            glow.addColorStop(0.4, `hsla(${f.hue + 10}, 80%, 65%, ${glowAlpha * 0.4})`);
            glow.addColorStop(1, `hsla(${f.hue + 20}, 70%, 55%, 0)`);
            ctx.fillStyle = glow;
            ctx.fillRect(fx - glowRadius, fy - glowRadius, glowRadius * 2, glowRadius * 2);

            // Bright body
            const bodyAlpha = 0.5 + pulse * 0.5;
            ctx.beginPath();
            ctx.arc(fx, fy, f.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${f.hue}, 90%, 85%, ${bodyAlpha})`;
            ctx.fill();

            // Bright core
            ctx.beginPath();
            ctx.arc(fx, fy, f.size * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${f.hue}, 90%, 95%, ${bodyAlpha * 0.8})`;
            ctx.fill();
        }

        ctx.restore();

        // ── 🕊️ FOREGROUND BIRDS (In front of village, close to viewer) ──
        if (sunVisibility > 0.05) {
            if (!birdsForeground || Math.abs(lavenderLastW - w) > 50) {
                const numBirds = isMobile ? 3 : 8;
                birdsForeground = [];
                for (let i = 0; i < numBirds; i++) {
                    birdsForeground.push({
                        x: Math.random() * (w + 100) - 50,
                        y: h * (0.15 + Math.random() * 0.20),  // lower than sky birds
                        size: 6 + Math.random() * 5,             // larger = closer
                        speed: 0.5 + Math.random() * 0.6,        // faster
                        wingFreq: 4 + Math.random() * 4,
                        wingPhase: Math.random() * Math.PI * 2,
                        bobPhase: Math.random() * Math.PI * 2,
                        bobAmp: 3 + Math.random() * 5,
                        dir: Math.random() > 0.5 ? 1 : -1,
                    });
                }
            }
            for (const b of birdsForeground) {
                // ── Movement ──
                b.x += b.speed * b.dir;
                if (b.dir > 0 && b.x > w + 60) b.x = -60;
                if (b.dir < 0 && b.x < -60) b.x = w + 60;

                const bob = Math.sin(time * 0.25 + b.bobPhase) * b.bobAmp;
                const by = b.y + bob;
                const wing = Math.sin(time * b.wingFreq + b.wingPhase);
                const wingUp = Math.abs(wing) * b.size * 0.5;
                const birdAlpha = 0.30 + sunVisibility * 0.40;  // more visible
                const bodyLen = b.size * 0.55;

                // Shadow (slightly offset, dark)
                ctx.beginPath();
                ctx.moveTo(b.x - bodyLen + 1, by + 2);
                ctx.lineTo(b.x + bodyLen + 1, by + 2);
                ctx.strokeStyle = `hsla(25, 10%, 3%, ${birdAlpha * 0.3})`;
                ctx.lineWidth = 1.0 + birdAlpha * 0.8;
                ctx.stroke();

                // Main body
                ctx.beginPath();
                ctx.moveTo(b.x - bodyLen, by);
                ctx.lineTo(b.x + bodyLen, by);

                ctx.moveTo(b.x, by);
                ctx.lineTo(b.x - b.size * 0.45, by - wingUp);

                ctx.moveTo(b.x, by);
                ctx.lineTo(b.x + b.size * 0.45, by - wingUp);

                ctx.strokeStyle = `hsla(25, 15%, 10%, ${birdAlpha})`;
                ctx.lineWidth = 1.0 + birdAlpha * 0.8;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }

        requestAnimationFrame(draw);
    }
    draw();

    // Handle window resize for moon position
    window.addEventListener('resize', () => {
        moonX = w * 0.82;
        moonY = h * 0.12;
    });
}
