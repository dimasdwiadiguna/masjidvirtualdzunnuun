export type DonationStatus = "pending" | "verified" | "rejected";
export type RegistrationStatus = "pending" | "confirmed" | "checked_in" | "cancelled";
export type SponsorTier = "utama" | "pendukung";

export type Season = {
  id: string;
  slug: string;
  title: string | null;
  tagline: string | null;
  description: string | null;
  header_image_url: string | null;
  target_amount: number;
  package_price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  fund_usage_summary: string | null;
  created_at: string;
};

export type Donation = {
  id: string;
  season_id: string;
  code: string;
  donor_name: string;
  whatsapp: string;
  package_count: number;
  base_amount: number;
  unique_suffix: number;
  total_amount: number;
  is_anonymous: boolean;
  status: DonationStatus;
  admin_note: string | null;
  created_at: string;
  verified_at: string | null;
};

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  starts_at: string;
  ends_at: string | null;
  location_name: string | null;
  location_map_url: string | null;
  is_paid: boolean;
  price: number;
  capacity: number | null;
  registration_deadline: string | null;
  is_recurring_note: string | null;
  is_published: boolean;
  created_at: string;
};

export type Registration = {
  id: string;
  event_id: string;
  name: string;
  whatsapp: string;
  quantity: number;
  code: string;
  total_amount: number;
  unique_suffix: number;
  status: RegistrationStatus;
  checked_in_at: string | null;
  created_at: string;
};

export type Update = {
  id: string;
  season_id: string | null;
  /** Penanda tipe kegiatan yang diisi bebas pengurus, misalnya "Tahsin Pertemuan 13". */
  activity_label: string | null;
  /** Kolom lama dari hitungan hari. Masih ada di database, tidak lagi dipakai app. */
  day_number: number | null;
  title: string;
  body: string;
  image_url: string | null;
  published_at: string;
  is_published: boolean;
};

export type Sponsor = {
  id: string;
  season_id: string;
  name: string;
  logo_url: string | null;
  link_url: string | null;
  tier: SponsorTier;
  sort_order: number;
};

export type HeroPhoto = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

/**
 * Pengumuman berbentuk gambar untuk carousel beranda, misalnya "Aturan Masjid
 * Ngopi-Ngopi" atau ucapan hari besar. Berbeda dari Laporan Kegiatan: laporan
 * menceritakan kegiatan yang sudah terlaksana, pengumuman memberi tahu sesuatu
 * dan bentuk utamanya gambar.
 */
export type Announcement = {
  id: string;
  slug: string;
  title: string;
  image_url: string;
  /** Keterangan tambahan di halaman detail. Boleh kosong kalau gambarnya sudah cukup. */
  body: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type Settings = {
  id: string;
  qris_image_url: string | null;
  admin_whatsapp: string;
  whatsapp_channel_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  about_markdown: string;
};

export type SeasonProgress = {
  collected: number;
  packages: number;
  donors: number;
};

export type EventCapacityInfo = {
  taken: number;
  remaining: number | null;
};
