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
  { image: "https://images.unsplash.com/photo-1516275860772-794f83076e30?auto=format&fit=crop&w=1600&q=80", source: "https://unsplash.com/photos/brown-and-black-dome-building-nTE88akjSos" },
  { image: "https://images.unsplash.com/photo-1588884492958-4cac1f90f647?auto=format&fit=crop&w=1600&q=80", source: "https://unsplash.com/photos/beige-and-green-dome-building-under-blue-sky-during-daytime-jjeLktIN8Ak" },
  { image: "https://images.unsplash.com/photo-1590108589108-3600131de843?auto=format&fit=crop&w=1600&q=80", source: "https://unsplash.com/photos/kaaba-and-crowd-in-mecca-W0FhhtnMd8k" },
  { image: "https://images.unsplash.com/photo-1761939997990-7e1635db43c5?auto=format&fit=crop&w=1600&q=80", source: "https://unsplash.com/photos/person-sitting-in-a-large-sunlit-hall-_xdnYkEZkF0" },
  { image: "https://images.unsplash.com/photo-1626664649936-69a273065389?auto=format&fit=crop&w=1600&q=80", source: "https://unsplash.com/photos/silhouette-of-building-during-sunset-x2-vCtkTMCg" }
];

for (let index = slides.length - 1; index > 0; index -= 1) {
  const randomIndex = Math.floor(Math.random() * (index + 1));
  [slides[index], slides[randomIndex]] = [slides[randomIndex], slides[index]];
}

