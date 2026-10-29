let prayers = [
  { name: "Subuh", key: "subuh", time: "04:15", iqamah: "04:35", symbol: "☼", offset: 20 },
  { name: "Syuruq", key: "terbit", time: "05:28", iqamah: "—", symbol: "◒", offset: 0 },
  { name: "Dzuhur", key: "dzuhur", time: "11:46", iqamah: "11:58", symbol: "☀", offset: 12 },
  { name: "Ashar", key: "ashar", time: "14:38", iqamah: "14:50", symbol: "≋", offset: 12 },
  { name: "Maghrib", key: "maghrib", time: "17:52", iqamah: "18:04", symbol: "◐", offset: 12 },
  { name: "Isya", key: "isya", time: "19:04", iqamah: "19:16", symbol: "◑", offset: 12 }
];

const savedOffsets = JSON.parse(localStorage.getItem("ar-razqa-iqamah-offsets") || "null");
if (savedOffsets) prayers = prayers.map((prayer) => ({ ...prayer, offset: savedOffsets[prayer.key] ?? prayer.offset }));

const slides = [
  { title: "Teduh sebelum waktu berkumpul", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=80" },
  { title: "Masjidil Haram · Makkah", image: "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=1600&q=80" },
  { title: "Damai di halaman Nabawi", image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1600&q=80" },
  { title: "Ruang yang menenangkan hati", image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1600&q=80" },
  { title: "Jaga lisan, jaga persaudaraan", image: "https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&w=1600&q=80" }
];

const hadiths = [
  "Shalat berjamaah lebih utama dua puluh tujuh derajat daripada shalat sendirian. — HR. Bukhari dan Muslim",
  "Sebaik-baik kalian adalah yang paling bermanfaat bagi orang lain. — HR. Ahmad",
  "Barangsiapa menempuh jalan untuk mencari ilmu, Allah mudahkan baginya jalan menuju surga. — HR. Muslim"
];

const API_CONFIG = {
  citySearch: "https://api.myquran.com/v3/sholat/kabkota/cari/bantul",
  cityId: "",
  timezone: "Asia/Jakarta"
};

const prayerList = document.querySelector("#prayerList");
const clock = document.querySelector("#clock");
const countdown = document.querySelector("#countdown");
const countdownNote = document.querySelector("#countdownNote");
const nextPrayerName = document.querySelector("#nextPrayerName");
const nextPrayerTime = document.querySelector("#nextPrayerTime");
const prayerProgress = document.querySelector("#prayerProgress");

function renderOffsetSettings() {
  const list = document.querySelector("#offsetSettingsList");
  list.innerHTML = prayers.filter((prayer) => prayer.key !== "terbit").map((prayer) => `
    <div class="offset-row">
      <label for="offset-${prayer.key}">${prayer.name}</label>
      <input id="offset-${prayer.key}" data-offset-key="${prayer.key}" type="number" min="1" max="60" step="1" value="${prayer.offset}" aria-label="Jeda iqamah ${prayer.name} dalam menit" />
    </div>`).join("");
}

function saveOffset(key, value) {
  const offset = Math.min(60, Math.max(1, Number(value) || 1));
  const target = prayers.find((prayer) => prayer.key === key);
  if (!target) return;
  target.offset = offset;
  target.iqamah = addMinutes(target.time, offset);
  const offsets = Object.fromEntries(prayers.filter((prayer) => prayer.key !== "terbit").map((prayer) => [prayer.key, prayer.offset]));
  localStorage.setItem("ar-razqa-iqamah-offsets", JSON.stringify(offsets));
  updateClock();
}

function minutes(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function renderPrayers(activeName) {
  prayerList.innerHTML = prayers.map((prayer) => `
    <div class="prayer-row ${prayer.name === activeName ? "active" : ""}">
      <div class="prayer-symbol" aria-hidden="true">${prayer.symbol}</div>
      <div><div class="prayer-name">${prayer.name}</div><div class="prayer-iqamah">${prayer.iqamah === "—" ? "Matahari terbit" : `IQAMAH ${prayer.iqamah}`}</div></div>
      <div class="prayer-time">${prayer.time}</div>
    </div>`).join("");
}

function parseTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function addMinutes(value, amount) {
  const total = (parseTime(value) + amount) % (24 * 60);
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
}

async function loadPrayerTimes() {
  try {
    if (!API_CONFIG.cityId) {
      const cityResponse = await fetch(API_CONFIG.citySearch);
      const cityJson = await cityResponse.json();
      API_CONFIG.cityId = cityJson.data?.find((item) => item.lokasi.includes("BANTUL"))?.id || cityJson.data?.[0]?.id;
    }
    if (!API_CONFIG.cityId) throw new Error("Wilayah Bantul tidak ditemukan");
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: API_CONFIG.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
    const today = `${parts.year}-${parts.month}-${parts.day}`;
    const response = await fetch(`https://api.myquran.com/v3/sholat/jadwal/${API_CONFIG.cityId}/${today}?tz=${encodeURIComponent(API_CONFIG.timezone)}`);
    const json = await response.json();
    const schedule = json.data?.jadwal?.[today];
    if (!schedule) throw new Error("Jadwal hari ini tidak tersedia");
    prayers = prayers.map((prayer) => ({ ...prayer, time: schedule[prayer.key] || prayer.time, iqamah: prayer.offset ? addMinutes(schedule[prayer.key] || prayer.time, prayer.offset) : "—" }));
    renderPrayers();
  } catch (error) {
    console.warn("Jadwal API tidak tersedia, memakai jadwal cadangan.", error);
  }
}

function secondsFromTime(value, now) {
  const target = parseTime(value) * 60;
  const current = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return target - current;
}

function updateClock() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const time = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  clock.textContent = time;
  document.querySelector("#gregorianDate").textContent = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  document.querySelector("#topbarDate").textContent = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  const iqamahPrayer = prayers.find((prayer) => prayer.iqamah !== "—" && secondsFromTime(prayer.time, now) <= 0 && secondsFromTime(prayer.iqamah, now) > 0);
  const stageVisual = document.querySelector("#stageVisual");
  const iqamahOverlay = document.querySelector("#iqamahOverlay");
  const nextKicker = document.querySelector("#nextPrayerKicker");
  if (iqamahPrayer) {
    const secondsToIqamah = Math.max(0, secondsFromTime(iqamahPrayer.iqamah, now));
    const mm = Math.floor(secondsToIqamah / 60).toString().padStart(2, "0");
    const ss = (secondsToIqamah % 60).toString().padStart(2, "0");
    stageVisual.classList.add("iqamah-mode");
    document.querySelector("#iqamahName").textContent = iqamahPrayer.name.toUpperCase();
    document.querySelector("#iqamahCount").textContent = `${mm}:${ss}`;
    nextKicker.textContent = "MENUJU IQAMAH";
    nextPrayerName.textContent = iqamahPrayer.name;
    nextPrayerTime.textContent = iqamahPrayer.iqamah;
    countdown.textContent = `${mm}:${ss}`;
    countdownNote.textContent = `Mohon merapatkan dan meluruskan saf`;
    prayerProgress.style.width = `${Math.min(100, Math.max(5, (1 - secondsToIqamah / (iqamahPrayer.offset * 60)) * 100))}%`;
  } else {
    stageVisual.classList.remove("iqamah-mode");
    nextKicker.textContent = "MENUJU WAKTU BERIKUTNYA";
  }
  let nextIndex = prayers.findIndex((prayer) => minutes(prayer.time) > currentMinutes);
  if (nextIndex === -1) nextIndex = 0;
  const previousIndex = nextIndex === 0 ? prayers.length - 1 : nextIndex - 1;
  const next = prayers[nextIndex];
  const current = prayers[previousIndex];
  let secondsUntil = (minutes(next.time) * 60 - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()));
  if (secondsUntil <= 0) secondsUntil += 24 * 3600;
  const hours = Math.floor(secondsUntil / 3600).toString().padStart(2, "0");
  const mins = Math.floor((secondsUntil % 3600) / 60).toString().padStart(2, "0");
  const secs = (secondsUntil % 60).toString().padStart(2, "0");
  if (!iqamahPrayer) {
    nextPrayerName.textContent = next.name;
    nextPrayerTime.textContent = next.time;
    countdown.textContent = `${hours}:${mins}:${secs}`;
    countdownNote.textContent = `Setelah ${current.name} · persiapan menuju ${next.name}`;
  }
  const start = minutes(current.time);
  let span = minutes(next.time) - start;
  if (span <= 0) span += 24 * 60;
  let elapsed = currentMinutes - start;
  if (elapsed < 0) elapsed += 24 * 60;
  prayerProgress.style.width = `${Math.min(100, Math.max(5, (elapsed / span) * 100))}%`;
  renderPrayers(current.name);
}

let slide = 0;
let autoSlide = true;
function renderSlide() {
  const item = slides[slide];
  const visual = document.querySelector("#stageVisual");
  visual.style.backgroundImage = `url("${item.image}")`;
  document.querySelector("#slideTitle").textContent = item.title;
  document.querySelector("#slideIndex").textContent = `${String(slide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  document.querySelector("#slideDots").innerHTML = slides.map((_, index) => `<span class="slide-dot ${index === slide ? "active" : ""}"></span>`).join("");
}
function changeSlide(direction) { slide = (slide + direction + slides.length) % slides.length; renderSlide(); }

document.querySelector("#previousSlide").addEventListener("click", () => changeSlide(-1));
document.querySelector("#nextSlide").addEventListener("click", () => changeSlide(1));
document.querySelector("#fullscreenButton").addEventListener("click", () => document.documentElement.requestFullscreen?.());
document.querySelector("#settingsButton").addEventListener("click", () => document.querySelector("#settingsDrawer").classList.add("open"));
document.querySelector("#closeSettings").addEventListener("click", () => document.querySelector("#settingsDrawer").classList.remove("open"));
document.querySelector("#tickerToggle").addEventListener("click", (event) => { const text = document.querySelector("#tickerText"); text.classList.toggle("paused"); event.currentTarget.textContent = text.classList.contains("paused") ? "▶" : "Ⅱ"; });
document.querySelector("#autoSlideToggle").addEventListener("change", (event) => { autoSlide = event.target.checked; });
document.querySelector("#tickerVisibility").addEventListener("change", (event) => { document.querySelector(".ticker-bar").style.display = event.target.checked ? "grid" : "none"; });
document.querySelector("#offsetSettingsList").addEventListener("change", (event) => {
  if (!event.target.matches("[data-offset-key]")) return;
  saveOffset(event.target.dataset.offsetKey, event.target.value);
  event.target.value = prayers.find((prayer) => prayer.key === event.target.dataset.offsetKey).offset;
});
let hadithIndex = 0;
const tickerText = document.querySelector("#tickerText");
tickerText.addEventListener("animationiteration", () => {
  hadithIndex = (hadithIndex + 1) % hadiths.length;
  tickerText.textContent = hadiths[hadithIndex];
});

renderSlide();
renderOffsetSettings();
updateClock();
loadPrayerTimes();
setInterval(loadPrayerTimes, 30 * 60 * 1000);
setInterval(updateClock, 1000);
setInterval(() => { if (autoSlide) changeSlide(1); }, 10000);
