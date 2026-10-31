import { useEffect, useState } from "react";

/** Waktu sekarang, diperbarui tiap detik. null sebelum hidrasi (hindari mismatch SSR). */
export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(new Date());
      t = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    t = setTimeout(tick, 1000 - (Date.now() % 1000));
    return () => clearTimeout(t);
  }, []);
  return now;
}
