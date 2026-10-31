import { APP_CONFIG } from "@/config/app";

/** Bagian waktu di zona masjid (WIB), apa pun zona waktu perangkat. */
export function zonedParts(d: Date, tz = APP_CONFIG.timeZone) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  const h = Number(p["hour"]), m = Number(p["minute"]), s = Number(p["second"]);
  return {
    date: `${p["year"]}-${p["month"]}-${p["day"]}`,
    h, m, s,
    secOfDay: h * 3600 + m * 60 + s,
  };
}

export const formatGregorian = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: APP_CONFIG.timeZone, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir",
  "Rajab", "Syaban", "Ramadhan", "Syawal", "Dzulqaidah", "Dzulhijjah",
];

/** Kalender Hijriah tabular (dihitung sendiri; Intl di sebagian TV Android salah/tidak mendukung). */
export function toHijri(d: Date) {
  const [y = 0, mo = 1, da = 1] = zonedParts(d).date.split("-").map(Number);
  const jd = Math.floor((1461 * (y + 4800 + Math.floor((mo - 14) / 12))) / 4)
    + Math.floor((367 * (mo - 2 - 12 * Math.floor((mo - 14) / 12))) / 12)
    - Math.floor((3 * Math.floor((y + 4900 + Math.floor((mo - 14) / 12)) / 100)) / 4)
    + da - 32075;
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { day, month, year };
}

export function formatHijri(d: Date) {
  const h = toHijri(d);
  return `${h.day} ${HIJRI_MONTHS[h.month - 1]} ${h.year} H`;
}
