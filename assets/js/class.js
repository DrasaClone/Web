import { initAnimations } from './animations.js';
import { initInteractions } from './interaction.js';
import { initUI, initDarkMode } from './ui.js';
import { FirebaseService } from './firebase-service.js';
import { CloudinaryService } from './cloudinary-service.js';
import { TransitionManager } from './transitions.js';
import { AudioEngine } from './audio.js';
import { showToast } from './toast.js';
import { LoadingScreen } from './loading.js';
import { compressImage, readFileAsDataURL, timeAgo, showConfirm, sanitizeText, escapeHtml } from './utils.js';

const LOADING_MESSAGES = [
    'Gợi lại những thước phim...',
    'Ép hoa vào trang giấy...',
    'Thắp nến trên bàn học...',
    'Viết lại những dòng thư...',
    'Lật từng trang nhật ký...'
];

let allMemoriesData = null;
let currentUserId = null;
let galleryData = [];
let galleryIndex = 0;
let prevMemoryCount = 0;

// ─── Scroll-Triggered Reveal ───
function initRevealAnimations() {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                gsap.to(entry.target, { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.8, 
                    ease: "power3.out",
                    clearProps: 'transform'
                });
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    setTimeout(() => {
        document.querySelectorAll('.scrapbook-board, #memory-wall, #shared-moments, .w-full.max-w-2xl').forEach(el => {
            if (el.closest('#profile-modal, template')) return;
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            revealObserver.observe(el);
        });
        document.querySelectorAll('h2.font-heading').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            revealObserver.observe(el);
        });
    }, 100);
}

