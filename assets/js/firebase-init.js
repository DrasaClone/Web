import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, get, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const app = initializeApp(window.APP_CONFIG.firebase);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

window.fb = { auth, db, provider, signInWithPopup, signOut, onAuthStateChanged, ref, set, onValue, get, push };
window.dispatchEvent(new Event('firebase-ready'));
