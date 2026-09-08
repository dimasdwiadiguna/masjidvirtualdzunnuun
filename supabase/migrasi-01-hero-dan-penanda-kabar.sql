-- Migrasi untuk database yang sudah berisi data.
-- Jalankan sekali di SQL Editor Supabase. Aman diulang.
--
-- Isinya dua hal:
-- 1. Tabel foto hero, sumber foto latar di beranda.
-- 2. Kolom penanda kegiatan di Kabar Aksi, pengganti hitungan hari.

create table if not exists hero_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists hero_photos_urutan on hero_photos (is_active, sort_order);

alter table hero_photos enable row level security;

alter table updates add column if not exists activity_label text;
