// main.js
import { auth } from "./config.js";
import { monitorAuthState, setupAuthListeners } from "./auth.js";
import { setupPostCreation, loadPosts, setupPostSearch } from "./posts.js";
import { setupCommentCreation } from "./comments.js";
import { setupChat } from "./chat.js";
import { setupNotifications } from "./notifications.js";
import { listenFriends, listenFriendRequests } from "./friends.js";
import { setupAIChatBot } from "./aiChatBot.js";
import { setupThemeToggle } from "./theme.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  setupAuthListeners();
  monitorAuthState();
  setupThemeToggle();
  setupPostSearch();

  onAuthStateChanged(auth, user => {
    setupPostCreation(user);
    setupCommentCreation(user);
    loadPosts(user);
    listenFriends(friendsList => {
      console.log("Danh sách bạn bè:", friendsList);
      // Cập nhật giao diện danh sách bạn bè nếu cần
    });
    listenFriendRequests(requests => {
      console.log("Yêu cầu kết bạn:", requests);
      // Cập nhật giao diện yêu cầu kết bạn nếu cần
    });
  });

  setupChat();
  setupNotifications();
  setupAIChatBot();

  document.addEventListener("openComments", e => {
    import("./comments.js").then(module => {
      module.openComments(e.detail);
    });
  });
});
