-- Migrasi 05: kode jamaah untuk alamat /jamaah/[kode].
--
-- Jalankan sekali di SQL Editor Supabase. Aman dijalankan berulang, dan tidak
-- menyentuh data kehadiran, donasi, atau acara.
--
-- Kode jamaah adalah 5 karakter berbentuk dua huruf lalu tiga angka, misalnya
-- KM472. Bisa dibacakan di depan pintu dan diketik ulang jamaah di bilah
-- alamat. Berbeda dari token tautan yang panjang dan rahasia, kode ini memang
-- identitas yang boleh diketahui orangnya sendiri.

alter table loyalty_links add column if not exists kode text;

-- Satu kode hanya boleh milik satu orang. Kodenya sudah dipilih dari yang
-- belum terpakai, tetapi dua pengurus bisa menekan tombol pada saat yang sama,
-- jadi aturannya ditegakkan database juga. Baris yang kodenya masih kosong
-- tidak ikut dibatasi.
create unique index if not exists loyalty_links_kode
  on loyalty_links (kode) where kode is not null;

-- Versi pertama migrasi ini sempat memakai nomor 4 angka. Ruang tebakannya
-- cuma 9.000, terlalu rapat untuk alamat yang bisa dibuka siapa saja, jadi
-- kolomnya dibuang dan digantikan kode 5 karakter di atas. Kalau versi lama
-- belum pernah dijalankan, kedua baris ini tidak melakukan apa-apa.
--
-- Nomor lama sengaja tidak dipindahkan ke kolom baru: bentuknya berbeda, dan
-- membiarkannya hidup berarti membiarkan alamat yang rapat itu tetap terbuka.
-- Setelah migrasi ini, terbitkan ulang kodenya dari menu Jamaah Loyal.
drop index if exists loyalty_links_nomor;
alter table loyalty_links drop column if exists nomor;
