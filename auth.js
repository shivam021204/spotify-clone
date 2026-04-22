// auth.js

import { auth } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

setPersistence(auth, browserSessionPersistence);

const googleProvider = new GoogleAuthProvider();
const getEl = (id) => document.getElementById(id);

const path = window.location.pathname;
const onLoginPage = path.endsWith("login.html") || path === "/" || path === "" || path.endsWith("/");
const onIndexPage = path.endsWith("index.html");

// ── Auth state ──
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (onLoginPage && !onIndexPage) window.location.href = "index.html";
    const displayName = user.email || user.displayName || "Logged in";
    document.querySelectorAll("#userInfo, #userInfoModal").forEach(el => {
      if (el) el.innerText = displayName;
    });
  } else {
    if (onIndexPage) window.location.href = "login.html";
  }
});

// ── Google login ──
getEl("googleLogin")?.addEventListener("click", async () => {
  const status = getEl("status");
  try {
    if (status) status.textContent = "Opening Google sign-in...";
    await signInWithPopup(auth, googleProvider);
    window.location.href = "index.html";
  } catch (err) {
    console.error("Google Error:", err.message);
    if (status) status.textContent = "Sign-in failed: " + err.message;
  }
});

// ── Logout (nav + settings modal) ──
async function handleLogout() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout Error:", err.message);
  }
}

getEl("logout")?.addEventListener("click", handleLogout);
getEl("logoutModal")?.addEventListener("click", handleLogout);