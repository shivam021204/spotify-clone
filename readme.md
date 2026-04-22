# Spotify Clone

A full-stack music player web app with authentication, built from scratch using vanilla JavaScript and Firebase. Inspired by Spotify's UI — refined, fast, and fully functional.

**[Live Demo]**


## Overview

Spotify Clone is a browser-based music player featuring secure Google authentication, a curated playlist, and a polished two-theme UI — all without any frontend framework.


## Features

- 🔐 **Google Authentication** — Firebase Auth with session persistence and protected routes
- 🎵 **Full Music Player** — Play, pause, skip, seek, auto-advance
- 🎨 **Dark & Light Mode** — Seamless theme switching via CSS custom properties
- 🖼️ **Live Album Art** — Cover art updates in real time as tracks change
- ⚙️ **Settings Panel** — Volume, auto-advance, display preferences
- 📱 **Touch Support** — Progress bar works on mobile with touch events


## Tech Stack

| Frontend | HTML5, CSS3, Vanilla JavaScript (ES Modules) |
| Auth | Firebase Authentication v10 (Google) |
| Fonts | Cormorant Garamond, DM Sans |
| Icons | Font Awesome 6 |
| Hosting | Firebase Hosting / Vercel / Netlify |

---

## Project Structure

```
├── index.html       # Player (auth-protected)
├── login.html       # Sign-in page
├── auth.js          # Auth logic & route guard        ← gitignored
├── firebase.js      # Firebase config & init          ← gitignored
├── script.js        # Player engine
├── style.css        # Player styles
├── login.css        # Login styles
├── songs/           # Audio files (1–10.mp3)
└── covers/          # Album art (1–10.jpg)
```

> **Note:** `auth.js` and `firebase.js` are excluded via `.gitignore` as they contain Firebase credentials. To run this project, create both files manually using your own [Firebase Console](https://console.firebase.google.com/) credentials.

---

## Deployment

Works out of the box on **Firebase Hosting**, **Vercel** — no build step required.
Firebase Hosting
#  Vercel — connect your GitHub repo, auto-deploys on push
```

## License
MIT — free to use and modify.