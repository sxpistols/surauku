import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "./Header";
import { PrayerSchedule } from "./PrayerSchedule";
import { DigitalClock } from "./DigitalClock";
import { Slideshow } from "./Slideshow";
import { IqamahCountdown } from "./IqamahCountdown";
import { AttentionTicker } from "./AttentionTicker";
import { SettingsPanel } from "./SettingsPanel";
import { useClock } from "@/hooks/useClock";
import { usePrayerSchedule } from "@/hooks/usePrayerSchedule";
import { useIqamahCountdown } from "@/hooks/useIqamahCountdown";
import { buildEntries, currentPrayer } from "@/services/prayerApi";
import { storage, DEFAULT_SETTINGS, type Settings } from "@/services/storage";
import { zonedParts } from "@/lib/time";
import { beep, shouldBeep, unlockBeep } from "@/lib/beep";
import { SLIDES, FRIDAY_SLIDE } from "@/data/slides";
import { ANNOUNCEMENTS } from "@/data/announcements";
import { clearExpiredFriday, showFridaySlide } from "@/lib/friday";

export function MosqueBoard() {
  const now = useClock();
  const parts = now ? zonedParts(now) : null;
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => setSettings(storage.loadSettings()), []);
  const updateSettings = useCallback((s: Settings) => {
    setSettings(s);
    storage.saveSettings(s);
  }, []);

  const { schedule, status, refresh } = usePrayerSchedule(settings.cityId, settings.city, parts?.date ?? null);

  useEffect(() => {
    if (!now) return;
    const cleared = clearExpiredFriday(settings.fridayOfficials, now);
    if (cleared !== settings.fridayOfficials) updateSettings({ ...settings, fridayOfficials: cleared });
  }, [now, settings, updateSettings]);

  const fridayVisible = now ? showFridaySlide(now, schedule?.times.isya ?? null, settings.fridayOfficials) : false;
  const slides = useMemo(() => fridayVisible ? [...SLIDES, FRIDAY_SLIDE] : SLIDES, [fridayVisible]);
  useEffect(() => { setSlide((i) => i % slides.length); }, [slides.length]);

  const entries = useMemo(() => (schedule ? buildEntries(schedule.times, settings.offsets) : []), [schedule, settings.offsets]);
  const secOfDay = parts?.secOfDay ?? null;
  const iqamah = useIqamahCountdown(entries, secOfDay);
  const active = secOfDay != null && entries.length ? currentPrayer(entries, Math.floor(secOfDay / 60)) : null;

  // Suara hanya bisa aktif setelah interaksi pertama (kebijakan browser/TV).
  useEffect(() => {
    const unlock = () => unlockBeep();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Bip di setiap detik dari 3 detik terakhir countdown iqamah.
  const prevRemaining = useRef<number | null>(null);
  useEffect(() => {
    const r = iqamah?.remainingSec ?? null;
    if (r != null && r !== prevRemaining.current && shouldBeep(r)) beep();
    prevRemaining.current = r;
  }, [iqamah]);

  const next = useMemo(() => {
    if (secOfDay == null || !entries.length) return null;
    const upcoming = entries.find((e) => e.minutes * 60 > secOfDay);
    const entry = upcoming ?? entries[0];
    if (!entry) return null;
    const inSec = upcoming ? entry.minutes * 60 - secOfDay : 86400 - secOfDay + entry.minutes * 60;
    return { entry, inSec };
  }, [entries, secOfDay]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (settingsOpen) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT") return;
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      else if (e.key === "s" || e.key === "S" || e.key === "ContextMenu") setSettingsOpen(true);
      else if (e.key === "ArrowRight") setSlide((i) => (i + 1) % slides.length);
      else if (e.key === "ArrowLeft") setSlide((i) => (i - 1 + slides.length) % slides.length);
      else if (e.key === " " && (e.target as HTMLElement)?.tagName !== "BUTTON") {
        e.preventDefault();
        updateSettings({ ...settings, marqueePaused: !settings.marqueePaused });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, toggleFullscreen, settings, updateSettings, slides.length]);

  const cityLabel = settings.city === "Bantul" ? "Bantul, DI Yogyakarta" : `${settings.city}, DI Yogyakarta`;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header
        now={now}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenSettings={() => setSettingsOpen(true)}
        locationLabel={cityLabel}
        mosqueName={settings.mosqueName}
        mosqueDescription={settings.mosqueDescription}
      />
      <div className="gold-rule mx-[2vw]" />

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-[1.4vw] px-[2vw] py-[1.6vh] md:grid-cols-[minmax(0,34fr)_minmax(0,66fr)]">
        <PrayerSchedule entries={entries} active={iqamah?.prayer.key ?? active} status={status} updatedAt={schedule?.fetchedAt ?? null} source={schedule?.source ?? null} scheduleDate={schedule?.date ?? null} today={parts?.date ?? null} />

        <section className="flex min-h-0 flex-col gap-[1.6vh]">
          <DigitalClock now={now} next={iqamah ? null : next} />
          <div className="relative min-h-[40vh] flex-1 md:min-h-0">
            {iqamah ? (
              <IqamahCountdown state={iqamah} />
            ) : (
              <Slideshow slides={slides} index={slide} onIndex={setSlide} autoplay={settings.slideshowEnabled} intervalSec={settings.slideIntervalSec} fridayOfficials={settings.fridayOfficials} />
            )}
          </div>
        </section>
      </main>

      {settings.marqueeEnabled && (
        <AttentionTicker
          messages={ANNOUNCEMENTS}
          paused={settings.marqueePaused}
          onTogglePause={() => updateSettings({ ...settings, marqueePaused: !settings.marqueePaused })}
        />
      )}

      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onChange={updateSettings}
        status={status}
        source={schedule?.source ?? null}
        onRefresh={() => void refresh()}
      />
    </div>
  );
}
