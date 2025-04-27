// main.js
import { auth } from "./config.js";
import { monitorAuthState, setupAuthListeners } from "./auth.js";
import { setupPostCreation, loadPosts, setupPostSearch } from "./posts.js";
import { setupCommentCreation } from "./comments.js";
import { setupChat } from "./chat.js";
import { setupNotifications } from "./notifications.js";
// Bạn có thể import thêm hàm từ friends.js nếu muốn thiết lập giao diện kết bạn
import { listenFriends, listenFriendRequests } from "./friends.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  setupAuthListeners();
  monitorAuthState();

  setupPostSearch();
  onAuthStateChanged(auth, (user) => {
    setupPostCreation(user);
    setupCommentCreation(user);
    loadPosts(user);
    // Bạn có thể gọi listenFriends để cập nhật danh sách bạn bè của người dùng
    // Ví dụ:
    // listenFriends(friendsList => { /* cập nhật giao diện danh sách bạn bè */ });
    // listenFriendRequests(requests => { /* cập nhật thông báo yêu cầu kết bạn */ });
  });

  setupChat();
  setupNotifications();

  // Lắng nghe sự kiện mở phần bình luận khi nhấp vào bài viết
  document.addEventListener("openComments", (e) => {
    import("./comments.js").then((module) => {
      module.openComments(e.detail);
    });
  });
});
