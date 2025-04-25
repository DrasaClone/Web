/* posts.js */
document.addEventListener("DOMContentLoaded", function() {
  const postBtn = document.getElementById("post-btn");
  if (postBtn) {
    postBtn.addEventListener("click", function() {
      const postContentElem = document.getElementById("post-content");
      let content = postContentElem.value.trim();
      if (content === "") return;
      content = secureInput(content);
      const user = firebase.auth().currentUser;
      const postsRef = firebase.database().ref('posts/');
      const newPost = {
        author: user ? user.email : "Anonymous",
        content: content,
        timestamp: Date.now()
      };
      postsRef.push(newPost, error => {
        if (error) {
          console.error("Lỗi khi đăng bài", error);
        } else {
          postContentElem.value = "";
        }
      });
    });
  }
  const postsRef = firebase.database().ref('posts/');
  postsRef.on('value', snapshot => {
    const postsDiv = document.getElementById("posts");
    postsDiv.innerHTML = "";
    const posts = snapshot.val();
    if (posts) {
      const postsArray = Object.values(posts).sort((a, b) => b.timestamp - a.timestamp);
      postsArray.forEach(post => {
        const postElem = document.createElement("div");
        postElem.className = "post";
        postElem.innerHTML = `<h3>${post.author}</h3><p>${post.content}</p>`;
        postsDiv.appendChild(postElem);
      });
    }
  });
});