// ─── Full-Screen Gallery ───
function initGallery() {
    function openGallery(index) {
        if (!galleryData.length) return;
        galleryIndex = index;

        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        overlay.innerHTML = `
            <div class="gallery-backdrop modal-bg"></div>
            <button class="gallery-nav gallery-prev" aria-label="Ảnh trước">‹</button>
            <button class="gallery-nav gallery-next" aria-label="Ảnh sau">›</button>
            <button class="gallery-close" aria-label="Đóng">✕</button>
            <div class="gallery-counter"></div>
            <img class="gallery-image" alt="Kỷ niệm" loading="lazy">
        `;
        document.body.appendChild(overlay);
        // Trigger fade-in animation: add active class after DOM insertion
        requestAnimationFrame(() => overlay.classList.add('active'));

        const img = overlay.querySelector('.gallery-image');
        const counter = overlay.querySelector('.gallery-counter');
        const prevBtn = overlay.querySelector('.gallery-prev');
        const nextBtn = overlay.querySelector('.gallery-next');
        const closeBtn = overlay.querySelector('.gallery-close');
        const backdrop = overlay.querySelector('.gallery-backdrop');

        function showImage(i) {
            galleryIndex = ((i % galleryData.length) + galleryData.length) % galleryData.length;
            const moment = galleryData[galleryIndex];
            img.src = moment?.url || '';
            counter.textContent = moment ? `${galleryIndex + 1} / ${galleryData.length}` : '';
            gsap.fromTo(img, { opacity: 0.3, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
        }

        showImage(index);

        prevBtn.onclick = () => showImage(galleryIndex - 1);
        nextBtn.onclick = () => showImage(galleryIndex + 1);

        const handleGalleryKeydown = (e) => {
            if (e.key === 'Escape') closeGallery();
            if (e.key === 'ArrowLeft') showImage(galleryIndex - 1);
            if (e.key === 'ArrowRight') showImage(galleryIndex + 1);
        };

        const closeGallery = () => {
            overlay.classList.remove('active');
            document.removeEventListener('keydown', handleGalleryKeydown);
            setTimeout(() => overlay.remove(), 300);
        };

        closeBtn.onclick = closeGallery;
        backdrop.addEventListener('click', closeGallery);
        document.addEventListener('keydown', handleGalleryKeydown);
        img.addEventListener('error', () => { img.src = ''; img.alt = 'Không thể tải ảnh'; });
    }

    // Expose to global scope for onclick handlers
    window.openGallery = openGallery;
}

// ─── Memory Send Functions (with validation) ───
function triggerSendText() {
    const input = document.getElementById('memory-input');
    if (!input) return;
    const text = sanitizeText(input.value);
    if (!text) {
        showToast("Hãy viết gì đó trước khi gửi nhé! 📝");
        return;
    }
    
    const btn = document.getElementById('send-memory');
    setSendLoading(btn, true);
    
    FirebaseService.saveMemory({ text })
        .then(() => { 
            input.value = ''; 
            input.dispatchEvent(new Event('input'));
            showToast("Đã gửi kỷ niệm 🫶"); 
        })
        .catch((err) => {
            console.error('Save memory error:', err);
            showToast("Gửi thất bại, thử lại nhé! 😅");
        })
        .finally(() => setSendLoading(btn, false));
}

function triggerSendPhoto() {
    const urlInput = document.getElementById('memory-photo-url');
    if (!urlInput) return;
    const rawUrl = urlInput.value.trim();
    if (!rawUrl) {
        showToast("Hãy dán link ảnh trước khi ghim! 🖼️");
        return;
    }
    // Basic URL validation
    if (!rawUrl.match(/^https?:\/\/.+\/.+/i)) {
        showToast("Link ảnh không hợp lệ, thử lại nhé! 🔗");
        return;
    }

    const btn = document.getElementById('send-photo-memory');
    setSendLoading(btn, true);

    FirebaseService.saveMemory({ 
        text: '📷 ' + rawUrl,
        type: 'photo',
        url: rawUrl
    })
        .then(() => { urlInput.value = ''; showToast("Đã ghim ảnh vào tường 🖼️"); })
        .catch(() => showToast("Ghim ảnh thất bại, thử lại! 😅"))
        .finally(() => setSendLoading(btn, false));
}

function triggerSendVoice() {
    const urlInput = document.getElementById('memory-voice-url');
    if (!urlInput) return;
    const rawUrl = urlInput.value.trim();
    if (!rawUrl) {
        showToast("Hãy dán link giọng nói trước! 🎙️");
        return;
    }
    if (!rawUrl.match(/^https?:\/\/.+\/.+\.(mp3|wav|ogg|m4a|webm)/i)) {
        showToast("Link file âm thanh không hợp lệ! Hãy dùng link .mp3/.wav/.ogg 🔊");
        return;
    }

    const btn = document.getElementById('send-voice-memory');
    setSendLoading(btn, true);

    FirebaseService.saveMemory({ 
        text: '🎙️ [Giọng nói] ' + rawUrl,
        type: 'voice',
        url: rawUrl
    })
        .then(() => { urlInput.value = ''; showToast("Đã gửi giọng nói 🎙️"); })
        .catch(() => showToast("Gửi giọng nói thất bại, thử lại! 😅"))
        .finally(() => setSendLoading(btn, false));
}

function setSendLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.6' : '1';
    btn.style.cursor = loading ? 'not-allowed' : 'pointer';
    if (loading) {
        btn.dataset.origText = btn.innerHTML;
        btn.innerHTML = '<span class="inline-block animate-spin">⏳</span> Đang gửi...';
    } else if (btn.dataset.origText) {
        btn.innerHTML = btn.dataset.origText;
        delete btn.dataset.origText;
    }
}

// ─── Profile Modal ───
function openProfile(profile) {
    const existing = document.getElementById('profile-modal');
    if (existing) existing.remove();

    const template = document.getElementById('profile-template');
    const modalClone = template.content.cloneNode(true);
    document.body.appendChild(modalClone);

    const modal = document.getElementById('profile-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('close-profile');
    const playBtn = document.getElementById('play-private-music');
    const vinylImg = document.getElementById('profile-vinyl-img');
    const nameEl = document.getElementById('profile-name');
    const nickEl = document.getElementById('profile-nick');
    const bioEl = document.getElementById('profile-bio');
    const musicNameEl = document.getElementById('music-name');
    const progressBar = document.getElementById('music-progress');
    const personalContainer = document.getElementById('personal-moments');

    vinylImg.src = profile.photo || '';
    nameEl.textContent = profile.name || '';
    nickEl.textContent = profile.nick || '';
    bioEl.textContent = profile.bio || 'Chưa để lại lời nhắn nào...';
    musicNameEl.textContent = profile.musicName || 'Bản nhạc bí ẩn';

    vinylImg.addEventListener('error', () => {
        vinylImg.src = '';
        vinylImg.alt = 'No photo';
    });

    gsap.to(modal, { opacity: 1, duration: 0.5, pointerEvents: 'auto' });
    gsap.from(modal.querySelector('.liquid-glass'), { y: 40, opacity: 0, scale: 0.95, duration: 0.6, ease: "power3.out" });

    let isPlaying = false;
    let personalAudioElements = [];

    // Focus trap
    const focusableElements = modal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const trapHandler = (e) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey && document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
        }
    };

    const closeModal = () => {
        // Clean up private music FIRST
        if (isPlaying) {
            AudioEngine.stopPrivate();
            isPlaying = false;
        }
        if (progressBar) progressBar.style.width = '0%';

        // Pause all personal audio elements (voice memories)
        personalAudioElements.forEach(audio => {
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });

        // Cleanup listeners
        modal.removeEventListener('keydown', trapHandler);
        document.removeEventListener('keydown', escHandler);

        gsap.to(modal, { 
            opacity: 0, 
            scale: 0.95,
            duration: 0.3, 
            ease: "power2.in",
            onComplete: () => {
                if (modal.parentNode) modal.remove();
            }
        });
    };

    const escHandler = (e) => { if (e.key === 'Escape') closeModal(); };

    // Close mechanisms
    closeBtn.onclick = closeModal;
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-bg')) closeModal();
    });
    document.addEventListener('keydown', escHandler);
    modal.addEventListener('keydown', trapHandler);
    setTimeout(() => firstFocusable?.focus(), 100);

    // Play button
    playBtn.onclick = () => {
        if (!isPlaying) {
            if (profile.musicUrl) {
                AudioEngine.playPrivate(profile.musicUrl, (progress) => {
                    if (progressBar) progressBar.style.width = Math.round(progress * 100) + '%';
                });
                playBtn.textContent = '⏸️';
                isPlaying = true;

                const vinylRing = modal.querySelector('[class*="animate-"]');
                if (vinylRing) vinylRing.style.animationDuration = '4s';
            } else {
                showToast("Bạn này chưa đăng tải nhạc riêng cậu ơi! 🎵");
            }
        } else {
            AudioEngine.stopPrivate();
            playBtn.textContent = '▶️';
            isPlaying = false;
            if (progressBar) progressBar.style.width = '0%';

            const vinylRing = modal.querySelector('[class*="animate-"]');
            if (vinylRing) vinylRing.style.animationDuration = '30s';
        }
    };

    // Personal moments with audio management
    if (personalContainer && allMemoriesData) {
        const myMemories = Object.values(allMemoriesData)
            .filter(m => m.uid === profile.uid)
            .slice(-6)
            .reverse();

        if (myMemories.length > 0) {
            personalContainer.innerHTML = myMemories.map(m => {
                if (m.type === 'photo' && m.url) {
                    return `<img src="${escapeHtml(m.url)}" class="w-full aspect-square object-cover rounded-lg" onerror="this.style.display='none'" loading="lazy">`;
                } else if (m.type === 'voice' && m.url) {
                    // Render actual audio player so it can be paused on modal close
                    return `
                        <div class="aspect-square bg-[#FF8AB8]/10 rounded-lg flex flex-col items-center justify-center p-2 relative">
                            <span class="text-2xl mb-1">🎙️</span>
                            <audio src="${escapeHtml(m.url)}" controls preload="none" class="w-full h-8 rounded-full personal-audio" style="max-width: 100px;"></audio>
                        </div>
                    `;
                }
                return `<div class="aspect-square bg-white/40 rounded-lg flex items-center justify-center text-sm italic p-1 text-[#5D4037]/60">💬</div>`;
            }).join('');

            // Collect audio elements for cleanup
            personalAudioElements = Array.from(personalContainer.querySelectorAll('.personal-audio'));
        } else {
            personalContainer.innerHTML = '<div class="col-span-full text-center py-8 text-[#5D4037]/40 text-sm italic font-body">Chưa có kỷ niệm nào...</div>';
        }
    }

}

