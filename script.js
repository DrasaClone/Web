/* script.js */

document.addEventListener('DOMContentLoaded', function() {
  /* Khởi tạo Firebase – hãy thay thế các thông số bên dưới bằng cấu hình của dự án Firebase của bạn */
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
  
  /* Khởi tạo PubNub – thay thế các khóa tương ứng */
  window.pubnub = new PubNub({
      publishKey: "YOUR_PUBNUB_PUBLISH_KEY",
      subscribeKey: "YOUR_PUBNUB_SUBSCRIBE_KEY",
      uuid: generateUUID()
  });
  
  // Đăng ký kênh chat
  pubnub.subscribe({ channels: ['chat-channel'] });
  pubnub.addListener({
     message: function(event) {
        displayMessage(event.message);
     },
     presence: function(event) {
        // Cập nhật trạng thái online/offline (cần xử lý chi tiết hơn trong sản phẩm thực tế)
        document.getElementById('online-status').innerText = event.action === 'join' ? "Online" : "Offline";
     }
  });

  // Yêu cầu không cho màn hình tắt (Wake Lock API)
  if ('wakeLock' in navigator) {
     requestWakeLock();
  }
  
  // Khởi tạo danh sách theme (ví dụ 3 theme, mở rộng lên đến 20 theo yêu cầu)
  initThemes();
  
  // Theo dõi trạng thái đăng nhập trên Firebase
  firebase.auth().onAuthStateChanged(function(user) {
     if (user) {
        // Người dùng đã đăng nhập
        document.getElementById('user-email').innerText = user.email ? user.email : "Chưa có email";
        document.getElementById('user-nickname').innerText = user.displayName ? user.displayName : "Nickname";
        closeAuthModal();
     } else {
        // Chưa đăng nhập – hiển thị modal đăng nhập
        openAuthModal();
     }
  });
});

/* Hàm tạo UUID đơn giản */
function generateUUID() {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, function(c) {
      var r = Math.random() * 16 | 0;
      return r.toString(16);
  });
}

/* Hiển thị tin nhắn trong khung chat */
function displayMessage(message) {
   const messagesContainer = document.getElementById('messages');
   const messageElement = document.createElement('div');
   messageElement.className = 'message';
   // Nếu tin nhắn có hình ảnh
   if(message.imageUrl) {
      messageElement.innerHTML = `<strong>${message.sender}:</strong> <br><img src="${message.imageUrl}" alt="Hình ảnh" style="max-width:200px;">`;
   } else {
      messageElement.innerHTML = `<strong>${message.sender}:</strong> ${message.text}`;
   }
   messagesContainer.appendChild(messageElement);
   messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* Gửi tin nhắn qua PubNub */
function sendMessage() {
    const input = document.getElementById('message-input');
    const messageText = input.value;
    if(messageText.trim() === "") return;
    pubnub.publish({
         channel: 'chat-channel',
         message: {
            sender: firebase.auth().currentUser ? firebase.auth().currentUser.displayName || "Anonymous" : "Anonymous",
            text: messageText,
            timestamp: Date.now()
         }
    }, function(status, response) {
         if(status.error) {
             console.error("Lỗi gửi tin:", status);
         } else {
             console.log("Tin nhắn đã gửi với timetoken", response.timetoken);
         }
    });
    input.value = "";
}

/* Upload ảnh sử dụng Cloudinary Upload Widget */
function uploadImage() {
    cloudinary.openUploadWidget({
        cloudName: 'YOUR_CLOUD_NAME', 
        uploadPreset: 'YOUR_UPLOAD_PRESET'
    }, function(error, result) {
       if (!error && result && result.event === "success") {
           const imageUrl = result.info.secure_url;
           // Gửi tin nhắn chứa URL ảnh
           pubnub.publish({
             channel: 'chat-channel',
             message: {
                 sender: firebase.auth().currentUser ? firebase.auth().currentUser.displayName || "Anonymous" : "Anonymous",
                 imageUrl: imageUrl,
                 timestamp: Date.now()
             }
           }, function(status, response) {
               if(status.error) {
                   console.error("Lỗi gửi tin:", status);
               } else {
                   console.log("Tin nhắn hình ảnh được gửi với timetoken", response.timetoken);
               }
           });
       }
    });
}

/* Bắt đầu cuộc gọi sử dụng Agora.io */
function startCall() {
   console.log("Bắt đầu cuộc gọi...");
   // Khởi tạo Agora client – thay thế YOUR_AGORA_APP_ID với App ID của bạn
   var client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
   client.init("YOUR_AGORA_APP_ID", function() {
      console.log("AgoraRTC client đã khởi tạo");
      client.join(null, "demoChannel", null, function(uid) {
          console.log("User " + uid + " đã tham gia phòng");
          // Tạo stream cục bộ và phát video lên container
          var localStream = AgoraRTC.createStream({audio: true, video: true});
          localStream.init(function() {
              localStream.play('agora-container');
              client.publish(localStream, function(err) {
                  console.error("Lỗi gửi stream cục bộ: " + err);
              });
          }, function(err) {
              console.error("Lỗi truy cập media: ", err);
          });
      }, function(err) {
          console.error("Lỗi tham gia phòng: ", err);
      });
   }, function(err) {
      console.error("Lỗi khởi tạo AgoraRTC client: ", err);
   });
}

/* Kết thúc cuộc gọi */
function endCall() {
   console.log("Kết thúc cuộc gọi...");
   // Ở sản phẩm thực, lưu tham chiếu client và các stream để gọi client.leave() và dọn dẹp.
}

/* Yêu cầu Wake Lock để chống tắt màn hình */
async function requestWakeLock() {
  try {
    let wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      console.log('Screen Wake Lock đã được giải phóng');
    });
    console.log('Screen Wake Lock đang hoạt động');
  } catch (err) {
    console.error('Lỗi Wake Lock: ', err.name, err.message);
  }
}

