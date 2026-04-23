window.addEventListener('firebase-ready', () => {
    const { auth, db, onAuthStateChanged, ref, onValue, push } = window.fb;

    initSakura();

    onValue(ref(db, 'class_2026/members'), (snapshot) => {
        const data = snapshot.val();
        const grid = document.getElementById('members-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        if (data) {
            Object.values(data).sort((a,b) => b.updatedAt - a.updatedAt).forEach(student => {
                const card = document.createElement('div');
                card.className = 'soft-card member-card';
                card.innerHTML = `
                    <div class="member-img-wrapper">
                        <img src="${student.avatar}" class="member-img">
                    </div>
                    <h3 class="member-name">${student.name}</h3>
                    <div style="text-align: center; margin-top: 10px;" class="handwritten">
                        <span style="font-size: 1.1rem; color: var(--sakura-primary);">Ghé thăm cậu ấy ✨</span>
                    </div>
                `;
                card.addEventListener('click', () => showDetail(student));
                grid.appendChild(card);
                gsap.from(card, { scale: 0.9, opacity: 0, y: 30, duration: 0.8, scrollTrigger: { trigger: card, start: "top 95%" } });
            });
        }
    });

    onValue(ref(db, 'class_2026/wishes'), (snapshot) => {
        const data = snapshot.val();
        const container = document.getElementById('wishes-container');
        if (!container) return;
        container.innerHTML = '';
        if (data) {
            Object.values(data).forEach(wish => {
                const item = document.createElement('div');
                item.className = 'wish-item';
                item.innerText = wish.text;
                item.style.left = Math.random() * 80 + '%';
                item.style.top = Math.random() * 60 + '%';
                container.appendChild(item);
                gsap.to(item, { x: "random(-50, 50)", y: "random(-50, 50)", duration: "random(10, 20)", repeat: -1, yoyo: true, ease: "sine.inOut" });
            });
        }
    });

    const sendBtn = document.getElementById('send-wish');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const input = document.getElementById('wish-input');
            if (input.value.trim()) {
                push(ref(db, 'class_2026/wishes'), { text: input.value, timestamp: Date.now() });
                input.value = '';
            }
        });
    }

    function showDetail(student) {
        const modal = document.getElementById('detail-modal');
        const content = document.getElementById('detail-content-target');
        content.innerHTML = `
            <img src="${student.avatar}" style="width:100%; height:350px; object-fit:cover; border-radius:30px; margin-bottom:30px;">
            <h2 class="title-modern" style="font-size:3.5rem; text-align:left; color:var(--text-main);">${student.name}</h2>
            
            <div style="display:flex; gap:10px; margin-bottom:30px; flex-wrap:wrap;">
                ${student.personality?.map(p => `<span class="tag-pill">${p}</span>`).join('')}
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:40px;">
                <div>
                    <div class="handwritten" style="color:var(--sakura-deep); margin-bottom:15px; font-size:1.5rem; font-weight:700;">Dấu ấn rực rỡ</div>
                    <ul style="list-style:none; padding:0;">
                        ${student.achievements?.map(a => `<li style="margin-bottom:8px; font-size:1.1rem; color:#555;">• ${a}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <div class="handwritten" style="color:var(--sakura-deep); margin-bottom:15px; font-size:1.5rem; font-weight:700;">Góc nhỏ kỷ niệm</div>
                    <p style="font-size:1rem; font-style:italic; color:#666; line-height:1.6;">${student.secretMemory}</p>
                </div>
            </div>

            <div style="margin-top:50px; padding:30px; background:var(--sakura-base); border-radius:30px; position:relative; border: 1px dashed var(--sakura-light);">
                <i data-lucide="quote" style="position:absolute; top:10px; left:20px; opacity:0.1; width:40px; height:40px;"></i>
                <p class="handwritten" style="font-size:2.2rem; color:#3b82f6; text-align:center;">"${student.quote}"</p>
            </div>
        `;
        modal.style.display = 'flex';
        lucide.createIcons();
        gsap.from(modal.querySelector('.modern-modal'), { scale: 0.8, opacity: 0, duration: 0.6, ease: "back.out(1.7)" });
    }

    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('detail-modal').style.display = 'none';
    });

    const audio = document.getElementById('bg-audio');
    const musicBtn = document.getElementById('toggle-music');
    let isPlaying = false;
    if (musicBtn && audio) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) { audio.pause(); musicBtn.innerHTML = '<i data-lucide="play-circle"></i>'; }
            else { audio.play(); musicBtn.innerHTML = '<i data-lucide="pause-circle"></i>'; }
            isPlaying = !isPlaying;
            lucide.createIcons();
        });
    }

    function initSakura() {
        const container = document.getElementById('sakura-container');
        if (!container) return;
        for (let i = 0; i < 25; i++) {
            const p = document.createElement('div');
            p.innerHTML = '🌸';
            p.className = 'floating-petal';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = '-50px';
            p.style.position = 'fixed';
            container.appendChild(p);
            gsap.to(p, { y: '110vh', x: '+=100', rotation: 360, duration: 6 + Math.random() * 4, repeat: -1, delay: Math.random() * 5, ease: "none" });
        }
    }
});
