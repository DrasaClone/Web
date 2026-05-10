import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Bạn cần điền cấu hình Firebase thực tế của bạn vào đây
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
    loginWithGoogle() {
        return signInWithPopup(auth, provider);
    },
    onAuthChange(callback) {
        onAuthStateChanged(auth, callback);
    },
    
    // Stickers - Tối ưu chỉ lấy 50 cái mới nhất
    saveSticker(data) {
        push(ref(db, 'stickers'), {
            ...data,
            user: auth.currentUser ? {
                name: auth.currentUser.displayName,
                photo: auth.currentUser.photoURL
            } : null,
            timestamp: Date.now()
        });
    },
    onStickersChange(callback) {
        const stickersRef = query(ref(db, 'stickers'), limitToLast(50));
        onValue(stickersRef, (snapshot) => {
            callback(snapshot.val());
        });
    },

    // Memories - Tối ưu chỉ lấy 50 lời nhắn mới nhất
    saveMemory(text) {
        push(ref(db, 'memories'), {
            text,
            user: auth.currentUser ? {
                name: auth.currentUser.displayName,
                photo: auth.currentUser.photoURL
            } : null,
            timestamp: Date.now()
        });
    },
    onMemoriesChange(callback) {
        const memoriesRef = query(ref(db, 'memories'), limitToLast(50));
        onValue(memoriesRef, (snapshot) => {
            callback(snapshot.val());
        });
    }
};
