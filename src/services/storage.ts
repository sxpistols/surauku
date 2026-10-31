import { DEFAULT_IQAMAH_OFFSETS, APP_CONFIG, type IqamahOffsets } from "@/config/app";
import type { DaySchedule } from "./prayerApi";
import { clearExpiredFriday, fridayDeadline, type FridayOfficials } from "@/lib/friday";

const KEYS = {
  schedule: "arrazqa:schedule",
  settings: "arrazqa:settings",
};

export interface Settings {
  slideshowEnabled: boolean;
  slideIntervalSec: number;
  marqueeEnabled: boolean;
  marqueePaused: boolean;
  offsets: IqamahOffsets;
  city: string;
  cityId: string;
  fridayOfficials: FridayOfficials;
  mosqueName: string;
  mosqueDescription: string;
}

export const DEFAULT_SETTINGS: Settings = {
  slideshowEnabled: true,
  slideIntervalSec: APP_CONFIG.slideIntervalSec,
  marqueeEnabled: true,
  marqueePaused: false,
  offsets: { ...DEFAULT_IQAMAH_OFFSETS },
  city: APP_CONFIG.city,
  cityId: APP_CONFIG.cityId,
  fridayOfficials: { ...APP_CONFIG.fridayOfficials },
  mosqueName: APP_CONFIG.mosqueName,
  mosqueDescription: APP_CONFIG.mosqueAddress,
};

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage penuh / tidak tersedia */
  }
}

export const storage = {
  loadSchedule: () => read<DaySchedule>(KEYS.schedule),
  saveSchedule: (s: DaySchedule) => write(KEYS.schedule, s),
  loadSettings: (): Settings => {
    const s = read<Partial<Settings>>(KEYS.settings);
    let fridayOfficials = { ...DEFAULT_SETTINGS.fridayOfficials, ...s?.fridayOfficials };
    if ((fridayOfficials.khatibImam || fridayOfficials.muadzin) && fridayOfficials.expiresAt == null) {
      fridayOfficials = { ...fridayOfficials, expiresAt: fridayDeadline(new Date()) };
    }
    const result = { ...DEFAULT_SETTINGS, ...s, offsets: { ...DEFAULT_SETTINGS.offsets, ...s?.offsets }, fridayOfficials: clearExpiredFriday(fridayOfficials, new Date()) };
    write(KEYS.settings, result);
    return result;
  },
  saveSettings: (s: Settings) => write(KEYS.settings, s),
};
