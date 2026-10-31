import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Slide } from "@/data/slides";
import { cn } from "@/lib/utils";
import { HADITHS } from "@/data/hadiths";
import { Button } from "@/components/ui/button";
import type { FridayOfficials } from "@/lib/friday";

interface Props {
  slides: Slide[];
  index: number;
  onIndex: (i: number) => void;
  autoplay: boolean;
  intervalSec: number;
  fridayOfficials: FridayOfficials;
}

export function Slideshow({ slides, index, onIndex, autoplay, intervalSec, fridayOfficials }: Props) {
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const n = slides.length;
  const currentIndex = n ? index % n : 0;

  useEffect(() => {
    if (!autoplay || n === 0) return;
    const id = setTimeout(() => onIndex((currentIndex + 1) % n), intervalSec * 1000);
    return () => clearTimeout(id);
  }, [autoplay, intervalSec, currentIndex, n, onIndex]);

  const s = slides[currentIndex];
  const hadith = HADITHS[currentIndex % HADITHS.length];
  if (!s) return null;
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[var(--radius)] border bg-navy-panel" style={{ backgroundImage: "var(--pattern)" }}>
      {slides.map((sl, i) =>
        failed[i] ? null : (
          <img
            key={sl.src}
            src={sl.src}
            alt={sl.title}
            width={1600}
            height={1024}
            loading={i === 0 ? "eager" : "lazy"}
            onError={() => setFailed((f) => ({ ...f, [i]: true }))}
            className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 motion-reduce:transition-none", i === currentIndex ? "opacity-100" : "opacity-0")}
          />
        ),
      )}
      <div className="slide-overlay absolute inset-0 flex flex-col justify-between px-5 py-4 lg:px-8 lg:py-6">
        <div className="my-auto min-h-0 py-2 text-center" key={s.src}>
          {s.friday ? (
            <div className="space-y-4 lg:space-y-6">
              <h2 className="font-display text-3xl text-gold lg:text-5xl">Shalat Jumat</h2>
              <div>
                <p className="text-base text-teal lg:text-xl">Khatib &amp; Imam</p>
                <p className="break-words text-2xl font-bold lg:text-4xl">{fridayOfficials.khatibImam}</p>
              </div>
              <div>
                <p className="text-base text-teal lg:text-xl">Muadzin</p>
                <p className="break-words text-2xl font-bold lg:text-4xl">{fridayOfficials.muadzin}</p>
              </div>
            </div>
          ) : hadith ? (
            <div className="space-y-4 lg:space-y-6">
              <p dir="rtl" lang="ar" className="font-arabic text-3xl leading-relaxed lg:text-[42px] lg:leading-relaxed">{hadith.arabic}</p>
              <p className="text-xl font-semibold leading-relaxed lg:text-[28px]">“{hadith.text}”</p>
              <p className="text-sm text-teal lg:text-lg">{hadith.source}</p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-lg lg:text-2xl">{s.friday ? s.caption : s.title}</p>
            {!s.friday && <p className="text-sm text-muted-foreground lg:text-base">{s.caption}</p>}
          </div>
          <div className="flex items-center gap-[0.8vw]">
            <Button variant="ghost" className="tv-btn" onClick={() => onIndex((currentIndex - 1 + n) % n)} aria-label="Slide sebelumnya">
              <ChevronLeft className="h-1/2 w-1/2" />
            </Button>
            <span className="min-w-[5ch] text-center text-[clamp(1rem,1.4vw,1.75rem)] font-bold tabular-nums">
              <span className="text-gold">{String(currentIndex + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </span>
            <Button variant="ghost" className="tv-btn" onClick={() => onIndex((currentIndex + 1) % n)} aria-label="Slide berikutnya">
              <ChevronRight className="h-1/2 w-1/2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
