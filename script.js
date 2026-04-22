import { auth } from "./firebase.js";

console.log("Spotify ready.");

const songs = [
  { songName: "Rakhlo Tum Chupake",  filePath: "songs/rakhlo.mp3",     coverPath: "covers/rakhlo.png"       },
  { songName: "Bairan",              filePath: "songs/bairan.mp3",      coverPath: "covers/bairan.jpeg"      },
  { songName: "Haath Toh Laga",      filePath: "songs/haath.mp3",       coverPath: "covers/47.jpg"           },
  { songName: "Gal Sun",             filePath: "songs/Gal.mp3",         coverPath: "covers/gal.jpg"          },
  { songName: "Heat Waves",          filePath: "songs/heat.mp3",        coverPath: "covers/heat waves.jpg"   },
  { songName: "Javedan",             filePath: "songs/Jaavedaan.mp3",   coverPath: "covers/javedan.jpg"      },
  { songName: "I Guess",             filePath: "songs/Guess.mp3",       coverPath: "covers/iguess.jpg"       },
  { songName: "Par Ab Jo Aygi",      filePath: "songs/Aur.mp3",         coverPath: "covers/aur.jpg"          },
  { songName: "Rang Jo Lagyo",       filePath: "songs/Rang.mp3",        coverPath: "covers/rang.jpg"         },
  { songName: "Sheesha",             filePath: "songs/Sheesha.mp3",     coverPath: "covers/sheesha.jpg"      },
];

let currentSong  = 0;
let isPlaying    = false;
let autoAdvance  = true;
let shuffleOn    = false;
let favourites   = new Set(JSON.parse(localStorage.getItem("favs") || "[]"));
let audio        = new Audio(songs[0].filePath);
audio.volume     = 1;

/* ── DOM ── */
const masterPlay        = document.getElementById("masterPlay");
const masterSongName    = document.getElementById("masterSongName");
const coverTitle        = document.getElementById("coverTitle");
const coverArt          = document.getElementById("coverArt");
const gif               = document.getElementById("gif");
const previous          = document.getElementById("previous");
const next              = document.getElementById("next");
const currentTimeEl     = document.getElementById("currentTime");
const totalTimeEl       = document.getElementById("totalTime");
const progressWrap      = document.getElementById("progressWrap");
const progressFill      = document.getElementById("progressFill");
const progressKnob      = document.getElementById("progressKnob");
const songItems         = document.querySelectorAll(".songItem");
const songItemPlays     = document.querySelectorAll(".songItemPlay");
const favStars          = document.querySelectorAll(".fav-star");
const playerFav         = document.getElementById("playerFav");
const shuffleBtn        = document.getElementById("shuffleBtn");
const autoBtn           = document.getElementById("autoBtn");
const settingsBtn       = document.getElementById("settingsBtn");
const settingsBtnPlayer = document.getElementById("settingsBtnPlayer");
const settingsOverlay   = document.getElementById("settingsOverlay");
const closeSettings     = document.getElementById("closeSettings");
const darkModeToggle    = document.getElementById("darkModeToggle");
const autoAdvanceToggle = document.getElementById("autoAdvanceToggle");
const albumArtToggle    = document.getElementById("albumArtToggle");
const volSlider         = document.getElementById("volSlider");
const volDown           = document.getElementById("volDown");
const volUp             = document.getElementById("volUp");
const navHome           = document.getElementById("navHome");
const navAbout          = document.getElementById("navAbout");
const homePage          = document.getElementById("homePage");
const aboutPage         = document.getElementById("aboutPage");

/* ── Helpers ── */
function formatTime(s) {
  if (isNaN(s) || s < 0) return "0:00";
  return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;
}

function setProgress(pct) {
  pct = Math.max(0, Math.min(100, pct));
  progressFill.style.width = pct + "%";
  progressKnob.style.left  = pct + "%";
}

