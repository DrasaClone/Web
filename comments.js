// comments.js

import { database } from "./config.js";
import { ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { pubnub } from "./config.js";

const commentsSection = document.getElementById("comments-section");
const commentsList = document.getElementById("comments-list");
const commentForm = document.getElementById("comment-form");
let currentPostId = null;

export function openComments(postId) {
  currentPostId = postId;
  commentsSection.classList.remove("hidden");
  loadComments(postId);
}

export function loadComments(postId) {
  const commentsRef = ref(database, "comments/" + postId);
  onValue(commentsRef, (snapshot) => {
    commentsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const comment = childSnapshot.val();
      const commentDiv = document.createElement("div");
      commentDiv.className = "comment-item";
      commentDiv.textContent = `${comment.author}: ${comment.text}`;
      commentsList.appendChild(commentDiv);
    });
  });
}

export function setupCommentCreation(currentUser) {
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Vui lòng đăng nhập để bình luận.");
      return;
    }
    const commentText = document.getElementById("comment-input").value;
    const commentData = {
      author: currentUser.email,
      text: commentText,
      timestamp: Date.now(),
    };

    const commentsRef = ref(database, `comments/${currentPostId}`);
    push(commentsRef, commentData)
      .then(() => {
        commentForm.reset();
        pubnub.publish({
          channel: "post-" + currentPostId,
          message: { type: "new-comment", data: commentData },
        });
      })
      .catch((error) => {
        alert("Lỗi khi gửi bình luận: " + error.message);
      });
  });
}
