// main.js
import { initAuth } from './auth.js';
import { initPubNub, sendMessage } from './pubnub-chat.js';
import { displayMessage, initEmojiPicker, processUpdate } from './chat.js';
import { initFileUpload } from './file-upload.js';
import { initNotifications, showNotification } from './notifications.js';
import { initGroups } from './groups.js';
import { initVideoChat } from './video-chat.js';
import { initTypingIndicator } from './typing.js';
import { initReadReceipts } from './read-receipts.js';
import { initThemeToggle } from './themes.js';
import { initProfile } from './profile.js';
import { initSearch } from './search.js';
import { initPinned } from './pinned.js';
import { openThread } from './threads.js';
import { auth, db } from './firebase-config.js';

function initChat() {
  initEmojiPicker();
  initFileUpload();
  initGroups();
  initVideoChat();
  initTypingIndicator();
  initReadReceipts();
  initSearch();
  initPinned();

  // Khởi tạo PubNub và xử lý tin nhắn đến
  initPubNub((message) => {
    // Nếu tin nhắn là loại edit hoặc delete, xử lý riêng
    if (message.type === "edit" || message.type === "delete") {
      processUpdate(message);
    } else if (message.threadId) {
      // Với tin nhắn thuộc thread, bạn có thể cập nhật modal thread nếu mở
      // Ở đây bạn có thể tự xử lý thòi gian cập nhật thread
      console.log("Tin nhắn thread:", message);
    } else {
      displayMessage(message);
    }

    if (auth.currentUser) {
      db.collection("messages").add(message)
        .catch(error => console.error("Lỗi lưu tin nhắn vào Firestore:", error));
    }
    if (document.hidden) {
      showNotification(message);
    }
  });

  const sendBtn = document.getElementById("send-btn");
  const msgInput = document.getElementById("msg-input");

  sendBtn.addEventListener("click", () => {
    const text = msgInput.value.trim();
    if (text) {
      const messageObj = {
        id: "msg-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        user: auth.currentUser ? (auth.currentUser.email || "Anonymous") : "Guest",
        text: text,
        timestamp: new Date().toISOString()
      };
      sendMessage(messageObj);
      msgInput.value = "";
    }
  });

  msgInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });
}

function initApp() {
  initAuth();
  initNotifications();
  initThemeToggle();
  initProfile();
  initChat();
}

document.addEventListener("DOMContentLoaded", initApp);
