# Prompt untuk Claude Code — Web App Komunitas Dzun Nuun

---

## 0. Langkah wajib sebelum menulis kode

Kerjakan berurutan, jangan dilewat:

1. Pasang guardrail antislop lebih dulu:
   ```
   /plugin marketplace add https://github.com/miqdadbadjuber/anti-slop
   /plugin install antislop@anti-slop
   ```
   Aktifkan skill: `antislop` (core), `antislop-ui`, `antislop-copywriting`, `antislop-layoutmobile`, `antislop-human`, `antislop-code`. Gunakan **mode DURING** (memandu saat membangun, bukan mengaudit setelah jadi).
2. Baca antislop dan pahami bahwa dia adalah **filter, bukan style guide**. Dia tidak akan memberi arah visual. Arah visual datang dari `DESIGN.md` yang Anda tulis di langkah 3.
3. Tulis `DESIGN.md` dari bagian §9 dan §10 prompt ini, lalu **tunjukkan ke saya untuk disetujui sebelum coding dimulai**.
4. Tulis `PLAN.md`: urutan kerja, asumsi, dan daftar pertanyaan yang masih menggantung. **Tanyakan ke saya semua yang ambigu.** Jangan mengarang keputusan produk.
5. Baru mulai coding.

Di akhir, jalankan **Delivery Gate** antislop (laporan PASS/FAIL 4 blok), termasuk R-35: setiap elemen interaktif diklik satu per satu dan hasilnya dicatat sebagai bukti.

---

## 1. Konteks

Dzun Nuun adalah komunitas pemuda yang melayani **Masjid Fathul Ummah** dengan satu tujuan: membuat anak muda tertarik lagi datang ke masjid. Saya pengurusnya, bukan programmer penuh waktu. Pengelola app ini 2–3 orang relawan.

Deskripsi singkat Dzun Nuun : "Komunitas pemuda pemudi yang ingin masjid jadi fun dan berdampak lagi"
Tagline : "Teman Beriman dan Bertumbuh"

Yang dibangun: **mini web app, mobile-first**, untuk fundraising per season, daftar acara + tiket, dan kabar kegiatan.

Ini bukan startup. Tidak ada payment gateway, tidak ada akun pengguna, tidak ada notifikasi push. Semua alur pembayaran manual lewat QRIS statis dan WhatsApp — itu **disengaja**, jangan "diperbaiki" jadi otomatis.

---

## 2. Stack & batasan

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS**
- **Supabase**: Postgres + Storage (upload foto header, poster acara, logo sponsor, QRIS)
- **Deploy: Vercel free tier.** Semua pilihan teknis harus muat di free tier Vercel + Supabase.
- Bahasa UI: **100% Bahasa Indonesia.** Tidak ada string Inggris yang terlihat pengguna. Jangan pasang i18n.
- Timezone `Asia/Jakarta`. Format uang `Intl.NumberFormat('id-ID')` → `Rp 7.000.000`.
- Target perangkat: HP Android kelas menengah-bawah, koneksi lambat. Optimasi gambar wajib (`next/image`, ukuran upload dibatasi).
- PWA: `manifest.json` + ikon, bisa "Add to Home Screen". Tidak perlu offline mode penuh.

---

## 3. Model data

