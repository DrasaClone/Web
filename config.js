// config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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
export const auth = getAuth(app);
export const database = getDatabase(app);

// Khởi tạo PubNub
export const pubnub = new PubNub({
  publishKey: "pub-c-9ad32978-37b1-4f15-bc57-bac1884507a4",
  subscribeKey: "YOUR_PUBNUB_SUBSCRIBE_KEY",
  uuid: "user_" + Math.random().toString(36).substring(2)
});
