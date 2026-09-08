-- Migrasi 02: tabel pengumuman untuk carousel gambar di beranda.
--
-- Jalankan sekali di SQL Editor Supabase. Aman dijalankan berulang, dan tidak
-- menyentuh data yang sudah ada.
--
-- Pengumuman berbeda dari Laporan Kegiatan: laporan menceritakan kegiatan yang
-- sudah terlaksana, pengumuman memberi tahu sesuatu dan bentuk utamanya gambar,
-- misalnya "Aturan Masjid Ngopi-Ngopi" atau ucapan hari besar.

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  image_url text not null,
  body text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists announcements_urutan on announcements (is_active, sort_order);

alter table announcements enable row level security;
