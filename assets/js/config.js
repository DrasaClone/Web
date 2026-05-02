// --- FIREBASE CONFIGURATION ---
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

// --- CLOUDINARY CONFIGURATION ---
const cloudinaryConfig = {
  cloudName: "dgbux4wzo",
  uploadPreset: "okeqfdx4"
};

// Xuất cấu hình ra môi trường toàn cục
window.APP_CONFIG = {
  firebase: firebaseConfig,
  cloudinary: cloudinaryConfig
};
