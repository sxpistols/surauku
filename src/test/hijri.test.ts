import { describe, it, expect } from "vitest";
import { formatHijri } from "@/lib/time";
describe("hijri", () => {
  it("31 Okt 2026 = Jumadil Awal 1448 H", () => {
    expect(formatHijri(new Date("2026-10-31T07:00:00Z"))).toMatch(/^2[01] Jumadil Awal 1448 H$/);
  });
});