/* Khởi tạo các theme cho việc chuyển đổi giao diện */
function initThemes() {
    const themeSelector = document.getElementById('theme-selector');
    const themes = ["default", "dark", "red"]; // Mở rộng mảng này tới khoảng 20 theme nếu cần
    themes.forEach(theme => {
        let opt = document.createElement('option');
        opt.value = theme;
        opt.text = theme.charAt(0).toUpperCase() + theme.slice(1);
        themeSelector.appendChild(opt);
    });
}

/* Hàm chuyển đổi theme */
function switchTheme(theme) {
   document.documentElement.className = 'theme-' + theme;
}

/* Hàm chuyển đổi chế độ sáng/tối bằng cách toggle class */
function toggleDarkMode() {
   document.body.classList.toggle('dark-mode');
}

/* Hàm hiển thị trang được chọn */
function showPage(pageId) {
   const pages = document.getElementsByClassName('page');
   for (let i = 0; i < pages.length; i++) {
      pages[i].style.display = 'none';
   }
   document.getElementById(pageId).style.display = 'block';
}

/* Các điều khiển của modal đăng nhập */
function openAuthModal() {
   document.getElementById('auth-modal').style.display = 'block';
}

function closeAuthModal() {
   document.getElementById('auth-modal').style.display = 'none';
}

/* Đăng nhập qua Email/Password với Firebase */
function signInWithEmail() {
   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;
   firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
         console.log("Đăng nhập qua Email thành công");
      })
      .catch((error) => {
         console.error(error.code, error.message);
      });
}

/* Đăng nhập qua Google với Firebase */
function signInWithGoogle() {
   var provider = new firebase.auth.GoogleAuthProvider();
   firebase.auth().signInWithPopup(provider)
      .then((result) => {
         console.log("Đăng nhập bằng Google thành công");
      }).catch((error) => {
         console.error(error);
      });
}

/* Đăng nhập bằng Số điện thoại (lưu ý: cần thiết lập Firebase Recaptcha) */
function signInWithPhone() {
   let phoneNumber = prompt("Nhập số điện thoại của bạn:");
   if (!phoneNumber) return;
   let appVerifier = new firebase.auth.RecaptchaVerifier('auth-modal', {
          'size': 'invisible'
   });
   firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
       .then(function (confirmationResult) {
           let code = prompt("Nhập mã OTP được gửi về điện thoại của bạn:");
           return confirmationResult.confirm(code);
       })
       .then((result) => {
           console.log("Đăng nhập bằng Số điện thoại thành công");
       })
       .catch((error) => {
           console.error(error);
       });
}

/* Hàm đăng status (bài viết) trên trang Mạng xã hội */
function postStatus() {
    const content = document.getElementById('post-content').value;
    if(content.trim() === "") return;
    const postsContainer = document.getElementById('posts');
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `<p><strong>${firebase.auth().currentUser ? firebase.auth().currentUser.displayName || "Anonymous" : "Anonymous"}</strong>: ${content}</p>`;
    postsContainer.insertBefore(postElement, postsContainer.firstChild);
    document.getElementById('post-content').value = "";
}

/* Hàm chỉnh sửa thông tin cá nhân (ví dụ thay đổi nickname) */
function editProfile() {
   let newNickname = prompt("Nhập nickname mới:");
   if(newNickname && firebase.auth().currentUser) {
       firebase.auth().currentUser.updateProfile({
            displayName: newNickname
       }).then(() => {
            document.getElementById('user-nickname').innerText = newNickname;
       }).catch((error) => {
            console.error("Lỗi cập nhật nickname:", error);
       });
   }
}
