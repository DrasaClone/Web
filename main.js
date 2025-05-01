/* main.js */

// -----------------
// CẤU HÌNH API KEY
// -----------------
const firebaseConfig = {
  apiKey: "AIzaSyCeYwTT7E8bi7bccIrc20MTe5S4r0e0wUI",
  authDomain: "webai-7642b.firebaseapp.com",
  databaseURL: "https://webai-7642b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webai-7642b",
  storageBucket: "webai-7642b.firebasestorage.app",
  messagingSenderId: "967881370128",
  appId: "1:967881370128:web:e5c4b06e4f70f55a68b895",
  measurementId: "G-61XJ390Q30"
};

firebase.initializeApp(firebaseConfig);

// PubNub configuration
const pubnub = new PubNub({
  publishKey: "pub-c-9ad32978-37b1-4f15-bc57-bac1884507a4",
  subscribeKey: "sub-c-0269ec54-430f-41b1-8a33-4200f566fcbb",
  uuid: "user-" + Math.floor(Math.random() * 10000)
});

// Agora configuration
const agoraAppId = "a0b62867bee543fe828e23b4888eb3ae";
let agoraClient; // Sẽ khởi tạo khi bắt đầu cuộc gọi

// --------------------
// THIẾT LẬP PHẦN TÍNH NĂNG
// --------------------
const loginSection = document.getElementById('login-section');
const chatSection = document.getElementById('chat-section');
const socialSection = document.getElementById('social-section');
const profileSection = document.getElementById('profile-section');
const musicSection = document.getElementById('music-section');
const callSection = document.getElementById('call-section');

const nicknameInput = document.getElementById('nickname');
const phoneInput = document.getElementById('phone');
const phoneLoginBtn = document.getElementById('phone-login');
const googleLoginBtn = document.getElementById('google-login');

const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');
const userStatusSpan = document.getElementById('user-status');

const toggleThemeBtn = document.getElementById('toggle-dark-light');
const themeSelect = document.getElementById('theme-select');

const displayNickname = document.getElementById('display-nickname');

const startCallBtn = document.getElementById('start-call');
const endCallBtn = document.getElementById('end-call');
const localStreamDiv = document.getElementById('local-stream');
const remoteStreamsDiv = document.getElementById('remote-streams');

// -------------------------------
// 1. CÁC THEME & CHẾ ĐỘ SÁNG/TỐI
// -------------------------------
const themes = [
  {name: "Blue", primary: "#2196F3"},
  {name: "Red", primary: "#F44336"},
  {name: "Green", primary: "#4CAF50"},
  {name: "Purple", primary: "#9C27B0"},
  {name: "Orange", primary: "#FF9800"},
  {name: "Pink", primary: "#E91E63"},
  {name: "Indigo", primary: "#3F51B5"},
  {name: "Teal", primary: "#009688"},
  {name: "Lime", primary: "#CDDC39"},
  {name: "Deep Orange", primary: "#FF5722"},
  // Thêm các theme khác lên đến 20 theme
];

themes.forEach(theme => {
  let option = document.createElement("option");
  option.value = theme.primary;
  option.textContent = theme.name;
  themeSelect.appendChild(option);
});

// Toggle chế độ sáng/tối
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Khi chọn theme mới, cập nhật biến CSS
themeSelect.addEventListener('change', (e) => {
  document.documentElement.style.setProperty('--primary-color', e.target.value);
});

// -----------------------------------
// 2. CHỨC NĂNG ĐĂNG NHẬP & ĐĂNG KÝ
// -----------------------------------
// THIẾT LẬP PHẦN TÍNH NĂNG và DOM Elements
// --------------------
const loginSection = document.getElementById('login-section');
const chatSection = document.getElementById('chat-section');
const socialSection = document.getElementById('social-section');
const profileSection = document.getElementById('profile-section');
const musicSection = document.getElementById('music-section');
const callSection = document.getElementById('call-section');

const nicknameInput = document.getElementById('nickname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const phoneInput = document.getElementById('phone');

const emailLoginBtn = document.getElementById('email-login');
const emailSignupBtn = document.getElementById('email-signup');
const phoneLoginBtn = document.getElementById('phone-login');
const googleLoginBtn = document.getElementById('google-login');

const displayNickname = document.getElementById('display-nickname');
const userStatusSpan = document.getElementById('user-status');
// -----------------------------------
// 1. CÁC HÀM XỬ LÝ ĐĂNG NHẬP & ĐĂNG KÝ
// -----------------------------------

// Hỗ trợ đăng nhập bằng Email
emailLoginBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const nickname = nicknameInput.value || (email.split('@')[0] || "User");

  if (email === "" || password === "") {
    alert("Email và Mật khẩu không được để trống!");
    return;
  }
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((result) => {
      handleLogin(nickname);
    })
    .catch((error) => {
      alert("Lỗi đăng nhập: " + error.message);
      console.error("Email login error:", error);
    });
});

// Hỗ trợ đăng ký bằng Email
emailSignupBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const nickname = nicknameInput.value || (email.split('@')[0] || "User");

  if (email === "" || password === "") {
    alert("Email và Mật khẩu không được để trống!");
    return;
  }
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((result) => {
      handleLogin(nickname);
    })
    .catch((error) => {
      alert("Lỗi đăng ký: " + error.message);
      console.error("Email signup error:", error);
    });
});

