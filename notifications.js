// notifications.js

import { pubnub } from "./config.js";

const notificationArea = document.getElementById("notification-area");

export function setupNotifications() {
  pubnub.subscribe({ channels: ["forum-posts", "forum-comments"] });

  pubnub.addListener({
    message: function (event) {
      let msgText = "";
      if (event.message.type === "new-post") {
        msgText = "Bài viết mới được đăng!";
      } else if (event.message.type === "new-comment") {
        msgText = "Có bình luận mới!";
      }
      if (msgText) showNotification(msgText);
    },
  });
}

function showNotification(text) {
  notificationArea.textContent = text;
  setTimeout(() => (notificationArea.textContent = ""), 3000);
}
