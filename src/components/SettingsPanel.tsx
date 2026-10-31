import { RefreshCw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { Settings } from "@/services/storage";
import { DEFAULT_IQAMAH_OFFSETS, type IqamahOffsets } from "@/config/app";
import type { ScheduleStatus } from "@/hooks/usePrayerSchedule";
import { Button } from "@/components/ui/button";
import { fridayDeadline } from "@/lib/friday";

export const CITY_OPTIONS = [
  { id: "1501", name: "Bantul" },
  { id: "1504", name: "Sleman" },
  { id: "1505", name: "Kota Yogyakarta" },
  { id: "1503", name: "Kulon Progo" },
  { id: "1502", name: "Gunungkidul" },
];

const OFFSET_LABELS: Record<keyof IqamahOffsets, string> = {
  subuh: "Subuh",
  dzuhur: "Dzuhur",
  ashar: "Ashar",
  maghrib: "Maghrib",
  isya: "Isya",
};

const STATUS_LABEL: Record<ScheduleStatus, string> = {
  loading: "Sedang memuat",
  online: "Terhubung",
  offline: "Offline — memakai jadwal tersimpan",
  error: "Tidak terhubung, belum ada jadwal tersimpan",
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  settings: Settings;
  onChange: (s: Settings) => void;
  status: ScheduleStatus;
  source: string | null;
  onRefresh: () => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-4 border-b border-border/60 py-2 text-lg">
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputCls = "h-12 rounded-md border bg-secondary px-3 text-lg text-foreground";

export function SettingsPanel({ open, onOpenChange, settings, onChange, status, source, onRefresh }: Props) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  const setOfficial = (key: "khatibImam" | "muadzin", value: string) => {
    const officials = { ...settings.fridayOfficials, [key]: value };
    set({ fridayOfficials: { ...officials, expiresAt: officials.khatibImam || officials.muadzin ? fridayDeadline(new Date()) : null } });
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l bg-popover sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-display text-3xl">Pengaturan</SheetTitle>
          <SheetDescription>Tersimpan otomatis di perangkat ini.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          <section>
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-widest text-gold">Identitas Masjid</h3>
            <label className="mt-3 block space-y-2 text-lg">
              <span>Nama masjid</span>
              <input className={`${inputCls} w-full`} maxLength={80} value={settings.mosqueName} onChange={(e) => set({ mosqueName: e.target.value })} />
            </label>
            <label className="mt-3 block space-y-2 text-lg">
              <span>Deskripsi (di bawah nama)</span>
              <input className={`${inputCls} w-full`} maxLength={140} value={settings.mosqueDescription} onChange={(e) => set({ mosqueDescription: e.target.value })} />
            </label>
          </section>

          <section>
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-widest text-gold">Tampilan</h3>
            <Row label="Slideshow otomatis">
              <Switch checked={settings.slideshowEnabled} onCheckedChange={(v) => set({ slideshowEnabled: v })} />
            </Row>
            <Row label="Interval slideshow (detik)">
              <input
                type="number" min={3} max={120} className={`${inputCls} w-24`}
                value={settings.slideIntervalSec}
                onChange={(e) => set({ slideIntervalSec: Math.max(3, Math.min(120, Number(e.target.value) || 10)) })}
              />
            </Row>
            <Row label="Running text aktif">
              <Switch checked={settings.marqueeEnabled} onCheckedChange={(v) => set({ marqueeEnabled: v })} />
            </Row>
            <Row label="Running text berjalan">
              <Switch checked={!settings.marqueePaused} onCheckedChange={(v) => set({ marqueePaused: !v })} />
            </Row>
          </section>

          <section>
            <h3 className="mb-1 text-sm font-semibold uppercase text-gold">Petugas Shalat Jumat</h3>
            <label className="mt-3 block space-y-2 text-lg">
              <span>Khatib &amp; Imam</span>
              <input className={`${inputCls} w-full`} maxLength={80} value={settings.fridayOfficials.khatibImam} onChange={(e) => setOfficial("khatibImam", e.target.value)} />
            </label>
            <label className="mt-3 block space-y-2 text-lg">
              <span>Muadzin</span>
              <input className={`${inputCls} w-full`} maxLength={80} value={settings.fridayOfficials.muadzin} onChange={(e) => setOfficial("muadzin", e.target.value)} />
            </label>
            <p className="mt-3 text-sm text-muted-foreground">Kamis setelah Isya – Jumat 12.00 WIB</p>
          </section>

          <section>
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-widest text-gold">Offset iqamah (menit)</h3>
            {(Object.keys(OFFSET_LABELS) as (keyof IqamahOffsets)[]).map((k) => (
              <Row key={k} label={OFFSET_LABELS[k]}>
                <input
                  type="number" min={0} max={60} className={`${inputCls} w-24`}
                  value={settings.offsets[k]}
                  onChange={(e) =>
                    set({ offsets: { ...settings.offsets, [k]: Math.max(0, Math.min(60, Number(e.target.value) || 0)) } })
                  }
                />
              </Row>
            ))}
            <Button variant="link" className="mt-3 h-auto whitespace-normal p-0 text-left text-base text-teal" onClick={() => set({ offsets: { ...DEFAULT_IQAMAH_OFFSETS } })}>
              Kembalikan ke bawaan (Subuh 20, lainnya 12)
            </Button>
          </section>

          <section>
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-widest text-gold">Jadwal</h3>
            <Row label="Kota/kabupaten">
              <select
                className={inputCls}
                value={settings.cityId}
                onChange={(e) => {
                  const c = CITY_OPTIONS.find((x) => x.id === e.target.value);
                  if (c) set({ cityId: c.id, city: c.name });
                }}
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Row>
            <div className="py-3 text-lg">
              <p>Status: <span className={status === "online" ? "text-teal" : "text-gold"}>{STATUS_LABEL[status]}</span></p>
              {source && <p className="text-base text-muted-foreground">Sumber: {source}</p>}
            </div>
            <Button
              onClick={onRefresh}
              className="inline-flex h-14 items-center gap-3 rounded-md bg-gold px-6 text-lg font-semibold text-gold-foreground hover:opacity-90"
            >
              <RefreshCw className="h-5 w-5" /> Perbarui jadwal sekarang
            </Button>
          </section>

          <p className="text-sm text-muted-foreground">
            Pintasan keyboard/remote: F = layar penuh, S = pengaturan, ← → = ganti slide, Spasi = jeda running text.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
