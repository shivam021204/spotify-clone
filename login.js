// login.js — Theme toggle for login page

const toggleBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    if (toggleBtn) toggleBtn.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    if (toggleBtn) toggleBtn.textContent = "🌙";
  }
}

// Load saved theme on page load
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

// Toggle on click
toggleBtn?.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
});