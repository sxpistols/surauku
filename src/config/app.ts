// Konfigurasi utama papan informasi. Ubah nilai di sini untuk lokasi/masjid lain.
export const APP_CONFIG = {
  mosqueName: "Masjid Ar-Razqa",
  mosqueAddress: "Perumahan DM Village Sudimoro, Sewon, Bantul - Yogyakarta",
  locationLabel: "Bantul, DI Yogyakarta",
  city: "Bantul",
  /** ID kota di API publik myQuran (sumber Bimas Islam Kemenag). Bantul = 1501 */
  cityId: "1501",
  timeZone: "Asia/Jakarta",
  timeZoneLabel: "WIB",
  /** Refresh jadwal berkala (ms) */
  refreshIntervalMs: 30 * 60 * 1000,
  slideIntervalSec: 10,
  fridayResetHour: 12,
  fridayOfficials: { khatibImam: "", muadzin: "", expiresAt: null as number | null },
  /** Sumber API (urutan prioritas): sihat (server, butuh token) -> myquran (publik) -> cache */
  apiSources: ["sihat", "myquran"] as const,
};

export type PrayerKey = "subuh" | "syuruq" | "dzuhur" | "ashar" | "maghrib" | "isya";

export const DEFAULT_IQAMAH_OFFSETS: Record<Exclude<PrayerKey, "syuruq">, number> = {
  subuh: 20,
  dzuhur: 12,
  ashar: 12,
  maghrib: 12,
  isya: 12,
};

export type IqamahOffsets = typeof DEFAULT_IQAMAH_OFFSETS;
