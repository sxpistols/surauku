import { describe, it, expect } from "vitest";
import { buildEntries } from "@/services/prayerApi";
import { findIqamahWindow } from "@/hooks/useIqamahCountdown";
import { DEFAULT_IQAMAH_OFFSETS } from "@/config/app";

const times = { subuh: "03:54", terbit: "05:08", dzuhur: "11:26", ashar: "14:38", maghrib: "17:36", isya: "18:48" };
const entries = buildEntries(times, DEFAULT_IQAMAH_OFFSETS);
const at = (hh: number, mm: number, ss = 0) => hh * 3600 + mm * 60 + ss;

describe("iqamah rules", () => {
  it("Subuh iqamah is 20 minutes after adzan", () => {
    expect(entries.find((e) => e.key === "subuh")!.iqamah).toBe("04:14");
  });
  it("Dzuhur, Ashar, Maghrib, Isya iqamah are 12 minutes after adzan", () => {
    expect(entries.find((e) => e.key === "dzuhur")!.iqamah).toBe("11:38");
    expect(entries.find((e) => e.key === "ashar")!.iqamah).toBe("14:50");
    expect(entries.find((e) => e.key === "maghrib")!.iqamah).toBe("17:48");
    expect(entries.find((e) => e.key === "isya")!.iqamah).toBe("19:00");
  });
  it("Syuruq has no iqamah", () => {
    expect(entries.find((e) => e.key === "syuruq")!.iqamah).toBeNull();
  });
  it("Subuh countdown starts at adzan with 20 minutes", () => {
    const w = findIqamahWindow(entries, at(3, 54));
    expect(w?.prayer.key).toBe("subuh");
    expect(w?.remainingSec).toBe(1200);
  });
  it("Maghrib countdown is 12 minutes and ends at iqamah", () => {
    expect(findIqamahWindow(entries, at(17, 36))?.remainingSec).toBe(720);
    expect(findIqamahWindow(entries, at(17, 48))).toBeNull();
  });
  it("no countdown before adzan", () => {
    expect(findIqamahWindow(entries, at(11, 25, 59))).toBeNull();
  });
});
