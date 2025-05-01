// File: config.js

// ---------- Firebase Configuration ----------
// Lấy từ Firebase Console → Project settings → Your apps → Firebase SDK snippet :contentReference[oaicite:0]{index=0}
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCeYwTT7E8bi7bccIrc20MTe5S4r0e0wUI",
  authDomain: "webai-7642b.firebaseapp.com",
  databaseURL: "https://webai-7642b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webai-7642b",
  storageBucket: "webai-7642b.firebasestorage.app",
  messagingSenderId: "967881370128",
  appId: "1:967881370128:web:e5c4b06e4f70f55a68b895",
  measurementId: "G-61XJ390Q30"
};

// ---------- PubNub Configuration ----------
const PUBNUB_KEYS = {
  publishKey:   "pub-c-9ad32978-37b1-4f15-bc57-bac1884507a4",
  subscribeKey: "sub-c-0269ec54-430f-41b1-8a33-4200f566fcbb"
};
const CHANNEL = "global_chat";

// ---------- Cloudinary Configuration ----------
// Tạo ở Cloudinary Dashboard → Settings → Upload → Upload presets (unsigned)
const CLOUDINARY = {
  cloudName:    "dgbux4wzo",
  uploadPreset: "okeqfdx4"
};

// ---------- Jitsi Meet Configuration ----------
// Sử dụng meet.jit.si hoặc tự host domain riêng
const JITSI_DOMAIN = "meet.jit.si";
const JITSI_ROOM   = "WebUIroom";
