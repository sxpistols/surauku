import { APP_CONFIG } from "@/config/app";
import { zonedParts } from "@/lib/time";

export interface FridayOfficials {
  khatibImam: string;
  muadzin: string;
  expiresAt: number | null;
}

export function fridayDeadline(now: Date): number {
  const { date, secOfDay } = zonedParts(now);
  const local = new Date(`${date}T12:00:00+07:00`);
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  let days = (5 - weekday + 7) % 7;
  if (days === 0 && secOfDay >= APP_CONFIG.fridayResetHour * 3600) days = 7;
  return local.getTime() + days * 86400000;
}

export function clearExpiredFriday(value: FridayOfficials, now: Date): FridayOfficials {
  if (value.expiresAt != null && now.getTime() >= value.expiresAt) {
    return { khatibImam: "", muadzin: "", expiresAt: null };
  }
  return value;
}

export function isFridayWindow(now: Date, isyaTime: string | null): boolean {
  const { date, secOfDay } = zonedParts(now);
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  if (weekday === 5) return secOfDay < APP_CONFIG.fridayResetHour * 3600;
  if (weekday !== 4 || !isyaTime) return false;
  const [hour, minute] = isyaTime.split(":").map(Number);
  if (hour == null || minute == null || !Number.isFinite(hour + minute)) return false;
  return secOfDay >= (hour * 60 + minute) * 60;
}

export function showFridaySlide(now: Date, isyaTime: string | null, officials: FridayOfficials): boolean {
  const current = clearExpiredFriday(officials, now);
  return isFridayWindow(now, isyaTime) && !!current.khatibImam.trim() && !!current.muadzin.trim();
}