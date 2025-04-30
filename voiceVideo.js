// voiceVideo.js
// Đảm bảo bạn đã thêm <script src="https://cdn.peerjs.com/1.3.1/peerjs.min.js"></script> vào index.html
let peer;
let currentCall;

export function setupVoiceVideo() {
  peer = new Peer(); // Khởi tạo PeerJS, tự động tạo ID
  peer.on("open", id => {
    console.log("PeerJS ID:", id);
    // Lưu ID vào Firebase nếu cần cho chức năng gọi riêng
  });
  peer.on("call", call => {
    currentCall = call;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      call.answer(stream);
      call.on("stream", remoteStream => {
        const video = document.createElement("video");
        video.srcObject = remoteStream;
        video.autoplay = true;
        video.playsInline = true;
        document.body.appendChild(video);
      });
    });
  });
}

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
    alert("Lỗi lấy stream video: " + err.message);
  });
}
