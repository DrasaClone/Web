// threads.js
import { sendMessage } from './pubnub-chat.js';

export function openThread(messageId) {
  // Tạo modal thread
  const modal = document.createElement("div");
  modal.className = "thread-modal";
  modal.innerHTML = `
    <header>Chủ đề trả lời <span class="close-thread">&times;</span></header>
    <div id="thread-messages"></div>
    <div class="thread-input">
      <input type="text" id="thread-input" placeholder="Nhập trả lời...">
      <button id="thread-send-btn">Gửi</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Sự kiện đóng modal
  modal.querySelector(".close-thread").addEventListener("click", () => {
    modal.remove();
  });

  // Gửi tin trong thread; ta sẽ gửi tin nhắn với thuộc tính "threadId"
  const threadSendBtn = modal.querySelector("#thread-send-btn");
  const threadInput = modal.querySelector("#thread-input");
  threadSendBtn.addEventListener("click", () => {
    const text = threadInput.value.trim();
    if (text) {
      const threadMsg = {
        threadId: messageId,
        user: localStorage.getItem("displayName") || "Guest",
        text: text,
        timestamp: new Date().toISOString()
      };
      // Gửi tin nhắn thread qua PubNub (các client có thể lọc theo threadId)
      sendMessage(threadMsg);
      threadInput.value = "";
      // Hiển thị ngay kết quả vào modal
      appendThreadMessage(modal.querySelector("#thread-messages"), threadMsg);
    }
  });
}

export function appendThreadMessage(container, messageObj) {
  const div = document.createElement("div");
  const time = new Date(messageObj.timestamp).toLocaleTimeString();
  div.innerHTML = `<span class="user">${messageObj.user}:</span>
                   <span class="text">${messageObj.text}</span>
                   <span class="time">${time}</span>`;
  container.appendChild(div);
}
