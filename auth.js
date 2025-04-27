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
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const authModal = document.getElementById("auth-modal");
const authForm = document.getElementById("auth-form");
const authModalTitle = document.getElementById("auth-modal-title");
const authSubmit = document.getElementById("auth-submit");
const toggleAuth = document.getElementById("toggle-auth");
let isLoginMode = true;

const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");

// --- Thêm phương thức đăng nhập Google ---
export function googleSignIn() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(result => {
      // Đăng nhập thành công
      closeAuthModal();
    })
    .catch(error => {
      alert("Google đăng nhập lỗi: " + error.message);
    });
}

// --- Thêm phương thức đăng nhập bằng Số điện thoại ---
// Trước tiên, bạn cần có một container cho reCAPTCHA bên trong HTML (ví dụ một div có id "recaptcha-container")
// Bạn có thể thêm div này vào modal xác thực nếu muốn.
export function setupPhoneAuth(containerId) {
  window.recaptchaVerifier = new RecaptchaVerifier(containerId, {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA đã xác nhận
    }
  }, auth);
}

export function phoneSignIn(phoneNumber) {
  const appVerifier = window.recaptchaVerifier;
  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then(confirmationResult => {
      const code = prompt("Nhập mã OTP gửi đến số điện thoại của bạn:");
      return confirmationResult.confirm(code);
    })
    .then(result => {
      closeAuthModal();
    })
    .catch(error => {
      alert("Phone đăng nhập lỗi: " + error.message);
    });
}

export function openAuthModal() {
  authModal.classList.remove("hidden");
}

export function closeAuthModal() {
  authModal.classList.add("hidden");
}

export function setupAuthListeners() {
  // Chuyển đổi giữa đăng nhập và đăng ký
  document.getElementById("toggle-link").addEventListener("click", (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
      authModalTitle.textContent = "Đăng nhập";
      authSubmit.textContent = "Đăng nhập";
      toggleAuth.innerHTML = 'Chưa có tài khoản? <a href="#" id="toggle-link">Đăng ký ngay</a>';
    } else {
      authModalTitle.textContent = "Đăng ký";
      authSubmit.textContent = "Đăng ký";
      toggleAuth.innerHTML = 'Đã có tài khoản? <a href="#" id="toggle-link">Đăng nhập ngay</a>';
    }
  });

  document.querySelector(".close-btn").addEventListener("click", closeAuthModal);

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    if (isLoginMode) {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          closeAuthModal();
        })
        .catch((error) => {
          alert("Lỗi đăng nhập: " + error.message);
        });
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          closeAuthModal();
        })
        .catch((error) => {
          alert("Lỗi đăng ký: " + error.message);
        });
    }
  });
}

export function updateUserArea(currentUser) {
  const userArea = document.getElementById("user-area");
  if (currentUser) {
    userArea.innerHTML = `<span>Chào, ${currentUser.email}</span> 
                          <button id="logout-btn">Đăng xuất</button>
                          <a href="profile.html">Trang Cá Nhân</a>`;
    document.getElementById("logout-btn").addEventListener("click", () => {
      signOut(auth).catch((error) =>
        alert("Lỗi khi đăng xuất: " + error.message)
      );
    });
  } else {
    userArea.innerHTML = '<button id="login-btn">Đăng nhập</button> <button id="signup-btn">Đăng ký</button>';
    document.getElementById("login-btn").addEventListener("click", () => {
      isLoginMode = true;
      authModalTitle.textContent = "Đăng nhập";
      authSubmit.textContent = "Đăng nhập";
      openAuthModal();
    });
    document.getElementById("signup-btn").addEventListener("click", () => {
      isLoginMode = false;
      authModalTitle.textContent = "Đăng ký";
      authSubmit.textContent = "Đăng ký";
      openAuthModal();
    });
  }
}

export function monitorAuthState() {
  onAuthStateChanged(auth, (user) => {
    updateUserArea(user);
  });
}
