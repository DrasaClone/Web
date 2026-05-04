window.addEventListener('firebase-ready', () => {
    const { auth, db, ref, onValue, push, set } = window.fb;
    const FB_ROOT = 'schweb_v2/class_2026';

    const getThumb = (url) => {
        if (!url || !url.includes('cloudinary')) return url;
        return url.replace('/upload/', '/upload/w_400,c_fill,g_auto,q_auto,f_auto,r_12/');
    };

    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) setTimeout(() => loadingScreen.classList.add('is-hidden'), 1500);

    onValue(ref(db, `${FB_ROOT}/members`), (snapshot) => {
        const data = snapshot.val();
        const grid = document.getElementById('members-grid');
        if (!grid) return;
        grid.innerHTML = '';
        if (data) {
            Object.values(data).forEach((student, i) => {
                const card = document.createElement('div');
                card.className = 'polaroid-card member-card';
                card.innerHTML = `
                    <div class="polaroid-inner">
                        <div class="polaroid-front">
                            <div class="washi-tape"></div>
                            <div class="card-img-box"><img src="${getThumb(student.avatar)}" class="card-img" loading="lazy"></div>
                            <h3 class="card-name-indie" style="margin-top: 15px; font-family: var(--font-display);">${student.name}</h3>
                            <div class="handwritten" style="color: var(--tertiary); font-size: 1.1rem; margin-top: 5px;">#${student.personality?.[0] || 'BanCung'}</div>
                        </div>
                        <div class="polaroid-back" style="overflow: hidden;">
                            <div class="paper-clip"></div>
                            <h3 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 5px; color: var(--primary);">${student.name}</h3>
                            <p class="handwritten" style="font-size: 1rem; color: var(--secondary); text-align: center; line-height: 1.2;">"${student.secretMemory}"</p>
                            <div class="comment-section" id="comments-${student.id}"></div>
                            <div class="comment-input-box">
                                <input type="text" placeholder="Để lại lời nhắn..." id="input-${student.id}">
                                <button onclick="postComment('${student.id}')"><i data-lucide="send" size="14"></i></button>
                            </div>
                        </div>
                    </div>`;
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.comment-input-box')) card.classList.toggle('is-flipped');
                });
                grid.appendChild(card);
            });
            lucide.createIcons();
        }
    });

    window.postComment = (studentId) => {
        const input = document.getElementById(`input-${studentId}`);
        if (input.value.trim()) {
            push(ref(db, `${FB_ROOT}/members/${studentId}/comments`), { text: input.value, timestamp: Date.now() });
            input.value = '';
        }
    };

    onValue(ref(db, `${FB_ROOT}/members`), (snapshot) => {
        const members = snapshot.val();
        if(!members) return;
        Object.values(members).forEach(m => {
            const container = document.getElementById(`comments-${m.id}`);
            if(!container) return;
            container.innerHTML = '';
            if(m.comments) {
                Object.values(m.comments).forEach(c => {
                    const el = document.createElement('div');
                    el.className = 'mini-comment';
                    el.innerText = c.text;
                    container.appendChild(el);
                });
            }
        });
    });

    const corkboard = document.getElementById('wishes-container');
    onValue(ref(db, `${FB_ROOT}/wishes`), (snapshot) => {
        const data = snapshot.val();
        if (!corkboard) return;
        document.querySelectorAll('.sticky-note').forEach(n => n.remove());
        if (data) {
            Object.values(data).forEach((wish, index) => {
                const note = document.createElement('div');
                note.className = 'sticky-note';
                note.innerText = wish.text;
                note.style.left = `calc(${(index % 4) * 25}% + ${Math.random() * 5}%)`;
                note.style.top = `${(Math.floor(index / 4) * 150) % 350 + Math.random() * 50}px`;
                note.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
                corkboard.appendChild(note);
                Draggable.create(note, { bounds: corkboard, edgeResistance: 0.8 });
            });
        }
    });

    onValue(ref(db, `${FB_ROOT}/stickers`), (snapshot) => {
        const data = snapshot.val();
        if (!corkboard) return;
        document.querySelectorAll('.placed-sticker').forEach(s => s.remove());
        if (data) {
            Object.entries(data).forEach(([key, s]) => {
                const el = document.createElement('div');
                el.className = 'placed-sticker';
                el.innerText = s.type;
                el.style.left = s.x + 'px';
                el.style.top = s.y + 'px';
                corkboard.appendChild(el);
            });
        }
    });

    document.getElementById('send-wish').addEventListener('click', () => {
        const input = document.getElementById('wish-input');
        if (input.value.trim()) {
            push(ref(db, `${FB_ROOT}/wishes`), { text: input.value, timestamp: Date.now() });
            input.value = '';
        }
    });

    const stickerTray = document.getElementById('sticker-tray');
    const stickerHandle = document.getElementById('sticker-handle');
    if (stickerHandle) stickerHandle.addEventListener('click', () => stickerTray.classList.toggle('is-open'));

    // Easter Egg: Confetti on Title Click
    const mainTitle = document.getElementById('main-title-trigger');
    if (mainTitle) {
        mainTitle.addEventListener('click', () => {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3A2747', '#9E82B5', '#FF8AB8', '#F2C94C', '#6FCF97']
            });
        });
    }

    document.querySelectorAll('.sticker-item').forEach(item => {
        Draggable.create(item, {
            type: "x,y",
            onPress: function() {
                // Tạo một bản sao nổi để kéo
                this.clone = this.target.cloneNode(true);
                this.clone.style.position = 'fixed';
                this.clone.style.pointerEvents = 'none'; 
                const rect = this.target.getBoundingClientRect();
                this.clone.style.left = rect.left + 'px';
                this.clone.style.top = rect.top + 'px';
                this.clone.style.zIndex = 3000;
                this.clone.style.margin = '0';
                document.body.appendChild(this.clone);
                gsap.set(this.clone, { scale: 1.2 });
            },
            onDrag: function() {
                // Cập nhật vị trí bản sao theo con trỏ
                if (this.clone) {
                    gsap.set(this.clone, { 
                        left: this.pointerX - 20, 
                        top: this.pointerY - 20 
                    });
                }
            },
            onDragEnd: function() {
                if (this.clone) {
                    const crect = corkboard.getBoundingClientRect();
                    const x = this.pointerX;
                    const y = this.pointerY;
                    
                    // Kiểm tra nếu nhả chuột trong phạm vi bảng tin
                    if (x > crect.left && x < crect.right && y > crect.top && y < crect.bottom) {
                        push(ref(db, `${FB_ROOT}/stickers`), { 
                            type: this.clone.innerText, 
                            x: x - crect.left - 20, 
                            y: y - crect.top - 20, 
                            timestamp: Date.now() 
                        });
                        
                        // Hiệu ứng pháo hoa nhỏ khi dán
                        confetti({
                            particleCount: 20,
                            spread: 30,
                            origin: { x: x / window.innerWidth, y: y / window.innerHeight },
                            colors: ['#FF8AB8', '#F2C94C']
                        });
                    }
                    this.clone.remove();
                    this.clone = null;
                }
                // Trả sticker gốc về vị trí cũ trong khay
                gsap.set(this.target, { x: 0, y: 0 });
            }
        });
    });

    window.setVibe = (vibe) => {
        document.documentElement.setAttribute('data-vibe', vibe);
        localStorage.setItem('schweb_vibe', vibe);
    };
    const savedVibe = localStorage.getItem('schweb_vibe');
    if(savedVibe) setVibe(savedVibe);


    const audio = document.getElementById('bg-audio');
    const disc = document.getElementById('vinyl-disc');
    const musicBtn = document.getElementById('toggle-music');
    const musicStatus = document.getElementById('music-status');
    const musicIcon = document.getElementById('music-icon-ui');
    let isPlaying = false;
    audio.volume = 0.3;
    musicBtn.addEventListener('click', async () => {
        if (isPlaying) {
            audio.pause();
            disc.style.animationPlayState = 'paused';
            musicIcon.setAttribute('data-lucide', 'play');
            musicStatus.innerText = "Đã tạm dừng";
            isPlaying = false;
        } else {
            musicStatus.innerText = "Đang tải...";
            try {
                await audio.play();
                disc.style.animationPlayState = 'running';
                musicIcon.setAttribute('data-lucide', 'pause');
                musicStatus.innerText = "Đang phát...";
                isPlaying = true;
            } catch (err) { musicStatus.innerText = "Lỗi phát nhạc"; }
        }
        lucide.createIcons();
    });

    const sakuraContainer = document.getElementById('sakura-container');
    if (sakuraContainer) {
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.innerHTML = '🌸';
            p.style.cssText = `position:fixed; top:-50px; left:${Math.random()*100}vw; font-size:${Math.random()*20+15}px; opacity:0.3; pointer-events:none; z-index:0;`;
            sakuraContainer.appendChild(p);
            gsap.to(p, { y: '110vh', x: '+=150', rotation: 360, duration: 8 + Math.random() * 5, repeat: -1, delay: Math.random() * 5, ease: 'none' });
        }
    }
});