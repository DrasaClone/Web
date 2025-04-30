// voiceVideo.js
// Sử dụng PeerJS để thiết lập voice và video call giữa 2 người dùng
// Đây là một phiên bản cơ bản, có thể mở rộng tích hợp giao diện riêng
let peer;
let currentCall;

export function setupVoiceVideo() {
  // Khởi tạo PeerJS
  peer = new Peer(); // Sẽ tạo id tự động

  peer.on("open", id => {
    console.log("PeerJS ID:", id);
    // Bạn có thể lưu id của người dùng vào Firebase để hỗ trợ private call
  });

  // Lắng nghe cuộc gọi
  peer.on("call", call => {
    currentCall = call;
    // Tự động trả lời cuộc gọi với stream của user (bạn cần có navigator.mediaDevices.getUserMedia)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      call.answer(stream);
      call.on("stream", remoteStream => {
        // Hiển thị video remote
        const video = document.createElement("video");
        video.srcObject = remoteStream;
        video.autoplay = true;
        video.playsInline = true;
        document.body.appendChild(video);
      });
    });
  });
}

// Gọi đến người dùng với peerId của họ
export function callPeer(peerId) {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    const call = peer.call(peerId, stream);
    currentCall = call;
    call.on("stream", remoteStream => {
      const video = document.createElement("video");
      video.srcObject = remoteStream;
      video.autoplay = true;
      video.playsInline = true;
      document.body.appendChild(video);
    });
  }).catch(err => {
    alert("Lỗi khi lấy stream video: " + err.message);
  });
}
