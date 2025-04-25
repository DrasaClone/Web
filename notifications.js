/* notifications.js */
document.addEventListener("DOMContentLoaded", function() {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});

function updateFriendNotification(channel) {
  const friendListItems = document.querySelectorAll("#friend-list-ul li");
  friendListItems.forEach(item => {
    const friendEmail = item.getAttribute("data-email");
    if (channel.indexOf(friendEmail.replace(/[@.]/g, "_")) >= 0) {
      let badge = item.querySelector(".friend-notification");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "friend-notification";
        badge.textContent = "1";
        item.appendChild(badge);
      } else {
        let count = parseInt(badge.textContent);
        badge.textContent = count + 1;
      }
      if (Notification.permission === "granted") {
        new Notification("Tin nhắn mới từ " + friendEmail, {
          body: "Bạn có tin nhắn mới.",
          icon: "notification-icon.png"
        });
      }
    }
  });
}
