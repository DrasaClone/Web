/* reactions.js */
function addReactionUI(messageElem, messageObj) {
  let reactionContainer = document.createElement("div");
  reactionContainer.className = "reaction-container";
  const emojis = ["👍", "❤️", "😂", "😮", "😢", "👏"];
  emojis.forEach(emoji => {
    let btn = document.createElement("button");
    btn.textContent = emoji;
    btn.addEventListener("click", function() {
      sendReaction(messageObj, emoji);
    });
    reactionContainer.appendChild(btn);
  });
  messageElem.appendChild(reactionContainer);
}

function sendReaction(messageObj, emoji) {
  const user = firebase.auth().currentUser;
  if (!user || !messageObj) return;
  const messageId = messageObj.timestamp;
  const reactionMessage = {
    type: "reaction",
    originalMessageId: messageId,
    emoji: emoji,
    reactor: user.email,
    timestamp: Date.now()
  };
  if (window.currentChatChannel) {
    pubnub.publish({
      channel: window.currentChatChannel,
      message: reactionMessage
    }, function(status, response) {
      if (status.error) console.error("Lỗi gửi phản ứng", status);
    });
  }
}

function processReactionMessage(message) {
  let msgElem = document.querySelector(`[data-message-id='${message.originalMessageId}']`);
  if (msgElem) {
    let reactionDiv = msgElem.querySelector(".reaction-summary");
    if (!reactionDiv) {
      reactionDiv = document.createElement("div");
      reactionDiv.className = "reaction-summary";
      msgElem.appendChild(reactionDiv);
    }
    let emojiSpan = reactionDiv.querySelector(`[data-emoji='${message.emoji}']`);
    if (!emojiSpan) {
      emojiSpan = document.createElement("span");
      emojiSpan.setAttribute("data-emoji", message.emoji);
      emojiSpan.textContent = message.emoji + " 1";
      reactionDiv.appendChild(emojiSpan);
    } else {
      let parts = emojiSpan.textContent.split(" ");
      let count = parseInt(parts[1]) + 1;
      emojiSpan.textContent = message.emoji + " " + count;
    }
  }
}
