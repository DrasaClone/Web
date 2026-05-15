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