```
seasons
  id, slug, title (boleh kosong — season 1 belum bernama),
  tagline, description (markdown), header_image_url,
  target_amount (bigint), package_price (default 15000),
  start_date, end_date, is_active (hanya satu boleh true), created_at

donations
  id, season_id, code (mis. DZN-4K7P, unik),
  donor_name, whatsapp, package_count,
  base_amount, unique_suffix (100–999), total_amount,
  is_anonymous (bool), status (pending|verified|rejected),
  admin_note, created_at, verified_at

events
  id, slug, title, description (markdown), poster_url,
  starts_at, ends_at, location_name, location_map_url,
  is_paid (bool), price, capacity (nullable = tanpa batas),
  registration_deadline, is_recurring_note (teks bebas, mis. "Setiap Ahad ba'da Subuh"),
  is_published, created_at

registrations
  id, event_id, name, whatsapp, quantity, code (unik),
  total_amount (0 kalau gratis), unique_suffix,
  status (pending|confirmed|checked_in|cancelled),
  checked_in_at, created_at

updates            -- "Kabar Aksi"
  id, season_id (nullable), day_number (int, nullable),
  title, body (markdown), image_url, published_at, is_published

sponsors
  id, season_id, name, logo_url, link_url, tier (utama|pendukung), sort_order

settings           -- satu baris
  qris_image_url, admin_whatsapp, whatsapp_channel_url,
  instagram_url, tiktok_url, youtube_url, about_markdown
```

**Progress season dihitung dari `SUM(total_amount) WHERE status='verified'`.** Donasi `pending` tidak pernah masuk hitungan progress. Ini penting: angka di halaman publik harus angka yang sudah benar-benar masuk.

---

## 4. Halaman publik

### `/` — Beranda
Urutan: hero season aktif dengan progress → 3 kabar terbaru → 3 acara terdekat → tentang kami singkat → sosial media.

### `/season/[slug]` — Halaman fundraising
- Foto header season (dari Storage, bisa diganti admin)
- Judul + deskripsi
- **Progress bar. Angka utama = rupiah** (`Rp 2.145.000 dari Rp 7.000.000`). Di bawahnya, baris kecil: `≈ 143 jamaah sudah dirangkul`. Jangan dibalik urutannya.
- Sisa hari season
- Tombol donasi (sticky di bawah layar saat scroll di mobile)
- Kabar Aksi terkait season ini
- Slot logo sponsor di bagian bawah — kalau `sponsors` kosong, **seluruh bagian itu tidak dirender**. Jangan tampilkan placeholder abu-abu "Sponsor kami akan hadir di sini".

### `/donasi` — Form
Field: nama, nomor WhatsApp, jumlah paket.
- Chip pilihan cepat: 1 / 5 / 10 / 33 paket + input bebas
- Konversi hidup di bawah input: `10 paket = Rp 150.000 = 10 jamaah dirangkul`
- Checkbox "Sembunyikan nama saya" (default: tidak dicentang)
- Validasi nomor WA: normalkan `08...` / `+628...` / `628...` jadi format `628...`

Saat submit:
1. Buat `unique_suffix` acak 100–999. `total_amount = package_count × 15000 + unique_suffix`. Pastikan tidak ada donasi `pending` lain di season yang sama dengan `total_amount` identik — kalau bentrok, ambil angka lain.
2. Buat `code` unik (`DZN-` + 4 karakter alfanumerik, hindari huruf/angka yang mirip: 0/O, 1/I).
3. Simpan sebagai `pending`, lalu redirect ke `/donasi/[code]`.

### `/donasi/[code]` — Halaman instruksi + status
Ini halaman terpenting untuk retensi. Isinya:
- Nominal transfer **persis**, besar dan bisa ditap untuk disalin: `Rp 150.137`
- Penjelasan jujur soal angka unik: nominalnya sengaja dibedakan sedikit supaya donasi mudah dicocokkan. Jangan pakai bahasa teknis "kode unik sistem".
- Gambar QRIS + tombol **Unduh QRIS**
- Tombol **Konfirmasi via WhatsApp** → `wa.me/{admin_whatsapp}?text=...` prefilled dengan nama, kode, jumlah paket, dan nominal
- Status saat ini: `Menunggu konfirmasi` / `Alhamdulillah, sudah kami terima`
- Setelah `verified`: ucapan terima kasih + `10 jamaah dirangkul lewat Anda` + 3 Kabar Aksi terbaru + tombol ikuti Saluran WhatsApp
- **Nomor WA di halaman ini ditampilkan tersamar** (`0812••••789`). Halaman ini bisa dibuka siapa saja yang punya link.
- Tombol "Simpan link ini" yang menyalin URL — jelaskan singkat kenapa perlu disimpan.

