// assets/js/auth.js

const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");
const authForm = document.getElementById("auth-form");
const toggleAuth = document.getElementById("toggle-auth");
const authTitle = document.getElementById("auth-title");
const authButton = document.getElementById("auth-button");

let isLoginMode = true; // true: đăng nhập; false: đăng ký

// Chuyển đổi giữa đăng nhập và đăng ký
toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  if (isLoginMode) {
    authTitle.textContent = "Đăng nhập";
    authButton.textContent = "Đăng nhập";
    toggleAuth.textContent = "Đăng ký ngay";
  } else {
    authTitle.textContent = "Đăng ký";
    authButton.textContent = "Đăng ký";
    toggleAuth.textContent = "Đăng nhập";
  }
});

// Xử lý form xác thực
authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  
  if (isLoginMode) {
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("Đăng nhập thành công:", userCredential.user);
        authSection.style.display = "none";
        chatSection.style.display = "block";
      })
      .catch((error) => {
        console.error("Lỗi đăng nhập:", error.message);
        alert(error.message);
      });
  } else {
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("Đăng ký thành công:", userCredential.user);
        authSection.style.display = "none";
        chatSection.style.display = "block";
      })
      .catch((error) => {
        console.error("Lỗi đăng ký:", error.message);
        alert(error.message);
      });
  }
});

// Theo dõi trạng thái đăng nhập của người dùng
auth.onAuthStateChanged((user) => {
  if (user) {
    authSection.style.display = "none";
    chatSection.style.display = "block";
  } else {
    authSection.style.display = "block";
    chatSection.style.display = "none";
  }
});
