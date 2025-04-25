/* friends.js */
document.addEventListener("DOMContentLoaded", function() {
  const addFriendBtn = document.getElementById("add-friend-btn");
  if (addFriendBtn) {
    addFriendBtn.addEventListener("click", function() {
      const friendEmail = document.getElementById("add-friend-email").value.trim();
      if (!friendEmail) return;
      const user = firebase.auth().currentUser;
      if (!user) return;
      const friendsRef = firebase.database().ref('friends/' + user.uid);
      friendsRef.push({ email: friendEmail })
      .then(() => {
        document.getElementById("add-friend-email").value = "";
        loadFriendsList();
      })
      .catch(err => {
        console.error("Lỗi thêm bạn:", err);
      });
    });
  }
  loadFriendsList();
});

function loadFriendsList() {
  const user = firebase.auth().currentUser;
  if (!user) return;
  const friendsRef = firebase.database().ref('friends/' + user.uid);
  friendsRef.on('value', snapshot => {
    const friendListUL = document.getElementById("friend-list-ul");
    friendListUL.innerHTML = "";
    const friends = snapshot.val();
    if (friends) {
      Object.keys(friends).forEach(key => {
        const friend = friends[key];
        const li = document.createElement("li");
        li.textContent = friend.email;
        li.setAttribute("data-email", friend.email);
        li.addEventListener("click", function() {
          startConversation(friend.email);
        });
        friendListUL.appendChild(li);
      });
    }
  });
}