// Đăng nhập bằng SĐT
phoneLoginBtn.addEventListener('click', () => {
  const nickname = nicknameInput.value || "Guest";
  
  // Sử dụng container có id "recaptcha-container" để khởi tạo reCAPTCHA
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible',
    callback: (response) => {
      console.log("Recaptcha solved");
    }
  });
  
  const phone = phoneInput.value.trim();
  if (phone === "") {
    alert("Số điện thoại không được để trống!");
    return;
  }
  firebase.auth().signInWithPhoneNumber('+84' + phone, window.recaptchaVerifier)
    .then((confirmationResult) => {
      const code = prompt("Nhập mã xác nhận SMS:");
      return confirmationResult.confirm(code);
    })
    .then((result) => {
      handleLogin(nickname);
    })
    .catch((error) => {
      alert("Lỗi đăng nhập SĐT: " + error.message);
      console.error("Phone login error:", error);
    });
});

// Đăng nhập bằng Google (giữ nguyên như mẫu ban đầu)
googleLoginBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      handleLogin(result.user.displayName || nicknameInput.value || "User");
    })
    .catch((error) => {
      alert("Lỗi đăng nhập Google: " + error.message);
      console.error("Google login error:", error);
    });
});

// Hàm xử lý sau khi đăng nhập thành công
function handleLogin(nickname) {
  // Ẩn phần đăng nhập, hiện các phần chức năng khác
  loginSection.style.display = 'none';
  chatSection.style.display = 'block';
  socialSection.style.display = 'block';
  profileSection.style.display = 'block';
  musicSection.style.display = 'block';
  callSection.style.display = 'block';

  // Cập nhật thông tin hiển thị người dùng
  displayNickname && (displayNickname.textContent = nickname);
  userStatusSpan && (userStatusSpan.textContent = 'Online');

  // Bạn có thể lưu thông tin người dùng vào Firebase Database hoặc localStorage tại đây.
}

// --------------------------------
// 3. CHỨC NĂNG CHAT (PubNub)
// --------------------------------
pubnub.subscribe({channels: ["chat"]});
pubnub.addListener({
  message: function(event) {
    displayMessage(event.message);
  }
});

function displayMessage(msg) {
  let div = document.createElement("div");
  div.className = "message";
  div.textContent = `${msg.sender}: ${msg.text}`;
  messagesDiv.appendChild(div);
}

// Gửi tin nhắn
sendMessageBtn.addEventListener('click', () => {
  let text = messageInput.value.trim();
  if (text === "") return;
  const msg = {
    sender: displayNickname.textContent,
    text: text
  };
  pubnub.publish({channel: "chat", message: msg});
  messageInput.value = "";
});

// -----------------------------------
// 4. TÍNH NĂNG UPLOAD ẢNH (Cloudinary)
// -----------------------------------
const uploadBtn = document.getElementById("upload-image");
if (uploadBtn) {
  uploadBtn.addEventListener("click", () => {
    cloudinary.openUploadWidget(
      { 
        cloudName: "dgbux4wzo", 
        uploadPreset: "okeqfdx4"
      }, 
      (error, result) => {
        if (!error && result && result.event === "success") {
          console.log("Ảnh upload thành công: ", result.info.secure_url);
          // Bạn có thể lưu URL hình này vào bài đăng trong mạng xã hội
        }
      }
    );
  });
}

// --------------------------------
// 5. TÍNH NĂNG NGHE NHẠC (Deezer) (😑 Don't create app sucess)
// --------------------------------
DZ.init({
  appId  : 'YOUR_DEEZER_APP_ID',
  channelUrl : 'YOUR_CHANNEL_URL', // Bạn cần tạo channel URL riêng
  player : {
    container : 'player',
    width : 300,
    height : 300,
    onload : function(){
      console.log('Deezer Player loaded');
    }
  }
});

// --------------------------------
// 6. TÍNH NĂNG GỌI ĐIỆN / VIDEO (Agora.io)
// --------------------------------
startCallBtn.addEventListener('click', async () => {
  startCallBtn.style.display = 'none';
  endCallBtn.style.display = 'inline';
  
  // Khởi tạo client Agora
  agoraClient = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
  await agoraClient.initialize(agoraAppId);
  // Tham gia kênh "demoChannel" – bạn có thể thay đổi theo ý muốn
  await agoraClient.join(agoraAppId, "demoChannel", null, null);
  
  // Tạo local stream với video và audio
  let localStream = AgoraRTC.createStream({video: true, audio: true});
  await localStream.init();
  
  // Hiển thị local stream
  localStreamDiv.innerHTML = "";
  localStreamDiv.appendChild(localStream.play("local-stream"));
  agoraClient.publish(localStream);
});

endCallBtn.addEventListener('click', async () => {
  if (agoraClient) {
    await agoraClient.leave();
    localStreamDiv.innerHTML = "";
    remoteStreamsDiv.innerHTML = "";
    startCallBtn.style.display = 'inline';
    endCallBtn.style.display = 'none';
  }
});

// ---------------------------------------------
// 7. CHỐNG TẮT MÀN HÌNH (Wake Lock API)
// ---------------------------------------------
if ('wakeLock' in navigator) {
  let wakeLock = null;
  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock released');
      });
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  };
  requestWakeLock();
}

// ---------------------------------------------
// 8. HIỆU ỨNG ĐỘNG (Anime.js)
// ---------------------------------------------
// Ví dụ: hiệu ứng đơn giản khi hiển thị tin nhắn mới
function animateNewMessage(element) {
  anime({
    targets: element,
    translateY: [-20, 0],
    opacity: [0, 1],
    duration: 800,
    easing: 'easeOutExpo'
  });
}
