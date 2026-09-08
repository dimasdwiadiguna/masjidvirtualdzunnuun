import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dzun Nuun, komunitas pemuda Masjid Fathul Ummah",
    short_name: "Dzun Nuun",
    description: "Patungan, acara, dan laporan kegiatan komunitas Dzun Nuun.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F3EA",
    theme_color: "#043A43",
    lang: "id",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
