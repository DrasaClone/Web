// search.js
export function initSearch() {
  const searchInput = document.getElementById("search-input");
  const messagesDiv = document.getElementById("messages");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const messages = messagesDiv.querySelectorAll(".message");
    messages.forEach(message => {
      const textEl = message.querySelector(".text");
      if (textEl && textEl.textContent.toLowerCase().includes(query)) {
        message.style.display = "block";
      } else {
        message.style.display = "none";
      }
    });
  });
}
