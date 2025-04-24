// video-chat.js
import { pubnub } from './pubnub-chat.js';

let localStream;
let peerConnection;
const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export function initVideoChat() {
  const videoChatBtn = document.getElementById("video-chat-btn");
  const videoContainer = createVideoChatContainer();

  videoChatBtn.addEventListener("click", () => {
    if (videoContainer.style.display === "none" || videoContainer.style.display === "") {
      startVideoChat(videoContainer);
      videoChatBtn.textContent = "Tắt Video Chat";
    } else {
      stopVideoChat(videoContainer);
      videoChatBtn.textContent = "Bật Video Chat";
    }
  });

  pubnub.addListener({
    message: function(msgEvent) {
      const data = msgEvent.message;
      if (data.videoSignal) {
        handleVideoSignal(data.videoSignal);
      }
    }
  });
}

function createVideoChatContainer() {
  let container = document.querySelector(".video-chat-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "video-chat-container";
    container.innerHTML = `<video id="local-video" autoplay muted></video>
                           <video id="remote-video" autoplay></video>`;
    document.body.appendChild(container);
  }
  return container;
}

async function startVideoChat(container) {
  container.style.display = "block";
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById("local-video").srcObject = localStream;
    peerConnection = new RTCPeerConnection(configuration);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) sendVideoSignal({ type: "candidate", candidate: event.candidate });
    };
    peerConnection.ontrack = (event) => {
      document.getElementById("remote-video").srcObject = event.streams[0];
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    sendVideoSignal({ type: "offer", sdp: offer });
  } catch (err) {
    console.error("Lỗi khởi tạo video chat:", err);
  }
}

function stopVideoChat(container) {
  container.style.display = "none";
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
}

function sendVideoSignal(signalObj) {
  pubnub.publish({
    channel: pubnub.getUUID(),
    message: { videoSignal: signalObj }
  });
}

async function handleVideoSignal(signalData) {
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection(configuration);
    if (localStream) {
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    }
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) sendVideoSignal({ type: "candidate", candidate: event.candidate });
    };
    peerConnection.ontrack = (event) => {
      document.getElementById("remote-video").srcObject = event.streams[0];
    };
  }

  if (signalData.type === "offer") {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    sendVideoSignal({ type: "answer", sdp: answer });
  } else if (signalData.type === "answer") {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
  } else if (signalData.type === "candidate") {
    try {
      await peerConnection.addIceCandidate(signalData.candidate);
    } catch (err) {
      console.error("Lỗi thêm ICE candidate:", err);
    }
  }
}
