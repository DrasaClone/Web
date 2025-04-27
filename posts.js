// posts.js
import { database } from "./config.js";
import { ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { pubnub } from "./config.js";
import { uploadFile } from "./cloudinary.js";
import { sanitizeInput } from "./security.js";

const postForm = document.getElementById("post-form");
const postList = document.getElementById("post-list");
const searchInput = document.getElementById("search-input");

const fileInput = document.getElementById("post-file");
const filePreview = document.getElementById("file-preview");
const previewImg = document.getElementById("preview-img");
const previewVideo = document.getElementById("preview-video");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  const fileType = file.type;
  if (fileType.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.classList.remove("hidden");
      previewVideo.classList.add("hidden");
    };
    reader.readAsDataURL(file);
  } else if (fileType.startsWith("video/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewVideo.src = e.target.result;
      previewVideo.classList.remove("hidden");
      previewImg.classList.add("hidden");
    };
    reader.readAsDataURL(file);
  }
  filePreview.classList.remove("hidden");
});

export function setupPostCreation(currentUser) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Vui lòng đăng nhập để đăng bài");
      return;
    }
    // Sanitize đầu vào để chống XSS
    const title = sanitizeInput(document.getElementById("post-title").value);
    const content = sanitizeInput(document.getElementById("post-content").value);
    const category = document.getElementById("post-category").value || "general";
    
    let imageUrl = "";
    if (fileInput.files && fileInput.files.length > 0) {
      try {
        const progressBar = document.getElementById("progress-bar");
        const progressText = document.getElementById("progress-text");
        const uploadProgress = document.getElementById("upload-progress");
        uploadProgress.classList.remove("hidden");

        const result = await uploadFile(fileInput.files[0], (percent) => {
          progressBar.value = percent;
          progressText.textContent = percent + "%";
        });
        imageUrl = result.secure_url;
        uploadProgress.classList.add("hidden");
      } catch (error) {
        alert("Lỗi upload file: " + error.message);
      }
    }

    const postData = {
      title,
      content,
      category,
      author: currentUser.email,
      authorId: currentUser.uid,
      votes: 0,
      timestamp: Date.now(),
      imageUrl
    };

    const postsRef = ref(database, "posts");
    push(postsRef, postData)
      .then(() => {
        postForm.reset();
        filePreview.classList.add("hidden");
        document.getElementById("upload-progress").classList.add("hidden");
        pubnub.publish({
          channel: "forum-posts",
          message: { type: "new-post", data: postData }
        });
      })
      .catch(error => alert("Lỗi đăng bài: " + error.message));
  });
}

export function loadPosts(currentUser) {
  const postsRef = ref(database, "posts");
  onValue(postsRef, snapshot => {
    postList.innerHTML = "";
    snapshot.forEach(childSnapshot => {
      const postKey = childSnapshot.key;
      const post = childSnapshot.val();
      const postDiv = document.createElement("div");
      postDiv.className = "post-item";
      
      const imageSection = post.imageUrl
        ? `<div class="post-image"><img src="${post.imageUrl}" alt="Ảnh đính kèm" /></div>`
        : "";

      postDiv.innerHTML = `
        <div class="post-header">
          <div class="post-title" data-id="${postKey}">${post.title}</div>
          <div class="post-votes">
            <span class="vote-count">${post.votes}</span>
            <button class="like-btn" data-id="${postKey}">Like</button>
          </div>
        </div>
        <div class="post-meta">
          Chủ đề: ${post.category} - Bởi ${post.author} - ${new Date(post.timestamp).toLocaleString()}
        </div>
        ${imageSection}
        <div class="post-content">${post.content}</div>
        <div class="post-controls"></div>
      `;
      postList.appendChild(postDiv);

      postDiv.querySelector(".post-title").addEventListener("click", () => {
        const event = new CustomEvent("openComments", { detail: postKey });
        document.dispatchEvent(event);
      });

      postDiv.querySelector(".like-btn").addEventListener("click", () => {
        const voteRef = ref(database, "posts/" + postKey);
        update(voteRef, { votes: post.votes + 1 })
          .catch(err => alert("Lỗi cập nhật lượt thích: " + err.message));
      });

      if (currentUser && (currentUser.uid === post.authorId || currentUser.isAdmin)) {
        const controls = postDiv.querySelector(".post-controls");
        controls.innerHTML = `
          <button class="edit-btn" data-id="${postKey}">Edit</button>
          <button class="delete-btn" data-id="${postKey}">Delete</button>
        `;
        controls.querySelector(".edit-btn").addEventListener("click", () => {
          const newContent = prompt("Nhập nội dung mới", post.content);
          if (newContent !== null) {
            update(ref(database, "posts/" + postKey), { content: sanitizeInput(newContent) });
          }
        });
        controls.querySelector(".delete-btn").addEventListener("click", () => {
          if (confirm("Bạn có chắc chắn muốn xoá bài viết này?")) {
            remove(ref(database, "posts/" + postKey));
          }
        });
      }
    });
  });
}

export function setupPostSearch() {
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const posts = document.querySelectorAll(".post-item");
    posts.forEach(post => {
      const title = post.querySelector(".post-title").textContent.toLowerCase();
      post.style.display = title.indexOf(keyword) !== -1 ? "" : "none";
    });
  });
}
