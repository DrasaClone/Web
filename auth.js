// auth.js
import { auth } from './firebase-config.js';

export function initAuth() {
  const signInBtn = document.getElementById("sign-in-btn");
  const signOutBtn = document.getElementById("sign-out-btn");
  const userInfoDiv = document.getElementById("user-info");
  const googleSignInBtn = document.createElement("button");
  googleSignInBtn.textContent = "Đăng nhập bằng Google";
  googleSignInBtn.style.margin = "5px";
  document.body.insertBefore(googleSignInBtn, document.body.firstChild);

  auth.onAuthStateChanged(user => {
    if (user) {
      const displayName = localStorage.getItem("displayName") || (user.displayName || "Anonymous");
      userInfoDiv.textContent = `Chào ${displayName}`;
      signInBtn.style.display = "none";
      signOutBtn.style.display = "inline-block";
      googleSignInBtn.style.display = "none";
    } else {
      userInfoDiv.textContent = "Chưa đăng nhập";
      signInBtn.style.display = "inline-block";
      signOutBtn.style.display = "none";
      googleSignInBtn.style.display = "inline-block";
    }
  });

  // Đăng nhập ẩn danh
  signInBtn.addEventListener("click", () => {
    auth.signInAnonymously().catch(error => console.error("Lỗi đăng nhập ẩn danh:", error));
  });

  // Đăng nhập bằng Google
  googleSignInBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(result => {
        // Lưu tên hiển thị (từ result.user.displayName) nếu cần
        localStorage.setItem("displayName", result.user.displayName);
      })
      .catch(error => console.error("Lỗi đăng nhập bằng Google:", error));
  });

  // Đăng xuất
  signOutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      localStorage.removeItem("displayName");
    });
  });
}
