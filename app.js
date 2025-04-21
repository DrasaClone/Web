// app.js
// Tham chiếu Firebase services
const db = firebase.database();
const storage = firebase.storage();
const messagesRef = db.ref('messages');

// Tham chiếu DOM
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');
const sendButton = document.getElementById('send-button');
const voiceCallButton = document.getElementById('voice-call-button');
const videoCallButton = document.getElementById('video-call-button');
const shareLocationButton = document.getElementById('share-location-button');

// Đăng nhập ẩn danh đã khởi tạo trong firebase-config.js

// Lắng nghe tin nhắn mới
messagesRef.on('child_added', snapshot => {
  const msg = snapshot.val();
  const div = document.createElement('div');
  div.classList.add('msg', msg.sender === currentUserId ? 'sent' : 'received');

  // Thời gian
  const timeSpan = document.createElement('span');
  timeSpan.classList.add('time');
  timeSpan.textContent = new Date(msg.timestamp).toLocaleTimeString();
  div.appendChild(timeSpan);

  // Nội dung văn bản
  if (msg.text) {
    const textSpan = document.createElement('span');
    textSpan.textContent = msg.text;
    div.appendChild(textSpan);
  }

  // File
  if (msg.file) {
    const link = document.createElement('a');
    link.href = msg.file.url;
    link.textContent = `📎 ${msg.file.name}`;
    link.target = '_blank';
    div.appendChild(document.createElement('br'));
    div.appendChild(link);
  }

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Gửi tin nhắn
sendButton.addEventListener('click', () => {
  const text = messageInput.value.trim();
  const file = fileInput.files[0];
  const msgData = { sender: currentUserId, timestamp: firebase.database.ServerValue.TIMESTAMP };

  if (file) {
    const fileRef = storage.ref(`files/${Date.now()}_${file.name}`);
    fileRef.put(file).then(() => fileRef.getDownloadURL()).then(url => {
      msgData.file = { url, name: file.name };
      if (text) msgData.text = text;
      messagesRef.push(msgData);
    });
  } else if (text) {
    msgData.text = text;
    messagesRef.push(msgData);
  }

  messageInput.value = '';
  fileInput.value = '';
});

// Gọi thoại/video với WebRTC
let localStream; let peerConnection;
const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

async function startCall(isVideo) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
    peerConnection = new RTCPeerConnection(iceServers);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    // Tiếp tục signaling qua Firebase (push offer/answer và ICE candidates)
  } catch (err) {
    console.error('Lỗi phương tiện:', err);
  }
}
voiceCallButton.onclick = () => startCall(false);
videoCallButton.onclick = () => startCall(true);

// Chia sẻ vị trí
shareLocationButton.onclick = () => {
  if (!navigator.geolocation) return alert('Không hỗ trợ vị trí');
  navigator.geolocation.getCurrentPosition(pos => {
    sendText(`Vị trí của tôi: https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`);
  }, () => alert('Không thể lấy vị trí'));
};

// Emoji & Sticker
function sendEmoji(emoji) { sendText(emoji); }
function sendSticker(fileName) { sendText(`<img src=\"assets/stickers/${fileName}\" />`); }

function sendText(text) { messagesRef.push({ sender: currentUserId, text, timestamp: firebase.database.ServerValue.TIMESTAMP }); }

// Biến lưu userID (sau khi đăng nhập thành công)
let currentUserId;
firebase.auth().onAuthStateChanged(user => { if (user) currentUserId = user.uid; });
