import { createFileRoute } from "@tanstack/react-router";
import { MosqueBoard } from "@/components/MosqueBoard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Masjid Ar-Razqa — Jadwal Shalat & Informasi" },
      { name: "description", content: "Papan informasi digital Masjid Ar-Razqa, DM Village Sudimoro, Sewon, Bantul: jadwal shalat, iqamah, dan hadits." },
      { property: "og:title", content: "Masjid Ar-Razqa — Jadwal Shalat & Informasi" },
      { property: "og:description", content: "Jadwal shalat Bantul, hitung mundur iqamah, dan hadits pilihan untuk jamaah Masjid Ar-Razqa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MosqueBoard,
});
