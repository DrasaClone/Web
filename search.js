/* search.js */
document.addEventListener("DOMContentLoaded", function() {
  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", function() {
      const keyword = document.getElementById("search-input").value.trim().toLowerCase();
      if (!keyword) return;
      const postsDiv = document.getElementById("posts");
      const posts = postsDiv.querySelectorAll(".post");
      posts.forEach(post => {
        if (post.textContent.toLowerCase().indexOf(keyword) >= 0) {
          post.style.display = "";
        } else {
          post.style.display = "none";
        }
      });
    });
  }
});
