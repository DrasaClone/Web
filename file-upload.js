// assets/js/file-upload.js

const fileInput = document.getElementById("file-input");
const attachBtn = document.getElementById("attach-btn");

// Khi nhấn nút đính kèm, mở hộp chọn file
attachBtn.addEventListener("click", () => {
  fileInput.click();
});

// Xử lý sự kiện chọn file
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Tạo reference cho file trên Firebase Storage
  const storageRef = storage.ref(`chat_files/${Date.now()}_${file.name}`);
  const uploadTask = storageRef.put(file);
  
  // Cập nhật tiến trình upload nếu cần
  uploadTask.on('state_changed', 
    (snapshot) => {
      // Bạn có thể hiển thị tiến trình upload tại đây
    },
    (error) => {
      console.error("Lỗi upload file:", error);
    },
    () => {
      // Khi upload thành công, lấy URL của file
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log('File available at', downloadURL);
        // Gửi tin nhắn có kèm đường link file
        pubnub.publish({
          channel: chatChannel,
          message: {
            username: pubnub.getUUID(),
            text: `🖼 File: ${downloadURL}`,
            timestamp: new Date().toISOString()
          }
        });
      });
    }
  );
});
