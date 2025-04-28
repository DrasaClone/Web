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
    // Cập nhật danh sách bạn bè
    listenFriends(friendsList => { console.log("Danh sách bạn bè:", friendsList); });
    listenFriendRequests(requests => { console.log("Yêu cầu kết bạn:", requests); });
    // Tải danh sách người dùng
    loadUsers(usersList => {
      console.log("Danh sách người dùng:", usersList);
      const usersContainer = document.getElementById("users-container");
      usersContainer.innerHTML = "";
      usersList.forEach(user => {
        const div = document.createElement("div");
        div.className = "user-card";
        // Hiển thị username và trạng thái (online/offline)
        div.innerHTML = `<strong>${user.username}</strong> - 
                         ${user.status ? `<span class="status online">Online</span>` : `<span class="status offline">Offline</span>`}`;
        // Khi nhấp vào thẻ người dùng, mở giao diện chat riêng (sử dụng module friends.js)
        div.addEventListener("click", () => {
          // Ví dụ: bạn có thể gửi tin nhắn riêng hoặc mở hộp thoại chat riêng với người đó
          const confirmChat = confirm(`Bạn có muốn trò chuyện riêng với ${user.username}?`);
          if (confirmChat) {
            // Gọi hàm từ friends.js để mở tin nhắn riêng tại trang profile (hoặc chuyển hướng)
            // Ví dụ: window.location.href = `privateChat.html?uid=${user.uid}`;
            alert(`Chức năng trò chuyện riêng với ${user.username} sẽ được triển khai.`);
          }
        });
        usersContainer.appendChild(div);
      });
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
