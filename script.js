import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";


console.log("Welcome to Spotify");


const songs = [
    { songName: "Salaam E Ishq",         filePath: "songs/1.mp3",  coverPath: "covers/1.jpg"  },
    { songName: "Tum Hi Ho",             filePath: "songs/2.mp3",  coverPath: "covers/2.jpg"  },
    { songName: "Kal Ho Naa Ho",         filePath: "songs/3.mp3",  coverPath: "covers/3.jpg"  },
    { songName: "Dil Dhadakne Do",       filePath: "songs/4.mp3",  coverPath: "covers/4.jpg"  },
    { songName: "Ae Dil Hai Mushkil",    filePath: "songs/5.mp3",  coverPath: "covers/5.jpg"  },
    { songName: "Gerua",                 filePath: "songs/6.mp3",  coverPath: "covers/6.jpg"  },
    { songName: "Raabta",                filePath: "songs/7.mp3",  coverPath: "covers/7.jpg"  },
    { songName: "Phir Bhi Tumko Chahna", filePath: "songs/8.mp3",  coverPath: "covers/8.jpg"  },
    { songName: "Kabira",                filePath: "songs/9.mp3",  coverPath: "covers/9.jpg"  },
    { songName: "Tera Ban Jaunga",       filePath: "songs/10.mp3", coverPath: "covers/10.jpg" },
];

let currentSong = 0;
let isPlaying   = false;
let autoAdvance = true;
let audio       = new Audio(songs[0].filePath);
audio.volume    = 1;

/* ── DOM refs ────────────────────────────────────────────────────── */
const masterPlay       = document.getElementById("masterPlay");
const masterSongName   = document.getElementById("masterSongName");
const gif              = document.getElementById("gif");
const previous         = document.getElementById("previous");
const next             = document.getElementById("next");
const currentTimeEl    = document.getElementById("currentTime");
const totalTimeEl      = document.getElementById("totalTime");
const progressWrap     = document.getElementById("progressWrap");
const progressFill     = document.getElementById("progressFill");
const progressKnob     = document.getElementById("progressKnob");
const songItems        = document.querySelectorAll(".songItem");
const songItemPlays    = document.querySelectorAll(".songItemPlay");
const banner           = document.querySelector(".songBanner");
const settingsBtn      = document.getElementById("settingsBtn");
const settingsOverlay  = document.getElementById("settingsOverlay");
const closeSettings    = document.getElementById("closeSettings");
const darkModeToggle   = document.getElementById("darkModeToggle");
const autoAdvanceToggle= document.getElementById("autoAdvanceToggle");
const volumeSelect     = document.getElementById("volumeSelect");
const albumArtToggle   = document.getElementById("albumArtToggle");
const navHome          = document.getElementById("navHome");
const navAbout         = document.getElementById("navAbout");
const homePage         = document.getElementById("homePage");
const aboutPage        = document.getElementById("aboutPage");

/* ── Helpers ─────────────────────────────────────────────────────── */
function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

function setProgress(pct) {
    pct = Math.max(0, Math.min(100, pct));
    progressFill.style.width = pct + "%";
    progressKnob.style.left  = pct + "%";
}

function pctFromEvent(e) {
    const rect = progressWrap.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return ((clientX - rect.left) / rect.width) * 100;
}

/* ── Load / Play / Pause ─────────────────────────────────────────── */
function loadSong(index) {
    currentSong = index;
    audio.src   = songs[index].filePath;
    masterSongName.textContent = songs[index].songName;

    if (banner && albumArtToggle.checked) {
        banner.style.backgroundImage = `url('${songs[index].coverPath}')`;
    }

    songItems.forEach((item, i) => item.classList.toggle("active", i === index));

    songItemPlays.forEach(icon => {
        icon.classList.remove("fa-pause-circle");
        icon.classList.add("fa-play-circle");
    });

    currentTimeEl.textContent = "0:00";
    totalTimeEl.textContent   = "0:00";
    setProgress(0);
}

