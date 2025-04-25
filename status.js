/* status.js */
document.addEventListener("DOMContentLoaded", function() {
  const user = firebase.auth().currentUser;
  if (user) {
    const statusRef = firebase.database().ref('status/' + user.uid);
    statusRef.set({ state: "online", lastChanged: Date.now() });
    window.addEventListener("beforeunload", function() {
      statusRef.set({ state: "offline", lastChanged: Date.now() });
    });
  }
});
