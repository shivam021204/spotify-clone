// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2zc3gFq7rwdvr5_KqlKs-jjJTO2i4Qxk",
  authDomain: "spotifyclone-f6de9.web.app",
  projectId: "spotifyclone-f6de9",
  storageBucket: "spotifyclone-f6de9.appspot.com",
  messagingSenderId: "960946511760",
  appId: "1:960946511760:web:76ed2edb14d78afe1d9d15"
};

console.log("CONFIG USED:", firebaseConfig);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);