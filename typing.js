/* typing.js */
document.addEventListener("DOMContentLoaded", function() {
  const chatInput = document.getElementById("chat-input");
  if (chatInput) {
    chatInput.addEventListener("input", function() {
      sendTypingSignal();
    });
  }
});

function sendTypingSignal() {
  const user = firebase.auth().currentUser;
  if (!user || !window.currentChatChannel) return;
  const typingMsg = {
    type: "typing",
    sender: user.email,
    timestamp: Date.now()
  };
  pubnub.publish({
    channel: window.currentChatChannel,
    message: typingMsg
  });
}

function processTypingSignal(message) {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) {
    indicator.textContent = `${message.sender} đang gõ...`;
    setTimeout(() => {
      indicator.textContent = "";
    }, 3000);
  }
}
