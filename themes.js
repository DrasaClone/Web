// themes.js
export function initThemeToggle() {
  const themeBtn = document.getElementById("theme-toggle-btn");
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);

  themeBtn.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
    setTheme(newTheme);
  });
}

function setTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}
