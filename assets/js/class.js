import { initAnimations } from './animations.js';
import { initInteractions } from './interaction.js';
import { initUI, initDarkMode } from './ui.js';
import { FirebaseService } from './firebase-service.js';
import { CloudinaryService } from './cloudinary-service.js';
import { TransitionManager } from './transitions.js';
import { AudioEngine } from './audio.js';
import { showToast } from './toast.js';
import { LoadingScreen } from './loading.js';
import { compressImage, readFileAsDataURL, timeAgo, showConfirm, sanitizeText, escapeHtml, calculateAge, timeSinceYear, detectMusicLinkType, getMusicEmbedUrl, WILDCARD_COLORS, getWildcardGradient, markEggFound } from './utils.js';

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

// ─── Cached status data for profile feed ───
let allStatusesData = null;
let allReactionsData = null;
let allCommentsData = null;
let currentProfileUid = null;

// ─── Single profiles listener: subscribe instead of multiple Firebase listeners ───
let profilesCached = null;
let profilesSubs = [];
function subscribeProfiles(cb) {
    profilesSubs.push(cb);
    if (profilesCached) cb(profilesCached);
    return () => { profilesSubs = profilesSubs.filter(s => s !== cb); };
}

// ─── Profile Modal ───
function renderProfileStatusFeed(uid) {
    const statusFeedEl = document.getElementById('profile-status-feed');
    const statusCountEl = document.getElementById('profile-status-count');
    if (!statusFeedEl || !allStatusesData) return;
    
    const myStatuses = Object.entries(allStatusesData)
        .filter(([, s]) => s.uid === uid)
        .sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0))
        .slice(0, 20);
    
    if (statusCountEl) statusCountEl.textContent = `(${myStatuses.length} bài)`;
    
    if (myStatuses.length === 0) {
        statusFeedEl.innerHTML = '<p class="font-body text-muted/30 italic text-center py-8">Chưa có bài viết nào...</p>';
    } else {
        statusFeedEl.innerHTML = myStatuses.map(([statusId, status]) => {
            const reactionCount = allReactionsData?.[statusId] ? Object.keys(allReactionsData[statusId]).length : 0;
            const commentsList = allCommentsData?.[statusId] ? Object.values(allCommentsData[statusId]).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)) : [];
            const userReacted = currentUserId && allReactionsData?.[statusId]?.[currentUserId];
            return renderStatusCard(statusId, status, reactionCount, commentsList, userReacted);
        }).join('');
        setTimeout(() => bindStatusHandlers(uid), 50);
    }
}

