import { fetchPrayerTimes, type RawTimes } from "./prayer.functions";
import type { PrayerKey, IqamahOffsets } from "@/config/app";

export interface DaySchedule {
  date: string; // YYYY-MM-DD (WIB)
  city: string;
  source: string;
  fetchedAt: number;
  times: RawTimes;
}

export interface PrayerEntry {
  key: PrayerKey;
  name: string;
  time: string; // HH:MM
  iqamah: string | null;
  minutes: number; // menit sejak 00:00
  iqamahMinutes: number | null;
}

export async function getSchedule(cityId: string, city: string, date: string): Promise<DaySchedule> {
  const res = await fetchPrayerTimes({ cityId, city, date });
  return { date, city, source: res.source, fetchedAt: Date.now(), times: res.times };
}

export const toMinutes = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fmt = (min: number) => {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export function buildEntries(times: RawTimes, offsets: IqamahOffsets): PrayerEntry[] {
  const list: [PrayerKey, string, string][] = [
    ["subuh", "Subuh", times.subuh],
    ["syuruq", "Syuruq", times.terbit],
    ["dzuhur", "Dzuhur", times.dzuhur],
    ["ashar", "Ashar", times.ashar],
    ["maghrib", "Maghrib", times.maghrib],
    ["isya", "Isya", times.isya],
  ];
  return list.map(([key, name, time]) => {
    const minutes = toMinutes(time);
    const off = key === "syuruq" ? null : offsets[key];
    return {
      key,
      name,
      time,
      minutes,
      iqamah: off == null ? null : fmt(minutes + off),
      iqamahMinutes: off == null ? null : minutes + off,
    };
  });
}

/** Shalat yang "sedang berlangsung": entri terakhir yang waktunya sudah lewat (Syuruq = berakhirnya Subuh). */
export function currentPrayer(entries: PrayerEntry[], nowMin: number): PrayerKey | null {
  let cur: PrayerKey | null = null;
  for (const e of entries) if (nowMin >= e.minutes) cur = e.key;
  return cur ?? "isya";
}
