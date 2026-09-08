-- Skema database web app komunitas Dzun Nuun.
-- Jalankan sekali lewat SQL Editor di dashboard Supabase, lalu jalankan seed.sql.

create extension if not exists "pgcrypto";

create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text,
  tagline text,
  description text,
  header_image_url text,
  target_amount bigint not null default 0,
  package_price bigint not null default 15000,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false,
  fund_usage_summary text,
  created_at timestamptz not null default now()
);

-- Hanya satu season boleh aktif pada satu waktu.
create unique index if not exists seasons_satu_aktif on seasons (is_active) where is_active;

create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons (id) on delete cascade,
  code text not null unique,
  donor_name text not null,
  whatsapp text not null,
  package_count integer not null check (package_count > 0),
  base_amount bigint not null,
  unique_suffix integer not null check (unique_suffix between 100 and 999),
  total_amount bigint not null,
  is_anonymous boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create index if not exists donations_season_status on donations (season_id, status);
create index if not exists donations_created on donations (created_at desc);

-- Nominal transfer dipakai untuk mencocokkan pembayaran, jadi dua donasi pending
-- di season yang sama tidak boleh punya nominal identik.
create unique index if not exists donations_pending_nominal_unik
  on donations (season_id, total_amount) where status = 'pending';

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  poster_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location_name text,
  location_map_url text,
  is_paid boolean not null default false,
  price bigint not null default 0,
  capacity integer,
  registration_deadline timestamptz,
  is_recurring_note text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists events_starts_at on events (starts_at);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  name text not null,
  whatsapp text not null,
  quantity integer not null default 1 check (quantity > 0),
  code text not null unique,
  total_amount bigint not null default 0,
  unique_suffix integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'checked_in', 'cancelled')),
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists registrations_event on registrations (event_id, status);

create unique index if not exists registrations_pending_nominal_unik
  on registrations (event_id, total_amount) where status = 'pending' and total_amount > 0;

create table if not exists updates (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons (id) on delete set null,
  -- Penanda tipe kegiatan yang diisi bebas pengurus, misalnya "Tahsin Pertemuan 13".
  activity_label text,
  -- Kolom lama dari hitungan hari, dipertahankan supaya data lama tidak hilang.
  day_number integer,
  title text not null,
  body text not null,
  image_url text,
  published_at timestamptz not null default now(),
  is_published boolean not null default true
);

create index if not exists updates_published on updates (is_published, published_at desc);

create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons (id) on delete cascade,
  name text not null,
  logo_url text,
  link_url text,
  tier text not null default 'pendukung' check (tier in ('utama', 'pendukung')),
  sort_order integer not null default 0
);

create index if not exists sponsors_season on sponsors (season_id, sort_order);

-- Foto latar hero di beranda. Sengaja tabel sendiri supaya pengurus memilih
-- foto mana yang tampil, bukan dipungut dari poster acara atau foto kabar.
create table if not exists hero_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists hero_photos_urutan on hero_photos (is_active, sort_order);

create table if not exists settings (
  id text primary key default 'settings',
  qris_image_url text,
  admin_whatsapp text not null default '628000000000',
  whatsapp_channel_url text,
  instagram_url text,
  tiktok_url text,
  youtube_url text,
  about_markdown text not null default '',
  constraint settings_satu_baris check (id = 'settings')
);

-- RLS menyala di semua tabel dan tidak ada policy publik sama sekali.
-- Seluruh baca dan tulis lewat route server yang memakai service role key,
-- yang memang melewati RLS. Anon key tidak bisa menyentuh data ini.
alter table seasons enable row level security;
alter table donations enable row level security;
alter table events enable row level security;
alter table registrations enable row level security;
alter table updates enable row level security;
alter table sponsors enable row level security;
alter table hero_photos enable row level security;
alter table settings enable row level security;

-- Bucket penyimpanan gambar. Publik untuk dibaca karena isinya foto header,
-- poster, logo sponsor, dan QRIS yang memang tampil di halaman publik.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media boleh dibaca siapa saja" on storage.objects;
create policy "media boleh dibaca siapa saja"
  on storage.objects for select
  using (bucket_id = 'media');