function openProfile(profile) {
    const existing = document.getElementById('profile-modal');
    if (existing) existing.remove();
    currentProfileUid = profile.uid;

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
    const ageEl = document.getElementById('profile-age');
    const wildcardEl = document.getElementById('profile-wildcard');
    const socialLinksEl = document.getElementById('profile-social-links');
    const statusFeedEl = document.getElementById('profile-status-feed');
    const statusCountEl = document.getElementById('profile-status-count');

    vinylImg.src = profile.photo || '';
    nameEl.textContent = profile.name || '';
    nickEl.textContent = profile.nick || '';
    bioEl.textContent = profile.bio || 'Chưa để lại lời nhắn nào...';
    musicNameEl.textContent = profile.musicName || 'Bản nhạc bí ẩn';
    
    // 🔗 Social Links
    if (socialLinksEl) {
        const links = profile.socialLinks || {};
        const socialIcons = {
            facebook: { icon: '📘', color: '#1877F2', label: 'Facebook' },
            instagram: { icon: '📸', color: '#E4405F', label: 'Instagram' },
            tiktok: { icon: '🎵', color: '#000000', label: 'TikTok' },
            youtube: { icon: '▶️', color: '#FF0000', label: 'YouTube' },
            github: { icon: '🐙', color: '#333333', label: 'GitHub' },
            zalo: { icon: '💬', color: '#0068FF', label: 'Zalo' }
        };
        
        let linksHtml = '';
        Object.entries(socialIcons).forEach(([key, info]) => {
            const url = links[key];
            if (url) {
                linksHtml += `
                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" 
                       class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-110"
                       style="background:${info.color}15; color:${info.color}; border:1px solid ${info.color}30;"
                       title="${info.label}">
                        <span>${info.icon}</span>
                        <span>${info.label}</span>
                    </a>
                `;
            }
        });
        socialLinksEl.innerHTML = linksHtml || '<span class="text-xs text-muted/30 italic">Chưa có liên kết</span>';
    }
    
    // 📝 Status Feed
    if (statusFeedEl && allStatusesData) {
        const myStatuses = Object.entries(allStatusesData)
            .filter(([, s]) => s.uid === profile.uid)
            .sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0))
            .slice(0, 20);
        
        if (statusCountEl) {
            statusCountEl.textContent = `(${myStatuses.length} bài)`;
        }
        
        if (myStatuses.length === 0) {
            statusFeedEl.innerHTML = '<p class="font-body text-muted/30 italic text-center py-8">Chưa có bài viết nào...</p>';
        } else {
            statusFeedEl.innerHTML = myStatuses.map(([statusId, status]) => {
                const reactionCount = allReactionsData?.[statusId] ? Object.keys(allReactionsData[statusId]).length : 0;
                const commentsList = allCommentsData?.[statusId] ? Object.values(allCommentsData[statusId]).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)) : [];
                const userReacted = currentUserId && allReactionsData?.[statusId]?.[currentUserId];
                
                return renderStatusCard(statusId, status, reactionCount, commentsList, userReacted);
            }).join('');
            
            // Re-bind reaction and comment handlers
            setTimeout(() => bindStatusHandlers(profile.uid), 50);
        }
    }
    
    // Age display
    if (ageEl) {
        if (profile.birthDate) {
            const age = calculateAge(profile.birthDate);
            if (age) {
                ageEl.innerHTML = `🎂 <strong>${age.years} tuổi</strong> <span class="text-muted/50 text-sm">(${age.display})</span>`;
            } else {
                ageEl.style.display = 'none';
            }
        } else {
            ageEl.style.display = 'none';
        }
    }
    
    // Wildcard display
    if (wildcardEl) {
        const jersey = (profile.jerseyNumber ?? '?');
        const colorId = profile.wildcardColor || 'pink';
        const gradient = getWildcardGradient(colorId);
        wildcardEl.style.background = gradient;
        wildcardEl.textContent = `#${jersey}`;
        wildcardEl.style.display = 'flex';
    }

    vinylImg.addEventListener('error', () => {
        vinylImg.src = '';
        vinylImg.alt = 'No photo';
    });

    // 🎵 Vinyl Double-Click Easter Egg
    let vinylAudioCtx = null;
    let vinylAudioTimeout = null;
    let previousVinylRingDuration = null;
    vinylImg.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        
        // Fast spin + wobble animation
        gsap.to(vinylImg, {
            rotation: 720,
            scale: 1.3,
            duration: 0.7,
            ease: 'power2.out',
            onComplete: () => {
                gsap.to(vinylImg, {
                    rotation: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: 'elastic.out(1, 0.3)',
                    clearProps: 'transform'
                });
            }
        });
        
        // Sound effect: ascending wobble tone
        try {
            // Clear old timeout + close old context to prevent leak
            if (vinylAudioTimeout) clearTimeout(vinylAudioTimeout);
            if (vinylAudioCtx) vinylAudioCtx.close();
            vinylAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = vinylAudioCtx.createOscillator();
            const gain = vinylAudioCtx.createGain();
            osc.connect(gain);
            gain.connect(vinylAudioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, vinylAudioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1500, vinylAudioCtx.currentTime + 0.35);
            gain.gain.setValueAtTime(0.25, vinylAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, vinylAudioCtx.currentTime + 0.6);
            osc.start(vinylAudioCtx.currentTime);
            osc.stop(vinylAudioCtx.currentTime + 0.6);
            vinylAudioTimeout = setTimeout(() => {
                if (vinylAudioCtx) { vinylAudioCtx.close(); vinylAudioCtx = null; }
                vinylAudioTimeout = null;
            }, 700);
        } catch {}
        
        // 🎊 Sparkle particles around vinyl
        const vRect = vinylImg.getBoundingClientRect();
        const colors = ['#FF8AB8', '#FFD54F', '#81D4FA', '#A5D6A7', '#CE93D8', '#fff'];
        for (let i = 0; i < 14; i++) {
            const spark = document.createElement('div');
            spark.className = 'fixed pointer-events-none z-[12000]';
            const size = 4 + Math.random() * 8;
            const isStar = Math.random() > 0.5;
            spark.style.cssText = `
                left: ${vRect.left + vRect.width * 0.5}px;
                top: ${vRect.top + vRect.height * 0.5}px;
                width: ${size}px;
                height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${isStar ? '50%' : '2px'};
                ${isStar ? '' : 'transform: rotate(45deg);'}
                box-shadow: 0 0 ${6 + Math.random() * 6}px ${colors[Math.floor(Math.random() * colors.length)]};
            `;
            document.body.appendChild(spark);
            gsap.to(spark, {
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100,
                scale: 0,
                opacity: 0,
                rotation: Math.random() * 360,
                duration: 0.6 + Math.random() * 0.4,
                ease: 'power2.out',
                delay: Math.random() * 0.15,
                onComplete: () => spark.remove()
            });
        }
        
        // Speed up vinyl ring temporarily (only save if not already set)
        const vinylRing = modal.querySelector('[class*="animate-"]');
        if (vinylRing) {
            if (previousVinylRingDuration === null) {
                previousVinylRingDuration = vinylRing.style.animationDuration || '';
            }
            gsap.to(vinylRing, { rotation: 180, duration: 0.4, ease: 'power2.out' });
            vinylRing.style.animationDuration = '0.8s';
            setTimeout(() => {
                gsap.to(vinylRing, { rotation: 0, duration: 0.3 });
                if (previousVinylRingDuration !== null) {
                    vinylRing.style.animationDuration = previousVinylRingDuration;
                    previousVinylRingDuration = null;
                }
            }, 800);
        }
        
        markEggFound('vinyl');
        showToast('💿 Woosh~ Bạn đã tìm thấy Vinyl Easter Egg! 🥚✨');
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
        currentProfileUid = null;
        // Clean up vinyl easter egg AudioContext
        if (vinylAudioTimeout) { clearTimeout(vinylAudioTimeout); vinylAudioTimeout = null; }
        if (vinylAudioCtx) { vinylAudioCtx.close(); vinylAudioCtx = null; }
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

        // Clean up embed container
        if (musicEmbed) {
            musicEmbed.innerHTML = '';
            musicEmbed.classList.add('hidden');
        }

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

    // Single typeLabels definition
    const typeLabels = {
        youtube: '▶️ YouTube',
        spotify: '🎧 Spotify',
        soundcloud: '🎵 SoundCloud',
        mp3: '🎶 MP3'
    };

    const musicTypeBadge = document.getElementById('music-type-badge');
    const musicEmbed = document.getElementById('music-embed-container');
    
    // Detect music type on load
    if (profile.musicUrl && musicTypeBadge) {
        const detectedType = detectMusicLinkType(profile.musicUrl);
        musicTypeBadge.textContent = typeLabels[detectedType] || '';
    }
    
    playBtn.onclick = () => {
        if (!isPlaying) {
            if (profile.musicUrl) {
                const detectedType = detectMusicLinkType(profile.musicUrl);
                
                if (detectedType === 'youtube' || detectedType === 'spotify' || detectedType === 'soundcloud') {
                    // Show embed instead of raw audio
                    const embedUrl = getMusicEmbedUrl(profile.musicUrl);
                    if (embedUrl && musicEmbed) {
                        musicEmbed.innerHTML = `
                            <div class="embed-hidden-branding">
                                <iframe src="${escapeHtml(embedUrl)}" 
                                    class="w-full h-52 rounded-xl" 
                                    frameborder="0" 
                                    allow="autoplay; encrypted-media" 
                                    allowfullscreen
                                    loading="lazy"></iframe>
                                <div class="embed-logo-cover"></div>
                            </div>
                        `;
                        musicEmbed.classList.remove('hidden');
                        // Hide progress bar — not needed for embeds
                        if (progressBar) progressBar.style.width = '0%';
                        playBtn.textContent = '⏹️';
                        isPlaying = true;
                        
                        // Stop background audio when playing embed
                        AudioEngine.fadeOutBackground();
                        
                        showToast(`🎵 Đang mở ${typeLabels[detectedType] || 'nhạc'}!`);
                    } else {
                        showToast('Không thể tạo embed cho link này! 😅');
                    }
                } else {
                    // Direct audio (mp3, etc.) — use AudioEngine
                    AudioEngine.playPrivate(profile.musicUrl, (progress) => {
                        if (progressBar) progressBar.style.width = Math.round(progress * 100) + '%';
                    });
                    playBtn.textContent = '⏸️';
                    isPlaying = true;
                    
                    if (musicEmbed) {
                        musicEmbed.classList.add('hidden');
                        musicEmbed.innerHTML = '';
                    }
                }

                const vinylRing = modal.querySelector('[class*="animate-"]');
                if (vinylRing) vinylRing.style.animationDuration = '4s';
            } else {
                showToast("Bạn này chưa đăng tải nhạc riêng cậu ơi! 🎵");
            }
        } else {
            // Stop — handle both embed and audio
            if (musicEmbed) {
                musicEmbed.innerHTML = '';
                musicEmbed.classList.add('hidden');
            }
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


// ─── 📝 RENDER STATUS CARD ───
function renderStatusCard(statusId, status, reactionCount, commentsList, userReacted, badgeHtml = '') {
    const userEmoji = userReacted ? userReacted.emoji : '';
    const timeStr = timeAgo(status.timestamp);
    const hasImage = status.image && status.image.trim();
    
    return `
        <div class="status-card liquid-glass p-4 md:p-6 bg-white/40" data-status-id="${escapeHtml(statusId)}">
            <!-- Header -->
            <div class="flex items-center gap-3 mb-3">
                <img src="${escapeHtml(status.userPhoto || '')}" class="w-8 h-8 rounded-full object-cover border border-white/50" onerror="this.style.display='none'" loading="lazy">
                <div class="flex-1 min-w-0">
                    <span class="font-body text-sm font-bold text-muted">${escapeHtml(status.userName || 'Ai đó')}</span>
                    <span class="text-[10px] text-muted/30 ml-2">${escapeHtml(timeStr)}</span>
                    ${badgeHtml}
                </div>
            </div>
            
            <!-- Text -->
            ${status.text ? `<p class="font-body text-sm text-muted/80 mb-3 leading-relaxed">${escapeHtml(status.text)}</p>` : ''}
            
            <!-- Image -->
            ${hasImage ? `<img src="${escapeHtml(status.image)}" class="w-full max-h-64 object-cover rounded-xl mb-3" onerror="this.style.display='none'" loading="lazy">` : ''}
            
            <!-- Actions: Reactions + Comments -->
            <div class="flex items-center gap-4 pt-3 border-t border-[#3E2723]/10">
                <!-- Reaction Button -->
                <button class="status-reaction-btn flex items-center gap-1.5 text-sm transition-all hover:scale-110 ${userReacted ? 'text-[#FF8AB8]' : 'text-muted/40'}" 
                        data-status-id="${escapeHtml(statusId)}" data-emoji="❤️">
                    ${userReacted ? userReacted.emoji : '❤️'}
                    <span class="text-xs">${reactionCount || 0}</span>
                </button>
                
                <!-- Emoji Picker Toggle -->
                <button class="status-emoji-picker-btn text-sm text-muted/40 hover:text-muted/70 transition-all" data-status-id="${escapeHtml(statusId)}">
                    😊 +
                </button>
                
                <!-- Comment Toggle -->
                <button class="status-comment-toggle text-sm text-muted/40 hover:text-muted/70 transition-all flex items-center gap-1" data-status-id="${escapeHtml(statusId)}">
                    💬 <span class="text-xs">${commentsList.length}</span>
                </button>
                
                <!-- Share -->
                <button class="status-share-btn text-sm text-muted/30 hover:text-[#81D4FA] transition-all ml-auto" data-status-id="${escapeHtml(statusId)}">
                    📤
                </button>
            </div>
            
            <!-- Emoji Picker (hidden) -->
            <div class="status-emoji-picker hidden mt-2 flex gap-2 flex-wrap" data-status-id="${escapeHtml(statusId)}">
                ${['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '💖', '🌟', '🎉'].map(e => 
                    `<button class="emoji-option text-lg hover:scale-125 transition-all ${userReacted?.emoji === e ? 'scale-125' : ''}" 
                             data-status-id="${escapeHtml(statusId)}" data-emoji="${e}">${e}</button>`
                ).join('')}
            </div>
            
            <!-- Comments Section (hidden) -->
            <div class="status-comments hidden mt-3 pt-3 border-t border-[#3E2723]/10 flex flex-col gap-3" data-status-id="${escapeHtml(statusId)}">
                ${commentsList.map(c => `
                    <div class="flex items-start gap-2">
                        <img src="${escapeHtml(c.userPhoto || '')}" class="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" onerror="this.style.display='none'" loading="lazy">
                        <div class="flex-1 min-w-0 bg-white/30 rounded-xl px-3 py-2">
                            <span class="font-body text-xs font-bold text-muted">${escapeHtml(c.userName || 'Ai đó')}</span>
                            <p class="font-body text-xs text-muted/70 mt-0.5">${escapeHtml(c.text)}</p>
                        </div>
                        <span class="text-[9px] text-muted/20">${timeAgo(c.timestamp)}</span>
                    </div>
                `).join('')}
                
                <!-- Comment input -->
                <div class="flex items-center gap-2 mt-1">
                    <input type="text" class="comment-input flex-1 bg-white/40 rounded-full px-4 py-2 outline-none font-body text-xs" 
                           placeholder="Viết bình luận..." data-status-id="${escapeHtml(statusId)}">
                    <button class="comment-send-btn text-sm text-[#FF8AB8] hover:scale-110 transition-all" data-status-id="${escapeHtml(statusId)}">➤</button>
                </div>
            </div>
        </div>
    `;
}

// ─── 📝 BIND STATUS HANDLERS ───
function bindStatusHandlers(profileUid) {
    // Reaction button
    document.querySelectorAll('.status-reaction-btn').forEach(btn => {
        btn.onclick = async () => {
            const statusId = btn.dataset.statusId;
            const emoji = btn.dataset.emoji;
            if (!statusId || !currentUserId) return;
            try {
                await FirebaseService.toggleReaction(statusId, emoji);
            } catch {}
        };
    });
    
    // Emoji picker toggle
    document.querySelectorAll('.status-emoji-picker-btn').forEach(btn => {
        btn.onclick = () => {
            const statusId = btn.dataset.statusId;
            const picker = document.querySelector(`.status-emoji-picker[data-status-id="${statusId}"]`);
            if (picker) {
                picker.classList.toggle('hidden');
                gsap.from(picker, { height: 0, opacity: 0, duration: 0.2 });
            }
        };
    });
    
    // Emoji options
    document.querySelectorAll('.emoji-option').forEach(btn => {
        btn.onclick = async () => {
            const statusId = btn.dataset.statusId;
            const emoji = btn.dataset.emoji;
            if (!statusId || !currentUserId) return;
            try {
                await FirebaseService.toggleReaction(statusId, emoji);
            } catch {}
            // Close picker
            const picker = btn.closest('.status-emoji-picker');
            if (picker) picker.classList.add('hidden');
        };
    });
    
    // Comment toggle
    document.querySelectorAll('.status-comment-toggle').forEach(btn => {
        btn.onclick = () => {
            const statusId = btn.dataset.statusId;
            const comments = document.querySelector(`.status-comments[data-status-id="${statusId}"]`);
            if (comments) {
                comments.classList.toggle('hidden');
                gsap.from(comments, { height: 0, opacity: 0, duration: 0.3 });
            }
        };
    });
    
    // Comment send
    document.querySelectorAll('.comment-send-btn').forEach(btn => {
        btn.onclick = async () => {
            const statusId = btn.dataset.statusId;
            const input = document.querySelector(`.comment-input[data-status-id="${statusId}"]`);
            if (!input || !input.value.trim() || !currentUserId) return;
            try {
                await FirebaseService.saveComment(statusId, input.value.trim());
                input.value = '';
            } catch {}
        };
    });
    
    // Enter key for comment input
    document.querySelectorAll('.comment-input').forEach(input => {
        input.onkeydown = async (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                const statusId = input.dataset.statusId;
                try {
                    await FirebaseService.saveComment(statusId, input.value.trim());
                    input.value = '';
                } catch {}
            }
        };
    });
    
    // Share button
    document.querySelectorAll('.status-share-btn').forEach(btn => {
        btn.onclick = () => {
            const statusId = btn.dataset.statusId;
            const url = window.location.href.split('?')[0] + '?status=' + statusId;
            navigator.clipboard?.writeText(url).then(() => {
                showToast('📤 Đã copy link bài viết!');
            }).catch(() => {
                showToast('📤 Chia sẻ: ' + url);
            });
        };
    });
}

// ─── 📰 RENDER GLOBAL FEED ───
let currentFeedSort = 'time';

function renderGlobalFeed() {
    const feed = document.getElementById('global-feed');
    if (!feed) return;
    
    if (!allStatusesData) {
        feed.innerHTML = '<p class="font-body text-muted/40 italic text-center py-16">Chưa có bài viết nào...</p>';
        return;
    }
    
    const entries = Object.entries(allStatusesData);
    
    if (entries.length === 0) {
        feed.innerHTML = '<p class="font-body text-muted/40 italic text-center py-16">Chưa có bài viết nào...</p>';
        return;
    }
    
    // Sort: by time (newest first) or by hot (reactions count)
    if (currentFeedSort === 'time') {
        entries.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
    } else {
        // 'hot' - sort by reaction count
        entries.sort((a, b) => {
            const aReactions = allReactionsData?.[a[0]] ? Object.keys(allReactionsData[a[0]]).length : 0;
            const bReactions = allReactionsData?.[b[0]] ? Object.keys(allReactionsData[b[0]]).length : 0;
            if (bReactions !== aReactions) return bReactions - aReactions;
            return (b[1].timestamp || 0) - (a[1].timestamp || 0);
        });
    }
    
    // Show upcoming/new badge on posts < 24h
    const oneDayAgo = Date.now() - 86400000;
    
    feed.innerHTML = entries.slice(0, 50).map(([statusId, status]) => {
        const reactionCount = allReactionsData?.[statusId] ? Object.keys(allReactionsData[statusId]).length : 0;
        const commentsList = allCommentsData?.[statusId] ? Object.values(allCommentsData[statusId]).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)) : [];
        const userReacted = currentUserId && allReactionsData?.[statusId]?.[currentUserId];
        
        let badgeHtml = '';
        if (status.timestamp && status.timestamp > oneDayAgo) {
            badgeHtml = '<span class="text-[9px] font-bold text-[#FF8AB8] bg-[#FF8AB8]/10 px-2 py-0.5 rounded-full ml-2">🔥 Mới</span>';
        }
        
        return renderStatusCard(statusId, status, reactionCount, commentsList, userReacted, badgeHtml);
    }).join('');
    
    // Bind handlers for reactions/comments
    setTimeout(() => bindStatusHandlers(null), 50);
}

