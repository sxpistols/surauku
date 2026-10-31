import { describe, expect, it } from "vitest";
import { clearExpiredFriday, fridayDeadline, showFridaySlide } from "@/lib/friday";
import { storage } from "@/services/storage";

const at = (value: string) => new Date(`${value}+07:00`);
const officials = { khatibImam: "Ustadz Ahmad", muadzin: "Bapak Ali", expiresAt: at("2026-10-30T12:00:00").getTime() };
const count = (date: string, names = officials) => showFridaySlide(at(date), "18:48", names) ? 6 : 5;

describe("Friday board rules in WIB", () => {
  it("shows six slides from Thursday Isya, not before", () => {
    expect(count("2026-10-29T18:47:59")).toBe(5);
    expect(count("2026-10-29T18:48:00")).toBe(6);
    expect(count("2026-10-29T23:59:59")).toBe(6);
  });
  it("shows six Friday morning and removes the sixth exactly at noon", () => {
    expect(count("2026-10-30T00:00:00")).toBe(6);
    expect(count("2026-10-30T11:59:59")).toBe(6);
    expect(count("2026-10-30T12:00:00")).toBe(5);
  });
  it("requires both officials", () => {
    expect(count("2026-10-30T10:00:00", { ...officials, muadzin: " " })).toBe(5);
    expect(count("2026-10-30T10:00:00", { ...officials, khatibImam: "" })).toBe(5);
  });
  it("never shows Friday information outside its window even with names", () => {
    expect(count("2026-10-28T20:00:00")).toBe(5);
    expect(count("2026-10-31T10:00:00")).toBe(5);
  });
  it("empties both names at noon and after restarting later", () => {
    expect(clearExpiredFriday(officials, at("2026-10-30T11:59:59"))).toBe(officials);
    expect(clearExpiredFriday(officials, at("2026-10-30T12:00:00"))).toEqual({ khatibImam: "", muadzin: "", expiresAt: null });
    expect(clearExpiredFriday(officials, at("2026-11-05T20:00:00"))).toEqual({ khatibImam: "", muadzin: "", expiresAt: null });
  });
  it("new names entered after noon expire the following Friday", () => {
    expect(fridayDeadline(at("2026-10-30T12:00:00"))).toBe(at("2026-11-06T12:00:00").getTime());
    expect(fridayDeadline(at("2026-10-29T20:00:00"))).toBe(at("2026-10-30T12:00:00").getTime());
  });
  it("returns the last stored schedule without network access", () => {
    const last = { date: "2026-10-29", city: "Bantul", source: "myQuran", fetchedAt: 1, times: { subuh: "04:00", terbit: "05:10", dzuhur: "11:26", ashar: "14:38", maghrib: "17:36", isya: "18:48" } };
    storage.saveSchedule(last);
    expect(storage.loadSchedule()).toEqual(last);
    localStorage.clear();
  });
});