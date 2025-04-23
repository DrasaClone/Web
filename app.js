// assets/js/app.js

// Khởi tạo PubNub
const pubnub = new PubNub({
  subscribeKey: "sub-c-0269ec54-430f-41b1-8a33-4200f566fcbb",
  publishKey: "pub-c-9ad32978-37b1-4f15-bc57-bac1884507a4",
  uuid: "user_" + Math.floor(Math.random() * 10000)
});

const chatChannel = "chat-channel";

// Hàm hiển thị tin nhắn trong giao diện
function addMessage(message) {
  const messagesUl = document.getElementById("messages");
  const li = document.createElement("li");
  li.textContent = `${message.username}: ${message.text}`;
  messagesUl.appendChild(li);
  
  // Tự động cuộn xuống dưới
  messagesUl.scrollTop = messagesUl.scrollHeight;
}

// Lắng nghe tin nhắn từ PubNub
pubnub.addListener({
  message: function(event) {
    const message = event.message;
    addMessage(message);
  },
  // Nếu triển khai "typing", bạn có thể lắng nghe sự kiện presence hoặc gửi tin trạng thái đặc biệt
  presence: function(event) {
    // Xử lý hiển thị “typing…” nếu cần
  }
});
pubnub.subscribe({ channels: [chatChannel] });

// Xử lý gửi tin nhắn từ form
document.getElementById("message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (text === "") return;
  
  // Gửi tin nhắn qua PubNub
  pubnub.publish({
    channel: chatChannel,
    message: {
      username: pubnub.getUUID(),
      text: text,
      timestamp: new Date().toISOString()
    }
  });
  
  input.value = "";
});

// Xử lý trạng thái “typing…”
const messageInput = document.getElementById("message-input");
const typingIndicator = document.getElementById("typing-indicator");
let typingTimeout;

messageInput.addEventListener("input", () => {
  typingIndicator.style.display = "block";
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typingIndicator.style.display = "none";
  }, 2000);
});

/* --- Tích hợp Emoji --- */
// Giả sử bạn dùng thư viện Emoji Button, khởi tạo và gắn vào nút emoji
if (window.EmojiButton) {
  const picker = new EmojiButton();
  const emojiBtn = document.getElementById("emoji-btn");
  
  emojiBtn.addEventListener("click", () => {
    picker.togglePicker(emojiBtn);
  });
  
  picker.on("emoji", (emoji) => {
    messageInput.value += emoji;
  });
}
