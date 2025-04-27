// cloudinary.js

/**
 * Upload file tới Cloudinary sử dụng unsigned upload preset.
 * @param {File} file - File cần upload.
 * @param {Function} onProgress - Callback theo dõi tiến trình (tùy chọn).
 * @returns {Promise<Object>} Đối tượng JSON trả về từ Cloudinary.
 */
export async function uploadFile(file, onProgress) {
  const CLOUD_NAME = "dgbux4wzo";       // Thay bằng Cloud Name của bạn
  const UPLOAD_PRESET = "okeqfdx4";   // Thay bằng Upload Preset của bạn
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error("Cloudinary upload failed"));
        }
      }
    };

    xhr.send(formData);
  });
}
