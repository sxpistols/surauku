import { useLayoutEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Kecepatan dalam persen lebar layar per detik — stabil di semua resolusi. */
const SPEED_VW_PER_SEC = 9;

/**
 * Pesan berikutnya hanya dimulai setelah pesan sebelumnya selesai bergulir.
 */
export function AttentionTicker({ messages, paused, onTogglePause }: { messages: string[]; paused: boolean; onTogglePause: () => void }) {
  const [index, setIndex] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const message = messages[index];

  useLayoutEffect(() => {
    setDuration(null);
    const el = textRef.current;
    if (!el) return;
    const vw = window.innerWidth / 100;
    setDuration(el.scrollWidth / (SPEED_VW_PER_SEC * vw));
  }, [index, messages]);

  if (!message) return null;

  return (
    <footer className="flex items-stretch border-t border-gold/40 bg-navy-panel">
      <div className="flex w-[19%] shrink-0 items-center justify-center bg-gold px-3 py-2 text-center font-display text-lg leading-tight text-gold-foreground lg:text-2xl">Perhatian Bagi Jamaah</div>
      <div className="relative flex-1 overflow-hidden">
        <span
          key={index}
          ref={textRef}
          onAnimationEnd={() => setIndex((i) => (i + 1) % messages.length)}
          className={duration ? "animate-marquee inline-block whitespace-nowrap py-[1.4vh] pl-[100%]" : "invisible inline-block whitespace-nowrap py-[1.4vh] pl-[100%]"}
          style={{ animationDuration: duration ? `${duration}s` : undefined, animationPlayState: paused ? "paused" : "running" }}
        >
          <span className="text-[clamp(1.2rem,2.3vw,2.9rem)] font-semibold">{message}</span>
        </span>
      </div>
      <Button variant="ghost"
        onClick={onTogglePause}
        aria-label={paused ? "Jalankan running text" : "Jeda running text"}
        className="h-auto shrink-0 rounded-none px-[1vw] hover:text-gold"
      >
        {paused ? <Play className="h-[clamp(24px,2vw,40px)] w-[clamp(24px,2vw,40px)]" /> : <Pause className="h-[clamp(24px,2vw,40px)] w-[clamp(24px,2vw,40px)]" />}
      </Button>
    </footer>
  );
}