// ─── Input Type Handlers ───
function setupInputSelector(inputSelector, dynamicInputArea) {
    if (!inputSelector) return;
    let currentInputMode = 'text';

    inputSelector.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            if (type === currentInputMode) return;
            currentInputMode = type;

            inputSelector.querySelectorAll('button').forEach(b => {
                b.className = 'p-2 rounded-lg text-xl hover:bg-white/30';
                b.setAttribute('aria-selected', 'false');
            });
            btn.className = 'p-2 rounded-lg text-xl bg-[#FF8AB8]/20';
            btn.setAttribute('aria-selected', 'true');

            const inputAreas = {
                text: `
                    <input type="text" id="memory-input" placeholder="Viết gì đó thật tâm trạng..." class="bg-white/40 rounded-full px-6 py-3 outline-none font-body text-[#3E2723]" maxlength="2000">
                    <button id="send-memory" class="bg-[#FF8AB8] text-white px-8 py-3 rounded-full font-heading italic hover:bg-[#ff70a6] transition-all">Gửi lời nhắn</button>
                `,
                photo: `
                    <input type="text" id="memory-photo-url" placeholder="Dán link ảnh kỷ niệm (https://...)..." class="bg-white/40 rounded-full px-6 py-3 outline-none font-body text-[#3E2723]">
                    <button id="send-photo-memory" class="bg-[#A5D6A7] text-white px-8 py-3 rounded-full font-heading italic hover:bg-[#8bc34a] transition-all">Ghim ảnh 🖼️</button>
                `,
                voice: `
                    <input type="text" id="memory-voice-url" placeholder="Dán link file giọng nói (.mp3/.wav/.ogg)..." class="bg-white/40 rounded-full px-6 py-3 outline-none font-body text-[#3E2723]">
                    <button id="send-voice-memory" class="bg-blue-300 text-white px-8 py-3 rounded-full font-heading italic hover:bg-blue-400 transition-all">Gửi giọng nói 🎙️</button>
                `
            };
            dynamicInputArea.innerHTML = inputAreas[type] || inputAreas.text;
            gsap.from(dynamicInputArea.children, { y: 10, opacity: 0, duration: 0.3, stagger: 0.1, ease: "power2.out" });
        });
    });
}

