// aiChatBot.js
import { pubnub } from "./config.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { database } from "./config.js";

const aiChannel = "ai-chat";
const chatMessages = document.getElementById("chat-messages");

function generateAIResponse(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
    return "Chào bạn! Tôi có thể hỗ trợ gì cho bạn?";
  }
  if (lowerMsg.includes("weather")) {
    return "Thời tiết hiện tại trên địa bàn của bạn rất tốt. Bạn có kế hoạch gì cho ngày hôm nay không?";
  }
  return "Bạn vừa nói: " + userMessage;
}

export function sendAIResponse(userMessage) {
  const aiResponse = generateAIResponse(userMessage);
  const messageData = { text: aiResponse, sender: "ai", timestamp: Date.now() };
  pubnub.publish({ channel: aiChannel, message: messageData });
  const aiChatRef = ref(database, "aiChats");
  push(aiChatRef, messageData);
}

export function setupAIChatBot() {
  document.getElementById("chatbot-btn").addEventListener("click", () => {
    const userMessage = prompt("Nhập câu hỏi cho AI:");
    if (userMessage) {
      const userMsg = { text: userMessage, sender: "user", timestamp: Date.now() };
      pubnub.publish({ channel: aiChannel, message: userMsg });
      const aiChatRef = ref(database, "aiChats");
      push(aiChatRef, userMsg);
      sendAIResponse(userMessage);
    }
  });
  
  pubnub.subscribe({ channels: [aiChannel] });
  pubnub.addListener({
    message: event => {
      if (event.channel === aiChannel) displayAIChatMessage(event.message);
    }
  });
}

function displayAIChatMessage(messageData) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message";
  if (messageData.sender === "ai") messageDiv.style.fontStyle = "italic";
  messageDiv.textContent = `${new Date(messageData.timestamp).toLocaleTimeString()}: ${messageData.text}`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