### `/acara` — Daftar acara
Dua tampilan, toggle-nya diingat di `localStorage`:
- **Kartu** (default): poster, judul, tanggal, lokasi, badge Gratis/Berbayar, sisa kuota
- **Kalender**: grid bulanan, tanggal berisi acara ditandai, tap tanggal → daftar acara hari itu. Buat kalendernya sendiri, jangan tarik library kalender berat.

### `/acara/[slug]`
Detail + tombol daftar. Tombol tertutup otomatis kalau lewat `registration_deadline` atau kuota penuh (tampilkan "Kuota penuh", bukan tombol mati tanpa penjelasan). Sediakan tombol **Tambah ke kalender** (unduh `.ics`) dan **Bagikan ke WhatsApp**.

### `/acara/[slug]/daftar` → `/tiket/[code]`
Alur sama dengan donasi. Acara gratis: langsung `confirmed`, lewati QRIS. Acara berbayar: nominal + suffix unik, QRIS, konfirmasi WA, status `pending`.

Halaman `/tiket/[code]` menampilkan: nama, judul acara, waktu, lokasi, **kode besar** (`DZN-9F2M`) dan **QR code**. QR digenerate di sisi klien pakai library `qrcode` — jangan panggil API QR eksternal.

### `/kabar` dan `/kabar/[id]` — Kabar Aksi
Feed kronologis. Tiap entri: 1 foto, judul (`Hari ke-12`), 2–4 kalimat, tanggal. Ini meniru pola masjid-masjid yang berhasil: hitungan hari yang naik terus adalah alasan orang membuka lagi.

Badge "kabar baru": simpan `lastVisitedAt` di `localStorage`, hitung entri yang lebih baru, tampilkan di navigasi (`Kabar •3`). Kalau pengunjung baru pertama kali, jangan tampilkan badge.

### `/tentang`
Profil singkat Dzun Nuun + Masjid Fathul Ummah, dan quick link sosial media (Instagram `@dzunnuun.id`, Saluran WhatsApp, dan lainnya dari `settings`).

### `/arsip`
Season yang sudah selesai: judul, periode, total terkumpul, dan ringkasan penggunaan dana. Bagian ini yang membangun kepercayaan jangka panjang — perlakukan sebagai fitur, bukan pelengkap.

---

## 5. Admin panel (`/admin`)

**Autentikasi: satu password bersama.** `ADMIN_PASSWORD` di env var, dibandingkan di server, lalu set cookie sesi `httpOnly` + `secure` + `sameSite=lax` yang ditandatangani. Middleware melindungi seluruh `/admin/*` dan seluruh route API admin. Jangan bikin tabel user, jangan bikin role, jangan pakai Supabase Auth.

Halaman:
- `/admin` — ringkasan: donasi pending, pendaftar pending, progress season aktif
- `/admin/donasi` — tabel donasi. Filter status. Cari berdasarkan nama/kode/nominal. Aksi: **Verifikasi**, **Tolak**, catatan admin, dan tombol **Buka WhatsApp donatur**. Verifikasi harus butuh satu konfirmasi (jangan satu tap langsung eksekusi).
- `/admin/season` — CRUD season, upload foto header, set aktif
- `/admin/acara` — CRUD acara, upload poster
- `/admin/pendaftar` — daftar pendaftar per acara, konfirmasi pembayaran, ekspor CSV
- `/admin/scan` — halaman check-in
- `/admin/kabar` — CRUD Kabar Aksi, upload foto, `day_number` terisi otomatis (dihitung dari `start_date` season aktif) tapi bisa diubah manual
- `/admin/sponsor` — CRUD sponsor
- `/admin/pengaturan` — QRIS, nomor WA admin, link sosial, teks tentang kami

