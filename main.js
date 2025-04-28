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
import { loadUsers } from "./users.js";
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
    // Lắng nghe và cập nhật danh sách bạn bè
    listenFriends(friendsList => {
      console.log("Danh sách bạn bè:", friendsList);
    });
    listenFriendRequests(requests => {
      console.log("Yêu cầu kết bạn:", requests);
    });
    // Tải danh sách người dùng cho chức năng tìm kiếm và kết bạn
    loadUsers(usersList => {
      console.log("Danh sách người dùng:", usersList);
      // Bạn có thể cập nhật giao diện danh sách người dùng ở trang profile
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
