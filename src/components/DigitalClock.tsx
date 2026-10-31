import { APP_CONFIG } from "@/config/app";
import { formatGregorian, zonedParts } from "@/lib/time";
import type { PrayerEntry } from "@/services/prayerApi";

const pad = (n: number) => String(n).padStart(2, "0");

export function DigitalClock({ now, next }: { now: Date | null; next: { entry: PrayerEntry; inSec: number } | null }) {
  const p = now ? zonedParts(now) : null;
  return (
    <div className="flex items-end justify-between gap-[2vw]">
      <div>
        <div className="flex items-baseline gap-[0.6vw] font-bold leading-none tabular-nums">
          <span className="text-[clamp(3.5rem,8.5vw,10.5rem)]">{p ? `${pad(p.h)}:${pad(p.m)}` : "--:--"}</span>
          <span className="text-[clamp(1.6rem,3.6vw,4.4rem)] text-gold">{p ? pad(p.s) : "--"}</span>
          <span className="ml-[0.4vw] text-[clamp(1rem,1.6vw,2rem)] font-semibold text-teal">{APP_CONFIG.timeZoneLabel}</span>
        </div>
        <p className="mt-[0.6vh] text-[clamp(1rem,1.6vw,2rem)] text-muted-foreground">{now ? formatGregorian(now) : "\u00a0"}</p>
      </div>
      {next && (
        <div className="text-right">
          <p className="text-[clamp(0.8rem,1vw,1.25rem)] uppercase tracking-[0.25em] text-muted-foreground">Menuju {next.entry.name}</p>
          <p className="text-[clamp(1.6rem,3vw,3.8rem)] font-bold tabular-nums text-gold">
            -{pad(Math.floor(next.inSec / 3600))}:{pad(Math.floor((next.inSec % 3600) / 60))}:{pad(next.inSec % 60)}
          </p>
        </div>
      )}
    </div>
  );
}
