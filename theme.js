// theme.js
export function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle-btn");
  btn.addEventListener("click", () => {
    document.body.classList.toggle("darkmode");
  });
}
