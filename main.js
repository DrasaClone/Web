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
import { setupPresence } from "./presence.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Nếu bạn thêm voiceVideo.js (để gọi voice/video), cũng import module đó
import { setupVoiceVideo } from "./voiceVideo.js";  // Module này sẽ sử dụng PeerJS

document.addEventListener("DOMContentLoaded", () => {
  setupAuthListeners();
  monitorAuthState();
  setupThemeToggle();
  setupPostSearch();
  setupPresence(); // Khởi chạy module presence để cập nhật trạng thái online/offline

  onAuthStateChanged(auth, user => {
    setupPostCreation(user);
    setupCommentCreation(user);
    loadPosts(user);
    listenFriends(friendsList => {
      console.log("Danh sách bạn bè:", friendsList);
      // Cập nhật giao diện trên trang index và profile nếu cần
    });
    listenFriendRequests(requests => {
      console.log("Yêu cầu kết bạn:", requests);
    });
    loadUsers(usersList => {
      console.log("Danh sách người dùng:", usersList);
      // Cập nhật giao diện hiển thị danh sách người dùng với trạng thái (vào #users-container)
      const usersContainer = document.getElementById("users-container");
      if (usersContainer) {
        usersContainer.innerHTML = "";
        usersList.forEach(user => {
          const div = document.createElement("div");
          div.className = "user-card";
          div.innerHTML = `<strong>${user.username}</strong> - 
                           ${user.status === "online" ? `<span class="status online">Online</span>` : `<span class="status offline">Offline</span>`}`;
          div.addEventListener("click", () => {
            const confirmChat = confirm(`Bạn có muốn trò chuyện riêng với ${user.username}?`);
            if (confirmChat) {
              // Ví dụ, chuyển hướng hoặc mở modal chat riêng (chức năng private chat trong friends.js)
              alert(`Chức năng gửi tin nhắn riêng tới ${user.username} được triển khai trong module Friends.`);
            }
          });
          usersContainer.appendChild(div);
        });
      }
    });
  });

  setupChat();
  setupNotifications();
  setupAIChatBot();
  
  // Nếu bạn tích hợp voice/video call, khởi chạy module voiceVideo
  // setupVoiceVideo();

  document.addEventListener("openComments", e => {
    import("./comments.js").then(module => {
      module.openComments(e.detail);
    });
  });
});
