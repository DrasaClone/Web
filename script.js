/* script.js */

// ----- Biến toàn cục và khởi tạo -----
let currentSection = 'chat';
let pubnub;
let userAuth = null;  // Lưu trạng thái người dùng sau khi đăng nhập
let agoraClient;

// ----- Điều hướng các phần (sections) -----
function showSection(section) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(sec => sec.classList.remove('active'));
  document.getElementById(section + 'Section').classList.add('active');
  currentSection = section;
}

// ----- Hàm thay đổi theme (có sử dụng anime.js cho hiệu ứng mượt) -----
function changeTheme(theme) {
  document.body.className = 'theme-' + theme;
  anime({
    targets: 'body',
    backgroundColor: theme === 'dark' ? '#121212' : (theme === 'blue' ? '#e0f7fa' : (theme === 'red' ? '#ffebee' : '#f0f0f0')),
    duration: 800,
    easing: 'easeInOutQuad'
  });
}

// ----- Tính năng chống tắt màn hình -----
// Một đoạn code “đánh thức” trình duyệt mỗi 5 phút
setInterval(() => {
  document.body.style.backgroundColor = document.body.style.backgroundColor;
}, 300000); // 300.000ms = 5 phút

// ----- Khởi tạo Firebase -----
// Thay thế cấu hình dưới đây bằng thông số dự án Firebase của bạn
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};
firebase.initializeApp(firebaseConfig);

// ----- Khởi tạo PubNub -----
// Thay thế bằng publishKey và subscribeKey của bạn
pubnub = new PubNub({
  publishKey: "YOUR_PUBNUB_PUBLISH_KEY",
  subscribeKey: "YOUR_PUBNUB_SUBSCRIBE_KEY",
  uuid: "user-" + Math.floor(Math.random() * 10000)
});
pubnub.subscribe({channels: ['chat']});
pubnub.addListener({
  message: function(event) {
    displayMessage(event.message);
  }
});

// ----- Hiển thị tin nhắn chat -----
function displayMessage(msg) {
  const chatWindow = document.getElementById('chatWindow');
  const msgDiv = document.createElement('div');
  msgDiv.textContent = msg.nickname + ': ' + msg.text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ----- Gửi tin nhắn chat -----
function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (text === "") return;
  const messageData = {
    nickname: localStorage.getItem('nickname') || 'Anonymous',
    text: text,
    timestamp: Date.now()
  };
  
  pubnub.publish({
    channel: 'chat',
    message: messageData
  }, function(status, response) {
    if (!status.error) input.value = "";
  });
}

// ----- Cập nhật thông tin cá nhân (nickname) -----
function updateProfile() {
  const nickname = document.getElementById('nickname').value.trim();
  if (nickname !== '') {
    localStorage.setItem('nickname', nickname);
    alert('Nickname đã được cập nhật!');
  }
}

// ----- Modal đăng nhập/đăng ký -----
function openAuthModal() {
  document.getElementById('authModal').style.display = 'block';
}
function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
}

// ----- Các hàm xác thực dùng Firebase ----- 
function loginWithEmail() {
  // Thêm logic xác thực email (firebase.auth().signInWithEmailAndPassword)
  document.getElementById('authForm').style.display = 'block';
}
function loginWithPhone() {
  // Thêm logic cho xác thực số điện thoại (firebase.auth().signInWithPhoneNumber)
  document.getElementById('authForm').style.display = 'block';
}
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      userAuth = result.user;
      alert("Đăng nhập thành công: " + userAuth.displayName);
    })
    .catch(error => {
      console.error(error);
    });
}
function submitAuth() {
  // Xử lý form đăng nhập/đăng ký chung (sử dụng createUserWithEmailAndPassword hoặc signInWithEmailAndPassword)
  closeAuthModal();
}

// ----- Tích hợp Agora.io cho cuộc gọi (video, audio và group call) -----
function initiateCall() {
  // Ví dụ sử dụng Agora.io: khởi tạo và tham gia kênh "demoChannel"
  agoraClient = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
  agoraClient.init("YOUR_AGORA_APP_ID", function() {
    console.log("AgoraRTC client initialized");
    agoraClient.join(null, "demoChannel", null, function(uid) {
      console.log("User " + uid + " joined channel");
      startLocalStream(uid);
    }, function(err) {
      console.error("AgoraRTC join failed", err);
    });
  });
}
function startLocalStream(uid) {
  let localStream = AgoraRTC.createStream({
    streamID: uid,
    audio: true,
    video: true,
    screen: false
  });
  localStream.init(function() {
    localStream.play('videoContainer');
    agoraClient.publish(localStream, function(err) {
      console.error("Publish error: " + err);
    });
  }, function(err) {
    console.error("Local stream init failed", err);
  });
}

// ----- Ví dụ game đơn giản (đã khởi chạy ở gameSection) -----
// Phần code game có thể được mở rộng hoặc thay thế bởi nhiều trò chơi hơn

// ----- Hiệu ứng giao diện bổ sung -----
// Các hiệu ứng phụ có thể được thêm vào ở đây bằng anime.js

// ----- Tích hợp Audio (Audiomack) -----
// Bạn có thể nâng cấp audio player hoặc thêm API tùy thuộc vào nguồn stream Audiomack

// ----- Online/Offline Tracking -----
window.addEventListener('online', () => {
  document.getElementById('onlineStatus').textContent = "Online";
});
window.addEventListener('offline', () => {
  document.getElementById('onlineStatus').textContent = "Offline";
});

// Nếu người dùng chưa xác thực, mở modal đăng nhập
if (!userAuth) {
  openAuthModal();
}