// ─── Enter Key Handler ───
function setupEnterKeyHandler() {
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const active = document.activeElement;
        if (!active) return;

        if (active.id === 'memory-input' && active.value.trim()) {
            e.preventDefault();
            triggerSendText();
        } else if (active.id === 'memory-photo-url' && active.value.trim()) {
            e.preventDefault();
            triggerSendPhoto();
        } else if (active.id === 'memory-voice-url' && active.value.trim()) {
            e.preventDefault();
            triggerSendVoice();
        }
    });
}

// ─── Click Delegation Handler ───
function setupClickDelegation() {
    document.addEventListener('click', (e) => {
        const textBtn = e.target.closest('#send-memory');
        const photoBtn = e.target.closest('#send-photo-memory');
        const voiceBtn = e.target.closest('#send-voice-memory');

        if (textBtn && !textBtn.disabled) triggerSendText();
        else if (photoBtn && !photoBtn.disabled) triggerSendPhoto();
        else if (voiceBtn && !voiceBtn.disabled) triggerSendVoice();
    });
}

// ─── Input Emptiness Toggle ───
function setupInputToggle() {
    document.addEventListener('input', (e) => {
        const input = e.target;
        const area = input?.closest('#dynamic-input-area');
        if (!area) return;
        const sendBtn = area.querySelector('button:last-child');
        if (!sendBtn) return;
        const hasText = input.value.trim().length > 0;
        sendBtn.disabled = !hasText;
        sendBtn.style.opacity = hasText ? '1' : '0.4';
        sendBtn.style.cursor = hasText ? 'pointer' : 'not-allowed';
    });
}