function pctFromEvent(e) {
  const rect = progressWrap.getBoundingClientRect();
  return ((( e.touches ? e.touches[0].clientX : e.clientX) - rect.left) / rect.width) * 100;
}

function updateVolSlider() {
  const pct = audio.volume * 100;
  volSlider.style.background = `linear-gradient(to right, var(--green) ${pct}%, var(--border) ${pct}%)`;
}

function saveFavs() {
  localStorage.setItem("favs", JSON.stringify([...favourites]));
}

function updateFavUI(index) {
  const isFav = favourites.has(index);
  // list star
  favStars.forEach(s => {
    if (parseInt(s.dataset.index) === index) {
      s.classList.toggle("active", isFav);
      s.classList.toggle("fas", isFav);
      s.classList.toggle("far", !isFav);
    }
  });
  // player star
  if (index === currentSong) {
    playerFav.classList.toggle("active", isFav);
    playerFav.classList.toggle("fas", isFav);
    playerFav.classList.toggle("far", !isFav);
  }
}

function toggleFav(index) {
  if (favourites.has(index)) { favourites.delete(index); }
  else { favourites.add(index); }
  saveFavs();
  updateFavUI(index);
}

/* ── Load / Play / Pause ── */
function loadSong(index) {
  currentSong = index;
  audio.src   = songs[index].filePath;
  masterSongName.textContent = songs[index].songName;
  if (coverTitle) coverTitle.textContent = songs[index].songName;
  if (coverArt && albumArtToggle.checked) {
    coverArt.style.backgroundImage = `url('${songs[index].coverPath}')`;
  }
  songItems.forEach((item, i) => item.classList.toggle("active", i === index));
  songItemPlays.forEach(icon => {
    icon.classList.remove("fa-pause-circle");
    icon.classList.add("fa-play-circle");
  });
  // update player fav star
  const isFav = favourites.has(index);
  playerFav.classList.toggle("active", isFav);
  playerFav.classList.toggle("fas", isFav);
  playerFav.classList.toggle("far", !isFav);

  currentTimeEl.textContent = "0:00";
  totalTimeEl.textContent   = "0:00";
  setProgress(0);
}

function playSong() {
  audio.play();
  isPlaying = true;
  masterPlay.innerHTML = '<i class="far fa-pause-circle"></i>';
  gif.classList.add("visible");
  if (songItemPlays[currentSong]) songItemPlays[currentSong].classList.replace("fa-play-circle","fa-pause-circle");
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  masterPlay.innerHTML = '<i class="far fa-play-circle"></i>';
  gif.classList.remove("visible");
  if (songItemPlays[currentSong]) songItemPlays[currentSong].classList.replace("fa-pause-circle","fa-play-circle");
}

function nextSong() {
  if (shuffleOn) {
    let r;
    do { r = Math.floor(Math.random() * songs.length); } while (r === currentSong && songs.length > 1);
    loadSong(r);
  } else {
    loadSong((currentSong + 1) % songs.length);
  }
}

/* ── Controls ── */
masterPlay.addEventListener("click", () => isPlaying ? pauseSong() : playSong());
previous.addEventListener("click", () => { loadSong((currentSong - 1 + songs.length) % songs.length); playSong(); });
next.addEventListener("click", () => { nextSong(); playSong(); });

// Shuffle
shuffleBtn.addEventListener("click", () => {
  shuffleOn = !shuffleOn;
  shuffleBtn.classList.toggle("active-ctrl", shuffleOn);
});

// Auto-advance button in player bar
autoBtn.addEventListener("click", () => {
  autoAdvance = !autoAdvance;
  autoBtn.classList.toggle("active-ctrl", autoAdvance);
  autoAdvanceToggle.checked = autoAdvance;
});
autoBtn.classList.add("active-ctrl"); // default on

songItems.forEach(item => {
  item.addEventListener("click", () => {
    const i = parseInt(item.getAttribute("data-index"));
    if (i === currentSong) { isPlaying ? pauseSong() : playSong(); }
    else { loadSong(i); playSong(); }
  });
});

