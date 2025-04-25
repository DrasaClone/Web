/* chat.js */
let currentChatChannel = null;
let currentChatFriend = null;

function getChatChannel(email1, email2) {
  const arr = [email1.replace(/[@.]/g, "_"), email2.replace(/[@.]/g, "_")];
  arr.sort();
  return "chat_" + arr.join("_");
}

function startConversation(friendEmail) {
  const user = firebase.auth().currentUser;
  if (!user) return;
  currentChatFriend = friendEmail;
  currentChatChannel = getChatChannel(user.email, friendEmail);
  document.getElementById("chat-with").textContent = "Chat với " + friendEmail;
  document.getElementById("chat-messages").innerHTML = "";
  pubnub.unsubscribeAll();
  pubnub.subscribe({ channels: [currentChatChannel] });
}

pubnub.addListener({
  message: function(event) {
    if (event.channel === currentChatChannel) {
      if (event.message.type === "reaction") {
        processReactionMessage(event.message);
      } else if (["edit", "delete", "reply"].includes(event.message.type)) {
        processMessageAction(event.message);
      } else if (event.message.type === "typing") {
        processTypingSignal(event.message);
      } else {
        displayChatMessage(event.message);
      }
    } else {
      updateFriendNotification(event.channel);
    }
  }
});

document.addEventListener("DOMContentLoaded", function() {
  const chatSendBtn = document.getElementById("chat-send-btn");
  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", sendChatMessage);
  }
  document.getElementById("chat-input").addEventListener("keyup", function(e) {
    if (e.key === "Enter") sendChatMessage();
  });
  document.getElementById("chat-attachment").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      sendChatMessage(evt.target.result, true);
    }
    reader.readAsDataURL(file);
  });
});

function sendChatMessage(attachmentData = null, isAttachment = false) {
  const input = document.getElementById("chat-input");
  let text = input.value.trim();
  if (!isAttachment && text) {
    text = secureInput(text);
  }
  if (!text && !attachmentData) return;
  if (!canSendMessage() && !isAttachment) {
    alert("Bạn đang gửi tin quá nhanh. Hãy chờ một chút!");
    return;
  }
  const user = firebase.auth().currentUser;
  let message = {
    sender: user ? user.email : "Anonymous",
    timestamp: Date.now(),
    read: false
  };
  if (isAttachment) {
    message.attachment = attachmentData;
    message.type = "image";
  } else {
    message.text = text;
    message.type = "text";
  }
  if (currentChatChannel) {
    pubnub.publish({
      channel: currentChatChannel,
      message: message
    }, function(status, response) {
      if (status.error) console.error("Lỗi gửi tin nhắn", status);
    });
  }
  input.value = "";
  document.getElementById("chat-attachment").value = "";
}

function displayChatMessage(message) {
  const chatMessagesDiv = document.getElementById("chat-messages");
  const msgElem = document.createElement("div");
  msgElem.className = "chat-message";
  msgElem.setAttribute("data-message-id", message.timestamp);
  let content = `<span class="message-sender"><strong>${message.sender}:</strong></span> `;
  if (message.type === "text") {
    content += `<span class="message-content">${message.text}</span>`;
  } else if (message.type === "image" && message.attachment) {
    content += `<br><img src="${message.attachment}" alt="Attachment" style="max-width: 200px;">`;
  }
  msgElem.innerHTML = content;
  // Thêm nút hành động: Sửa, Xoá, Reply (chỉ của tin nhắn của chính người dùng)
  if (firebase.auth().currentUser && firebase.auth().currentUser.email === message.sender) {
    let actionsDiv = document.createElement("div");
    actionsDiv.className = "message-actions";
    actionsDiv.innerHTML = `<button onclick='editMessagePrompt(${message.timestamp})'>Sửa</button> <button onclick='deleteMessagePrompt(${message.timestamp})'>Xoá</button>`;
    msgElem.appendChild(actionsDiv);
  }
  // Thêm nút trả lời cho mọi tin nhắn
  let replyBtn = document.createElement("button");
  replyBtn.textContent = "Reply";
  replyBtn.onclick = function() {
    let replyText = prompt("Nhập tin nhắn trả lời:");
    if (replyText) replyToMessage(message, replyText);
  };
  msgElem.appendChild(replyBtn);
  // Thêm nút reaction
  let reactBtn = document.createElement("button");
  reactBtn.textContent = "React";
  reactBtn.onclick = function() {
    addReactionUI(msgElem, message);
  };
  msgElem.appendChild(reactBtn);

  chatMessagesDiv.appendChild(msgElem);
  chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}
