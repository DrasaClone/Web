// notifications.js
import { pubnub } from "./config.js";
const notificationArea = document.getElementById("notification-area");

export function setupNotifications() {
  pubnub.subscribe({ channels: ["forum-posts", "forum-comments", "friendRequests", "forum-chat"] });
  pubnub.addListener({
    message: event => {
      let msgText = "";
      if (event.message.type === "new-post") {
        msgText = "Bài viết mới được đăng!";
      } else if (event.message.type === "new-comment") {
        msgText = "Có bình luận mới!";
      } else if (event.message.type === "friend-request") {
        msgText = "Có yêu cầu kết bạn mới!";
      }
      if (msgText) showNotification(msgText);
    }
  });
}

function showNotification(text) {
  notificationArea.textContent = text;
  setTimeout(() => notificationArea.textContent = "", 3000);
}
