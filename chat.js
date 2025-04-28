// chat.js - trích đoạn cải tiến để lưu lịch sử chat và báo cáo trạng thái
import { database } from "./config.js";
import { ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { pubnub } from "./config.js";

const chatMessages = document.getElementById("chat-messages");

export function setupChat() {
  loadChatHistory();
  pubnub.subscribe({ channels: ["forum-chat"] });
  pubnub.addListener({
    message: event => {
      if (event.channel === "forum-chat") {
        displayChatMessage(event.message);
        saveChatMessage(event.message);
      }
    }
  });

  document.getElementById("chat-form").addEventListener("submit", e => {
    e.preventDefault();
    const chatInput = document.getElementById("chat-input");
    const message = chatInput.value;
    if (message.trim() === "") return;
    const messageData = { text: message, sender: "user", timestamp: Date.now() };
    pubnub.publish({ channel: "forum-chat", message: messageData });
    chatInput.value = "";
  });
}

function loadChatHistory() {
  const historyRef = ref(database, "groupChats");
  onValue(historyRef, snapshot => {
    chatMessages.innerHTML = "";
    snapshot.forEach(child => {
      displayChatMessage(child.val());
    });
  });
}

function saveChatMessage(messageData) {
  const chatHistoryRef = ref(database, "groupChats");
  push(chatHistoryRef, messageData);
}

function displayChatMessage(messageData) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "chat-message";
  msgDiv.textContent = `${new Date(messageData.timestamp).toLocaleTimeString()}: ${messageData.text}`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
