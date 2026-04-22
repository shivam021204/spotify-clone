// auth.js

import { auth } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

await setPersistence(auth, browserSessionPersistence);

const googleProvider = new GoogleAuthProvider();
const getEl = (id) => document.getElementById(id);

const path = window.location.pathname;
const host = window.location.hostname;

// ✅ FIXED page detection
const onLoginPage = path.endsWith("login.html");
const onIndexPage = path.endsWith("index.html");

// ✅ Detect Firebase hosting
const useRedirect =
  host.includes("firebaseapp.com") || host.includes("web.app");


// ── Handle redirect result (IMPORTANT FIX) ──
if (useRedirect) {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      window.location.href = "/index.html"; // ✅ absolute path
    }
  } catch (err) {
    console.error("Redirect error:", err.message);
  }
}


// ── Auth state ──
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (onLoginPage) {
      window.location.href = "/index.html";
    }

    const displayName = user.email || user.displayName || "Logged in";

    document.querySelectorAll("#userInfo, #userInfoModal").forEach(el => {
      if (el) el.innerText = displayName;
    });

  } else {
    if (onIndexPage) {
      window.location.href = "/login.html";
    }
  }
});


// ── Google login ──
getEl("googleLogin")?.addEventListener("click", async () => {
  const status = getEl("status");

  if (useRedirect) {
    // ✅ Firebase → redirect
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      console.error(err);
      if (status) status.textContent = err.message;
    }

  } else {
    // ✅ Vercel → popup
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = "/index.html";
    } catch (err) {
      console.error(err);
      if (status) status.textContent = err.message;
    }
  }
});


// ── Logout ──
async function handleLogout() {
  try {
    await signOut(auth);
    window.location.href = "/login.html";
  } catch (err) {
    console.error("Logout Error:", err.message);
  }
}

getEl("logout")?.addEventListener("click", handleLogout);
getEl("logoutModal")?.addEventListener("click", handleLogout);