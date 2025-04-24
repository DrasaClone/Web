// reactions.js
export function initReactions(messageDiv, messageId) {
  const reactionsDiv = messageDiv.querySelector(`.reactions[data-reaction-for="${messageId}"]`);
  const reactionBtn = document.createElement("button");
  reactionBtn.textContent = "😊";
  reactionBtn.style.border = "none";
  reactionBtn.style.background = "transparent";
  reactionBtn.style.cursor = "pointer";
  reactionBtn.addEventListener("click", () => {
    showReactionPicker(reactionsDiv, messageId);
  });
  reactionsDiv.appendChild(reactionBtn);
}

function showReactionPicker(reactionsDiv, messageId) {
  const picker = document.createElement("div");
  const emojis = ["😀", "😂", "😅", "😎", "😍", "👍", "🙏", "🔥"];
  emojis.forEach(emoji => {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.style.margin = "0 4px";
    span.style.cursor = "pointer";
    span.addEventListener("click", () => {
      addReaction(reactionsDiv, emoji);
      picker.remove();
      // Ở đây bạn có thể gửi cập nhật reaction qua PubNub nếu cần
    });
    picker.appendChild(span);
  });
  picker.style.background = "#fff";
  picker.style.border = "1px solid #ddd";
  picker.style.position = "absolute";
  picker.style.top = "-30px";
  reactionsDiv.appendChild(picker);
}

function addReaction(reactionsDiv, emoji) {
  let reactionSpan = reactionsDiv.querySelector(`span[data-emoji="${emoji}"]`);
  if (reactionSpan) {
    let count = parseInt(reactionSpan.getAttribute("data-count"));
    count++;
    reactionSpan.setAttribute("data-count", count);
    reactionSpan.textContent = `${emoji} ${count}`;
  } else {
    reactionSpan = document.createElement("span");
    reactionSpan.setAttribute("data-emoji", emoji);
    reactionSpan.setAttribute("data-count", "1");
    reactionSpan.textContent = `${emoji} 1`;
    reactionSpan.style.margin = "0 4px";
    reactionsDiv.appendChild(reactionSpan);
  }
}
