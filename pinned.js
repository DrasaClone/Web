// pinned.js
import { db } from './firebase-config.js';

export function initPinned() {
  const pinnedDiv = document.getElementById("pinned-message");
  // Tải tin ghim từ Firestore nếu có (nếu dùng Firestore, bạn có thể lưu vào một document “pinned”)
  db.collection("pinned").doc("current").get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      showPinned(data);
    }
  }).catch(error => console.error("Lỗi tải pinned:", error));

  // Để cho người dùng ghim tin, ta thêm sự kiện khi click chuột đôi vào tin nhắn (ví dụ)
  document.getElementById("messages").addEventListener("dblclick", (e) => {
    const messageDiv = e.target.closest(".message");
    if (messageDiv) {
      const messageId = messageDiv.getAttribute("data-id");
      // Lấy nội dung của tin nhắn
      const text = messageDiv.querySelector(".text").textContent;
      const user = messageDiv.querySelector(".user").textContent.replace(":", "");
      const timestamp = new Date().toISOString();
      const pinnedData = { id: messageId, text, user, timestamp };
      // Lưu vào Firestore
      db.collection("pinned").doc("current").set(pinnedData)
        .then(() => { showPinned(pinnedData); })
        .catch(err => console.error("Lỗi ghim tin nhắn:", err));
    }
  });
}

function showPinned(pinnedData) {
  const pinnedDiv = document.getElementById("pinned-message");
  pinnedDiv.innerHTML = `<strong>Ghim:</strong> [${pinnedData.user}] ${pinnedData.text}`;
  pinnedDiv.style.display = "block";
}
