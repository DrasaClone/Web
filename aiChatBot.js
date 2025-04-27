// aiChatBot.js
import { pubnub } from "./config.js";
import { ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { database } from "./config.js";

// Giả sử chúng ta sử dụng một kênh riêng cho AI Chat
const aiChannel = "ai-chat";
const chatMessages = document.getElementById("chat-messages");

// Hàm để tạo phản hồi của AI (rất đơn giản, có thể mở rộng)
function generateAIResponse(userMessage) {
  // Ví dụ: nếu người dùng nói "hello", bot trả lời "Hi there!"
  const lowerMsg = userMessage.toLowerCase();
  if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
    return "Chào bạn! Tôi có thể giúp gì cho bạn?";
  }
  if (lowerMsg.includes("how are you")) {
    return "Tôi khỏe, còn bạn thì sao?";
  }
  // Mặc định, bot chỉ echo lại tin nhắn
  return "Bạn vừa nói: " + userMessage;
}

// Hàm gửi phản hồi của AI qua PubNub và lưu vào Firebase cho lịch sử
export function sendAIResponse(userMessage) {
  const aiResponse = generateAIResponse(userMessage);
  const messageData = {
    text: aiResponse,
    sender: "ai",
    timestamp: Date.now()
  };
  // Gửi tin nhắn qua kênh PubNub
  pubnub.publish({
    channel: aiChannel,
    message: messageData
  });
  // Lưu tin nhắn vào Firebase (bạn có thể lưu vào node riêng "aiChats")
  const aiChatRef = ref(database, "aiChats");
  push(aiChatRef, messageData);
}

// Thiết lập AI Chat Bot
export function setupAIChatBot() {
  document.getElementById("chatbot-btn").addEventListener("click", () => {
    const userMessage = prompt("Nhập câu hỏi cho AI:");
    if (userMessage) {
      // Gửi câu hỏi của người dùng vào kênh AI (bạn cũng có thể xử lý lưu lịch sử)
      const userMsg = {
        text: userMessage,
        sender: "user",
        timestamp: Date.now()
      };
      pubnub.publish({
        channel: aiChannel,
        message: userMsg
      });
      // Lưu câu hỏi vào Firebase
      const aiChatRef = ref(database, "aiChats");
      push(aiChatRef, userMsg);
      // Sau đó, gọi hàm trả lời của AI
      sendAIResponse(userMessage);
    }
  });
  
  // Lắng nghe kênh AI để hiển thị tin nhắn (có thể tích hợp chung với chat nhóm hoặc riêng)
  pubnub.subscribe({ channels: [aiChannel] });
  pubnub.addListener({
    message: event => {
      if (event.channel === aiChannel) {
        displayAIChatMessage(event.message);
      }
    }
  });
}

function displayAIChatMessage(messageData) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message";
  // Hiển thị theo định dạng khác nếu sender là ai
  if (messageData.sender === "ai") messageDiv.style.fontStyle = "italic";
  messageDiv.textContent = `${new Date(messageData.timestamp).toLocaleTimeString()}: ${messageData.text}`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
