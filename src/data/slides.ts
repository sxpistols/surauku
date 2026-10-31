import s1 from "@/assets/slide-1.jpg";
import s2 from "@/assets/slide-2.jpg";
import s3 from "@/assets/slide-3.jpg";
import s4 from "@/assets/slide-4.jpg";
import s5 from "@/assets/slide-5.jpg";
import friday from "@/assets/slide-friday.jpg";

export interface Slide {
  src: string;
  title: string;
  caption: string;
  friday?: boolean;
}

// Ganti file di src/assets/ atau isi `src` dengan URL gambar lain.
export const SLIDES: Slide[] = [
  { src: s1, title: "Masjidil Haram", caption: "Makkah Al-Mukarramah" },
  { src: s2, title: "Masjid Nabawi", caption: "Madinah Al-Munawwarah" },
  { src: s3, title: "Rumah Allah", caption: "Interior masjid" },
  { src: s4, title: "Senja di Masjid", caption: "Waktu Maghrib menjelang" },
  { src: s5, title: "Ornamen Islami", caption: "Keindahan geometri arsitektur" },
];

export const FRIDAY_SLIDE: Slide = { src: friday, title: "Shalat Jumat", caption: "Masjid Ar-Razqa", friday: true };
