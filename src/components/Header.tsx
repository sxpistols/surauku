import { Maximize, Minimize, Settings, MapPin } from "lucide-react";
import { APP_CONFIG } from "@/config/app";
import { formatGregorian, formatHijri } from "@/lib/time";
import { MosqueLogo } from "./MosqueLogo";

interface Props {
  now: Date | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  locationLabel: string;
  mosqueName: string;
  mosqueDescription: string;
}

export function Header({ now, isFullscreen, onToggleFullscreen, onOpenSettings, locationLabel, mosqueName, mosqueDescription }: Props) {
  return (
    <header className="flex items-center gap-[1.5vw] px-[2vw] py-[1.4vh]">
      <MosqueLogo className="h-[clamp(48px,5.5vw,96px)] w-[clamp(48px,5.5vw,96px)] shrink-0 text-gold" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[clamp(1.6rem,3vw,3.6rem)] leading-tight tracking-wide text-foreground">
          {mosqueName || APP_CONFIG.mosqueName}
        </h1>
        <p className="mt-[0.5vh] truncate text-[clamp(0.85rem,1.15vw,1.4rem)] text-muted-foreground">
          {mosqueDescription}
        </p>
      </div>
      <div className="hidden text-right lg:block">
        <p className="flex items-center justify-end gap-2 text-[clamp(0.85rem,1.05vw,1.3rem)] font-semibold text-teal">
          <MapPin className="h-[1.1em] w-[1.1em]" /> {locationLabel}
        </p>
        <p className="text-[clamp(0.95rem,1.3vw,1.6rem)] font-semibold">{now ? formatGregorian(now) : "\u00a0"}</p>
        <p className="text-[clamp(0.85rem,1.1vw,1.35rem)] text-gold">{now ? formatHijri(now) : "\u00a0"}</p>
      </div>
      <div className="flex gap-[0.6vw]">
        <button className="tv-btn" onClick={onToggleFullscreen} aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}>
          {isFullscreen ? <Minimize className="h-1/2 w-1/2" /> : <Maximize className="h-1/2 w-1/2" />}
        </button>
        <button className="tv-btn" onClick={onOpenSettings} aria-label="Pengaturan">
          <Settings className="h-1/2 w-1/2" />
        </button>
      </div>
    </header>
  );
}
