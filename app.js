// ----------------------------
// 1. CÀI ĐẶT & KHỞI TẠO API
// ----------------------------

// Firebase configuration – thay thế các giá trị dưới đây bằng thông tin dự án của bạn
var firebaseConfig = {
  apiKey: "AIzaSyCeYwTT7E8bi7bccIrc20MTe5S4r0e0wUI",
  authDomain: "webai-7642b.firebaseapp.com",
  databaseURL: "https://webai-7642b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webai-7642b",
  storageBucket: "webai-7642b.firebasestorage.app",
  messagingSenderId: "967881370128",
  appId: "1:967881370128:web:e5c4b06e4f70f55a68b895",
  measurementId: "G-61XJ390Q30"
};
// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Khởi tạo PubNub – thay khóa của bạn
var pubnub = new PubNub({
  publishKey: "pub-c-9ad32978-37b1-4f15-bc57-bac1884507a4",
  subscribeKey: "sub-c-0269ec54-430f-41b1-8a33-4200f566fcbb"
});
var chatChannel = "global_chat";

// ----------------------------
// 2. CHUYỂN TAB VÀ HIỆU ỨNG
// ----------------------------
document.querySelectorAll("nav ul li a").forEach(function(tabLink) {
  tabLink.addEventListener("click", function (e) {
    e.preventDefault();
    let target = this.dataset.tab;
    // Ẩn tất cả các tab
    document.querySelectorAll(".tab-content").forEach(function(section) {
      section.classList.remove("active");
    });
    // Hiển thị tab được chọn với hiệu ứng
    let activeTab = document.getElementById(target);
    activeTab.classList.add("active");
    anime({
      targets: activeTab,
      opacity: [0, 1],
      duration: 500,
      easing: 'easeInOutQuad'
    });
  });
});

// ----------------------------
// 3. CHỨC NĂNG CHAT (PubNub)
// ----------------------------

// Lắng nghe tin nhắn được công bố trên PubNub
pubnub.addListener({
  message: function(event) {
    appendMessage(event.message);
  }
});
pubnub.subscribe({
  channels: [chatChannel]
});

// Hàm gửi tin nhắn
document.getElementById("send-btn").addEventListener("click", function(){
  var message = document.getElementById("chat-input").value.trim();
  if(message) {
    pubnub.publish({
      channel: chatChannel,
      message: { nickname: getNickname(), text: message, time: new Date().toLocaleTimeString() }
    });
    document.getElementById("chat-input").value = "";
  }
});

