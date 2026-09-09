import type { Season, Settings } from "./types";

export const PLACEHOLDER_WA = "628000000000";

export const SEED_SETTINGS: Settings = {
  id: "settings",
  qris_image_url: null,
  admin_whatsapp: PLACEHOLDER_WA,
  whatsapp_channel_url: null,
  instagram_url: "https://www.instagram.com/dzunnuun.id",
  tiktok_url: null,
  youtube_url: null,
  about_markdown: [
    "Dzun Nuun adalah komunitas pemuda pemudi yang ingin masjid jadi fun dan berdampak lagi.",
    "",
    "Kami melayani Masjid Fathul Ummah. Yang kami kerjakan sederhana: menyiapkan kegiatan yang bikin anak muda betah singgah, lalu merawat orang yang datang.",
    "",
    "Teman Beriman dan Bertumbuh.",
  ].join("\n"),
  interaksi_mode: "mati",
  kuis_bank: "",
  kuis_kuota_harian: 5,
  polling_pertanyaan: "",
  polling_pilihan: "",
  polling_kunci: "",
  wa_templat: {},
};

export const SEED_SEASON: Season = {
  id: "season-1",
  slug: "season-1",
  title: null,
  tagline: "Merangkul jamaah yang singgah ke Masjid Fathul Ummah",
  description: [
    "Setiap jamaah yang singgah ke masjid perlu disambut: tempat wudu yang layak, air minum, dan kegiatan yang membuat mereka kembali.",
    "",
    "Satu paket bernilai Rp 15.000. Nilainya kami pakai untuk merangkul satu jamaah yang singgah, agar amal ibadahnya mengalir.",
    "",
    "Patungan ini dikelola tiga relawan. Setiap pemasukan yang sudah kami terima dicatat di halaman ini, dan penggunaannya dilaporkan lewat Laporan Kegiatan.",
  ].join("\n"),
  header_image_url: null,
  target_amount: 7_000_000,
  package_price: 15_000,
  start_date: "2026-10-01",
  end_date: "2026-12-31",
  is_active: true,
  fund_usage_summary: null,
  created_at: "2026-09-01T00:00:00.000Z",
};
