// main.js
import { auth } from "./config.js";
import { monitorAuthState, setupAuthListeners } from "./auth.js";
import { setupPostCreation, loadPosts, setupPostSearch } from "./posts.js";
import { setupCommentCreation } from "./comments.js";
import { setupChat } from "./chat.js";
import { setupNotifications } from "./notifications.js";
import { listenFriends, listenFriendRequests } from "./friends.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  setupAuthListeners();
  monitorAuthState();

  setupPostSearch();
  onAuthStateChanged(auth, user => {
    setupPostCreation(user);
    setupCommentCreation(user);
    loadPosts(user);
    // Ví dụ: cập nhật danh sách bạn bè lên giao diện
    listenFriends(friendsList => {
      // Cập nhật giao diện cho danh sách bạn bè trên profile hoặc trang riêng nếu có
      console.log("Danh sách bạn bè:", friendsList);
    });
    // Ví dụ: lắng nghe yêu cầu kết bạn
    listenFriendRequests(requests => {
      console.log("Yêu cầu kết bạn:", requests);
    });
  });

  setupChat();
  setupNotifications();

  document.addEventListener("openComments", e => {
    import("./comments.js").then(module => {
      module.openComments(e.detail);
    });
  });
});