// Hàm hiển thị tin nhắn lên giao diện
function appendMessage(msg) {
  var messageContainer = document.getElementById("messages");
  var messageEl = document.createElement("div");
  messageEl.className = "message";
  messageEl.innerHTML = `<strong>${msg.nickname}</strong> [${msg.time}]: ${msg.text}`;
  messageContainer.appendChild(messageEl);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// ----------------------------
// 4. CHỨC NĂNG MẠNG XÃ HỘI
// ----------------------------
document.getElementById("post-btn").addEventListener("click", function(){
  var postText = document.getElementById("post-text").value.trim();
  if(postText){
    addSocialPost(getNickname(), postText);
    document.getElementById("post-text").value = "";
  }
});

// Hàm tạo bài đăng
function addSocialPost(nickname, text) {
  var feed = document.getElementById("social-feed");
  var post = document.createElement("div");
  post.className = "social-post";
  post.innerHTML = `<strong>${nickname}</strong>: ${text} <span class="post-time">(${new Date().toLocaleTimeString()})</span>`;
  feed.prepend(post);
}

// ----------------------------
// 5. DANH SÁCH TRÒ CHƠI (100 game mẫu)
// ----------------------------
function generateGameList() {
  var gameList = document.getElementById("game-list");
  for (let i = 1; i <= 100; i++) {
    let gameItem = document.createElement("div");
    gameItem.className = "game-item";
    gameItem.textContent = "Trò chơi " + i;
    gameItem.addEventListener("click", function() {
      alert("Khởi chạy Trò chơi " + i);
      // Ở đây bạn có thể tích hợp game thực tế hoặc chuyển hướng trang
    });
    gameList.appendChild(gameItem);
  }
}
generateGameList();

// ----------------------------
// 6. CHỨC NĂNG GỌI ĐIỆN / VIDEO CALL (Agora.io)
// ----------------------------
document.getElementById("start-call").addEventListener("click", function(){
  startCall();
});
document.getElementById("end-call").addEventListener("click", function(){
  endCall();
});
document.getElementById("group-call").addEventListener("click", function(){
  startGroupCall();
});

function startCall() {
  // Đây là ví dụ khởi tạo Agora với mã giả.
  // Bạn cần thay thế bằng AppID và token của mình từ Agora.io
  console.log("Bắt đầu cuộc gọi 1-1");
  // Khởi tạo client, join channel, stream video...
  document.getElementById("end-call").disabled = false;
}

function endCall() {
  console.log("Kết thúc cuộc gọi");
  // Hủy kết nối Agora và giải phóng tài nguyên
  document.getElementById("end-call").disabled = true;
}

function startGroupCall() {
  console.log("Bắt đầu cuộc gọi nhóm");
  // Tương tự như startCall nhưng với logic gọi nhóm
}

// ----------------------------
// 7. CHỨC NĂNG NGHE NHẠC
// ----------------------------
// (Sử dụng thẻ <audio> trong HTML – bạn có thể mở rộng chức năng chơi, tạm dừng, thay playlist,...)

// ----------------------------
// 8. QUẢN LÝ TÀI KHOẢN & ĐĂNG NHẬP (Firebase Auth)
// ----------------------------
document.getElementById("login-google").addEventListener("click", function(){
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(function(result) {
      console.log("Đăng nhập Google thành công: ", result.user);
      setNickname(result.user.displayName || "User");
    })
    .catch(function(error) {
      console.error(error);
    });
});

document.getElementById("login-email").addEventListener("click", function(){
  // Tích hợp đăng nhập Email/PW thực tế sẽ yêu cầu thêm form nhập
  alert("Chức năng đăng nhập Email/PW cần tích hợp form riêng");
});
document.getElementById("login-phone").addEventListener("click", function(){
  // Tích hợp đăng nhập bằng SĐT qua Firebase Phone – cần xác nhận OTP
  alert("Chức năng đăng nhập SĐT cần tích hợp xác thực OTP qua Firebase");
});

// ----------------------------
// 9. CHỨC NĂNG THAY ĐỔI GIAO DIỆN (theme, màu sắc)
// ----------------------------
document.getElementById("theme-select").addEventListener("change", function(){
  var theme = this.value;
  if(theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  // Bạn có thể mở rộng cho thêm các theme khác dựa trên giá trị chọn
});

document.getElementById("color-picker").addEventListener("input", function(){
  var color = this.value;
  document.documentElement.style.setProperty("--accent", color);
});

// ----------------------------
// 10. CHỨC NĂNG ONLINE/OFFLINE & CHỈNH SỬA THÔNG TIN CÁ NHÂN
// ----------------------------

// Hàm giữ nickname trong localStorage
function getNickname() {
  return localStorage.getItem("nickname") || "Khách";
}
function setNickname(name) {
  localStorage.setItem("nickname", name);
  document.getElementById("nickname-display").textContent = name;
}

// Cập nhật trạng thái online/offline
window.addEventListener("online", function(){
  document.getElementById("status-display").textContent = "Online";
});
window.addEventListener("offline", function(){
  document.getElementById("status-display").textContent = "Offline";
});

// Khi trang mới load
document.addEventListener("DOMContentLoaded", function(){
  setNickname(getNickname());
  if(navigator.onLine) {
    document.getElementById("status-display").textContent = "Online";
  }
});

// Cho nút chỉnh sửa thông tin cá nhân
document.getElementById("edit-profile").addEventListener("click", function(){
  var newNickname = prompt("Nhập nickname mới:", getNickname());
  if(newNickname) {
    setNickname(newNickname);
  }
});

// ----------------------------
// 11. CHỨC NĂNG CHỐNG TẮT MÀN HÌNH (Screen Wake Lock)
// ----------------------------
let wakeLock = null;
document.getElementById("lock-screen-toggle").addEventListener("click", async function(){
  if ('wakeLock' in navigator) {
    if (!wakeLock) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        alert("Chế độ chống tắt màn hình đã bật");
      } catch (err) {
        console.error(`Không thể bật wake lock: ${err.message}`);
      }
    } else {
      wakeLock.release().then(() => {
        wakeLock = null;
        alert("Chế độ chống tắt màn hình đã tắt");
      });
    }
  } else {
    alert("Trình duyệt của bạn không hỗ trợ Screen Wake Lock API");
  }
});
