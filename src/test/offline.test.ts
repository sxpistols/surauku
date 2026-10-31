import { describe, expect, it } from "vitest";
import { refuseOfflineWorker } from "@/lib/offline";

describe("offline only on published origins", () => {
  it("permits published and custom domains", () => {
    expect(refuseOfflineWorker("masjidarrazqadmvs.lovable.app", true, false, false)).toBe(false);
    expect(refuseOfflineWorker("preview-v2--shop.example.com", true, false, false)).toBe(false);
  });
  it("refuses development, iframes, and the kill switch", () => {
    expect(refuseOfflineWorker("localhost", false, false, false)).toBe(true);
    expect(refuseOfflineWorker("masjid.example.com", true, true, false)).toBe(true);
    expect(refuseOfflineWorker("masjid.example.com", true, false, true)).toBe(true);
  });
  it("refuses all preview families", () => {
    for (const host of ["id-preview--556d9f94-2058-4d82-8889-3d5d2718e292.lovable.app", "preview-2--abc.gpt-eng.com", "preview--abc.gptengineer.run", "project--556d9f94-2058-4d82-8889-3d5d2718e292-dev.lovable.app", "foo.lovableproject.com", "foo.lovableproject-dev.com", "beta.lovable.dev"]) {
      expect(refuseOfflineWorker(host, true, false, false)).toBe(true);
    }
  });
});