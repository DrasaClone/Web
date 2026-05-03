window.addEventListener('firebase-ready', () => {
    const { auth, db, provider, signInWithPopup, onAuthStateChanged, ref, set, get } = window.fb;
    const FB_ROOT = 'schweb_v2/class_2026';

    // --- LOADING SCREEN REMOVAL ---
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) setTimeout(() => loadingScreen.classList.add('is-hidden'), 800);

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            document.getElementById('auth-portal').style.display = 'none';
            document.getElementById('reg-section').style.display = 'block';
            
            const snapshot = await get(ref(db, `${FB_ROOT}/members/${user.uid}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                document.getElementById('reg-name').value = data.name || '';
                document.getElementById('reg-personality').value = data.personality?.join(', ') || '';
                document.getElementById('reg-quote').value = data.quote || '';
                document.getElementById('reg-secret').value = data.secretMemory || '';
                document.getElementById('avatar-preview').innerHTML = `<img src="${data.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius: var(--radius-md)">`;
            }
        }
    });

    document.getElementById('login-btn').addEventListener('click', () => signInWithPopup(auth, provider));

    document.getElementById('reg-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('reg-submit');
        const file = document.getElementById('avatar-input').files[0];
        
        btn.disabled = true;
        btn.innerText = "ĐANG GÓI GÉM...";

        try {
            let imageUrl = document.querySelector('#avatar-preview img')?.src;
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', window.APP_CONFIG.cloudinary.uploadPreset);
                const res = await axios.post(`https://api.cloudinary.com/v1_1/${window.APP_CONFIG.cloudinary.cloudName}/image/upload`, formData);
                imageUrl = res.data.secure_url;
            }

            await set(ref(db, `${FB_ROOT}/members/${auth.currentUser.uid}`), {
                id: auth.currentUser.uid.substring(0, 5),
                name: document.getElementById('reg-name').value,
                personality: document.getElementById('reg-personality').value.split(',').map(s => s.trim()),
                quote: document.getElementById('reg-quote').value,
                secretMemory: document.getElementById('reg-secret').value,
                avatar: imageUrl,
                updatedAt: Date.now()
            });

            alert("Ký ức đã được lưu!");
            window.location.href = "myclass.html";
        } catch (err) { alert("Lỗi: " + err.message); } finally { btn.disabled = false; btn.innerText = "GÓI GÉM KÝ ỨC"; }
    });

    document.getElementById('avatar-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('avatar-preview').innerHTML = `<img src="${URL.createObjectURL(file)}" style="width:100%;height:100%;object-fit:cover;border-radius: var(--radius-md)">`;
        }
    });
});