async function initClass() {
    await LoadingScreen.show(LOADING_MESSAGES);

    initUI('class-template');
    initAnimations();
    TransitionManager.init();

    const userInfo = document.getElementById('user-info');
    const memoryWall = document.getElementById('memory-wall');
    const scrapbookBoard = document.getElementById('scrapbook-board');
    const sharedMoments = document.getElementById('shared-moments');
    const uploadBtn = document.getElementById('upload-moment');
    const editSection = document.getElementById('edit-profile-section');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const nickInput = document.getElementById('edit-nick');
    const bioInput = document.getElementById('edit-bio');
    const mNameInput = document.getElementById('edit-music-name');
    const mUrlInput = document.getElementById('edit-music-url');
    const inputSelector = document.getElementById('input-selector');
    const dynamicInputArea = document.getElementById('dynamic-input-area');

    initGallery();
    initRevealAnimations();
    setupInputSelector(inputSelector, dynamicInputArea);
    setupEnterKeyHandler();
    setupClickDelegation();
    setupInputToggle();

    // ═══════════════ AUTH STATE ═══════════════
    FirebaseService.onAuthChange((user) => {
        currentUserId = user?.uid || null;
        if (user && userInfo) {
            userInfo.innerHTML = `
                <button id="toggle-edit" class="text-xs font-bold text-[#FF8AB8] hover:scale-105 transition-all">Góc của tớ ✍️</button>
                <img src="${escapeHtml(user.photoURL || '')}" class="w-10 h-10 rounded-full border-2 border-[#FF8AB8]" onerror="this.src=''; this.alt=''">
                <div class="flex flex-col">
                    <span class="text-xs font-bold text-[#5D4037]">${escapeHtml(user.displayName || '')}</span>
                    <button id="logout-btn" class="text-[10px] text-left text-[#5D4037]/50 hover:text-[#5D4037]">Đăng xuất</button>
                </div>
            `;

            document.getElementById('toggle-edit').onclick = () => {
                editSection.classList.toggle('hidden');
                gsap.from(editSection, { height: 0, opacity: 0, duration: 0.5 });
            };

            document.getElementById('logout-btn').addEventListener('click', () => {
                FirebaseService.auth.signOut();
                TransitionManager.navigate('main.html');
            });

            // Pre-fill profile
            FirebaseService.onProfilesChange((allProfiles) => {
                const myProfile = allProfiles?.[user.uid];
                if (myProfile) {
                    nickInput.value = myProfile.nick || '';
                    bioInput.value = myProfile.bio || '';
                    mNameInput.value = myProfile.musicName || '';
                    mUrlInput.value = myProfile.musicUrl || '';
                    const avatarImg = document.getElementById('avatar-img');
                    if (myProfile.photo && avatarImg) {
                        avatarImg.src = myProfile.photo;
                        avatarImg.style.display = 'block';
                    }
                }
            });
        } else if (!user && userInfo) {
            userInfo.innerHTML = `
                <a href="auth.html" class="liquid-glass px-5 py-2 rounded-full text-sm hover:bg-white/50 transition-all">Đăng nhập để ghi danh ✨</a>
            `;
        }
    });

    // ═══════════════ PROFILE EDIT ═══════════════
    let pendingAvatar = null;

    const avatarInput = document.getElementById('avatar-input');
    const avatarBtn = document.getElementById('edit-avatar-btn');
    const avatarImg = document.getElementById('avatar-img');

    if (avatarBtn && avatarInput) {
        avatarBtn.onclick = () => avatarInput.click();
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast("Chỉ chấp nhận file ảnh! 📸");
                avatarInput.value = '';
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast("Ảnh quá lớn! Hãy chọn ảnh dưới 5MB 📸");
                avatarInput.value = '';
                return;
            }

            try {
                const raw = await readFileAsDataURL(file);
                pendingAvatar = await compressImage(raw, 400, 0.85);
                avatarImg.src = pendingAvatar;
                avatarImg.style.display = 'block';
                showToast("Đã chọn ảnh đại diện mới! 📸");
            } catch {
                showToast("Không thể đọc ảnh, thử lại nhé! 😅");
            }
            avatarInput.value = '';
        });
    }

    if (saveProfileBtn) {
        saveProfileBtn.onclick = async () => {
            const origText = saveProfileBtn.innerHTML;
            saveProfileBtn.innerHTML = '<span class="inline-block animate-spin">⏳</span> Đang lưu...';
            saveProfileBtn.disabled = true;

            try {
                let photoUrl = null;
                if (pendingAvatar) {
                    photoUrl = await CloudinaryService.uploadImage(pendingAvatar);
                }

                await FirebaseService.saveProfile({
                    nick: sanitizeText(nickInput.value),
                    bio: sanitizeText(bioInput.value),
                    musicName: sanitizeText(mNameInput.value),
                    musicUrl: mUrlInput.value.trim().slice(0, 500),
                    ...(photoUrl ? { photo: photoUrl } : {})
                });
                pendingAvatar = null;
                showToast("Đã lưu dấu ấn của cậu thành công! ✨");
                editSection.classList.add('hidden');
                gsap.from(editSection, { height: 0, opacity: 0, duration: 0.3 });
            } catch (err) {
                console.error('Save profile error:', err);
                showToast("Lưu thất bại, thử lại nhé! 😅");
            } finally {
                saveProfileBtn.innerHTML = origText;
                saveProfileBtn.disabled = false;
            }
        };
    }

    // ═══════════════ POLAROID GALLERY ═══════════════
    FirebaseService.onProfilesChange((data) => {
        if (!data || !Object.keys(data).length) {
            scrapbookBoard.innerHTML = '<p class="col-span-full text-center py-20 font-handwriting text-2xl">Chưa có ai đăng ký cả, cậu là người đầu tiên chứ? ✨</p>';
            return;
        }
        scrapbookBoard.innerHTML = '';
        Object.values(data).forEach((profile) => {
            const rotation = (Math.random() * 8 - 4);
            const card = document.createElement('div');
            card.className = "member-card";
            card.style.transform = `rotate(${rotation}deg)`;
            card.innerHTML = `
                <img src="${escapeHtml(profile.photo || '')}" class="card-img" onerror="this.style.display='none'" loading="lazy" alt="${escapeHtml(profile.name || '')}">
                <h3 class="font-heading text-2xl text-[#5D4037] mt-4">${escapeHtml(profile.name || '')}</h3>
                <p class="font-handwriting text-lg mt-1">"${escapeHtml(profile.nick || 'Thanh xuân')}"</p>
            `;
            card.onclick = () => openProfile(profile);
            scrapbookBoard.appendChild(card);
        });
    });

    // ═══════════════ MEMORY WALL (Realtime, Multi-modal) ═══════════════
    FirebaseService.onMemoriesChange((data) => {
        const hadData = allMemoriesData !== null;
        allMemoriesData = data;
        if (!data) {
            memoryWall.innerHTML = '<div class="w-full text-center py-16"><span class="text-6xl block mb-4">💬</span><p class="font-handwriting text-2xl text-[#5D4037]/50">Chưa có kỷ niệm nào. Hãy viết điều gì đó! ✨</p></div>';
            return;
        }

        memoryWall.innerHTML = '';
        const entries = Object.entries(data);
        entries.reverse().forEach(([key, m], idx) => {
            const wrap = document.createElement('div');
            wrap.className = "memory-card-wrap relative";

            const el = document.createElement('div');
            el.className = "liquid-glass p-6 max-w-xs transform hover:rotate-1 transition-all bg-white/60 border-dashed border-[#5D4037]/20";

            const isOwner = m.uid && m.uid === currentUserId;
            const isName = m.user?.name || 'Ai đó ẩn danh';

            let content = '';
            if (m.type === 'photo' && m.url) {
                content = `
                    <img src="${escapeHtml(m.url)}" class="w-full h-40 object-cover rounded-lg mb-3" onerror="this.style.display='none'" loading="lazy">
                    <p class="font-body text-[#5D4037] mb-4 text-sm italic">${escapeHtml(m.text || '')}</p>
                `;
            } else if (m.type === 'voice' && m.url) {
                content = `
                    <div class="flex items-center gap-3 bg-[#5D4037]/5 rounded-full px-4 py-2 mb-3">
                        <span class="text-2xl">🎙️</span>
                        <audio src="${escapeHtml(m.url)}" controls class="w-full h-8" style="max-width: 180px" preload="none"></audio>
                    </div>
                    <p class="font-body text-[#5D4037] text-sm italic">${escapeHtml(m.text || '')}</p>
                `;
            } else {
                content = `
                    <p class="font-body text-[#5D4037] mb-4 leading-relaxed">${escapeHtml(m.text || '')}</p>
                `;
            }

            el.innerHTML = `
                ${content}
                <div class="flex items-center gap-3 mt-auto pt-3 border-t border-[#5D4037]/10">
                    <img src="${escapeHtml(m.user?.photo || '')}" class="w-6 h-6 rounded-full grayscale opacity-50" onerror="this.style.display='none'" loading="lazy">
                    <span class="text-[10px] uppercase tracking-widest text-[#5D4037]/40">${escapeHtml(isName)}</span>
                    <span class="memory-timestamp ml-auto">${timeAgo(m.timestamp)}</span>
                </div>
            `;

            wrap.appendChild(el);

            // Delete button for owner
            if (isOwner) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'memory-delete-btn';
                deleteBtn.innerHTML = '✕';
                deleteBtn.setAttribute('aria-label', 'Xóa kỷ niệm này');
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    showConfirm('Cậu có chắc muốn xóa kỷ niệm này không? Hành động này không thể hoàn tác!')
                        .then((confirmed) => {
                            if (!confirmed) return;
                            FirebaseService.deleteMemory(key)
                                .then(() => showToast("Đã xóa kỷ niệm 🗑️"))
                                .catch(() => showToast("Không thể xóa, thử lại nhé! 😅"));
                        });
                };
                wrap.appendChild(deleteBtn);
            }

            memoryWall.appendChild(wrap);

            // Entrance animation
            gsap.from(wrap, { 
                scale: 0.8, 
                opacity: 0, 
                duration: 0.5, 
                ease: "back.out(1.7)",
                delay: hadData ? 0 : idx * 0.05
            });
        });

        // Auto-scroll + highlight on new memory
        const currentCount = entries.length;
        if (hadData && currentCount > prevMemoryCount) {
            const firstCard = memoryWall.firstElementChild;
            if (firstCard) {
                firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                gsap.from(firstCard, { 
                    borderColor: '#FF8AB8',
                    boxShadow: '0 0 0 4px rgba(255, 138, 184, 0.3)',
                    duration: 1.5, 
                    ease: "power2.out",
                    clearProps: 'boxShadow'
                });
            }
        }
        prevMemoryCount = currentCount;
    });

    // ═══════════════ SHARED MOMENTS (Album) ═══════════════
    FirebaseService.onMomentsChange((data) => {
        if (!data) {
            sharedMoments.innerHTML = '<div class="col-span-full text-center py-16"><span class="text-6xl block mb-4">📸</span><p class="font-handwriting text-2xl text-[#5D4037]/50">Chưa có kỷ niệm nào được ghi lại. Hãy là người đầu tiên!</p></div>';
            return;
        }
        sharedMoments.innerHTML = '';
        galleryData = Object.values(data);
        galleryData.forEach((moment, idx) => {
            const el = document.createElement('div');
            el.className = "relative group overflow-hidden rounded-xl liquid-glass aspect-square cursor-pointer";
            el.innerHTML = `
                <img src="${escapeHtml(moment.url)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" onerror="this.style.display='none'">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <span class="text-[10px] text-white/70 uppercase tracking-widest">Góp bởi</span>
                    <span class="text-xs font-bold text-white">${escapeHtml(moment.user?.name || 'Ai đó')}</span>
                </div>
            `;
            el.addEventListener('click', () => window.openGallery(idx));
            sharedMoments.appendChild(el);
        });
    });

    // ═══════════════ UPLOAD MOMENT ═══════════════
    if (uploadBtn) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.className = 'hidden';
        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast("Chỉ chấp nhận file ảnh! 📸");
                fileInput.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                showToast("Ảnh quá lớn! Hãy chọn ảnh dưới 10MB 📸");
                fileInput.value = '';
                return;
            }

            uploadBtn.innerHTML = '<span class="animate-spin">⏳</span> Đang tải lên...';
            uploadBtn.disabled = true;

            try {
                const raw = await readFileAsDataURL(file);
                const compressed = await compressImage(raw, 1200, 0.82);
                
                // Upload to Cloudinary instead of saving base64 to Firebase
                const imageUrl = await CloudinaryService.uploadImage(compressed);
                await FirebaseService.saveMoment(imageUrl);
                
                showToast("Đã thêm ảnh vào album! 📸");
            } catch (error) {
                console.error("Upload error:", error);
                showToast("Không thể tải lên, thử lại nhé! 😅");
            } finally {
                uploadBtn.innerHTML = '<span>📸</span> Thêm ảnh kỷ niệm';
                uploadBtn.disabled = false;
            }

            fileInput.value = '';
        });

        uploadBtn.onclick = () => fileInput.click();
    }

    initInteractions();
    initDarkMode();
}

initClass();