### Halaman check-in (`/admin/scan`)
- Kamera pakai `BarcodeDetector` API kalau tersedia
- **Wajib ada input kode manual sebagai jalur setara**, bukan fallback tersembunyi. Safari iOS belum mendukung `BarcodeDetector`, dan panitia sering pakai HP seadanya.
- Setelah scan/input: tampilkan nama + status besar dan jelas. Sudah check-in sebelumnya → peringatan, bukan error merah menakutkan.

---

## 6. Retensi (jangan dipangkas)

Empat mekanisme, semuanya dipakai:
1. Kabar Aksi dengan hitungan hari
2. Badge kabar belum dibaca via `localStorage`
3. Halaman status donasi pribadi `/donasi/[code]`
4. Tombol ikuti **Saluran WhatsApp** di footer semua halaman dan di halaman status

Tambahan: **OG image dinamis** untuk season, acara, dan kabar (pakai `next/og` `ImageResponse`). Distribusi utama app ini adalah grup WhatsApp — preview link yang jelek langsung memotong konversi. Uji preview-nya sungguhan.

---

## 7. Keamanan & privasi (tidak bisa ditawar)

- `SUPABASE_SERVICE_ROLE_KEY` **hanya di server**. Jangan pernah masuk bundle klien.
- Tidak ada endpoint publik yang mengembalikan daftar donatur atau pendaftar. Halaman `/donasi/[code]` dan `/tiket/[code]` hanya mengembalikan satu baris berdasarkan kode.
- Nomor WhatsApp tidak pernah tampil utuh di halaman publik.
- Nama donatur `is_anonymous` tidak pernah keluar dari server dalam bentuk apa pun ke halaman publik.
- Rate limit pada submit form donasi dan pendaftaran (per IP, sederhana saja) supaya tidak dibanjiri entri sampah.
- Validasi ukuran dan tipe file pada semua upload.
- Aktifkan RLS di Supabase; akses tulis hanya lewat route server.

---

## 8. Aturan menulis teks (copywriting)

Ini diturunkan dari cara Masjid Jogokariyan, Masjid Kapal Munzalan Pontianak, dan Masjid Makan-Makan Bandung berkomunikasi. Terapkan di seluruh copy:

1. **Angka konkret, bukan superlatif.** "Dari 15 orang di hari pertama, kini 350 porsi setiap hari" — bukan "program kami sangat sukses". Kalau angkanya belum ada, tulis kalimat tanpa angka. **Jangan pernah mengarang statistik.**
2. **Satu nama, satu cerita.** Dampak besar dibuktikan lewat satu orang, bukan lewat kata "banyak".
3. **Donatur adalah pelaku kebaikan, bukan sumber dana.** "Anda merangkul satu jamaah" — bukan "bantu kami mencapai target".
4. **Sebut masalahnya apa adanya, dengan bahasa sederhana.** Masjid sebagai solusi masalah nyata.
5. **Jangan memelas, jangan membebani.** Yang ditawarkan adalah peran, bukan iba. Tidak ada urgensi palsu, tidak ada hitung mundur yang menekan.
6. **Laporan adalah bentuk hormat kepada donatur**, bukan formalitas. Bahasa di halaman arsip harus terbuka dan tidak defensif.

Yang dilarang: kata "revolusioner", "platform", "solusi terpadu", "ekosistem"; ajakan bertingkat ("Yuk! Ayo! Segera!"); emoji berjejer; dan istilah keagamaan yang ditumpuk-tumpuk sampai terdengar tidak tulus. Satu "insyaAllah" yang pas lebih baik daripada lima.

---

## 9. Arah visual (`DESIGN.md`)

Brand Dzun Nuun sudah ada. Gunakan:

```
Warna 1 : #0A8074
Warna 1 - Darker : #043A43
Warna 2 : #C6B066
Warna terang : sesuaikan namun jangan pure white
Warna gelap : sesuaikan namun jangan pure black
Logo : cari di root folder repository bernama :
- "Logo - Dark background.png" jika background berwarna gelap
- "Logo - White background.png" jika background berwarna terang
Font : Geologica (untuk heading), Raleway (untuk body)
Referensi rasa: feed Instagram @dzunnuun.id
```

