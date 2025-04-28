// auth.js
import { auth } from "./config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { database } from "./config.js";

const authModal = document.getElementById("auth-modal");
const authForm = document.getElementById("auth-form");
const authModalTitle = document.getElementById("auth-modal-title");
const authSubmit = document.getElementById("auth-submit");
const toggleAuth = document.getElementById("toggle-auth");
let isLoginMode = true;

// Thêm trường username trong modal đăng ký
const usernameInput = document.getElementById("auth-username");
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");

// Đăng nhập Google
export function googleSignIn() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(result => closeAuthModal())
    .catch(error => alert("Google đăng nhập lỗi: " + error.message));
}

// Đăng nhập Phone
export function setupPhoneAuth(containerId) {
  window.recaptchaVerifier = new RecaptchaVerifier(containerId, {
    size: 'invisible',
    callback: response => {}
  }, auth);
}

export function phoneSignIn(phoneNumber) {
  const appVerifier = window.recaptchaVerifier;
  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then(confirmationResult => {
      const code = prompt("Nhập mã OTP gửi đến số điện thoại của bạn:");
      return confirmationResult.confirm(code);
    })
    .then(result => closeAuthModal())
    .catch(error => alert("Phone đăng nhập lỗi: " + error.message));
}

export function openAuthModal() {
  authModal.classList.remove("hidden");
}

export function closeAuthModal() {
  authModal.classList.add("hidden");
}

export function setupAuthListeners() {
  // Thêm sự kiện chuyển giữa đăng nhập và đăng ký
  document.getElementById("toggle-link").addEventListener("click", e => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
      authModalTitle.textContent = "Đăng nhập";
      authSubmit.textContent = "Đăng nhập";
      usernameInput.classList.add("hidden");
      toggleAuth.innerHTML = 'Chưa có tài khoản? <a href="#" id="toggle-link">Đăng ký ngay</a>';
    } else {
      authModalTitle.textContent = "Đăng ký";
      authSubmit.textContent = "Đăng ký";
      usernameInput.classList.remove("hidden");
      toggleAuth.innerHTML = 'Đã có tài khoản? <a href="#" id="toggle-link">Đăng nhập ngay</a>';
    }
  });
  
  document.querySelector(".close-btn").addEventListener("click", closeAuthModal);

  authForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    if (isLoginMode) {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => closeAuthModal())
        .catch(error => alert("Lỗi đăng nhập: " + error.message));
    } else {
      const username = usernameInput.value.trim();
      if (!username) {
        alert("Vui lòng nhập username!");
        return;
      }
      createUserWithEmailAndPassword(auth, email, password)
        .then(result => {
          // Cập nhật profile Firebase với username
          updateProfile(result.user, { displayName: username });
          // Lưu thông tin người dùng vào node "users" trong Firebase Database
          set(ref(database, "users/" + result.user.uid), {
            username: username,
            email: email,
            createdAt: Date.now()
          });
          closeAuthModal();
        })
        .catch(error => alert("Lỗi đăng ký: " + error.message));
    }
  });
  
  document.getElementById("google-login").addEventListener("click", googleSignIn);
  document.getElementById("phone-login").addEventListener("click", () => {
    const phone = prompt("Nhập số điện thoại (bao gồm mã quốc gia):");
    if (phone) phoneSignIn(phone);
  });
}

export function updateUserArea(currentUser) {
  const userArea = document.getElementById("user-area");
  if (currentUser) {
    // Nếu đã cập nhật displayName (username) thì hiển thị username
    const name = currentUser.displayName ? currentUser.displayName : currentUser.email;
    userArea.innerHTML = `<span>Chào, ${name}</span>
                          <button id="logout-btn">Đăng xuất</button>
                          <a href="profile.html">Trang Cá Nhân</a>`;
    document.getElementById("logout-btn").addEventListener("click", () => {
      signOut(auth).catch(error => alert("Lỗi đăng xuất: " + error.message));
    });
  } else {
    userArea.innerHTML = '<button id="login-btn">Đăng nhập</button> <button id="signup-btn">Đăng ký</button>';
    document.getElementById("login-btn").addEventListener("click", () => {
      isLoginMode = true;
      authModalTitle.textContent = "Đăng nhập";
      authSubmit.textContent = "Đăng nhập";
      usernameInput.classList.add("hidden");
      openAuthModal();
    });
    document.getElementById("signup-btn").addEventListener("click", () => {
      isLoginMode = false;
      authModalTitle.textContent = "Đăng ký";
      authSubmit.textContent = "Đăng ký";
      usernameInput.classList.remove("hidden");
      openAuthModal();
    });
  }
}

export function monitorAuthState() {
  onAuthStateChanged(auth, user => updateUserArea(user));
}
