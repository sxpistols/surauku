import { useCallback, useEffect, useRef, useState } from "react";
import { APP_CONFIG } from "@/config/app";
import { getSchedule, type DaySchedule } from "@/services/prayerApi";
import { storage } from "@/services/storage";

export type ScheduleStatus = "loading" | "online" | "offline" | "error";

/**
 * Ambil jadwal saat dibuka, tiap 30 menit, dan saat tanggal (WIB) berganti.
 * Gagal -> pakai cache localStorage terakhir (mode offline).
 */
export function usePrayerSchedule(cityId: string, city: string, today: string | null) {
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [status, setStatus] = useState<ScheduleStatus>("loading");
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (!today || busy.current) return;
    busy.current = true;
    try {
      if (!navigator.onLine) throw new Error("offline");
      const s = await getSchedule(cityId, city, today);
      setSchedule(s);
      storage.saveSchedule(s);
      setStatus("online");
    } catch {
      const cached = storage.loadSchedule();
      if (cached) {
        setSchedule(cached);
        setStatus("offline");
      } else setStatus("error");
    } finally {
      busy.current = false;
    }
  }, [cityId, city, today]);

  // Tampilkan cache langsung saat start
  useEffect(() => {
    const cached = storage.loadSchedule();
    if (cached) setSchedule(cached);
  }, []);

  // Fetch awal + saat tanggal/kota berganti
  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => void refresh(), APP_CONFIG.refreshIntervalMs);
    const online = () => void refresh();
    window.addEventListener("online", online);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", online);
    };
  }, [refresh]);

  return { schedule, status, refresh };
}
