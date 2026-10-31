import type { IqamahState } from "@/hooks/useIqamahCountdown";

const pad = (n: number) => String(n).padStart(2, "0");

// Ukuran teks mengikuti tinggi/lebar kotak (cqmin) agar semua isi selalu di dalam frame.
export function IqamahCountdown({ state }: { state: IqamahState }) {
  const m = Math.floor(state.remainingSec / 60);
  const s = state.remainingSec % 60;
  return (
    <div
      role="timer"
      aria-live="polite"
      className="absolute inset-0 overflow-hidden rounded-[var(--radius)] border border-gold/50 bg-navy-panel [container-type:size]"
      style={{ backgroundImage: "var(--pattern)" }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-[2cqh] px-[4cqw] py-[4cqh] text-center">
        <p className="text-[5cqmin] font-semibold leading-none tracking-[0.4em] text-teal">SECONDS TO</p>
        <p className="font-display text-[11cqmin] leading-none tracking-[0.15em]">{state.prayer.name.toUpperCase()}</p>
        <p className="font-bold leading-none tabular-nums text-gold text-[min(30cqh,22cqw)]">
          {pad(m)}:{pad(s)}
        </p>
        <p className="text-[6cqmin] font-semibold leading-none tracking-[0.4em]">IQAMAH</p>
        <div className="gold-rule w-1/2" />
        <p className="text-[5.5cqmin] leading-tight text-foreground">Mohon merapatkan dan meluruskan shaf</p>
      </div>
    </div>
  );
}