Karakter yang saya inginkan: **hangat, jujur, dan terasa buatan manusia** — komunitas pemuda masjid, bukan produk fintech. Boleh punya tekstur dan kepribadian; tidak boleh terasa steril.

Yang dilarang keras (ini pola AI slop yang akan langsung saya tolak): gradien ungu-biru, kartu putih melayang dengan bayangan seragam di atas latar abu-abu, bento grid, deretan ikon garis-tipis seragam, angka statistik hiasan yang tidak punya sumber, hero dengan gambar generik "orang berjabat tangan", dan section pemisah bergelombang.

Layout mobile-first sungguhan: rancang di 360px dulu, baru naik. Target tap minimal 44×44px. Kontras teks memenuhi WCAG AA — jalankan pengecek kontras dari `antislop-human`, jangan dikira-kira.

---

## 10. Data awal (seed)

```
Season 1
  title: (kosong — belum dinamai; UI harus tetap rapi tanpa judul)
  target_amount: 7000000
  package_price: 15000
  start_date: 2026-10-01
  end_date: 2026-12-31
  is_active: true
```

Narasi paket yang wajib dipakai konsisten di seluruh app:
**1 paket = Rp 15.000 = biaya merangkul satu jamaah yang singgah ke masjid, agar amal ibadahnya mengalir.**

QRIS, nomor WA admin, dan link sosial: satu untuk semua keperluan, diisi lewat `/admin/pengaturan`. Sediakan nilai placeholder yang jelas-jelas placeholder saat seed.

---

## 11. Urutan kerja

Saya minta semuanya sekaligus, tapi bangun dengan urutan ini supaya kalau waktunya mepet, yang paling penting sudah bisa jalan duluan:

1. Skema DB + auth admin + pengaturan
2. Season + halaman fundraising + form donasi + halaman status + admin donasi
3. Kabar Aksi + badge + Saluran WA + OG image
4. Acara + tiket + kalender + check-in
5. Tentang + arsip + sponsor
6. PWA, optimasi gambar, Delivery Gate

Target live: **25 September 2026** (season mulai 1 Oktober, saya butuh seminggu untuk sosialisasi).

---

## 12. Yang TIDAK dibuat

Jangan buat, walaupun terlihat masuk akal: payment gateway atau integrasi Midtrans/Xendit; akun pengguna, login jamaah, atau profil donatur; sistem role dan permission; notifikasi push atau email; dashboard analitik buatan sendiri; dark mode toggle; i18n; animasi scroll di sepanjang halaman; chatbot; leaderboard donatur.

---

## 13. Selesai berarti

- [ ] Alur donasi dijalankan penuh di HP sungguhan: isi form → nominal unik muncul → QRIS terunduh → WA terbuka dengan teks terisi → admin verifikasi → progress publik naik → halaman status berubah jadi ucapan terima kasih
- [ ] Alur tiket dijalankan penuh, termasuk check-in lewat kamera **dan** lewat input kode manual
- [ ] Tidak ada satu pun teks placeholder atau lorem ipsum tersisa
- [ ] Preview link diuji di WhatsApp sungguhan untuk beranda, season, satu acara, dan satu kabar
- [ ] Lighthouse mobile: performa ≥ 85, aksesibilitas ≥ 95
- [ ] Halaman `/donasi/[code]` milik orang lain tidak membocorkan nomor WA utuh
- [ ] Tidak ada kunci rahasia di bundle klien (cek dengan `grep` pada hasil build)
- [ ] Laporan **Delivery Gate** antislop lengkap 4 blok, termasuk bukti klik R-35
- [ ] `README.md` berisi cara deploy ke Vercel, daftar env var, dan **panduan singkat berbahasa Indonesia untuk pengurus non-teknis** tentang cara memverifikasi donasi dan menulis Kabar Aksi
