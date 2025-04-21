// app.js

// Đăng nhập ẩn danh
firebase.auth().signInAnonymously().catch((error) => {
  console.error("Lỗi đăng nhập:", error);
});

// Tham chiếu đến Realtime Database và Storage
const db = firebase.database();
const storage = firebase.storage();
const messagesRef = db.ref("messages");

// Lấy các phần tử DOM
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const fileInput = document.getElementById("file-input");
const sendButton = document.getElementById("send-button");

// Lắng nghe sự kiện gửi tin nhắn
sendButton.addEventListener("click", () => {
  const messageText = messageInput.value;
  const file = fileInput.files[0];

  if (file) {
    const storageRef = storage.ref("files/" + file.name);
    storageRef.put(file).then((snapshot) => {
      snapshot.ref.getDownloadURL().then((downloadURL) => {
        sendMessage(messageText, downloadURL, file.name);
      });
    });
  } else {
    sendMessage(messageText);
  }

  messageInput.value = "";
  fileInput.value = "";
});

// Gửi tin nhắn đến Realtime Database
function sendMessage(text, fileURL = null, fileName = null) {
  const message = {
    text: text || "",
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  };

  if (fileURL && fileName) {
    message.file = {
      url: fileURL,
      name: fileName,
    };
  }

  messagesRef.push(message);
}

// Lắng nghe tin nhắn mới
messagesRef.on("child_added", (snapshot) => {
  const message = snapshot.val();
  displayMessage(message);
});

// Hiển thị tin nhắn trên giao diện
function displayMessage(message) {
  const messageElement = document.createElement("div");
  const time = new Date(message.timestamp).toLocaleTimeString();

  messageElement.innerHTML = `<strong>${time}</strong>: ${message.text}`;

  if (message.file) {
    const fileLink = document.createElement("a");
    fileLink.href = message.file.url;
    fileLink.textContent = `📎 ${message.file.name}`;
    fileLink.target = "_blank";
    messageElement.appendChild(document.createElement("br"));
    messageElement.appendChild(fileLink);
  }

  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
