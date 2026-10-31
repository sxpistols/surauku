import { z } from "zod";

export interface RawTimes {
  subuh: string;
  terbit: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

/**
 * Proxy server-side jadwal shalat. Token SIHAT tidak pernah dikirim ke browser.
 * Urutan: SIHAT Kemenag (jika SIHAT_API_TOKEN & SIHAT_API_URL ada) -> myQuran (sumber Bimas Islam).
 */
export async function fetchPrayerTimes(input: unknown): Promise<{ source: string; times: RawTimes }> {
  const data = z.object({ cityId: z.string().regex(/^\d+$/), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), city: z.string().max(60) }).parse(input);
  const [year, month, day] = data.date.split("-");
  const response = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${data.cityId}/${year}/${month}/${day}`);
  if (!response.ok) throw new Error("Jadwal shalat tidak tersedia");
  const json: any = await response.json();
  const times = json?.data?.jadwal;
  if (!times?.subuh) throw new Error("Format jadwal tidak valid");
  return {
    source: "Bimas Islam Kemenag (myQuran)",
    times: { subuh: times.subuh, terbit: times.terbit, dzuhur: times.dzuhur, ashar: times.ashar, maghrib: times.maghrib, isya: times.isya },
  };
}
