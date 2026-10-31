import { describe, it, expect } from "vitest";
import { shouldBeep } from "@/lib/beep";

describe("iqamah beep rule", () => {
  it("beeps on each of the last 3 seconds", () => {
    expect(shouldBeep(3)).toBe(true);
    expect(shouldBeep(2)).toBe(true);
    expect(shouldBeep(1)).toBe(true);
  });
  it("does not beep before the last 3 seconds or after countdown ends", () => {
    expect(shouldBeep(4)).toBe(false);
    expect(shouldBeep(0)).toBe(false);
  });
});
