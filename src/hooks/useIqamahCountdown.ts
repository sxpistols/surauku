import { useEffect, useRef, useState } from "react";
import type { PrayerEntry } from "@/services/prayerApi";

export interface IqamahState {
  prayer: PrayerEntry;
  remainingSec: number;
}

/** Cari shalat yang waktunya sudah masuk tapi iqamah belum tiba. */
export function findIqamahWindow(entries: PrayerEntry[], secOfDay: number): IqamahState | null {
  for (const e of entries) {
    if (e.iqamahMinutes == null) continue;
    const start = e.minutes * 60;
    const end = e.iqamahMinutes * 60;
    if (secOfDay >= start && secOfDay < end) return { prayer: e, remainingSec: end - secOfDay };
  }
  return null;
}

/**
 * Mode countdown iqamah. Setelah aktif, target dikunci sampai hitungan habis
 * (tidak berganti meski jadwal diperbarui di tengah countdown).
 */
export function useIqamahCountdown(entries: PrayerEntry[], secOfDay: number | null) {
  const [state, setState] = useState<IqamahState | null>(null);
  const locked = useRef<{ prayer: PrayerEntry; endSec: number } | null>(null);

  useEffect(() => {
    if (secOfDay == null) return;
    if (locked.current) {
      const remaining = locked.current.endSec - secOfDay;
      if (remaining > 0) {
        setState({ prayer: locked.current.prayer, remainingSec: remaining });
        return;
      }
      locked.current = null;
    }
    const w = findIqamahWindow(entries, secOfDay);
    if (w) {
      locked.current = { prayer: w.prayer, endSec: secOfDay + w.remainingSec };
      setState(w);
    } else setState(null);
  }, [entries, secOfDay]);

  return state;
}
