// login.js — Theme toggle for login page

const toggleBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
    if (toggleBtn) toggleBtn.textContent = "🌙";
  } else {
    document.body.classList.remove("light");
    if (toggleBtn) toggleBtn.textContent = "☀️";
  }
}

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

toggleBtn?.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  const newTheme = isLight ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
});