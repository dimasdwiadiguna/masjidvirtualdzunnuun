-- Migrasi 03: kartu loyalitas, post sosmed, kuis, dan polling.
--
-- Jalankan sekali di SQL Editor Supabase. Aman dijalankan berulang, dan tidak
-- menyentuh data yang sudah ada.

-- Kehadiran dihitung per nomor WhatsApp dari tiket berstatus checked_in.
-- Tanpa indeks ini, tiap pembukaan kartu memindai seluruh tabel registrations.
create index if not exists registrations_whatsapp
  on registrations (whatsapp) where status = 'checked_in';

-- Tautan kartu loyalitas. Token acak, bukan nomor WhatsApp yang disandikan,
-- supaya nomor tidak pernah muncul di alamat halaman publik.
create table if not exists loyalty_links (
  token text primary key,
  whatsapp text not null,
  created_at timestamptz not null default now()
);
create index if not exists loyalty_links_whatsapp on loyalty_links (whatsapp);

-- Post Instagram dan TikTok yang dipilih pengurus untuk ditampilkan.
create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'tiktok')),
  post_url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists social_posts_urutan on social_posts (is_active, sort_order);

-- Pemenang kuis. Batas unik di bawah yang menegakkan satu kemenangan per nomor
-- per hari, bukan pemeriksaan di aplikasi.
create table if not exists quiz_winners (
  id uuid primary key default gen_random_uuid(),
  whatsapp text not null,
  nama text not null,
  won_on date not null default ((now() at time zone 'Asia/Jakarta')::date),
  created_at timestamptz not null default now(),
  unique (whatsapp, won_on)
);
create index if not exists quiz_winners_hari on quiz_winners (won_on);

-- Suara polling. Keunikan ditegakkan batas unik (poll_key, penanda), dengan
-- penanda berupa id acak di kuki perangkat. IP sengaja tidak dipakai sebagai
-- identitas karena satu masjid sering berbagi satu IP seluler.
create table if not exists poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_key text not null,
  pilihan integer not null,
  penanda text not null,
  created_at timestamptz not null default now(),
  unique (poll_key, penanda)
);
create index if not exists poll_votes_kunci on poll_votes (poll_key);

-- Kolom pengaturan untuk bagian interaksi di beranda.
alter table settings add column if not exists interaksi_mode text not null default 'mati';
alter table settings add column if not exists kuis_bank text not null default '';
alter table settings add column if not exists kuis_kuota_harian integer not null default 5;
alter table settings add column if not exists polling_pertanyaan text not null default '';
alter table settings add column if not exists polling_pilihan text not null default '';
alter table settings add column if not exists polling_kunci text not null default '';

alter table loyalty_links enable row level security;
alter table social_posts enable row level security;
alter table quiz_winners enable row level security;
alter table poll_votes enable row level security;
