// profile.js
export function initProfile() {
  const profileBtn = document.getElementById("profile-btn");
  profileBtn.addEventListener("click", () => {
    const newName = prompt("Nhập tên hiển thị của bạn:");
    if (newName) {
      localStorage.setItem("displayName", newName);
      updateUserInfo();
    }
    if (confirm("Bạn có muốn cập nhật ảnh đại diện không?")) {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) uploadAvatar(file);
      });
      fileInput.click();
    }
  });
}

function updateUserInfo() {
  const userInfoDiv = document.getElementById("user-info");
  const displayName = localStorage.getItem("displayName") || "Guest";
  const avatarUrl = localStorage.getItem("avatarUrl");
  if (avatarUrl) {
    userInfoDiv.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="avatar"> Chào ${displayName}`;
  } else {
    userInfoDiv.textContent = `Chào ${displayName}`;
  }
}

function uploadAvatar(file) {
  const cloudName = "YOUR_CLOUD_NAME";
  const uploadPreset = "YOUR_UPLOAD_PRESET";
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  fetch(url, { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => {
      const avatarUrl = data.secure_url;
      localStorage.setItem("avatarUrl", avatarUrl);
      updateUserInfo();
    })
    .catch(err => console.error("Lỗi upload avatar:", err));
}
