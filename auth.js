// auth.js
import { auth } from './firebase-config.js';

export function initAuth() {
  const signInBtn = document.getElementById("sign-in-btn");
  const signOutBtn = document.getElementById("sign-out-btn");
  const userInfoDiv = document.getElementById("user-info");

  auth.onAuthStateChanged(user => {
    if (user) {
      const displayName = localStorage.getItem("displayName") || (user.email ? user.email : "Anonymous");
      userInfoDiv.textContent = `Chào ${displayName}`;
      signInBtn.style.display = "none";
      signOutBtn.style.display = "inline-block";
    } else {
      userInfoDiv.textContent = "Chưa đăng nhập";
      signInBtn.style.display = "inline-block";
      signOutBtn.style.display = "none";
    }
  });

  signInBtn.addEventListener("click", () => {
    auth.signInAnonymously().catch(error => console.error("Lỗi đăng nhập:", error));
  });

  signOutBtn.addEventListener("click", () => {
    auth.signOut();
  });
}
