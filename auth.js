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

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
const getEl = (id) => document.getElementById(id);

const path = window.location.pathname;
const host = window.location.hostname;
const onLoginPage = path.endsWith("login.html") || path === "/" || path === "" || path.endsWith("/");
const onIndexPage = path.endsWith("index.html");

// Use redirect on Firebase Hosting, popup everywhere else (Vercel/localhost)
const useRedirect = host.endsWith("firebaseapp.com") || host.endsWith("web.app");

// ── Loading overlay ──
function showLoader(message = "Signing in...") {
  let overlay = getEl("authLoader");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "authLoader";
    overlay.innerHTML = `
      <div class="auth-loader-inner">
        <div class="auth-loader-ring"></div>
        <p class="auth-loader-text">${message}</p>
      </div>
    `;
    const style = document.createElement("style");
    style.textContent = `
      #authLoader {
        position: fixed; inset: 0; z-index: 1000;
        background: rgba(8,8,8,0.85);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        display: flex; align-items: center; justify-content: center;
        animation: loaderFadeIn 0.25s ease both;
      }
      @keyframes loaderFadeIn { from { opacity: 0; } to { opacity: 1; } }
      .auth-loader-inner {
        display: flex; flex-direction: column; align-items: center; gap: 22px;
        animation: loaderRise 0.35s cubic-bezier(0.22,1,0.36,1) both;
      }
      @keyframes loaderRise {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .auth-loader-ring {
        width: 44px; height: 44px; border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.08);
        border-top-color: #1DB954;
        animation: spin 0.75s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .auth-loader-text {
        font-family: 'DM Sans', sans-serif;
        font-size: 13px; font-weight: 300;
        letter-spacing: 0.1em;
        color: rgba(240,237,232,0.55);
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
  } else {
    overlay.querySelector(".auth-loader-text").textContent = message;
    overlay.style.display = "flex";
  }
}

function hideLoader() {
  const overlay = getEl("authLoader");
  if (overlay) {
    overlay.style.animation = "loaderFadeIn 0.2s ease reverse both";
    setTimeout(() => { overlay.style.display = "none"; }, 200);
  }
}

// ── Handle redirect result (Firebase Hosting only) ──
if (useRedirect) {
  getRedirectResult(auth).then((result) => {
    if (result?.user) {
      window.location.href = "index.html";
    }
  }).catch((err) => {
    console.error("Redirect error:", err.message);
    const status = getEl("status");
    if (status) status.textContent = "Sign-in failed: " + err.message;
  });
}

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
  if (useRedirect) {
    // Firebase Hosting — full page redirect, no popup
    showLoader("Redirecting to Google...");
    await signInWithRedirect(auth, googleProvider);
  } else {
    // Vercel / localhost — popup with loading overlay
    showLoader("Connecting to Google...");
    try {
      await signInWithPopup(auth, googleProvider);
      showLoader("Signing you in...");
      window.location.href = "index.html";
    } catch (err) {
      hideLoader();
      console.error("Google Error:", err.message);
      if (status) status.textContent = "Sign-in failed: " + err.message;
    }
  }
});

// ── Logout ──
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