const hadiths = [
  { arabic: "صَلَاةُ الْجَمَاعَةِ أَفْضَلُ مِنْ صَلَاةِ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً", translation: "Shalat berjamaah lebih utama dua puluh tujuh derajat daripada shalat sendirian.", source: "HR. Bukhari dan Muslim" },
  { arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى", translation: "Sesungguhnya amal itu tergantung niatnya, dan setiap orang mendapatkan sesuai dengan apa yang ia niatkan.", source: "HR. Bukhari dan Muslim" },
  { arabic: "مَنْ لَا يَرْحَمْ لَا يُرْحَمْ", translation: "Barangsiapa tidak menyayangi, maka ia tidak akan disayangi.", source: "HR. Bukhari dan Muslim" },
  { arabic: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ", translation: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.", source: "HR. Ath-Thabrani" },
  { arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", translation: "Barangsiapa menempuh jalan untuk mencari ilmu, Allah mudahkan baginya jalan menuju surga.", source: "HR. Muslim" }
];

const API_CONFIG = {
  citySearch: "https://api.myquran.com/v3/sholat/kabkota/cari/bantul",
  cityId: "",
  timezone: "Asia/Jakarta"
};

const displaySettings = JSON.parse(localStorage.getItem("ar-razqa-display-settings") || "null") || { slideInterval: 45, tickerSpeed: 38 };
let slideIntervalSeconds = Number(displaySettings.slideInterval) || 45;
let tickerSpeedSeconds = Number(displaySettings.tickerSpeed) || 38;
const fridayInfo = JSON.parse(localStorage.getItem("ar-razqa-friday-info") || "null") || { imam: "", muadzin: "" };

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

function isFridayWindow(now = new Date()) {
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return now.getDay() === 5 && minutesNow >= 360 && minutesNow < 720;
}

let fridayWindowState = null;
function renderFridaySettings(now = new Date()) {
  const container = document.querySelector("#fridaySettings");
  const active = isFridayWindow(now);
  if (active === fridayWindowState) return;
  fridayWindowState = active;
  container.hidden = !active;
  if (active) {
    document.querySelector("#fridayImamInput").value = fridayInfo.imam;
    document.querySelector("#fridayMuadzinInput").value = fridayInfo.muadzin;
    if (slide === 4) renderSlide();
  }
}

function saveFridayInfo() {
  fridayInfo.imam = document.querySelector("#fridayImamInput").value.trim();
  fridayInfo.muadzin = document.querySelector("#fridayMuadzinInput").value.trim();
  localStorage.setItem("ar-razqa-friday-info", JSON.stringify(fridayInfo));
  renderSlide();
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
  let hijriDate = "Kalender Hijriah";
  try {
    hijriDate = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(now).replace(" AH", " H");
  } catch {
    // Browser TV lama mungkin tidak menyediakan kalender Umm al-Qura.
  }
  document.querySelector("#topbarHijri").textContent = hijriDate;
  renderFridaySettings(now);

  const prayerMode = document.querySelector("#prayerMode");
  const prayerModePrayer = prayers.find((prayer) => prayer.iqamah !== "—" && secondsFromTime(prayer.iqamah, now) <= 0 && secondsFromTime(addMinutes(prayer.iqamah, 10), now) > 0);
  if (prayerModePrayer) {
    const remaining = Math.max(0, secondsFromTime(addMinutes(prayerModePrayer.iqamah, 10), now));
    const minutesLeft = Math.floor(remaining / 60).toString().padStart(2, "0");
    const secondsLeft = (remaining % 60).toString().padStart(2, "0");
    prayerMode.classList.add("active");
    prayerMode.setAttribute("aria-hidden", "false");
    document.querySelector("#prayerModeName").textContent = prayerModePrayer.name.toUpperCase();
    document.querySelector("#prayerModeCountdown").textContent = `${minutesLeft}:${secondsLeft}`;
  } else {
    prayerMode.classList.remove("active");
    prayerMode.setAttribute("aria-hidden", "true");
  }

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
let slideElapsed = 0;
function renderSlide() {
  const item = slides[slide];
  const hadith = hadiths[slide];
  const visual = document.querySelector("#stageVisual");
  visual.style.backgroundImage = `url("${item.image}")`;
  if (slide === 4 && isFridayWindow()) {
    document.querySelector("#slideHadithArabic").textContent = "صَلَاةُ الْجُمُعَةِ";
    document.querySelector("#slideHadithTranslation").textContent = fridayInfo.imam || fridayInfo.muadzin ? `Imam & Khatib: ${fridayInfo.imam || "—"} · Muadzin: ${fridayInfo.muadzin || "—"}` : "Informasi Imam, Khatib, dan Muadzin dapat diatur melalui menu Pengaturan.";
    document.querySelector("#slideHadithSource").textContent = "Informasi Shalat Jumat · Masjid Ar-Razqa";
  } else {
    document.querySelector("#slideHadithArabic").textContent = hadith.arabic;
    document.querySelector("#slideHadithTranslation").textContent = `“${hadith.translation}”`;
    document.querySelector("#slideHadithSource").textContent = `— ${hadith.source}`;
  }
  document.querySelector("#slideIndex").textContent = `${String(slide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  document.querySelector("#slideDots").innerHTML = slides.map((_, index) => `<span class="slide-dot ${index === slide ? "active" : ""}"></span>`).join("");
}
function changeSlide(direction) { slide = (slide + direction + slides.length) % slides.length; slideElapsed = 0; renderSlide(); }

document.querySelector("#previousSlide").addEventListener("click", () => changeSlide(-1));
document.querySelector("#nextSlide").addEventListener("click", () => changeSlide(1));
document.querySelector("#fullscreenButton").addEventListener("click", () => document.documentElement.requestFullscreen?.());
document.querySelector("#settingsButton").addEventListener("click", () => document.querySelector("#settingsDrawer").classList.add("open"));
document.querySelector("#closeSettings").addEventListener("click", () => document.querySelector("#settingsDrawer").classList.remove("open"));
document.querySelector("#tickerToggle").addEventListener("click", (event) => { const text = document.querySelector("#tickerText"); text.classList.toggle("paused"); event.currentTarget.textContent = text.classList.contains("paused") ? "▶" : "Ⅱ"; });
document.querySelector("#autoSlideToggle").addEventListener("change", (event) => { autoSlide = event.target.checked; });
document.querySelector("#tickerVisibility").addEventListener("change", (event) => { document.querySelector(".ticker-bar").style.display = event.target.checked ? "grid" : "none"; });
document.querySelector("#slideIntervalInput").value = slideIntervalSeconds;
document.querySelector("#tickerSpeedInput").value = tickerSpeedSeconds;
document.querySelector("#tickerText").style.animationDuration = `${tickerSpeedSeconds}s`;
document.querySelector("#slideIntervalInput").addEventListener("change", (event) => {
  slideIntervalSeconds = Math.min(300, Math.max(10, Number(event.target.value) || 45));
  slideElapsed = 0;
  event.target.value = slideIntervalSeconds;
  localStorage.setItem("ar-razqa-display-settings", JSON.stringify({ slideInterval: slideIntervalSeconds, tickerSpeed: tickerSpeedSeconds }));
});
document.querySelector("#tickerSpeedInput").addEventListener("change", (event) => {
  tickerSpeedSeconds = Math.min(180, Math.max(10, Number(event.target.value) || 38));
  event.target.value = tickerSpeedSeconds;
  document.querySelector("#tickerText").style.animationDuration = `${tickerSpeedSeconds}s`;
  localStorage.setItem("ar-razqa-display-settings", JSON.stringify({ slideInterval: slideIntervalSeconds, tickerSpeed: tickerSpeedSeconds }));
});
document.querySelector("#fridayImamInput").addEventListener("input", saveFridayInfo);
document.querySelector("#fridayMuadzinInput").addEventListener("input", saveFridayInfo);
document.querySelector("#offsetSettingsList").addEventListener("change", (event) => {
  if (!event.target.matches("[data-offset-key]")) return;
  saveOffset(event.target.dataset.offsetKey, event.target.value);
  event.target.value = prayers.find((prayer) => prayer.key === event.target.dataset.offsetKey).offset;
});
const tickerText = document.querySelector("#tickerText");

renderSlide();
renderOffsetSettings();
renderFridaySettings();
updateClock();
loadPrayerTimes();
setInterval(loadPrayerTimes, 30 * 60 * 1000);
setInterval(updateClock, 1000);
setInterval(() => { if (autoSlide && ++slideElapsed >= slideIntervalSeconds) changeSlide(1); }, 1000);
