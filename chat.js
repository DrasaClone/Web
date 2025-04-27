// chat.js

import { pubnub } from "./config.js";

const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

export function setupChat() {
  pubnub.subscribe({ channels: ["forum-chat"] });

  pubnub.addListener({
    message: function (event) {
      if (event.channel === "forum-chat") {
        displayChatMessage(event.message);
      }
    },
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = chatInput.value;
    if (message.trim() === "") return;
    const messageData = {
      text: message,
      timestamp: Date.now(),
    };
    pubnub.publish({
      channel: "forum-chat",
      message: messageData,
    });
    chatInput.value = "";
  });
}

function displayChatMessage(messageData) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message";
  messageDiv.textContent =
    `${new Date(messageData.timestamp).toLocaleTimeString()}: ` + messageData.text;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
