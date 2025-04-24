// typing.js
import { pubnub } from './pubnub-chat.js';

let typingTimeout;

export function initTypingIndicator() {
  const msgInput = document.getElementById("msg-input");
  const typingIndicator = document.getElementById("typing-indicator");

  msgInput.addEventListener("input", () => {
    pubnub.publish({
      channel: pubnub.getUUID(),
      message: { typing: true, user: localStorage.getItem("displayName") || "User" }
    });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      pubnub.publish({
        channel: pubnub.getUUID(),
        message: { typing: false, user: localStorage.getItem("displayName") || "User" }
      });
    }, 1000);
  });

  pubnub.addListener({
    message: function(msgEvent) {
      const data = msgEvent.message;
      if (data.typing !== undefined) {
        typingIndicator.style.display = data.typing ? "block" : "none";
        typingIndicator.textContent = data.typing ? `${data.user} đang gõ…` : "";
      }
    }
  });
}
