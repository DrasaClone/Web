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
  // Thiết lập xác thực
  setupAuthListeners();
  monitorAuthState();

  // Thiết lập tìm kiếm và load bài viết
  setupPostSearch();
  onAuthStateChanged(auth, user => {
    setupPostCreation(user);
    setupCommentCreation(user);
    loadPosts(user);
    // Lắng nghe và cập nhật danh sách bạn bè
    listenFriends(friendsList => {
      console.log("Danh sách bạn bè:", friendsList);
      // Cập nhật giao diện nếu cần
    });
    // Lắng nghe yêu cầu kết bạn
    listenFriendRequests(requests => {
      console.log("Yêu cầu kết bạn:", requests);
      // Cập nhật giao diện hoặc thông báo nếu cần
    });
  });

  // Thiết lập chat nhóm và thông báo
  setupChat();
  setupNotifications();

  // Lắng nghe sự kiện mở phần bình luận khi nhấp vào tiêu đề bài viết
  document.addEventListener("openComments", e => {
    import("./comments.js").then(module => {
      module.openComments(e.detail);
    });
  });
});
