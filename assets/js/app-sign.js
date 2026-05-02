window.addEventListener('firebase-ready', () => {
    const { auth, db, provider, signInWithPopup, signOut, onAuthStateChanged, ref, set, get } = window.fb;

    let currentUser = null;
    const FB_ROOT = 'schweb_v2/class_2026'; // Parent namespace mới

    // Khởi tạo Sakura
    initSakura();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            document.getElementById('auth-portal').style.display = 'none';
            document.getElementById('reg-section').style.display = 'block';
            
            // Kiểm tra xem đã có hồ sơ chưa
            const snapshot = await get(ref(db, `${FB_ROOT}/members/${user.uid}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                document.getElementById('reg-name').value = data.name || '';
                document.getElementById('reg-personality').value = data.personality?.join(', ') || '';
                document.getElementById('reg-achievements').value = data.achievements?.join('\n') || '';
                document.getElementById('reg-quote').value = data.quote || '';
                document.getElementById('reg-song').value = data.songLink || '';
                document.getElementById('reg-secret').value = data.secretMemory || '';
                document.getElementById('avatar-preview').innerHTML = `<img src="${data.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius: var(--radius-md)">`;
                
                document.getElementById('view-class-btn').style.display = 'block';
            }
        } else {
            document.getElementById('auth-portal').style.display = 'flex';
            document.getElementById('reg-section').style.display = 'none';
        }
    });

    document.getElementById('login-btn').addEventListener('click', () => {
        signInWithPopup(auth, provider);
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        signOut(auth);
    });

    document.getElementById('reg-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('reg-submit');
        const avatarInput = document.getElementById('avatar-input');
        const file = avatarInput.files[0];
        
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader" class="spin"></i> <span>ĐANG LƯU...</span>';
        lucide.createIcons();

        try {
            let imageUrl = document.querySelector('#avatar-preview img')?.src;

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', window.APP_CONFIG.cloudinary.uploadPreset);
                const res = await axios.post(`https://api.cloudinary.com/v1_1/${window.APP_CONFIG.cloudinary.cloudName}/image/upload`, formData);
                imageUrl = res.data.secure_url;
            }

            if (!imageUrl) throw new Error("Cậu cần tải ảnh lên nhé!");

            await set(ref(db, `${FB_ROOT}/members/${currentUser.uid}`), {
                id: currentUser.uid.substring(0, 5),
                name: document.getElementById('reg-name').value,
                personality: document.getElementById('reg-personality').value.split(',').map(s => s.trim()),
                achievements: document.getElementById('reg-achievements').value.split('\n').map(s => s.trim()),
                quote: document.getElementById('reg-quote').value,
                songLink: document.getElementById('reg-song').value,
                secretMemory: document.getElementById('reg-secret').value,
                avatar: imageUrl,
                updatedAt: Date.now()
            });

            alert("Kỷ niệm đã được gói ghém thành công!");
            document.getElementById('view-class-btn').style.display = 'block';
        } catch (err) {
            alert("Lỗi: " + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="heart" size="18"></i> <span>LƯU KỶ NIỆM</span>';
            lucide.createIcons();
        }
    });

    document.getElementById('avatar-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('avatar-preview').innerHTML = `<img src="${URL.createObjectURL(file)}" style="width:100%;height:100%;object-fit:cover;border-radius: var(--radius-md)">`;
        }
    });

    function initSakura() {
        const container = document.getElementById('sakura-container');
        if (!container) return;
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.innerHTML = '🌸';
            p.className = 'floating-petal';
            p.style.cssText = `position:fixed; top:-50px; left:${Math.random()*100}vw; font-size:${Math.random()*20+15}px; opacity:${Math.random()*0.5}; pointer-events:none; z-index:0;`;
            container.appendChild(p);
            gsap.to(p, { y: '110vh', x: '+=100', rotation: 360, duration: 5 + Math.random() * 5, repeat: -1, delay: Math.random() * 5, ease: 'none' });
        }
    }
});
