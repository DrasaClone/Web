// profile.js

import { auth, database } from "./config.js";
import { ref, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const userDetails = document.getElementById("user-details");
const userPostList = document.getElementById("user-post-list");

function loadUserProfile(user) {
  userDetails.innerHTML = `<p>Email: ${user.email}</p>`;
  const postsRef = ref(database, "posts");
  onValue(postsRef, (snapshot) => {
    userPostList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const postKey = childSnapshot.key;
      const post = childSnapshot.val();
      if (post.authorId === user.uid) {
        const postDiv = document.createElement("div");
        postDiv.className = "post-item";
        postDiv.innerHTML = `
          <div class="post-title" data-id="${postKey}">${post.title}</div>
          <div class="post-meta">${new Date(post.timestamp).toLocaleString()}</div>
          <div class="post-content">${post.content}</div>
          <div class="post-controls">
            <button class="edit-btn" data-id="${postKey}">Edit</button>
            <button class="delete-btn" data-id="${postKey}">Delete</button>
          </div>
        `;
        userPostList.appendChild(postDiv);

        postDiv.querySelector(".edit-btn").addEventListener("click", () => {
          const newContent = prompt("Nhập nội dung mới", post.content);
          if (newContent !== null) {
            update(ref(database, "posts/" + postKey), { content: newContent });
          }
        });
        postDiv.querySelector(".delete-btn").addEventListener("click", () => {
          if (confirm("Bạn có chắc muốn xoá bài viết này?")) {
            remove(ref(database, "posts/" + postKey));
          }
        });
      }
    });
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUserProfile(user);
  } else {
    window.location.href = "index.html";
  }
});
