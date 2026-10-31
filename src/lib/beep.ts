// Bunyi "bip" untuk detik-detik akhir countdown iqamah (Web Audio, tanpa file audio).
let ctx: AudioContext | null = null;

/** Browser/TV hanya mengizinkan suara setelah interaksi pertama; panggil saat pointerdown/keydown. */
export function unlockBeep() {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
}

export function beep(freq = 880, durationSec = 0.15) {
  if (!ctx || ctx.state !== "running") return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationSec);
}

/** Bip hanya pada 3 detik terakhir countdown (sisa 3, 2, 1 detik). */
export const shouldBeep = (remainingSec: number) => remainingSec >= 1 && remainingSec <= 3;
