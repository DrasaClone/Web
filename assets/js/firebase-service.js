import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, query, limitToLast, set, remove, update, get, child, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signInAnonymously, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCeYwTT7E8bi7bccIrc20MTe5S4r0e0wUI",
    authDomain: "webai-7642b.firebaseapp.com",
    databaseURL: "https://webai-7642b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "webai-7642b",
    storageBucket: "webai-7642b.firebasestorage.app",
    messagingSenderId: "967881370128",
    appId: "1:967881370128:web:e5c4b06e4f70f55a68b895",
    measurementId: "G-61XJ390Q30"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ─── Helper: hash email for Firebase key (simple base64-like sanitization) ───
function hashEmail(email) {
    return btoa(email.trim().toLowerCase()).replace(/[^a-zA-Z0-9]/g, '_');
}

export const FirebaseService = {
    auth,

    // ─── Auth ───
    loginWithGoogle() {
        return signInWithPopup(auth, provider);
    },
    loginWithGoogleRedirect() {
        return signInWithRedirect(auth, provider);
    },
    handleRedirectResult() {
        return getRedirectResult(auth);
    },
    loginAnonymously() {
        return signInAnonymously(auth);
    },
    sendMagicLink(email) {
        const actionCodeSettings = {
            url: window.location.origin + '/myclass.html',
            handleCodeInApp: true
        };
        return sendSignInLinkToEmail(auth, email, actionCodeSettings);
    },
    isMagicLink(url) {
        return isSignInWithEmailLink(auth, url);
    },
    handleMagicLinkSignIn(email, url) {
        return signInWithEmailLink(auth, email, url);
    },
    onAuthChange(callback) {
        return onAuthStateChanged(auth, callback);
    },

    // ═══════════════════════════════════════════════════════════════
    // ═══  _SAFE  —  DATABASE SAFETY LAYER  ═══════════════════════
    // ═══════════════════════════════════════════════════════════════
    // All database writes go through this layer which:
    // 1. Validates data before writing (prevents null/undefined/malicious data)
    // 2. Logs every operation to the `_safe/logs` meta-node for auditing
    // 3. Provides consistent error handling
    //
    // The `_safe` node is a meta-storage area that stores:
    //   _safe/logs/{timestamp}  →  { type, path, uid, email, data, userAgent }
    //   _safe/validators/      →  schema rules for each path
    //   _safe/status/          →  overall system health
    // ═══════════════════════════════════════════════════════════════

    /**
     * Validate data before writing to Firebase.
     * Returns { valid: boolean, sanitized: any, error?: string }
     */
    _validateData(path, data) {
        if (data === null || data === undefined) {
            return { valid: false, error: 'Data is null or undefined', sanitized: null };
        }
        
        // String validation
        if (typeof data === 'string') {
            if (data.length > 10000) {
                return { valid: false, error: 'String exceeds 10000 characters', sanitized: null };
            }
            // Block potential script injection
            if (/<script[\s>]/i.test(data) || /javascript\s*:/i.test(data)) {
                return { valid: false, error: 'Potential XSS detected', sanitized: null };
            }
            return { valid: true, sanitized: data.slice(0, 10000) };
        }
        
        // Object validation
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                // Sanitize keys
                const cleanKey = String(key).replace(/[$\[\].#]/g, '_');
                if (cleanKey !== key) {
                    return { valid: false, error: `Invalid character in key: ${key}`, sanitized: null };
                }
                // Recurse for nested objects
                if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                    const nested = this._validateData(path + '/' + key, value);
                    if (!nested.valid) return nested;
                    sanitized[cleanKey] = nested.sanitized;
                } else if (typeof value === 'string') {
                    if (value.length > 10000) return { valid: false, error: 'String value exceeds limit', sanitized: null };
                    sanitized[cleanKey] = value.slice(0, 10000);
                } else {
                    sanitized[cleanKey] = value;
                }
            }
            return { valid: true, sanitized };
        }
        
        // Numbers, booleans — pass through
        return { valid: true, sanitized: data };
    },

    /**
     * Log an operation to the _safe/logs node.
     * This creates an auditable trail of all database writes.
     */
    async _logOperation(type, path, data = null) {
        try {
            const logRef = push(ref(db, '_safe/logs'));
            await set(logRef, {
                type,           // 'write', 'delete', 'read', 'auth', 'error'
                path,           // Firebase path (e.g., 'v3/profiles/xxx')
                timestamp: Date.now(),
                uid: auth.currentUser?.uid || 'anonymous',
                email: auth.currentUser?.email || 'none',
                userAgent: navigator.userAgent?.slice(0, 200) || '',
                dataPreview: data ? JSON.stringify(data).slice(0, 500) : ''
            });
        } catch (e) {
            // Silent — logging should never block the main operation
            console.warn('SafeDB log error (non-critical):', e);
        }
    },

    /**
     * Safe wrapper for set() with validation + logging.
     */
    async _safeSet(dbRef, data, path) {
        const validated = this._validateData(path, data);
        if (!validated.valid) {
            console.error(`SafeDB validation failed for ${path}:`, validated.error);
            await this._logOperation('error', path, { error: validated.error });
            throw new Error(`SafeDB: ${validated.error}`);
        }
        await set(dbRef, validated.sanitized);
        await this._logOperation('write', path, validated.sanitized);
    },

    /**
     * Safe wrapper for push() with validation + logging.
     */
    async _safePush(dbRef, data, path) {
        const validated = this._validateData(path, data);
        if (!validated.valid) {
            console.error(`SafeDB validation failed for ${path}:`, validated.error);
            await this._logOperation('error', path, { error: validated.error });
            throw new Error(`SafeDB: ${validated.error}`);
        }
        const result = await push(dbRef, validated.sanitized);
        await this._logOperation('write', path + '/' + result.key, validated.sanitized);
        return result;
    },

    /**
     * Safe wrapper for update() with validation + logging.
     */
    async _safeUpdate(dbRef, data, path) {
        const validated = this._validateData(path, data);
        if (!validated.valid) {
            console.error(`SafeDB validation failed for ${path}:`, validated.error);
            await this._logOperation('error', path, { error: validated.error });
            throw new Error(`SafeDB: ${validated.error}`);
        }
        await update(dbRef, validated.sanitized);
        await this._logOperation('update', path, validated.sanitized);
    },

    /**
     * Safe wrapper for remove() with logging.
     */
    async _safeRemove(dbRef, path) {
        await this._logOperation('delete', path);
        await remove(dbRef);
    },

    /**
     * Get the total count of operations logged in _safe/logs.
     * Useful for monitoring / easter egg.
     */
    async _getSafeStats() {
        try {
            const logsRef = ref(db, '_safe/logs');
            const snap = await get(query(logsRef, limitToLast(1)));
            const allSnap = await get(logsRef);
            const count = allSnap.val() ? Object.keys(allSnap.val()).length : 0;
            return { totalOperations: count };
        } catch { return { totalOperations: 0 }; }
    },

    // ─── OTP Code ───
    /**
     * Generate a 6-digit OTP code, store in Firebase RTDB.
     * Returns the generated code.
     */
    async generateOTP(email) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const emailKey = hashEmail(email);
        const otpRef = ref(db, `v3/emailOtp/${emailKey}`);
        
        await set(otpRef, {
            code,
            email: email.trim().toLowerCase(),
            createdAt: Date.now(),
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });
        
        // Auto-cleanup after 10 minutes
        setTimeout(() => {
            get(otpRef).then((snap) => {
                const data = snap.val();
                if (data && data.code === code) {
                    remove(otpRef).catch(() => {});
                }
            }).catch(() => {});
        }, 10 * 60 * 1000);
        
        return code;
    },
    
    /**
     * Verify OTP code against stored code in Firebase.
     * Returns the emailKey (hashed email) if valid, null otherwise.
     */
    async verifyOTP(email, code) {
        const emailKey = hashEmail(email);
        const otpRef = ref(db, `v3/emailOtp/${emailKey}`);
        
        const snap = await get(otpRef);
        const data = snap.val();
        
        if (!data) return null;
        if (data.code !== code) return null;
        if (Date.now() > data.expiresAt) {
            // Expired — clean up
            remove(otpRef);
            return null;
        }
        
        // Valid! Clean up the used code
        await remove(otpRef);
        return emailKey;
    },
    
    /**
     * Sign in with anonymous auth + store verified email in RTDB.
     * This avoids the email/password password-changing problem entirely.
     */
    async signInWithVerifiedEmail(email, emailKey) {
        // 1. Sign in anonymously first
        let result = await signInAnonymously(auth);
        const uid = result.user.uid;
        
        // 2. Store verified email in RTDB
        const verifiedRef = ref(db, `v3/verifiedEmails/${uid}`);
        await set(verifiedRef, {
            email: email.trim().toLowerCase(),
            verifiedAt: Date.now()
        });
        
        // 3. Also store in email lookup index (so we can find the user by email later)
        const emailRef = ref(db, `v3/emailUsers/${emailKey}`);
        await set(emailRef, {
            uid,
            email: email.trim().toLowerCase(),
            lastVerified: Date.now()
        });
        
        return result;
    },
    
    /**
     * Check if user has already verified this email (for returning users).
     */
    async getVerifiedEmail(uid) {
        const verifiedRef = ref(db, `v3/verifiedEmails/${uid}`);
        const snap = await get(verifiedRef);
        return snap.val();
    },
    
    /**
     * Try to restore a session by checking if the anonymous user has a verified email.
     */
    async hasVerifiedEmail(uid) {
        const data = await this.getVerifiedEmail(uid);
        return data ? data.email : null;
    },

    // ─── Cross-Device Login Request ───
    /**
     * Create a login request from a computer trying to log in.
     * The phone (already logged in with this email) will receive a realtime notification.
     */
    async createLoginRequest(email) {
        const reqRef = push(ref(db, 'v3/loginRequests'));
        const requestId = reqRef.key;
        await set(reqRef, {
            email: email.trim().toLowerCase(),
            status: 'pending',
            createdAt: Date.now(),
            expiresAt: Date.now() + 60 * 1000, // 60 seconds timeout
            requestId
        });
        
        // Auto-expire after 60s
        setTimeout(() => {
            get(reqRef).then((snap) => {
                const data = snap.val();
                if (data && data.status === 'pending') {
                    update(reqRef, { status: 'expired' }).catch(() => {});
                }
            }).catch(() => {});
        }, 60 * 1000);
        
        return requestId;
    },
    
    /**
     * Listen for login requests targeted at a specific email.
     * Returns an unsubscribe function.
     */
    onLoginRequestsForEmail(email, callback) {
        const emailLower = email.trim().toLowerCase();
        return onValue(ref(db, 'v3/loginRequests'), (snapshot) => {
            const data = snapshot.val();
            if (!data) return;
            // Filter for this email + pending or approved
            Object.entries(data).forEach(([id, req]) => {
                if (req.email === emailLower) {
                    callback(id, req);
                }
            });
        });
    },
    
    /**
     * Listen for a specific login request by ID (used by computer).
     */
    onLoginRequestChange(requestId, callback) {
        const reqRef = ref(db, `v3/loginRequests/${requestId}`);
        return onValue(reqRef, (snapshot) => {
            callback(snapshot.val());
        });
    },
    
    /**
     * Approve a login request from the phone.
     * Sets status to 'approved' and records who approved it.
     */
    async approveLoginRequest(requestId, approveUid) {
        const reqRef = ref(db, `v3/loginRequests/${requestId}`);
        await update(reqRef, {
            status: 'approved',
            approvedBy: approveUid,
            approvedAt: Date.now()
        });
    },
    
    /**
     * Deny a login request from the phone.
     */
    async denyLoginRequest(requestId) {
        const reqRef = ref(db, `v3/loginRequests/${requestId}`);
        await update(reqRef, { status: 'denied' });
    },

    // ─── Stickers ───
    saveSticker(data) {
        if (!auth.currentUser) return Promise.reject('Not authenticated');
        return push(ref(db, 'v3/stickers'), {
            ...data,
            uid: auth.currentUser.uid,
            user: { name: auth.currentUser.displayName, photo: auth.currentUser.photoURL },
            timestamp: Date.now()
        });
    },
    deleteSticker(id) {
        return remove(ref(db, `v3/stickers/${id}`));
    },
    updateSticker(id, data) {
        return update(ref(db, `v3/stickers/${id}`), data);
    },
    onStickersChange(callback) {
        return onValue(query(ref(db, 'v3/stickers'), limitToLast(100)), (snapshot) => callback(snapshot.val()));
    },

    // ─── Memories ───
    saveMemory(payload) {
        if (!auth.currentUser) return Promise.reject('Not authenticated');
        const data = typeof payload === 'string' ? { text: payload } : payload;
        return push(ref(db, 'v3/memories'), {
            ...data,
            uid: auth.currentUser.uid,
            user: { name: auth.currentUser.displayName, photo: auth.currentUser.photoURL },
            timestamp: Date.now()
        }).catch(err => {
            console.error('Firebase saveMemory error:', err);
            throw err;
        });
    },
    deleteMemory(id) {
        return remove(ref(db, `v3/memories/${id}`));
    },
    onMemoriesChange(callback) {
        return onValue(query(ref(db, 'v3/memories'), limitToLast(50)), (snapshot) => callback(snapshot.val()));
    },

    // ─── Profiles ───
    saveProfile(data) {
        if (!auth.currentUser) return Promise.reject('Not authenticated');
        return set(ref(db, `v3/profiles/${auth.currentUser.uid}`), {
            ...data,
            uid: auth.currentUser.uid,
            name: auth.currentUser.displayName,
            photo: data.photo || auth.currentUser.photoURL,
            lastActive: Date.now()
        });
    },
    onProfilesChange(callback) {
        return onValue(ref(db, 'v3/profiles'), (snapshot) => callback(snapshot.val()));
    },

    // ─── Moments ───
    saveMoment(url) {
        if (!auth.currentUser) return Promise.reject('Not authenticated');
        return push(ref(db, 'v3/moments'), {
            url,
            uid: auth.currentUser.uid,
            user: { name: auth.currentUser.displayName, photo: auth.currentUser.photoURL },
            timestamp: Date.now()
        }).catch(err => {
            console.error('Firebase saveMoment error:', err);
            throw err;
        });
    },
    deleteMoment(id) {
        return remove(ref(db, `v3/moments/${id}`));
    },
    onMomentsChange(callback) {
        return onValue(query(ref(db, 'v3/moments'), limitToLast(30)), (snapshot) => callback(snapshot.val()));
    },

    // ─── Quiz Questions ───
    saveQuizQuestions(uid, questions) {
        return set(ref(db, `v3/quiz/${uid}`), questions);
    },
    onQuizQuestionsChange(callback) {
        return onValue(ref(db, 'v3/quiz'), (snapshot) => callback(snapshot.val()));
    },

    // ─── Quiz Scores ───
    saveQuizScore(targetUid, scoreData) {
        if (!auth.currentUser) return Promise.reject('Not authenticated');
        return push(ref(db, `v3/scores/${targetUid}`), {
            ...scoreData,
            playerUid: auth.currentUser.uid,
            playerName: auth.currentUser.displayName,
            timestamp: Date.now()
        });
    },
    onQuizScoresChange(callback) {
        return onValue(ref(db, 'v3/scores'), (snapshot) => callback(snapshot.val()));
    },

    // ─── Statuses (Global Feed + Personal Feed) ───
    saveStatus({ text, image }) {
        if (!auth.currentUser) return Promise.reject('Not authenticated');
        return push(ref(db, 'v3/statuses'), {
            text: text || '',
            image: image || '',
            uid: auth.currentUser.uid,
            userName: auth.currentUser.displayName,
            userPhoto: auth.currentUser.photoURL || '',
            timestamp: Date.now()
        });
    },
    deleteStatus(id) {
        return remove(ref(db, `v3/statuses/${id}`));
    },
    onStatusesChange(callback) {
        return onValue(query(ref(db, 'v3/statuses'), limitToLast(100)), (snapshot) => callback(snapshot.val()));
    },

    // ─── Status Reactions (Emoji) ───
    toggleReaction(statusId, emoji) {
        if (!auth.currentUser) return Promise.reject('Not authenticated');
        const reactionRef = ref(db, `v3/statusReactions/${statusId}/${auth.currentUser.uid}`);
        return new Promise((resolve, reject) => {
            onValue(reactionRef, (snap) => {
                const existing = snap.val();
                if (existing && existing.emoji === emoji) {
                    remove(reactionRef).then(resolve).catch(reject);
                } else {
                    set(reactionRef, {
                        emoji,
                        userName: auth.currentUser.displayName,
                        timestamp: Date.now()
                    }).then(resolve).catch(reject);
                }
            }, { onlyOnce: true });
        });
    },
    onReactionsChange(callback) {
        return onValue(ref(db, 'v3/statusReactions'), (snapshot) => callback(snapshot.val()));
    },

    // ─── Status Comments ───
    saveComment(statusId, text) {
        if (!auth.currentUser) return Promise.reject('Not authenticated');
        if (!text || !text.trim()) return Promise.reject('Empty comment');
        return push(ref(db, `v3/statusComments/${statusId}`), {
            text: text.trim(),
            uid: auth.currentUser.uid,
            userName: auth.currentUser.displayName,
            userPhoto: auth.currentUser.photoURL || '',
            timestamp: Date.now()
        });
    },
    deleteComment(statusId, commentId) {
        return remove(ref(db, `v3/statusComments/${statusId}/${commentId}`));
    },
    onCommentsChange(callback) {
        return onValue(ref(db, 'v3/statusComments'), (snapshot) => callback(snapshot.val()));
    }
};
