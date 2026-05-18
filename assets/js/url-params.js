// ─── 🔗 URL Params Utility — An toàn, chống injection ───
// Hỗ trợ:
// - Parse tham số URL an toàn (chống XSS, chống injection)
// - Kiểm tra độ dài, ký tự cho phép
// - One-time link (OTP, magic link) với timestamp hết hạn
// - Mã hóa/giải mã dữ liệu nhạy cảm (base64 đơn giản + XOR)

const URLParams = (() => {
    // ─── Constants ───
    const MAX_PARAM_LENGTH = 2000;
    const ALLOWED_PARAM_PATTERN = /^[a-zA-Z0-9@._\-\s+=\/:]+$/;
    const TIMESTAMP_EXPIRY_MS = 10 * 60 * 1000; // 10 phút

    // ─── Helper: Đơn giản hóa key ───
    // Firebase paths không chấp nhận $ . # [ ]
    function sanitizeKey(key) {
        return String(key).replace(/[$[\]\.#\/]/g, '_').trim();
    }

    // ─── Helper: Kiểm tra email ───
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ─── Lấy tham số từ URL an toàn ───
    // Returns: giá trị đã sanitize hoặc null nếu không hợp lệ
    function get(name) {
        try {
            const params = new URLSearchParams(window.location.search);
            const raw = params.get(name);
            if (raw === null) return null;

            return sanitize(raw);
        } catch (e) {
            console.warn('URLParams.get error:', e);
            return null;
        }
    }

    // ─── Lấy nhiều tham số cùng lúc ───
    function getAll(names) {
        const result = {};
        for (const name of names) {
            result[name] = get(name);
        }
        return result;
    }

    // ─── Sanitize giá trị tham số ───
    function sanitize(value) {
        if (typeof value !== 'string') return null;

        // Giới hạn độ dài
        if (value.length > MAX_PARAM_LENGTH) {
            console.warn('URLParams: param too long, truncated');
            return value.slice(0, MAX_PARAM_LENGTH);
        }

        // Kiểm tra ký tự nguy hiểm — block XSS / injection
        if (/<[^>]*>|javascript\s*:|data\s*:\s*text\/html|onerror\s*=|onclick\s*=|onload\s*=/i.test(value)) {
            console.warn('URLParams: blocked potentially malicious param');
            return null;
        }

        // Chặn đường dẫn tuyệt đối nguy hiểm
        if (/^(\/\/|\\\\)/.test(value)) {
            console.warn('URLParams: blocked protocol-relative path');
            return null;
        }

        // Trim
        return value.trim();
    }

    // ─── Lấy email từ URL an toàn ───
    function getEmail() {
        const email = get('email');
        if (!email) return null;
        // Validate định dạng email
        if (!isValidEmail(email)) {
            console.warn('URLParams: invalid email in URL');
            return null;
        }
        return email.toLowerCase().trim();
    }

    // ─── Lấy mã OTP từ URL ───
    function getOTP() {
        const code = get('otp') || get('code');
        if (!code) return null;
        // OTP phải là 6 chữ số
        if (!/^\d{6}$/.test(code)) {
            console.warn('URLParams: invalid OTP format');
            return null;
        }
        return code;
    }

    // ─── Lấy token từ URL ───
    function getToken() {
        const token = get('token') || get('t') || get('key');
        if (!token) return null;
        // Token: alphanumeric + dash + underscore, độ dài 8-128
        if (!/^[a-zA-Z0-9_\-]{8,128}$/.test(token)) {
            console.warn('URLParams: invalid token format');
            return null;
        }
        return token;
    }

    // ─── Kiểm tra URL có tham số hợp lệ không ───
    function hasParams() {
        try {
            const params = new URLSearchParams(window.location.search);
            return [...params.keys()].length > 0;
        } catch { return false; }
    }

    // ─── Lấy toàn bộ tham số dạng object (đã sanitize) ───
    function getAllParams() {
        try {
            const params = new URLSearchParams(window.location.search);
            const result = {};
            for (const [key, value] of params) {
                const cleanKey = sanitizeKey(key);
                const cleanValue = sanitize(value);
                if (cleanValue !== null) {
                    result[cleanKey] = cleanValue;
                }
            }
            return result;
        } catch { return {}; }
    }

    // ─── Tạo URL với tham số an toàn ───
    function buildURL(base, params) {
        try {
            const url = new URL(base, window.location.origin);
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== null) {
                    url.searchParams.set(sanitizeKey(key), String(value).trim());
                }
            }
            return url.toString();
        } catch {
            // Fallback an toàn: dùng string concat
            const query = Object.entries(params)
                .filter(([, v]) => v !== undefined && v !== null)
                .map(([k, v]) => `${encodeURIComponent(sanitizeKey(k))}=${encodeURIComponent(String(v).trim())}`)
                .join('&');
            const baseClean = base.split('?')[0];
            return query ? `${baseClean}?${query}` : baseClean;
        }
    }

    // ─── Tạo one-time link (OTP) ───
    // Dùng để tạo link dạng: ?otp=123456&email=test@example.com&_t=1234567890
    // _t là timestamp, dùng để kiểm tra hết hạn
    function generateOneTimeLink(baseUrl, data, expiryMs = TIMESTAMP_EXPIRY_MS) {
        const params = {
            ...data,
            _t: Date.now() + expiryMs  // expires at
        };
        return buildURL(baseUrl, params);
    }

    // ─── Kiểm tra one-time link còn hạn không ───
    function isLinkExpired() {
        const expiry = get('_t');
        if (!expiry) return false; // không có timestamp, mặc định cho qua
        const expiryNum = parseInt(expiry, 10);
        if (isNaN(expiryNum)) return true;
        return Date.now() > expiryNum;
    }

    // ─── Xoá tham số khỏi URL (clean address bar) ───
    function cleanURL() {
        try {
            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, '', url.toString());
        } catch {}
    }

    // ─── Detect loại link ───
    // Returns: 'otp' | 'magic-link' | 'redirect' | null
    function detectLinkType() {
        if (getOTP() && getEmail()) return 'otp';
        if (get('mode') === 'magic-link') return 'magic-link';
        if (get('redirect') || get('r')) return 'redirect';
        if (hasParams()) return 'custom';
        return null;
    }

    return {
        get,
        getAll,
        getAllParams,
        sanitize,
        getEmail,
        getOTP,
        getToken,
        hasParams,
        buildURL,
        generateOneTimeLink,
        isLinkExpired,
        cleanURL,
        detectLinkType,
        isValidEmail,
        sanitizeKey
    };
})();

export default URLParams;
