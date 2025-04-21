// app.js
(async () => {
  await sodium.ready;  // Libsodium

  // Tham chiếu Firebase
  const db = firebase.database();
  const storage = firebase.storage();
  const auth = firebase.auth();
  let currentUser;
  auth.onAuthStateChanged(u => currentUser = u);

  // ---- Room & Group Chat ----
  const roomsRef = db.ref('rooms');
  const roomListEl = document.getElementById('room-list');
  const roomNameEl = document.getElementById('room-name');
  let currentRoomId = null;

  // Tạo room mới
  window.createRoom = () => {
    const name = prompt('Tên nhóm mới:');
    if (!name) return;
    const roomRef = roomsRef.push({ name, createdAt: firebase.database.ServerValue.TIMESTAMP });
    joinRoom(roomRef.key);
  };

  // Hiển thị danh sách room
  roomsRef.on('child_added', snap => {
    const li = document.createElement('li');
    li.textContent = snap.val().name;
    li.onclick = () => joinRoom(snap.key);
    roomListEl.appendChild(li);
  });

  // Tham gia room & lắng nghe messages
  async function joinRoom(roomId) {
    currentRoomId = roomId;
    roomNameEl.textContent = 'Phòng: ' + (await roomsRef.child(roomId).child('name').get()).val();
    Array.from(roomListEl.children).forEach(li => li.classList.toggle('active', li.textContent === roomNameEl.textContent.split(': ')[1]));

    const messagesRef = roomsRef.child(roomId).child('messages');
    messagesRef.off(); document.getElementById('messages').innerHTML = '';
    messagesRef.on('child_added', snap => displayMessage(snap.key, snap.val()));

    // Phát tín hiệu WebRTC: listen offer/answer/candidates under rooms/<roomId>/signals
    const signalsRef = roomsRef.child(roomId).child('signals');
    signalsRef.on('child_added', snap => handleSignal(snap.key, snap.val()));
  }

  // ---- Display & Send ----
  const messagesDiv = document.getElementById('messages');
  document.getElementById('send-button').onclick = sendMessage;

  async function sendMessage() {
    if (!currentRoomId) return alert('Chưa chọn nhóm');
    const text = document.getElementById('message-input').value.trim();
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    const msgData = {
      sender: currentUser.uid,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    if (text) {
      // E2E encrypt text
      const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
      const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
      const cipher = sodium.crypto_secretbox_easy(sodium.from_string(text), nonce, key);
      msgData.text = sodium.to_base64(cipher);
      msgData.nonce = sodium.to_base64(nonce);
      msgData.key = sodium.to_base64(key);
    }
    if (file) {
      const ref = storage.ref(`files/${Date.now()}_${file.name}`);
      await ref.put(file);
      msgData.file = { url: await ref.getDownloadURL(), name: file.name };
    }
    await roomsRef.child(currentRoomId).child('messages').push(msgData);
    document.getElementById('message-input').value = '';
    document.getElementById('file-input').value = '';
  }

  function displayMessage(id, msg) {
    const div = document.createElement('div');
    div.classList.add('msg', msg.sender === currentUser.uid ? 'sent' : 'received');
    const time = new Date(msg.timestamp).toLocaleTimeString();
    div.innerHTML = `<span class='time'>${time}</span>`;
    if (msg.text) {
      // Decrypt
      const cipher = sodium.from_base64(msg.text);
      const nonce = sodium.from_base64(msg.nonce);
      const key = sodium.from_base64(msg.key);
      const plain = sodium.to_string(sodium.crypto_secretbox_open_easy(cipher, nonce, key));
      div.innerHTML += `<span>${plain}</span>`;
    }
    if (msg.file) {
      div.innerHTML += `<br><a href='${msg.file.url}' target='_blank'>📎 ${msg.file.name}</a>`;
    }
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // ---- WebRTC Signaling ----
  let localStream, peer;
  const iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  async function startCall(isVideo) {
    if (!currentRoomId) return;
    localStream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
    peer = new RTCPeerConnection(iceConfig);
    localStream.getTracks().forEach(t => peer.addTrack(t, localStream));

    // Push ICE candidates
    peer.onicecandidate = e => e.candidate && roomsRef.child(currentRoomId).child('signals').push({
      type: 'candidate', candidate: e.candidate
    });

    // Khi nhận media track, bạn có thể gắn vào video element
    peer.ontrack = e => {
      const v = document.getElementById('remote-video') || document.createElement('video');
      v.id = 'remote-video'; v.autoplay = true; v.srcObject = e.streams[0];
      document.body.appendChild(v);
    };

    // Tạo offer
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    roomsRef.child(currentRoomId).child('signals').push({ type: 'offer', sdp: offer.sdp });
  }

  window.voiceCallButton.onclick = () => startCall(false);
  window.videoCallButton.onclick = () => startCall(true);

  async function handleSignal(id, sig) {
    if (!peer) return;
    if (sig.type === 'offer') {
      await peer.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: sig.sdp }));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      roomsRef.child(currentRoomId).child('signals').push({ type: 'answer', sdp: answer.sdp });
    }
    if (sig.type === 'answer') {
      await peer.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: sig.sdp }));
    }
    if (sig.type === 'candidate') {
      await peer.addIceCandidate(new RTCIceCandidate(sig.candidate));
    }
  }
})();
