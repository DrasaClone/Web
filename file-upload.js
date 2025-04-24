// file-upload.js
import { sendMessage } from './pubnub-chat.js';

export function initFileUpload() {
  const fileBtn = document.getElementById("file-btn");
  const fileInput = document.getElementById("file-input");
  const msgInput = document.getElementById("msg-input");

  fileBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const cloudName = "YOUR_CLOUD_NAME";
    const uploadPreset = "ml_default";
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    fetch(url, { method: "POST", body: formData })
      .then(res => res.json())
      .then(data => {
        const downloadURL = data.secure_url;
        const messageObj = {
          user: "FileUploader",
          text: msgInput.value || "Đã gửi file đính kèm",
          fileUrl: downloadURL,
          fileType: file.type,
          timestamp: new Date().toISOString()
        };
        sendMessage(messageObj);
        fileInput.value = "";
      })
      .catch(error => console.error("Lỗi upload file:", error));
  });
}
