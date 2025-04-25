/* auth.js */
document.addEventListener("DOMContentLoaded", function() {
  const loginForm  = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginPage  = document.getElementById("login-page");
  const signupPage = document.getElementById("signup-page");
  const mainApp    = document.getElementById("main-app");

  // Đăng nhập
  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const email    = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      firebase.auth().signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        loginPage.style.display  = "none";
        signupPage.style.display = "none";
        mainApp.style.display    = "block";
        loadProfile(userCredential.user);
      })
      .catch(error => {
        alert("Lỗi đăng nhập: " + error.message);
      });
    });
  }

  // Đăng ký
  if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const email    = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        signupPage.style.display = "none";
        loginPage.style.display  = "none";
        mainApp.style.display    = "block";
        userCredential.user.updateProfile({
          displayName: email,
          photoURL: 'default-avatar.png'
        });
        loadProfile(userCredential.user);
      })
      .catch(error => {
        alert("Lỗi đăng ký: " + error.message);
      });
    });
  }

  // Chuyển đổi giữa trang đăng nhập và đăng ký
  const goSignup = document.getElementById("go-signup"),
        goLogin  = document.getElementById("go-login");
  if (goSignup) {
    goSignup.addEventListener("click", function(e) {
      e.preventDefault();
      loginPage.style.display  = "none";
      signupPage.style.display = "block";
    });
  }
  if (goLogin) {
    goLogin.addEventListener("click", function(e) {
      e.preventDefault();
      signupPage.style.display = "none";
      loginPage.style.display  = "block";
    });
  }

  // Đăng xuất
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function(e) {
      e.preventDefault();
      firebase.auth().signOut().then(() => {
        mainApp.style.display   = "none";
        loginPage.style.display = "block";
      });
    });
  }
});

function loadProfile(user) {
  const profileInfo = document.getElementById("profile-info");
  if (profileInfo) {
    profileInfo.innerHTML = `
      <img src="${user.photoURL || 'default-avatar.png'}" alt="Avatar" width="100" style="border-radius:50%;">
      <p>Email: ${user.email}</p>
      <p>Tên hiển thị: ${user.displayName}</p>
    `;
  }
}
