// chat.js (trích đoạn bổ sung lưu lịch sử chat)
import { database } from "./config.js";
import { ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { pubnub } from "./config.js";

const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

// Lưu tin nhắn vào Firebase (groupChats)
export function saveChatMessage(messageData) {
  const chatRef = ref(database, "groupChats");
  push(chatRef, messageData);
}

export function loadChatHistory() {
  const historyRef = ref(database, "groupChats");
  onValue(historyRef, snapshot => {
    chatMessages.innerHTML = "";
    snapshot.forEach(childSnapshot => {
      const msg = childSnapshot.val();
      displayChatMessage(msg);
    });
  });
}

export function setupChat() {
  // Tải lịch sử chat khi trang load
  loadChatHistory();

  // Kênh PubNub để realtime
  pubnub.subscribe({ channels: ["forum-chat"] });
  
  pubnub.addListener({
    message: function(event) {
      if (event.channel === "forum-chat") {
        displayChatMessage(event.message);
        // Lưu tin nhắn vào Firebase để lưu lịch sử
        saveChatMessage(event.message);
      }
    }
  });

  chatForm.addEventListener("submit", e => {
    e.preventDefault();
    const message = chatInput.value;
    if (message.trim() === "") return;
    const messageData = {
      text: message,
      sender: "user",  // Hoặc bạn có thể thêm senderId, senderEmail, …
      timestamp: Date.now()
    };
    pubnub.publish({
      channel: "forum-chat",
      message: messageData
    });
    chatInput.value = "";
  });
}

function displayChatMessage(messageData) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message";
  messageDiv.textContent = `${new Date(messageData.timestamp).toLocaleTimeString()}: ${messageData.text}`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
