/* messageActions.js */
function editMessage(originalMessage, newText) {
  if (!originalMessage || !newText) return;
  const user = firebase.auth().currentUser;
  if (!user || user.email !== originalMessage.sender) {
    alert("Bạn không có quyền chỉnh sửa tin nhắn này!");
    return;
  }
  newText = secureInput(newText);
  const editMsg = {
    type: "edit",
    originalMessageId: originalMessage.timestamp,
    newText: newText,
    editor: user.email,
    timestamp: Date.now()
  };
  if (window.currentChatChannel) {
    pubnub.publish({
      channel: window.currentChatChannel,
      message: editMsg
    }, function(status, response) {
      if (status.error) console.error("Lỗi sửa tin nhắn", status);
    });
  }
}

function deleteMessage(originalMessage) {
  if (!originalMessage) return;
  const user = firebase.auth().currentUser;
  if (!user || user.email !== originalMessage.sender) {
    alert("Bạn không có quyền xoá tin nhắn này!");
    return;
  }
  const deleteMsg = {
    type: "delete",
    originalMessageId: originalMessage.timestamp,
    deleter: user.email,
    timestamp: Date.now()
  };
  if (window.currentChatChannel) {
    pubnub.publish({
      channel: window.currentChatChannel,
      message: deleteMsg
    }, function(status, response) {
      if (status.error) console.error("Lỗi xoá tin nhắn", status);
    });
  }
}

function replyToMessage(originalMessage, replyText) {
  if (!originalMessage || !replyText) return;
  replyText = secureInput(replyText);
  const user = firebase.auth().currentUser;
  const replyMsg = {
    type: "reply",
    originalMessageId: originalMessage.timestamp,
    replyText: replyText,
    replier: user ? user.email : "Anonymous",
    timestamp: Date.now()
  };
  if (window.currentChatChannel) {
    pubnub.publish({
      channel: window.currentChatChannel,
      message: replyMsg
    }, function(status, response) {
      if (status.error) console.error("Lỗi gửi reply", status);
    });
  }
}

function processMessageAction(message) {
  let msgElem = document.querySelector(`[data-message-id='${message.originalMessageId}']`);
  if (!msgElem) return;
  if (message.type === "edit") {
    let contentElem = msgElem.querySelector(".message-content");
    if (contentElem) {
      contentElem.textContent = message.newText;
    }
  } else if (message.type === "delete") {
    msgElem.style.opacity = "0.5";
    let notice = document.createElement("em");
    notice.textContent = "Tin nhắn đã bị xoá.";
    msgElem.appendChild(notice);
  } else if (message.type === "reply") {
    let replyDiv = msgElem.querySelector(".replies");
    if (!replyDiv) {
      replyDiv = document.createElement("div");
      replyDiv.className = "replies";
      msgElem.appendChild(replyDiv);
    }
    let replyElem = document.createElement("div");
    replyElem.className = "reply";
    replyElem.innerHTML = `<strong>${message.replier} trả lời:</strong> ${message.replyText}`;
    replyDiv.appendChild(replyElem);
  }
}

// Các hàm sau đây dùng để gọi prompt khi người dùng nhấn nút Sửa hay Xoá
function editMessagePrompt(messageId) {
  let msgElem = document.querySelector(`[data-message-id='${messageId}']`);
  if (!msgElem) return;
  let origText = msgElem.querySelector(".message-content").textContent;
  let newText = prompt("Nhập tin nhắn mới:", origText);
  if (newText && newText !== origText) {
    let tempMsg = { timestamp: messageId, sender: firebase.auth().currentUser.email };
    editMessage(tempMsg, newText);
  }
}

function deleteMessagePrompt(messageId) {
  if (confirm("Bạn có chắc chắn muốn xoá tin nhắn này không?")) {
    let tempMsg = { timestamp: messageId, sender: firebase.auth().currentUser.email };
    deleteMessage(tempMsg);
  }
}
