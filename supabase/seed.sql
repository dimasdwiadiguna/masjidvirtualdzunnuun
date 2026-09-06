-- Data awal. Jalankan setelah schema.sql.
-- Nilai QRIS, nomor WhatsApp admin, dan link sosial sengaja placeholder.
-- Ganti lewat /admin/pengaturan sebelum app dibagikan ke jamaah.

insert into settings (id, qris_image_url, admin_whatsapp, whatsapp_channel_url, instagram_url, tiktok_url, youtube_url, about_markdown)
values (
  'settings',
  null,
  '628000000000',
  null,
  'https://www.instagram.com/dzunnuun.id',
  null,
  null,
  'Dzun Nuun adalah komunitas pemuda pemudi yang ingin masjid jadi fun dan berdampak lagi.

Kami melayani Masjid Fathul Ummah. Yang kami kerjakan sederhana: menyiapkan kegiatan yang bikin anak muda betah singgah, lalu merawat orang yang datang.

Teman Beriman dan Bertumbuh.'
)
on conflict (id) do nothing;

insert into seasons (slug, title, tagline, description, target_amount, package_price, start_date, end_date, is_active)
values (
  'season-1',
  null,
  'Merangkul jamaah yang singgah ke Masjid Fathul Ummah',
  'Setiap jamaah yang singgah ke masjid perlu disambut: tempat wudu yang layak, air minum, dan kegiatan yang membuat mereka kembali.

Satu paket bernilai Rp 15.000. Nilainya kami pakai untuk merangkul satu jamaah yang singgah, agar amal ibadahnya mengalir.

Patungan ini dikelola tiga relawan. Setiap pemasukan yang sudah kami terima dicatat di halaman ini, dan penggunaannya dilaporkan lewat Kabar Aksi.',
  7000000,
  15000,
  '2026-10-01',
  '2026-12-31',
  true
)
on conflict (slug) do nothing;
