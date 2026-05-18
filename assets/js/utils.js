// ─── Shared Utilities ───

/**
 * Escape HTML to prevent XSS attacks
 */
export function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

/**
 * Sanitize user text input (trim + escape HTML)
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return escapeHtml(text.trim().slice(0, 2000)); // max 2000 chars
}

/**
 * Compress an image data URL to a max resolution + quality
 */
export function compressImage(dataUrl, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}

/**
 * Read a File as base64 data URL
 */
export function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Format timestamp to relative time (Vietnamese)
 */
export function timeAgo(timestamp) {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vài giây trước';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return new Date(timestamp).toLocaleDateString('vi-VN');
}

/**
 * Show a confirmation dialog with custom message and callback
 * Returns a promise that resolves to boolean (true = confirmed)
 */
export function showConfirm(message) {
    return new Promise((resolve) => {
        const existing = document.querySelector('.confirm-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-dialog font-body">
                <div class="text-4xl mb-4">😢</div>
                <p class="text-brown text-lg mb-6 leading-relaxed">${escapeHtml(message)}</p>
                <div class="flex gap-4 justify-center">
                    <button id="confirm-cancel" class="confirm-no px-6 py-3 rounded-full bg-white/30 text-brown font-bold hover:bg-white/50 transition-all">Không, giữ lại</button>
                    <button id="confirm-ok" class="confirm-yes px-6 py-3 rounded-full bg-[#FF5757] text-white font-bold hover:bg-[#ff4040] transition-all">Xóa 🗑️</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));

        const cleanup = (result) => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
            resolve(result);
        };

        overlay.querySelector('.confirm-yes').onclick = () => cleanup(true);
        overlay.querySelector('.confirm-no').onclick = () => cleanup(false);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cleanup(false);
        });
    });
}

/**
 * Debounce utility for rate-limiting
 */
export function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Calculate precise age from birth date string (ISO format YYYY-MM-DD)
 * Returns { years, months, days, totalDays, display }
 */
export function calculateAge(birthDateStr) {
    if (!birthDateStr) return null;
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return null;
    
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    
    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    
    const diff = now.getTime() - birth.getTime();
    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    let display = `${years} tuổi`;
    if (months > 0) display += `, ${months} tháng`;
    if (days > 0) display += `, ${days} ngày`;
    
    return { years, months, days, totalDays, display };
}

/**
 * Calculate time since graduation year
 * Returns { years, months, display }
 */

export function timeSinceYear(targetYear) {
    const now = new Date();
    const target = new Date(targetYear, 5, 1); // June 1st
    const diff = now.getTime() - target.getTime();
    const totalYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    const remaining = diff % (1000 * 60 * 60 * 24 * 365.25);
    const totalMonths = Math.floor(remaining / (1000 * 60 * 60 * 24 * 30.44));
    
    let display = `${totalYears} năm`;
    if (totalMonths > 0) display += `, ${totalMonths} tháng`;
    
    return { years: totalYears, months: totalMonths, display };
}

/**
 * Detect music link type: 'youtube', 'spotify', 'soundcloud', 'mp3', or null
 */
export function detectMusicLinkType(url) {
    if (!url || typeof url !== 'string') return null;
    const u = url.trim().toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
    if (u.includes('spotify.com')) return 'spotify';
    if (u.includes('soundcloud.com')) return 'soundcloud';
    if (u.match(/\.(mp3|wav|ogg|m4a|webm)(\?|$)/i)) return 'mp3';
    return null;
}

/**
 * Convert a music link to an embed URL (for YouTube / Spotify / SoundCloud)
 */
export function getMusicEmbedUrl(url) {
    if (!url) return null;
    const u = url.trim();
    const type = detectMusicLinkType(u);
    
    if (type === 'youtube') {
        // Extract video ID from various YouTube URL formats
        const match = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (match) {
            // modestbranding=1 hides YouTube logo; rel=0 no related videos; iv_load_policy=3 no annotations
            return `https://www.youtube.com/embed/${match[1]}?autoplay=0&loop=1&playlist=${match[1]}&modestbranding=1&rel=0&iv_load_policy=3`;
        }
        return null;
    }
    if (type === 'spotify') {
        // Extract track/album/playlist ID from Spotify URL
        const match = u.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
        if (match) return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
        return null;
    }
    if (type === 'soundcloud') {
        // SoundCloud doesn't have a simple embed ID, use the URL itself
        // hide_related, show_comments=false, show_user=false, buying=false, liking=false, sharing=false, download=false = minimal UI
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(u)}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&buying=false&liking=false&sharing=false&download=false`;
    }
    return null;
}

/**
 * Wildcard color presets (7 colors + rainbow)
 */
export const WILDCARD_COLORS = [
    { id: 'pink', label: 'Hồng', value: '#FF8AB8' },
    { id: 'mint', label: 'Bạc hà', value: '#A5D6A7' },
    { id: 'blue', label: 'Xanh dương', value: '#81D4FA' },
    { id: 'purple', label: 'Tím', value: '#CE93D8' },
    { id: 'gold', label: 'Vàng', value: '#FFD54F' },
    { id: 'coral', label: 'San hô', value: '#FFAB91' },
    { id: 'lavender', label: 'Oải hương', value: '#B39DDB' },
    { id: 'rainbow', label: 'Cầu vồng', value: 'rainbow' }
];

// ─── 🥚 Egg Progress Persistence (shared between main.js & class.js) ───
const EGG_STORAGE_KEY = 'kyuc_egg_progress';

export function getEggProgress() {
    try {
        const data = localStorage.getItem(EGG_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

export function saveEggProgress(ids) {
    try { localStorage.setItem(EGG_STORAGE_KEY, JSON.stringify(ids)); } catch {}
}

export function isEggFound(id) {
    return getEggProgress().includes(id);
}

export function markEggFound(id) {
    const ids = getEggProgress();
    if (!ids.includes(id)) {
        ids.push(id);
        saveEggProgress(ids);
    }
}

/**
 * Get wildcard gradient CSS based on color id
 */
export function getWildcardGradient(colorId) {
    const color = WILDCARD_COLORS.find(c => c.id === colorId);
    if (!color) return 'linear-gradient(135deg, #FF8AB8, #A5D6A7)';
    if (colorId === 'rainbow') {
        return 'linear-gradient(135deg, #FF8AB8, #FFD54F, #A5D6A7, #81D4FA, #CE93D8)';
    }
    // Return a nice gradient using the color
    return `linear-gradient(135deg, ${color.value}, ${color.value}dd)`;
}