songItemPlays.forEach(icon => {
  icon.addEventListener("click", e => {
    e.stopPropagation();
    const i = parseInt(icon.id);
    if (i === currentSong) { isPlaying ? pauseSong() : playSong(); }
    else { loadSong(i); playSong(); }
  });
});

// Fav stars in list
favStars.forEach(star => {
  star.addEventListener("click", e => {
    e.stopPropagation();
    toggleFav(parseInt(star.dataset.index));
  });
});

// Fav in player bar
playerFav.addEventListener("click", () => toggleFav(currentSong));

/* ── Audio events ── */
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  setProgress((audio.currentTime / audio.duration) * 100);
  currentTimeEl.textContent = formatTime(audio.currentTime);
});
audio.addEventListener("loadedmetadata", () => { totalTimeEl.textContent = formatTime(audio.duration); });
audio.addEventListener("ended", () => { if (autoAdvance) { nextSong(); playSong(); } });

/* ── Progress drag ── */
let dragging = false;
function seekTo(pct) { setProgress(pct); if (audio.duration) audio.currentTime = (pct/100)*audio.duration; }
progressWrap.addEventListener("mousedown", e => { dragging=true; seekTo(pctFromEvent(e)); });
window.addEventListener("mousemove", e => { if (dragging) seekTo(pctFromEvent(e)); });
window.addEventListener("mouseup", () => { dragging=false; });
progressWrap.addEventListener("touchstart", e => { dragging=true; seekTo(pctFromEvent(e)); }, {passive:true});
window.addEventListener("touchmove", e => { if (dragging) seekTo(pctFromEvent(e)); }, {passive:true});
window.addEventListener("touchend", () => { dragging=false; });

/* ── Volume slider ── */
volSlider.addEventListener("input", () => {
  audio.volume = parseFloat(volSlider.value);
  updateVolSlider();
});
volDown.addEventListener("click", () => {
  audio.volume = Math.max(0, parseFloat((audio.volume - 0.1).toFixed(2)));
  volSlider.value = audio.volume;
  updateVolSlider();
});
volUp.addEventListener("click", () => {
  audio.volume = Math.min(1, parseFloat((audio.volume + 0.1).toFixed(2)));
  volSlider.value = audio.volume;
  updateVolSlider();
});

/* ── Settings ── */
[settingsBtn, settingsBtnPlayer].forEach(btn => btn?.addEventListener("click", () => settingsOverlay.classList.add("open")));
closeSettings.addEventListener("click", () => settingsOverlay.classList.remove("open"));
settingsOverlay.addEventListener("click", e => { if (e.target===settingsOverlay) settingsOverlay.classList.remove("open"); });

darkModeToggle.addEventListener("change", () => {
  document.documentElement.setAttribute("data-theme", darkModeToggle.checked ? "dark" : "light");
  updateVolSlider();
});
autoAdvanceToggle.addEventListener("change", () => {
  autoAdvance = autoAdvanceToggle.checked;
  autoBtn.classList.toggle("active-ctrl", autoAdvance);
});
albumArtToggle.addEventListener("change", () => {
  if (coverArt) coverArt.style.backgroundImage = albumArtToggle.checked ? `url('${songs[currentSong].coverPath}')` : "none";
});

/* ── Nav ── */
navHome.addEventListener("click", () => {
  homePage.classList.add("active"); aboutPage.classList.remove("active");
  navHome.classList.add("nav-active"); navAbout.classList.remove("nav-active");
});
navAbout.addEventListener("click", () => {
  aboutPage.classList.add("active"); homePage.classList.remove("active");
  navAbout.classList.add("nav-active"); navHome.classList.remove("nav-active");
});

/* ── Init ── */
loadSong(0);
if (coverArt) coverArt.style.backgroundImage = `url('${songs[0].coverPath}')`;
updateVolSlider();
// Restore saved fav UI
favourites.forEach(i => updateFavUI(i));