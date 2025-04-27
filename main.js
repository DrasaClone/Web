// main.js

import { auth } from "./config.js";
import { monitorAuthState, setupAuthListeners } from "./auth.js";
import { setupPostCreation, loadPosts, setupPostSearch } from "./posts.js";
import { setupCommentCreation } from "./comments.js";
import { setupChat } from "./chat.js";
import { setupNotifications } from "./notifications.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  setupAuthListeners();
  monitorAuthState();

  setupPostSearch();
  onAuthStateChanged(auth, (user) => {
    setupPostCreation(user);
    setupCommentCreation(user);
    loadPosts(user);
  });

  setupChat();
  setupNotifications();

  document.addEventListener("openComments", (e) => {
    import("./comments.js").then((module) => {
      module.openComments(e.detail);
    });
  });
});
