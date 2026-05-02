window.addEventListener('firebase-ready', () => {
    const { auth, db, ref, onValue, push } = window.fb;

    // --- 1. CLOUDINARY OPTIMIZATION HELPER ---
    // Thuật toán nén ảnh: W_400 (rộng 400px), q_auto (chất lượng tự động), f_auto (định dạng tự động), r_32 (bo tròn)
    const getThumb = (url) => {
        if (!url || !url.includes('cloudinary')) return url;
        return url.replace('/upload/', '/upload/w_400,c_fill,g_auto,q_auto,f_auto,r_32/');
    };

    // --- 2. XỬ LÝ DANH SÁCH THÀNH VIÊN (POLAROID STYLE) ---
    onValue(ref(db, 'class_2026/members'), (snapshot) => {
        const data = snapshot.val();
        const grid = document.getElementById('members-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        if (data) {
            Object.values(data).forEach((student, i) => {
                const card = document.createElement('div');
                card.className = 'polaroid-card member-card';
                card.setAttribute('data-tilt', ''); // Kích hoạt Vanilla-tilt
                
                card.innerHTML = `
                    <div class="washi-tape"></div>
                    <div class="card-img-box">
                        <img src="${getThumb(student.avatar)}" class="card-img" loading="lazy">
                    </div>
                    <h3 class="card-name-indie" style="font-family: var(--font-title);">${student.name}</h3>
                    <div class="handwritten" style="text-align: center; color: var(--sakura-pink); font-size: 0.9rem;">
                        #${student.personality?.[0] || 'BanCung'}
                    </div>
                `;
                
                card.addEventListener('click', () => showDetail(student));
                grid.appendChild(card);
                
                // GSAP ScrollTrigger: Thẻ bay vào với góc xoay ngẫu nhiên
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 90%",
                        toggleActions: "play none none reverse"
                    },
                    y: 100,
                    x: i % 2 === 0 ? -50 : 50,
                    rotation: gsap.utils.random(-15, 15),
                    opacity: 0,
                    duration: 1.2,
                    ease: "back.out(1.7)"
                });
            });
            
            // Khởi tạo Vanilla-tilt cho các thẻ mới
            VanillaTilt.init(document.querySelectorAll(".member-card"), {
                max: 15,
                speed: 400,
                glare: true,
                "max-glare": 0.3,
            });
        }
    });

    // --- 3. BẢNG GHIM NGUYỆN ƯỚC (DRAGGABLE) ---
    onValue(ref(db, 'class_2026/wishes'), (snapshot) => {
        const data = snapshot.val();
        const container = document.getElementById('wishes-container');
        if (!container) return;
        container.innerHTML = '';
        
        if (data) {
            Object.values(data).forEach(wish => {
                const note = document.createElement('div');
                note.className = 'sticky-note';
                note.innerText = wish.text;
                
                // Vị trí ngẫu nhiên trên bảng bần
                const left = Math.random() * (container.offsetWidth - 220);
                const top = Math.random() * (container.offsetHeight - 170);
                
                note.style.left = left + 'px';
                note.style.top = top + 'px';
                note.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
                
                container.appendChild(note);
                
                // GSAP Draggable: Kéo thả tờ giấy note
                Draggable.create(note, {
                    bounds: container,
                    edgeResistance: 0.65,
                    type: "x,y",
                    onDragStart: function() { gsap.to(this.target, { scale: 1.1, boxShadow: "10px 20px 30px rgba(0,0,0,0.2)" }); },
                    onDragEnd: function() { gsap.to(this.target, { scale: 1, boxShadow: "5px 5px 15px rgba(0,0,0,0.1)" }); }
                });
            });
        }
    });

    document.getElementById('send-wish').addEventListener('click', () => {
        const input = document.getElementById('wish-input');
        if (input.value.trim()) {
            push(ref(db, 'class_2026/wishes'), { text: input.value, timestamp: Date.now() });
            input.value = '';
        }
    });

    // --- 4. MODAL CHI TIẾT (PREMIUM DESIGN) ---
    function showDetail(student) {
        const modal = document.getElementById('detail-modal');
        const target = document.getElementById('detail-content-target');
        
        // Sử dụng Avatar làm ảnh bìa mờ (Nếu không có Cover riêng)
        const coverImg = student.avatar; 

        target.innerHTML = `
            <div class="profile-cover" style="background-image: url('${coverImg}')">
                <div class="profile-cover-overlay"></div>
                <button class="close-modal" style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.2); border: none; border-radius: 50%; padding: 8px; cursor: pointer; color: white; z-index: 100;">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div style="display: flex; flex-wrap: wrap;">
                <img src="${student.avatar}" class="profile-avatar-large">
                <div class="modal-right" style="flex: 1; padding: 40px;">
                    <h2 style="font-family: var(--font-display); font-size: 3.5rem; color: var(--primary);">${student.name}</h2>
                    <div style="display: flex; gap: 10px; margin: 20px 0;">
                        ${student.personality?.map(p => `<span style="padding: 5px 15px; background: var(--neutral); border-radius: 20px; font-size: 0.85rem; font-weight: 700; color: var(--primary); border: 1px solid var(--secondary);">#${p}</span>`).join('')}
                    </div>
                    <div style="margin-top: 30px;">
                        <div style="font-size: 0.7rem; font-weight: 800; letter-spacing: 3px; color: var(--tertiary); margin-bottom: 15px;">DẤU ẤN RỰC RỠ</div>
                        <ul style="list-style: none; padding: 0;">
                            ${student.achievements?.map(a => `<li style="margin-bottom: 10px; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; color: var(--primary);"><div style="width:6px; height:6px; background:var(--tertiary); border-radius:50%;"></div> ${a}</li>`).join('')}
                        </ul>
                    </div>
                    <div style="margin-top: 40px; padding: 30px; background: var(--neutral); border-radius: var(--radius-md); border: 2px dashed var(--secondary); position: relative;">
                        <i data-lucide="quote" style="position: absolute; top: 10px; left: 15px; opacity: 0.1; width: 40px; height: 40px; color: var(--primary);"></i>
                        <p class="handwritten" style="font-size: 2rem; color: var(--primary); text-align: center;">"${student.quote}"</p>
                        <p class="secret-text" style="font-size: 0.9rem; font-style: italic; color: var(--secondary); margin-top: 20px; text-align: center; border-top: 1px solid var(--secondary); padding-top: 15px;">
                            Kỷ niệm riêng: <span style="filter: blur(4px); transition: filter 0.3s; cursor: pointer;" onmouseover="this.style.filter='blur(0)'" onmouseout="this.style.filter='blur(4px)'">${student.secretMemory}</span>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        lucide.createIcons();
        gsap.from(".profile-modal-content", { y: 50, opacity: 0, duration: 0.6, ease: "power3.out" });
        
        target.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // --- 5. VINYL MUSIC PLAYER ---
    const audio = document.getElementById('bg-audio');
    const disc = document.getElementById('vinyl-disc');
    const musicBtn = document.getElementById('toggle-music');
    const musicStatus = document.getElementById('music-status');
    const musicIcon = document.getElementById('music-icon-ui');
    let isPlaying = false;

    // Hạ âm lượng xuống 30% cho dễ chịu
    audio.volume = 0.3;

    musicBtn.addEventListener('click', async () => {
        if (isPlaying) {
            audio.pause();
            disc.style.animationPlayState = 'paused';
            musicIcon.setAttribute('data-lucide', 'play');
            musicStatus.innerText = "Đã tạm dừng";
            isPlaying = false;
        } else {
            musicStatus.innerText = "Đang tải nhạc...";
            try {
                await audio.play();
                disc.style.animationPlayState = 'running';
                musicIcon.setAttribute('data-lucide', 'pause');
                musicStatus.innerText = "Đang phát...";
                isPlaying = true;
            } catch (err) {
                console.error("Lỗi phát nhạc:", err);
                musicStatus.innerText = "Không thể phát nhạc";
            }
        }
        lucide.createIcons();
    });

    // Sakura Effect
    const container = document.getElementById('sakura-container');
    if (container) {
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.innerHTML = '🌸';
            p.style.cssText = `position:fixed; top:-50px; left:${Math.random()*100}vw; font-size:${Math.random()*20+15}px; opacity:${Math.random()*0.5}; pointer-events:none; z-index:100;`;
            container.appendChild(p);
            gsap.to(p, { y: '110vh', x: '+=150', rotation: 360, duration: 8 + Math.random() * 5, repeat: -1, delay: Math.random() * 5, ease: 'none' });
        }
    }

    // Easter Egg: Mưa kẹo
    let clickCount = 0;
    const titleNode = document.querySelector('.title-main');
    if(titleNode) {
        titleNode.addEventListener('click', () => {
            clickCount++;
            if(clickCount === 5) {
                document.getElementById('sakura-container').innerHTML = '';
                const candies = ['🍬', '🍡', '🍭', '🌸'];
                for (let i = 0; i < 30; i++) {
                    const p = document.createElement('div');
                    p.innerHTML = candies[Math.floor(Math.random() * candies.length)];
                    p.style.cssText = `position:fixed; top:-50px; left:${Math.random()*100}vw; font-size:${Math.random()*30+20}px; pointer-events:none; z-index:100;`;
                    container.appendChild(p);
                    gsap.to(p, { y: '110vh', x: 'random(-100, 100)', rotation: 360, duration: 4 + Math.random() * 4, repeat: -1, ease: 'none' });
                }
                alert("Bí mật mở khóa: Cơn mưa kẹo ngọt!");
            }
        });
    }
});
