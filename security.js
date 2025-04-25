/* security.js */
function sanitizeInput(input) {
  let div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

const bannedWords = ["badword1", "badword2", "badword3"];
function filterProfanity(input) {
  let filtered = input;
  bannedWords.forEach(word => {
    let regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "****");
  });
  return filtered;
}

function secureInput(input) {
  let sanitized = sanitizeInput(input);
  let filtered = filterProfanity(sanitized);
  return filtered;
}

let lastSendTime = 0;
function canSendMessage() {
  const now = Date.now();
  if (now - lastSendTime > 1000) {
    lastSendTime = now;
    return true;
  }
  return false;
}
