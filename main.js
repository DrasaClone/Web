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
import { setupVoiceVideo } from "./voiceVideo.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  setupAuthListeners();
  monitorAuthState();
  setupThemeToggle();
  setupPostSearch();
  
  // Khởi chạy presence để báo cáo online/offline
  setupPresence();
  
  // Khởi chạy Voice/Video Call module
  setupVoiceVideo();

  onAuthStateChanged(auth, user => {
    setupPostCreation(user);
    setupCommentCreation(user);
    loadPosts(user);
    listenFriends(friendsList => {
      console.log("Danh sách bạn bè:", friendsList);
      // Cập nhật giao diện danh sách bạn bè tại trang index hoặc profile
    });
    listenFriendRequests(requests => {
      console.log("Yêu cầu kết bạn:", requests);
    });
    loadUsers(usersList => {
      console.log("Danh sách người dùng:", usersList);
      const usersContainer = document.getElementById("users-container");
      if (usersContainer) {
        usersContainer.innerHTML = "";
        usersList.forEach(user => {
          const div = document.createElement("div");
          div.className = "user-card";
          div.innerHTML = `<strong>${user.username}</strong> - 
                           ${user.status === "online" 
                           ? `<span class="status online">Online</span>` 
                           : `<span class="status offline">Offline</span>`}`;
          div.addEventListener("click", () => {
            const confirmChat = confirm(`Bạn có muốn trò chuyện riêng với ${user.username}?`);
            if (confirmChat) {
              // Chuyển hướng hoặc mở modal private chat, có thể sử dụng module friends.js
              alert(`Chức năng private chat với ${user.username} được xây dựng trong module Friends.`);
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

  document.addEventListener("openComments", e => {
    import("./comments.js").then(module => {
      module.openComments(e.detail);
    });
  });
});
