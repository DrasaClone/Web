// chat.js
import { sendMessage } from './pubnub-chat.js';
import { initReactions } from './reactions.js';

let messagesMap = {}; // Lưu tin theo ID để hỗ trợ edit/delete

export function displayMessage(messageObj) {
  if (!messageObj.id) {
    messageObj.id = "msg-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  }
  messagesMap[messageObj.id] = messageObj;

  const messagesDiv = document.getElementById("messages");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.setAttribute("data-id", messageObj.id);

  const time = new Date(messageObj.timestamp).toLocaleTimeString();
  let htmlContent = `<span class="user">${messageObj.user}:</span>
                     <span class="text">${messageObj.text}</span>
                     <span class="time">${time}</span>`;

  if (messageObj.edited) {
    htmlContent += `<span class="edited">(edited)</span>`;
  }

  // Nếu có file đính kèm
  if (messageObj.fileUrl) {
    if (messageObj.fileType && messageObj.fileType.startsWith("image/")) {
      htmlContent += `<div class="file-attachment"><img src="${messageObj.fileUrl}" alt="Ảnh đính kèm"></div>`;
    } else {
      htmlContent += `<div class="file-attachment"><a href="${messageObj.fileUrl}" target="_blank">Tải xuống file đính kèm</a></div>`;
    }
  }

  // Các hành động (edit, delete, reply – để kích hoạt thread) cho tin nhắn riêng của người dùng
  if (messageObj.user === (localStorage.getItem("displayName") || "Guest") ||
      messageObj.user === "Anonymous") {
    htmlContent += `<div class="actions">
                      <button class="edit-btn">Sửa</button>
                      <button class="delete-btn">Xoá</button>
                      <button class="reply-btn">Trả lời</button>
                    </div>`;
  }
  
  // Vùng hiển thị reaction cho tin nhắn
  htmlContent += `<div class="reactions" data-reaction-for="${messageObj.id}"></div>`;

  messageDiv.innerHTML = htmlContent;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Sự kiện cho edit, delete, reply
  const editBtn = messageDiv.querySelector(".edit-btn");
  const deleteBtn = messageDiv.querySelector(".delete-btn");
  const replyBtn = messageDiv.querySelector(".reply-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => { editMessage(messageObj.id); });
  }
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => { deleteMessage(messageObj.id); });
  }
  if (replyBtn) {
    replyBtn.addEventListener("click", () => { openThread(messageObj.id); });
  }

  initReactions(messageDiv, messageObj.id);
}

function editMessage(messageId) {
  const newText = prompt("Nhập nội dung mới cho tin nhắn:");
  if (newText) {
    const messageDiv = document.querySelector(`.message[data-id="${messageId}"] .text`);
    if (messageDiv) messageDiv.textContent = newText;
    const updatedObj = { id: messageId, text: newText, edited: true, timestamp: new Date().toISOString() };
    sendMessage({ type: "edit", data: updatedObj });
  }
}

function deleteMessage(messageId) {
  if (confirm("Bạn có chắc muốn xoá tin nhắn này không?")) {
    const messageDiv = document.querySelector(`.message[data-id="${messageId}"]`);
    if (messageDiv) messageDiv.remove();
    sendMessage({ type: "delete", data: { id: messageId } });
  }
}

// Xử lý các tin nhắn edit hoặc delete đến từ PubNub
export function processUpdate(messageObj) {
  if (messageObj.type === "edit" && messageObj.data) {
    const { id, text } = messageObj.data;
    const messageDiv = document.querySelector(`.message[data-id="${id}"] .text`);
    if (messageDiv) {
      messageDiv.textContent = text;
      messageDiv.parentElement.classList.add("edited");
    }
  } else if (messageObj.type === "delete" && messageObj.data) {
    const { id } = messageObj.data;
    const messageDiv = document.querySelector(`.message[data-id="${id}"]`);
    if (messageDiv) messageDiv.remove();
  }
}

export function initEmojiPicker() {
  const emojiPicker = document.getElementById("emoji-picker");
  const emojiBtn = document.getElementById("emoji-btn");
  const msgInput = document.getElementById("msg-input");

  const emojis = ["😀", "😂", "😅", "😊", "😍", "😎", "🤔", "🙌", "👍", "🙏", "💯", "🔥"];
  emojiPicker.innerHTML = "";
  emojis.forEach(emoji => {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.addEventListener("click", () => {
      msgInput.value += emoji;
      emojiPicker.style.display = "none";
      msgInput.focus();
    });
    emojiPicker.appendChild(span);
  });

  emojiBtn.addEventListener("click", () => {
    emojiPicker.style.display = (emojiPicker.style.display === "none" || emojiPicker.style.display === "") ? "flex" : "none";
  });

  document.addEventListener("click", (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
      emojiPicker.style.display = "none";
    }
  });
}

// Mở cửa sổ thread (chức năng "trả lời theo chủ đề") – được xử lý ở threads.js
import { openThread } from './threads.js';
