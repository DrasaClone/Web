/* settings.js */
document.addEventListener("DOMContentLoaded", function() {
  const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");
  if (toggleDarkModeBtn) {
    toggleDarkModeBtn.addEventListener("click", function() {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "true" : "false");
    });
  }
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
  const updateProfileBtn = document.getElementById("update-profile-btn");
  if (updateProfileBtn) {
    updateProfileBtn.addEventListener("click", function() {
      const newDisplayName = document.getElementById("new-display-name").value.trim();
      const avatarFile     = document.getElementById("new-avatar").files[0];
      const user = firebase.auth().currentUser;
      if (!user) return;
      let updates = {};
      if (newDisplayName) {
        updates.displayName = newDisplayName;
      }
      if (avatarFile) {
        const storageRef = firebase.storage().ref();
        const avatarRef = storageRef.child('avatars/' + user.uid + '/' + avatarFile.name);
        avatarRef.put(avatarFile).then(snapshot => {
          snapshot.ref.getDownloadURL().then(url => {
            updates.photoURL = url;
            user.updateProfile(updates).then(() => {
              loadProfile(user);
              alert("Profile đã được cập nhật!");
            });
          });
        });
      } else {
        user.updateProfile(updates).then(() => {
          loadProfile(user);
          alert("Profile đã được cập nhật!");
        });
      }
    });
  }
});
