-- Migrasi 05: nomor jamaah untuk alamat /jamaah/[nomor].
--
-- Jalankan sekali di SQL Editor Supabase. Aman dijalankan berulang, dan tidak
-- menyentuh data yang sudah ada.
--
-- Nomor jamaah adalah 4 angka yang bisa dibacakan di depan pintu dan diketik
-- ulang jamaah di bilah alamat. Berbeda dari token tautan yang panjang dan
-- rahasia, nomor ini memang identitas yang boleh diketahui orangnya sendiri.

alter table loyalty_links add column if not exists nomor text;

-- Satu nomor hanya boleh milik satu orang. Kodenya sudah memilih nomor yang
-- belum terpakai, tetapi dua pengurus bisa menekan tombol pada saat yang sama,
-- jadi aturannya ditegakkan database juga. Baris lama yang nomornya masih
-- kosong tidak ikut dibatasi.
create unique index if not exists loyalty_links_nomor
  on loyalty_links (nomor) where nomor is not null;