function playSong() {
    audio.play();
    isPlaying = true;
    masterPlay.classList.replace("fa-play-circle", "fa-pause-circle");
    gif.style.opacity = "1";
    if (songItemPlays[currentSong]) {
        songItemPlays[currentSong].classList.replace("fa-play-circle", "fa-pause-circle");
    }
}

function pauseSong() {
    audio.pause();
    isPlaying = false;
    masterPlay.classList.replace("fa-pause-circle", "fa-play-circle");
    gif.style.opacity = "0";
    if (songItemPlays[currentSong]) {
        songItemPlays[currentSong].classList.replace("fa-pause-circle", "fa-play-circle");
    }
}

/* ── Player controls ─────────────────────────────────────────────── */
masterPlay.addEventListener("click", () => isPlaying ? pauseSong() : playSong());

previous.addEventListener("click", () => {
    loadSong((currentSong - 1 + songs.length) % songs.length);
    playSong();
});

next.addEventListener("click", () => {
    loadSong((currentSong + 1) % songs.length);
    playSong();
});

songItems.forEach(item => {
    item.addEventListener("click", () => {
        const index = parseInt(item.getAttribute("data-index"));
        if (index === currentSong) {
            isPlaying ? pauseSong() : playSong();
        } else {
            loadSong(index);
            playSong();
        }
    });
});

songItemPlays.forEach(icon => {
    icon.addEventListener("click", e => {
        e.stopPropagation();
        const index = parseInt(icon.id);
        if (index === currentSong) {
            isPlaying ? pauseSong() : playSong();
        } else {
            loadSong(index);
            playSong();
        }
    });
});


/* ── Audio time updates ──────────────────────────────────────────── */
audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    setProgress(pct);
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
    totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", () => {
    if (autoAdvance) {
        loadSong((currentSong + 1) % songs.length);
        playSong();
    }
});



/* ── Custom progress bar — mouse & touch drag ────────────────────── */
let dragging = false;

function seekTo(pct) {
    setProgress(pct);
    if (audio.duration) {
        audio.currentTime = (pct / 100) * audio.duration;
    }
}

progressWrap.addEventListener("mousedown", e => {
    dragging = true;
    seekTo(pctFromEvent(e));
});

window.addEventListener("mousemove", e => {
    if (dragging) seekTo(pctFromEvent(e));
});

window.addEventListener("mouseup", () => { dragging = false; });

progressWrap.addEventListener("touchstart", e => {
    dragging = true;
    seekTo(pctFromEvent(e));
}, { passive: true });

window.addEventListener("touchmove", e => {
    if (dragging) seekTo(pctFromEvent(e));
}, { passive: true });

window.addEventListener("touchend", () => { dragging = false; });



/* ── Settings ────────────────────────────────────────────────────── */
settingsBtn.addEventListener("click",   () => settingsOverlay.classList.add("open"));
closeSettings.addEventListener("click", () => settingsOverlay.classList.remove("open"));
settingsOverlay.addEventListener("click", e => {
    if (e.target === settingsOverlay) settingsOverlay.classList.remove("open");
});

darkModeToggle.addEventListener("change", () => {
    document.documentElement.setAttribute(
        "data-theme",
        darkModeToggle.checked ? "dark" : "light"
    );
});

autoAdvanceToggle.addEventListener("change", () => {
    autoAdvance = autoAdvanceToggle.checked;
});

volumeSelect.addEventListener("change", () => {
    audio.volume = parseFloat(volumeSelect.value);
});

albumArtToggle.addEventListener("change", () => {
    if (banner) {
        banner.style.backgroundImage = albumArtToggle.checked
            ? `url('${songs[currentSong].coverPath}')`
            : "none";
    }
});



/* ── Nav ─────────────────────────────────────────────────────────── */
navHome.addEventListener("click", () => {
    homePage.classList.add("active");
    aboutPage.classList.remove("active");
    navHome.classList.add("nav-active");
    navAbout.classList.remove("nav-active");
});

navAbout.addEventListener("click", () => {
    aboutPage.classList.add("active");
    homePage.classList.remove("active");
    navAbout.classList.add("nav-active");
    navHome.classList.remove("nav-active");
});

/* ── Init ────────────────────────────────────────────────────────── */
loadSong(0);