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

// --- INITIALIZATION ---
try {
  await setPersistence(auth, browserSessionPersistence);
} catch (e) {
  console.error("Persistence error:", e);
}

const googleProvider = new GoogleAuthProvider();
const getEl = (id) => document.getElementById(id);

const path = window.location.pathname;
const host = window.location.hostname;

// ✅ FIX 1: Defined onIndexPage (This was missing and causing a crash)
const onLoginPage = path === "/" || path.endsWith("login.html");
const onIndexPage = path.endsWith("index.html") || (path === "/" && !onLoginPage);

// ✅ Detect Hosting Environment
const useRedirect = host.includes("firebaseapp.com") || host.includes("web.app");

// ✅ Handle Redirect Result
if (useRedirect) {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      window.location.replace("/index.html"); 
    }
  } catch (err) {
    console.error("Redirect error:", err.message);
  }
}

// --- AUTH STATE ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (onLoginPage) {
      window.location.replace("/index.html");
    }

    const displayName = user.email || user.displayName || "Logged in";
    document.querySelectorAll("#userInfo, #userInfoModal").forEach(el => {
      if (el) el.innerText = displayName;
    });

  } else {
    // ✅ FIX 2: Fixed the reference error for onIndexPage here
    if (onIndexPage) {
      window.location.replace("/login.html");
    }
  }
});

// --- GOOGLE LOGIN ---
getEl("googleLogin")?.addEventListener("click", async () => {
  const status = getEl("status");

  if (useRedirect) {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      console.error(err);
      if (status) status.textContent = err.message;
    }
  } else {
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = "/index.html";
    } catch (err) {
      console.error(err);
      if (status) status.textContent = err.message;
    }
  }
});

// --- LOGOUT ---
async function handleLogout() {
  try {
    await signOut(auth);
    window.location.replace("/login.html");
  } catch (err) {
    console.error("Logout Error:", err.message);
  }
}

getEl("logout")?.addEventListener("click", handleLogout);
getEl("logoutModal")?.addEventListener("click", handleLogout);