// ─── 📝 NEW STATUS MODAL ───
function initNewStatusModal() {
    const btn = document.getElementById('new-status-btn');
    if (!btn) return;
    
    // Show button only when logged in — handled by onAuthChange in initClass
    let pendingStatusImage = null;
    
    btn.onclick = () => {
        // Create modal dynamically
        const existing = document.getElementById('new-status-modal');
        if (existing) existing.remove();
        
        const overlay = document.createElement('div');
        overlay.id = 'new-status-modal';
        overlay.className = 'fixed inset-0 z-[12000] flex items-center justify-center p-4';
        overlay.innerHTML = `
            <div class="absolute inset-0 bg-[#3E2723]/30 backdrop-blur-sm modal-bg"></div>
            <div class="liquid-glass w-full max-w-lg p-6 md:p-8 relative z-10">
                <button class="close-new-status absolute top-4 right-4 text-2xl text-muted/30 hover:text-muted transition-all">✕</button>
                <h3 class="font-heading text-2xl text-[#3E2723] mb-6">📸 Đăng ảnh lên bảng tin</h3>
                
                <!-- Image Upload -->
                <div id="status-image-upload-area" class="w-full aspect-video bg-[#3E2723]/5 rounded-2xl border-2 border-dashed border-[#3E2723]/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF8AB8]/30 transition-all mb-4">
                    <span class="text-5xl mb-3">🖼️</span>
                    <p class="font-body text-sm text-muted/50">Click để chọn ảnh</p>
                    <p class="font-body text-xs text-muted/30 mt-1">hoặc dán link ảnh bên dưới</p>
                </div>
                <img id="status-image-preview" class="w-full max-h-64 object-cover rounded-2xl mb-4 hidden" loading="lazy">
                <input type="file" id="status-image-file-input" accept="image/*" class="hidden">
                <input type="text" id="status-image-url-input" placeholder="Dán link ảnh (https://...)" class="w-full bg-white/40 rounded-full px-5 py-3 outline-none font-body text-sm mb-4">
                
                <!-- Text caption -->
                <textarea id="status-text-input" placeholder="Viết gì đó về bức ảnh... (không bắt buộc)" 
                    class="w-full bg-white/40 rounded-2xl px-5 py-3 outline-none font-body text-sm h-24 resize-none mb-6"></textarea>
                
                <!-- Actions -->
                <div class="flex gap-3">
                    <button class="close-new-status flex-1 px-5 py-3 rounded-full bg-white/40 text-muted font-bold hover:bg-white/60 transition-all">Huỷ</button>
                    <button id="submit-new-status" class="flex-1 px-5 py-3 rounded-full bg-gradient-to-r from-[#FF8AB8] to-[#A5D6A7] text-white font-bold hover:scale-105 transition-all">
                        🚀 Đăng bài
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        gsap.from(overlay.querySelector('.liquid-glass'), { y: 40, opacity: 0, scale: 0.95, duration: 0.4, ease: 'power3.out' });
        
        pendingStatusImage = null;
        const uploadArea = overlay.querySelector('#status-image-upload-area');
        const preview = overlay.querySelector('#status-image-preview');
        const fileInput = overlay.querySelector('#status-image-file-input');
        const urlInput = overlay.querySelector('#status-image-url-input');
        const textInput = overlay.querySelector('#status-text-input');
        const submitBtn = overlay.querySelector('#submit-new-status');
        
        // Close handlers
        overlay.querySelectorAll('.close-new-status').forEach(el => {
            el.onclick = () => {
                gsap.to(overlay, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: () => overlay.remove() });
            };
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.classList.contains('modal-bg')) {
                gsap.to(overlay, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: () => overlay.remove() });
            }
        });
        
        // Upload area click → file input
        uploadArea.onclick = () => fileInput.click();
        
        // File input change
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                showToast('Chỉ chấp nhận file ảnh! 📸');
                fileInput.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                showToast('Ảnh quá lớn! Chọn ảnh dưới 10MB 📸');
                fileInput.value = '';
                return;
            }
            try {
                const raw = await readFileAsDataURL(file);
                pendingStatusImage = await compressImage(raw, 1200, 0.82);
                preview.src = pendingStatusImage;
                preview.classList.remove('hidden');
                uploadArea.classList.add('hidden');
                showToast('Đã chọn ảnh! 📸');
            } catch {
                showToast('Không thể đọc ảnh, thử lại! 😅');
            }
            fileInput.value = '';
        });
        
        // URL input change
        urlInput.addEventListener('input', () => {
            const url = urlInput.value.trim();
            if (url.match(/^https?:\/\/.+\/.+/i)) {
                pendingStatusImage = url;
                preview.src = url;
                preview.classList.remove('hidden');
                uploadArea.classList.add('hidden');
            } else if (!url) {
                pendingStatusImage = null;
                preview.classList.add('hidden');
                uploadArea.classList.remove('hidden');
            }
        });
        
        // Submit
        submitBtn.onclick = async () => {
            if (!pendingStatusImage && !textInput.value.trim()) {
                showToast('Hãy chọn ảnh hoặc viết gì đó! 📝');
                return;
            }
            
            submitBtn.textContent = '⏳ Đang đăng...';
            submitBtn.disabled = true;
            
            try {
                let imageUrl = '';
                if (pendingStatusImage && pendingStatusImage.startsWith('data:')) {
                    imageUrl = await CloudinaryService.uploadImage(pendingStatusImage);
                } else if (pendingStatusImage && pendingStatusImage.startsWith('http')) {
                    imageUrl = pendingStatusImage;
                }
                
                await FirebaseService.saveStatus({
                    text: sanitizeText(textInput.value.trim()),
                    image: imageUrl
                });
                
                showToast('Đã đăng bài lên bảng tin! 🚀');
                gsap.to(overlay, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: () => overlay.remove() });
            } catch (err) {
                console.error('Save status error:', err);
                showToast('Đăng thất bại, thử lại nhé! 😅');
            } finally {
                submitBtn.textContent = '🚀 Đăng bài';
                submitBtn.disabled = false;
            }
        };
        
        // Enter key in URL → auto-preview
        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                urlInput.dispatchEvent(new Event('input'));
            }
        });
    };
}

// ─── 🧠 QUIZ FUNCTIONS ───
function initQuiz() {
    const addBtn = document.getElementById('add-question-btn');
    const container = document.getElementById('quiz-questions-edit');
    const select = document.getElementById('quiz-target-select');
    const quizArea = document.getElementById('quiz-area');
    
    // Cache data at module level to avoid listener accumulation
    let cachedQuizData = null;
    let cachedProfiles = null;
    
    // Single top-level listeners (NOT inside select change handler)
    FirebaseService.onQuizQuestionsChange((data) => {
        cachedQuizData = data;
        // If a target is selected, re-render
        if (select && select.value) {
            renderQuiz(select.value, cachedQuizData, cachedProfiles, quizArea);
        }
    });
    
    subscribeProfiles((data) => {
        cachedProfiles = data;
        // If a target is selected, re-render with updated names
        if (select && select.value) {
            renderQuiz(select.value, cachedQuizData, cachedProfiles, quizArea);
        }
    });
    
    function renderQuiz(targetUid, quizData, profiles, area) {
        if (!area) return;
        
        const questions = quizData?.[targetUid];
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            area.innerHTML = '<p class="font-body text-muted/40 italic text-center py-12">🤔 Bạn này chưa đặt câu hỏi nào...</p>';
            return;
        }
        
        const targetName = profiles?.[targetUid]?.name || 'bạn ấy';
        
        // Shuffle questions and pick 5
        const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 5);
        
        let html = `
            <div class="quiz-header mb-6">
                <h4 class="font-heading text-2xl text-muted">Quiz về <span class="text-[#FF8AB8]">${escapeHtml(targetName)}</span></h4>
                <p class="font-body text-sm text-muted/50">Trả lời ${shuffled.length} câu hỏi — xem bạn có hiểu rõ không!</p>
            </div>
            <div class="quiz-questions-list flex flex-col gap-4 mb-6">
        `;
        
        shuffled.forEach((q, i) => {
            html += `
                <div class="quiz-question-item liquid-glass p-4 bg-white/30">
                    <p class="font-body text-sm text-muted font-semibold mb-2">${i + 1}. ${escapeHtml(q)}</p>
                    <div class="flex flex-wrap gap-2">
                        <label class="quiz-option flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 cursor-pointer hover:bg-[#FF8AB8]/10 transition-all">
                            <input type="radio" name="quiz_q_${i}" value="yes" class="accent-[#FF8AB8]">
                            <span class="text-sm text-muted">Đúng 👍</span>
                        </label>
                        <label class="quiz-option flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 cursor-pointer hover:bg-[#A5D6A7]/10 transition-all">
                            <input type="radio" name="quiz_q_${i}" value="no" class="accent-[#A5D6A7]">
                            <span class="text-sm text-muted">Sai 👎</span>
                        </label>
                        <label class="quiz-option flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 cursor-pointer hover:bg-[#81D4FA]/10 transition-all">
                            <input type="radio" name="quiz_q_${i}" value="maybe" class="accent-[#81D4FA]">
                            <span class="text-sm text-muted">Có thể... 🤔</span>
                        </label>
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            <button id="quiz-submit-btn" class="bg-gradient-to-r from-[#FF8AB8] to-[#A5D6A7] text-white px-10 py-4 rounded-full font-heading text-lg hover:scale-105 transition-all">
                🎯 Nộp bài
            </button>
        `;
        
        area.innerHTML = html;
        gsap.from(area.children, { y: 20, opacity: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' });
        
        // Submit handler
        document.getElementById('quiz-submit-btn')?.addEventListener('click', () => {
            let answered = 0;
            const total = shuffled.length;
            shuffled.forEach((_, i) => {
                const selected = document.querySelector(`input[name="quiz_q_${i}"]:checked`);
                if (selected) answered++;
            });
            
            const score = Math.round((answered / total) * 100);
            const pct = Math.max(0, Math.min(100, score));
            
            let emoji = '😅', msg = 'Cố gắng hơn nhé!';
            if (pct >= 80) { emoji = '🥰'; msg = 'Hiểu nhau ghê!'; }
            else if (pct >= 60) { emoji = '🤗'; msg = 'Khá tốt!'; }
            else if (pct >= 40) { emoji = '😊'; msg = 'Cũng tạm được!'; }
            else if (pct >= 20) { emoji = '🤔'; msg = 'Chưa hiểu lắm!'; }
            
            const resultHtml = `
                <div class="quiz-result text-center py-8">
                    <div class="text-6xl mb-4">${emoji}</div>
                    <h4 class="font-heading text-4xl text-muted mb-2">${pct}%</h4>
                    <p class="font-body text-muted/70 mb-2">${answered}/${total} câu trả lời</p>
                    <p class="font-handwriting text-xl text-[#FF8AB8]">${msg}</p>
                    <button class="quiz-retry-btn mt-6 text-sm text-muted/50 hover:text-muted transition-all" data-target="${escapeHtml(targetUid)}">⟳ Làm lại</button>
                </div>
            `;
            
            // Save score to Firebase
            if (currentUserId && targetUid !== currentUserId) {
                FirebaseService.saveQuizScore(targetUid, {
                    score: pct,
                    correct: answered,
                    total
                }).catch(() => {});
            }
            
            area.innerHTML += resultHtml;
            gsap.from(area.querySelector('.quiz-result'), { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2)' });
            
            const submitBtn = document.getElementById('quiz-submit-btn');
            if (submitBtn) submitBtn.disabled = true;
            
            // Fix: Retry via click delegation
        });
    }
    
    // Fix: Retry click delegation
    document.addEventListener('click', (e) => {
        const retryBtn = e.target.closest('.quiz-retry-btn');
        if (retryBtn) {
            const targetUid = retryBtn.dataset.target;
            if (targetUid && select) {
                select.value = targetUid;
                renderQuiz(targetUid, cachedQuizData, cachedProfiles, quizArea);
            }
        }
    });
    
    // Add question to own quiz
    if (addBtn && container) {
        addBtn.onclick = () => {
            const div = document.createElement('div');
            div.className = 'flex items-center gap-2';
            div.innerHTML = `
                <input type="text" class="quiz-q-input flex-1 bg-white/40 rounded-full px-4 py-2 outline-none font-body text-sm" placeholder="Câu hỏi của bạn...">
                <button class="quiz-q-remove text-[#FF5757] hover:scale-110 transition-all text-sm" type="button">✕</button>
            `;
            container.appendChild(div);
            div.querySelector('.quiz-q-remove').onclick = () => div.remove();
            gsap.from(div, { x: -20, opacity: 0, duration: 0.3 });
        };
    }
    
    // Quiz taking — select change just triggers re-render from cached data
    if (select) {
        select.addEventListener('change', () => {
            const targetUid = select.value;
            if (!targetUid || !quizArea) {
                if (quizArea) quizArea.innerHTML = '<p class="font-body text-muted/50 italic text-center py-12">Chọn một thành viên để bắt đầu quiz! 🌟</p>';
                return;
            }
            quizArea.innerHTML = '<p class="text-center py-8 text-muted/50">⏳ Đang tải câu hỏi...</p>';
            renderQuiz(targetUid, cachedQuizData, cachedProfiles, quizArea);
        });
    }
    
    // ═══════════════ LEADERBOARD ═══════════════
    let cachedLeaderboardProfiles = null;
    let cachedScoresData = null;
    
    function renderLeaderboard() {
        const leaderboard = document.getElementById('quiz-leaderboard');
        if (!leaderboard) return;
        
        if (!cachedScoresData) {
            leaderboard.innerHTML = '<p class="font-body text-muted/40 italic text-center py-8">Chưa có dữ liệu...</p>';
            return;
        }
        
        const profiles = cachedLeaderboardProfiles || {};
        // Aggregate best scores per target+player combo
        const bestScores = {};
        
        Object.entries(cachedScoresData).forEach(([targetUid, scores]) => {
            if (!scores) return;
            const targetName = profiles?.[targetUid]?.name || 'Ai đó';
            
            Object.values(scores).forEach(entry => {
                if (!entry) return;
                const key = targetUid + '_' + (entry.playerUid || 'anon');
                if (!bestScores[key] || entry.score > bestScores[key].score) {
                    bestScores[key] = {
                        targetUid,
                        targetName,
                        playerName: entry.playerName || 'Ai đó',
                        playerUid: entry.playerUid,
                        score: entry.score,
                        timestamp: entry.timestamp
                    };
                }
            });
        });
        
        const entries = Object.values(bestScores).sort((a, b) => b.score - a.score).slice(0, 20);
        
        if (entries.length === 0) {
            leaderboard.innerHTML = '<p class="font-body text-muted/40 italic text-center py-8">Chưa có điểm số nào...</p>';
            return;
        }
        
        const medals = ['🥇', '🥈', '🥉'];
        leaderboard.innerHTML = entries.map((entry, i) => `
            <div class="flex items-center gap-3 px-4 py-3 rounded-xl ${i < 3 ? 'bg-[#FF8AB8]/10' : 'bg-white/20'} transition-all hover:bg-[#FF8AB8]/10">
                <span class="text-lg w-8 text-center">${i < 3 ? medals[i] : `#${i + 1}`}</span>
                <div class="flex-1 min-w-0">
                    <p class="font-body text-sm text-muted font-semibold truncate">${escapeHtml(entry.playerName)}</p>
                    <p class="font-body text-xs text-muted/50 truncate">về ${escapeHtml(entry.targetName)}</p>
                </div>
                <span class="font-heading text-lg text-[#FF8AB8]">${entry.score}%</span>
            </div>
        `).join('');
        
        gsap.from(leaderboard.children, { x: -20, opacity: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out' });
    }
    
    subscribeProfiles((data) => {
        cachedLeaderboardProfiles = data;
        renderLeaderboard();
    });
    
    FirebaseService.onQuizScoresChange((scoresData) => {
        cachedScoresData = scoresData;
        renderLeaderboard();
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
    // ═══════════════ CROSS-DEVICE LOGIN REQUEST LISTENER (Phone side) ═══════════════
    let crossDeviceFilterUnsub = null;
    let handledCrossDeviceRequests = new Set();
    
    async function setupCrossDeviceListener(uid) {
        // Clean up previous listener
        if (crossDeviceFilterUnsub) { crossDeviceFilterUnsub(); crossDeviceFilterUnsub = null; }
        
        try {
            // Get this user's verified email
            const verified = await FirebaseService.getVerifiedEmail(uid);
            if (!verified || !verified.email) return;
            
            const myEmail = verified.email;
            
            // Listen for pending login requests for this email
            crossDeviceFilterUnsub = FirebaseService.onLoginRequestsForEmail(myEmail, (requestId, req) => {
                // Ignore if already handled or not pending
                if (req.status !== 'pending') return;
                if (handledCrossDeviceRequests.has(requestId)) return;
                handledCrossDeviceRequests.add(requestId);
                
                showCrossDeviceApprovalModal(requestId, myEmail, uid);
            });
            
            // Clean up old request IDs from set (prevent memory leak)
            setTimeout(() => { handledCrossDeviceRequests = new Set(); }, 120000);
        } catch (err) {
            console.error('Cross-device listener setup error:', err);
        }
    }
    
    function showCrossDeviceApprovalModal(requestId, email, uid) {
        // Remove any existing cross-device modal
        const existing = document.getElementById('cross-device-modal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'cross-device-modal';
        modal.className = 'fixed inset-0 z-[15000] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-[#3E2723]/30 backdrop-blur-sm modal-bg"></div>
            <div class="liquid-glass w-full max-w-sm p-6 md:p-8 relative z-10 text-center animate-bounce-in">
                <div class="text-6xl mb-4">📱</div>
                <h3 class="font-heading text-2xl text-muted mb-2">Yêu cầu đăng nhập</h3>
                <p class="font-body text-sm text-muted/60 mb-1">
                    Có người muốn đăng nhập vào <strong>Ký Ức Trong Veo</strong>
                    từ thiết bị khác bằng email:
                </p>
                <p class="font-body text-base font-bold text-[#FF8AB8] mb-1">${escapeHtml(email)}</p>
                <p class="font-body text-xs text-muted/40 mb-6">
                    Bạn có muốn cho phép?
                </p>
                <div class="flex gap-3">
                    <button id="cross-deny-btn" class="flex-1 px-5 py-3 rounded-full bg-white/40 text-muted font-bold hover:bg-[#FF5757]/20 hover:text-[#FF5757] transition-all text-sm">
                        ❌ Từ chối
                    </button>
                    <button id="cross-approve-btn" class="flex-1 px-5 py-3 rounded-full bg-gradient-to-r from-[#A5D6A7] to-[#81D4FA] text-white font-bold hover:scale-105 transition-all text-sm">
                        ✅ Xác nhận
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        gsap.from(modal.querySelector('.liquid-glass'), { y: 40, opacity: 0, scale: 0.95, duration: 0.5, ease: 'power3.out' });
        
        // Show toast notification as well
        showToast('📱 Có yêu cầu đăng nhập từ thiết bị khác!');
        
        const approveBtn = modal.querySelector('#cross-approve-btn');
        const denyBtn = modal.querySelector('#cross-deny-btn');
        
        approveBtn.onclick = async () => {
            approveBtn.disabled = true;
            approveBtn.textContent = '⏳ Đang xác nhận...';
            try {
                await FirebaseService.approveLoginRequest(requestId, uid);
                showToast('✅ Đã xác nhận! Thiết bị kia sẽ tự động đăng nhập.');
                gsap.to(modal, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: () => modal.remove() });
            } catch (err) {
                console.error('Approve error:', err);
                showToast('Xác nhận thất bại! 😅');
                approveBtn.disabled = false;
                approveBtn.textContent = '✅ Xác nhận';
            }
        };
        
        denyBtn.onclick = async () => {
            denyBtn.disabled = true;
            try {
                await FirebaseService.denyLoginRequest(requestId);
                showToast('❌ Đã từ chối yêu cầu đăng nhập.');
                gsap.to(modal, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: () => modal.remove() });
            } catch (err) {
                console.error('Deny error:', err);
                denyBtn.disabled = false;
            }
        };
        
        // Close on backdrop click = deny
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-bg')) {
                denyBtn.click();
            }
        });
    }

    FirebaseService.onAuthChange((user) => {
        currentUserId = user?.uid || null;
        
        // Set up cross-device listener when logged in
        if (user?.uid) {
            setupCrossDeviceListener(user.uid);
        } else {
            if (crossDeviceFilterUnsub) { crossDeviceFilterUnsub(); crossDeviceFilterUnsub = null; }
        }
        
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
            subscribeProfiles((allProfiles) => {
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
                    // Pre-fill new fields
                    const birthInput = document.getElementById('edit-birthdate');
                    if (birthInput && myProfile.birthDate) birthInput.value = myProfile.birthDate;
                    const jerseyInput = document.getElementById('edit-jersey');
                    if (jerseyInput && myProfile.jerseyNumber) jerseyInput.value = myProfile.jerseyNumber;
                    // Pre-fill social links
                    const socialFields = {
                        'edit-social-fb': 'facebook',
                        'edit-social-ig': 'instagram',
                        'edit-social-tt': 'tiktok',
                        'edit-social-yt': 'youtube',
                        'edit-social-gh': 'github',
                        'edit-social-za': 'zalo'
                    };
                    if (myProfile.socialLinks) {
                        Object.entries(socialFields).forEach(([elId, key]) => {
                            const el = document.getElementById(elId);
                            if (el && myProfile.socialLinks[key]) el.value = myProfile.socialLinks[key];
                        });
                    }
                    // Select wildcard color
                    if (myProfile.wildcardColor) {
                        document.querySelectorAll('#wildcard-color-picker button').forEach(btn => {
                            btn.classList.remove('selected', 'ring-2', 'ring-[#FF8AB8]', 'scale-110');
                            if (btn.dataset.color === myProfile.wildcardColor) {
                                btn.classList.add('selected', 'ring-2', 'ring-[#FF8AB8]', 'scale-110');
                            }
                        });
                    }
                }
            });
        // Show/hide new status button based on auth state
        const newStatusBtn = document.getElementById('new-status-btn');
        if (newStatusBtn) {
            newStatusBtn.classList.toggle('hidden', !user);
        }
        
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

                // Collect quiz questions
                const qInputs = document.querySelectorAll('.quiz-q-input');
                const quizQuestions = [];
                qInputs.forEach(input => {
                    const val = sanitizeText(input.value);
                    if (val) quizQuestions.push(val);
                });

                // Save quiz questions separately
                if (quizQuestions.length > 0 && currentUserId) {
                    await FirebaseService.saveQuizQuestions(currentUserId, quizQuestions);
                }

                const birthDate = document.getElementById('edit-birthdate')?.value || '';
                const jerseyNumber = parseInt(document.getElementById('edit-jersey')?.value) || 0;
                const selectedColor = document.querySelector('#wildcard-color-picker .selected')?.dataset?.color || 'pink';
                
                // Collect social links
                const socialLinks = {
                    facebook: document.getElementById('edit-social-fb')?.value?.trim() || '',
                    instagram: document.getElementById('edit-social-ig')?.value?.trim() || '',
                    tiktok: document.getElementById('edit-social-tt')?.value?.trim() || '',
                    youtube: document.getElementById('edit-social-yt')?.value?.trim() || '',
                    github: document.getElementById('edit-social-gh')?.value?.trim() || '',
                    zalo: document.getElementById('edit-social-za')?.value?.trim() || ''
                };

                await FirebaseService.saveProfile({
                    nick: sanitizeText(nickInput.value),
                    bio: sanitizeText(bioInput.value),
                    musicName: sanitizeText(mNameInput.value),
                    musicUrl: mUrlInput.value.trim().slice(0, 500),
                    birthDate,
                    jerseyNumber,
                    wildcardColor: selectedColor,
                    socialLinks,
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

    // ═══════════════ POLAROID GALLERY + WILDCARD GALLERY ═══════════════
    subscribeProfiles((data) => {
        if (!data || !Object.keys(data).length) {
            scrapbookBoard.innerHTML = '<p class="col-span-full text-center py-20 font-handwriting text-2xl">Chưa có ai đăng ký cả, cậu là người đầu tiên chứ? ✨</p>';
            document.getElementById('wildcard-gallery').innerHTML = '<p class="col-span-full text-center py-20 font-handwriting text-xl text-muted/50">Chưa có dữ liệu...</p>';
            return;
        }
        
        // ─── POLAROID CARDS ───
        scrapbookBoard.innerHTML = '';
        Object.values(data).forEach((profile) => {
            const rotation = (Math.random() * 8 - 4);
            const card = document.createElement('div');
            card.className = "member-card";
            card.style.transform = `rotate(${rotation}deg)`;
            
            // Calculate age if birthDate exists
            let ageHtml = '';
            if (profile.birthDate) {
                const age = calculateAge(profile.birthDate);
                if (age) ageHtml = `<p class="font-body text-xs text-muted/40 mt-1">${age.years} tuổi</p>`;
            }
            
            card.innerHTML = `
                <img src="${escapeHtml(profile.photo || '')}" class="card-img" onerror="this.style.display='none'" loading="lazy" alt="${escapeHtml(profile.name || '')}">
                <h3 class="font-heading text-2xl text-[#5D4037] mt-4">${escapeHtml(profile.name || '')}</h3>
                <p class="font-handwriting text-lg mt-1">"${escapeHtml(profile.nick || 'Thanh xuân')}"</p>
                ${ageHtml}
            `;
            card.onclick = () => openProfile(profile);
            scrapbookBoard.appendChild(card);
        });
        
        // ─── WILDCARD GALLERY ───
        const wildcardGallery = document.getElementById('wildcard-gallery');
        if (wildcardGallery) {
            wildcardGallery.innerHTML = '';
            const profiles = Object.values(data);
            // Sort by jersey number (or name)
            profiles.sort((a, b) => (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99));
            
            profiles.forEach((profile) => {
                const colorId = profile.wildcardColor || 'pink';
                const gradient = getWildcardGradient(colorId);
                const jersey = (profile.jerseyNumber ?? '?');
                const name = profile.name || 'Ai đó';
                const nick = profile.nick || '';
                
                const card = document.createElement('div');
                card.className = 'wildcard-card';
                card.style.background = gradient;
                card.innerHTML = `
                    <div class="wildcard-jersey">${escapeHtml(String(jersey))}</div>
                    <div class="wildcard-name">${escapeHtml(name)}</div>
                    ${nick ? `<div class="wildcard-nick">"${escapeHtml(nick)}"</div>` : ''}
                    ${profile.birthDate ? `<div class="wildcard-age">${calculateAge(profile.birthDate)?.years || '?'} tuổi</div>` : ''}
                `;
                card.onclick = (e) => {
                    // 🎯 Wildcard wobble + particle burst (Minecraft allay style)
                    const rect = card.getBoundingClientRect();
                    
                    // Wobble animation
                    gsap.to(card, {
                        rotation: -5,
                        scaleX: 1.08,
                        scaleY: 0.92,
                        duration: 0.08,
                        ease: 'power2.out',
                        onComplete: () => {
                            gsap.to(card, {
                                rotation: 4,
                                scaleX: 0.95,
                                scaleY: 1.05,
                                duration: 0.08,
                                ease: 'power2.out',
                                onComplete: () => {
                                    gsap.to(card, {
                                        rotation: -2,
                                        scaleX: 1.02,
                                        scaleY: 0.98,
                                        duration: 0.06,
                                        ease: 'power2.out',
                                        onComplete: () => {
                                            gsap.to(card, {
                                                rotation: 0,
                                                scaleX: 1,
                                                scaleY: 1,
                                                duration: 0.04,
                                                ease: 'power2.out'
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    
                    // 💥 Particle burst
                    const colors = ['#FF8AB8', '#A5D6A7', '#FFD54F', '#81D4FA', '#CE93D8', '#FFAB91', '#fff'];
                    for (let i = 0; i < 20; i++) {
                        const particle = document.createElement('div');
                        particle.className = 'wildcard-particle';
                        const size = 4 + Math.random() * 8;
                        const isStar = Math.random() > 0.6;
                        particle.style.cssText = `
                            position: fixed;
                            left: ${rect.left + rect.width * 0.5}px;
                            top: ${rect.top + rect.height * 0.5}px;
                            width: ${size}px;
                            height: ${size}px;
                            background: ${colors[Math.floor(Math.random() * colors.length)]};
                            border-radius: ${isStar ? '50%' : '2px'};
                            pointer-events: none;
                            z-index: 50000;
                            ${isStar ? '' : 'transform: rotate(45deg);'}
                        `;
                        document.body.appendChild(particle);
                        
                        gsap.to(particle, {
                            x: (Math.random() - 0.5) * 120,
                            y: (Math.random() - 0.5) * 120,
                            scale: 0,
                            opacity: 0,
                            rotation: Math.random() * 360,
                            duration: 0.5 + Math.random() * 0.4,
                            ease: 'power2.out',
                            delay: Math.random() * 0.1,
                            onComplete: () => particle.remove()
                        });
                    }
                    
                    // Open profile after wobble
                    setTimeout(() => openProfile(profile), 300);
                };
                wildcardGallery.appendChild(card);
            });
        }
        
        // ─── QUIZ TARGET SELECT POPULATE ───
        const select = document.getElementById('quiz-target-select');
        if (select) {
            select.innerHTML = '<option value="">— Chọn thành viên —</option>';
            Object.entries(data).forEach(([uid, profile]) => {
                const opt = document.createElement('option');
                opt.value = uid;
                opt.textContent = `${profile.name || 'Ai đó'} ${profile.nick ? `(${profile.nick})` : ''}`;
                select.appendChild(opt);
            });
        }
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

    // ═══════════════ STATUS FEED LISTENERS (Profile + Global) ═══════════════
    FirebaseService.onStatusesChange((data) => {
        allStatusesData = data;
        renderGlobalFeed();            // Re-render open profile modal if one is open
            if (currentProfileUid && allStatusesData) {
                const profileModal2 = document.getElementById('profile-modal');
                if (profileModal2 && profileModal2.style.pointerEvents === 'auto') {
                    renderProfileStatusFeed(currentProfileUid);
                }
            }
        });
    
    FirebaseService.onReactionsChange((data) => {
        allReactionsData = data;
        renderGlobalFeed();
        // Re-render open profile modal
        if (currentProfileUid) {
            const profileModal2 = document.getElementById('profile-modal');
            if (profileModal2 && profileModal2.style.pointerEvents === 'auto') {
                renderProfileStatusFeed(currentProfileUid);
            }
        }
    });
    
    FirebaseService.onCommentsChange((data) => {
        allCommentsData = data;
        renderGlobalFeed();
        // Re-render open profile modal
        if (currentProfileUid) {
            const profileModal2 = document.getElementById('profile-modal');
            if (profileModal2 && profileModal2.style.pointerEvents === 'auto') {
                renderProfileStatusFeed(currentProfileUid);
            }
        }
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

    // ═══════════════ WILDCARD COLOR PICKER ═══════════════
    const colorPicker = document.getElementById('wildcard-color-picker');
    if (colorPicker) {
        colorPicker.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            colorPicker.querySelectorAll('button').forEach(b => {
                b.classList.remove('selected', 'ring-2', 'ring-[#FF8AB8]', 'scale-110');
            });
            btn.classList.add('selected', 'ring-2', 'ring-[#FF8AB8]', 'scale-110');
        });
        // Default select first
        const first = colorPicker.querySelector('button');
        if (first) first.classList.add('selected', 'ring-2', 'ring-[#FF8AB8]', 'scale-110');
    }

    // ═══════════════ GLOBAL FEED SORT TABS ═══════════════
    document.querySelectorAll('.feed-sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.feed-sort-btn').forEach(b => {
                b.classList.remove('active', 'bg-[#FF8AB8]/20');
                b.classList.add('bg-white/30');
            });
            btn.classList.add('active', 'bg-[#FF8AB8]/20');
            btn.classList.remove('bg-white/30');
            currentFeedSort = btn.dataset.sort || 'time';
            renderGlobalFeed();
        });
    });
    
    // ═══════════════ NEW STATUS MODAL ═══════════════
    initNewStatusModal();

    // ═══════════════ QUIZ INIT ═══════════════
    initQuiz();

    initInteractions();
    initDarkMode();
    initEasterEggs();

    // ═══════════════ SINGLE FIREBASE PROFILES LISTENER ═══════════════
    FirebaseService.onProfilesChange((data) => {
        profilesCached = data;
        profilesSubs.forEach(cb => cb(data));
    });
}

// ═══════════════ EASTER EGGS 🥚 ═══════════════
function initEasterEggs() {
    // ─── Wildcard Party Mode ───
    let wildcardClicks = [];
    let partyActive = false;

    document.addEventListener('click', (e) => {
        const wildcardCard = e.target.closest('.wildcard-card');
        if (!wildcardCard || partyActive) return;
        
        const now = Date.now();
        wildcardClicks.push({ time: now });
        // Only keep last 5 seconds
        wildcardClicks = wildcardClicks.filter(c => now - c.time < 5000);
        
        // If 3+ clicks on wildcards within 5s → PARTY!
        if (wildcardClicks.length >= 3) {
            partyActive = true;
            wildcardClicks = [];
            
            const allCards = document.querySelectorAll('.wildcard-card');
            markEggFound('wildcard-party');
            showToast('🎉 WILDCARD PARTY! 🎉');
            
            allCards.forEach((card, i) => {
                gsap.to(card, {
                    rotation: (i % 2 === 0 ? 10 : -10),
                    scale: 1.15,
                    duration: 0.15,
                    yoyo: true,
                    repeat: 9,
                    ease: 'power2.inOut',
                    delay: i * 0.05,
                    onComplete: () => {
                        gsap.to(card, { rotation: 0, scale: 1, duration: 0.2 });
                    }
                });
            });
            
            // Confetti burst
            for (let i = 0; i < 60; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'fixed w-2 h-2 pointer-events-none z-[50000]';
                const colors = ['#FF8AB8', '#A5D6A7', '#FFD54F', '#81D4FA', '#CE93D8', '#FFAB91'];
                confetti.style.cssText = `
                    left: ${Math.random() * 100}vw;
                    top: -10px;
                    width: ${4 + Math.random() * 8}px;
                    height: ${4 + Math.random() * 8}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                    transform: rotate(${Math.random() * 360}deg);
                `;
                document.body.appendChild(confetti);
                
                gsap.to(confetti, {
                    y: window.innerHeight + 20,
                    x: (Math.random() - 0.5) * 200,
                    rotation: Math.random() * 720 - 360,
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: 'power1.in',
                    onComplete: () => confetti.remove()
                });
            }
            
            setTimeout(() => { partyActive = false; }, 5000);
        }
    });
    
    // ─── Secret 'hi' Command ───
    let hiBuffer = '';
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key.length !== 1 || !key.match(/[a-z0-9]/)) {
            hiBuffer = '';
            return;
        }
        hiBuffer = (hiBuffer + key).slice(-5);
        
        if (hiBuffer === 'hi' || hiBuffer === 'chao' || hiBuffer === 'hello') {
            hiBuffer = '';
            
            // Emoji wave from center of screen
            const emojis = ['👋', '💖', '🌟', '✨', '🌸', '🦊', '🌈', '🎉', '💫', '⭐'];
            for (let i = 0; i < 16; i++) {
                const emoji = document.createElement('div');
                emoji.className = 'fixed pointer-events-none z-[50000] text-2xl';
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                emoji.style.cssText = `
                    left: ${window.innerWidth / 2}px;
                    top: ${window.innerHeight / 2}px;
                    transform: translate(-50%, -50%);
                `;
                document.body.appendChild(emoji);
                
                const angle = (Math.PI * 2 * i) / 16;
                const distance = 80 + Math.random() * 120;
                
                gsap.to(emoji, {
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: 0,
                    opacity: 0,
                    rotation: Math.random() * 360 - 180,
                    duration: 1 + Math.random() * 0.5,
                    ease: 'power2.out',
                    onComplete: () => emoji.remove()
                });
            }
            
            markEggFound('secret-hi');
            showToast('🌈 Chào bạn! Chúc một ngày vui vẻ!');
        }
    });
}

initClass();
