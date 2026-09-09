-- Migrasi 04: templat pesan WhatsApp yang bisa disunting pengurus, dan donasi
-- yang dicatat manual dari panel pengurus.
--
-- Jalankan sekali di SQL Editor Supabase. Aman dijalankan berulang, dan tidak
-- menyentuh data yang sudah ada.

-- Kata-kata pesan WhatsApp yang disunting pengurus di menu Pesan WhatsApp.
-- Dipetakan dari id templat ke teksnya. Kunci yang tidak ada berarti templat
-- itu masih memakai teks bawaan yang tertulis di kode, jadi baris kosong '{}'
-- adalah keadaan awal yang benar, bukan data yang hilang.
alter table settings add column if not exists wa_templat jsonb not null default '{}'::jsonb;

-- Donasi yang dicatat pengurus (uang tunai, transfer yang nominalnya tidak
-- unik, atau titipan) tidak punya angka unik untuk dicocokkan, jadi angka
-- uniknya nol. Sebelumnya kolom ini mengharuskan 100 sampai 999, yang memang
-- benar untuk donasi yang datang dari formulir publik.
--
-- Nama constraint di bawah adalah nama bawaan Postgres untuk check yang
-- ditulis menempel pada kolomnya di schema.sql.
alter table donations drop constraint if exists donations_unique_suffix_check;
alter table donations add constraint donations_unique_suffix_check
  check (unique_suffix between 0 and 999);
