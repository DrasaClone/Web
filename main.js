/* main.js */
document.addEventListener("DOMContentLoaded", function() {
  firebase.auth().onAuthStateChanged(user => {
    const loginPage  = document.getElementById("login-page");
    const signupPage = document.getElementById("signup-page");
    const mainApp    = document.getElementById("main-app");
    if (user) {
      loginPage.style.display  = "none";
      signupPage.style.display = "none";
      mainApp.style.display    = "block";
      loadProfile(user);
      if (typeof loadFriendsList === "function") {
        loadFriendsList();
      }
    } else {
      mainApp.style.display    = "none";
      loginPage.style.display  = "block";
    }
  });
});
