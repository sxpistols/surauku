import { Moon, Sun, Sunrise, Sunset, CloudSun, MoonStar } from "lucide-react";
import type { PrayerKey } from "@/config/app";
import type { PrayerEntry } from "@/services/prayerApi";
import type { ScheduleStatus } from "@/hooks/usePrayerSchedule";
import { cn } from "@/lib/utils";

const ICONS: Record<PrayerKey, typeof Sun> = {
  subuh: MoonStar,
  syuruq: Sunrise,
  dzuhur: Sun,
  ashar: CloudSun,
  maghrib: Sunset,
  isya: Moon,
};

const STATUS_TEXT: Record<ScheduleStatus, string> = {
  loading: "Memuat jadwal…",
  online: "Data diperbarui",
  offline: "Mode offline",
  error: "Jadwal belum tersedia",
};

interface Props {
  entries: PrayerEntry[];
  active: PrayerKey | null;
  status: ScheduleStatus;
  updatedAt: number | null;
  source: string | null;
  scheduleDate: string | null;
  today: string | null;
}

export function PrayerSchedule({ entries, active, status, updatedAt, scheduleDate, today }: Props) {
  return (
    <aside className="flex h-full flex-col rounded-[var(--radius)] border bg-navy-panel/80 p-[1.2vw]">
      <div className="mb-[1vh] grid grid-cols-[1fr_auto_auto] gap-[1vw] px-[0.8vw] text-[clamp(0.75rem,0.95vw,1.15rem)] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span>Shalat</span>
        <span className="w-[6.5vw] text-right">Adzan</span>
        <span className="w-[6.5vw] text-right text-teal">Iqamah</span>
      </div>

      <ol className="flex flex-1 flex-col gap-[0.8vh]">
        {entries.length === 0 &&
          Array.from({ length: 6 }).map((_, i) => <li key={i} className="flex-1 animate-pulse rounded-lg bg-muted/40" />)}
        {entries.map((e) => {
          const Icon = ICONS[e.key];
          const isActive = e.key === active;
          return (
            <li
              key={e.key}
              className={cn(
                "grid flex-1 grid-cols-[1fr_auto_auto] items-center gap-[1vw] rounded-lg px-[0.8vw] transition-colors",
                isActive ? "animate-pulse-gold bg-gold text-gold-foreground" : "border-b border-border/50",
              )}
            >
              <span className="flex items-center gap-[0.8vw]">
                <Icon className={cn("h-[clamp(20px,2vw,40px)] w-[clamp(20px,2vw,40px)]", !isActive && "text-gold")} />
                <span className="font-display text-[clamp(1.2rem,2vw,2.5rem)]">{e.name}</span>
              </span>
              <span className="w-[6.5vw] text-right text-[clamp(1.3rem,2.3vw,2.9rem)] font-bold tabular-nums">{e.time}</span>
              <span
                className={cn(
                  "w-[6.5vw] text-right text-[clamp(1rem,1.7vw,2.1rem)] font-semibold tabular-nums",
                  isActive ? "" : "text-teal",
                )}
              >
                {e.iqamah ?? "—"}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-[1vh] flex items-center gap-2 text-[clamp(0.7rem,0.85vw,1rem)] text-muted-foreground">
        <span
          className={cn(
            "inline-block h-[0.7em] w-[0.7em] rounded-full",
            status === "online" ? "bg-teal" : status === "loading" ? "bg-muted-foreground" : "bg-gold",
          )}
        />
        {STATUS_TEXT[status]}
        {updatedAt && status !== "loading" && (
          <span>
            · {new Date(updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })}
          </span>
        )}
      </p>
      {scheduleDate && today && scheduleDate !== today && (
        <p className="mt-1 text-sm text-gold">Jadwal terakhir: {scheduleDate}</p>
      )}
    </aside>
  );
}
