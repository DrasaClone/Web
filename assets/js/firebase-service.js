import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, query, limitToLast, set, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

export const FirebaseService = {
    auth,

    // ─── Auth ───
    loginWithGoogle() {
        return signInWithPopup(auth, provider);
    },
    onAuthChange(callback) {
        return onAuthStateChanged(auth, callback);
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
    }
};
