# Web App Komunitas Dzun Nuun

Mini web app mobile-first untuk Masjid Fathul Ummah: patungan per season, daftar acara dan tiket, serta Kabar Aksi.

Bagian 1 sampai 4 untuk yang memasang app. Bagian 5 ditulis untuk pengurus yang tidak berlatar teknis.

---

## 1. Yang perlu disiapkan

- Akun [Vercel](https://vercel.com) (paket gratis cukup)
- Akun [Supabase](https://supabase.com) (paket gratis cukup)
- Node.js 20 atau lebih baru kalau ingin menjalankan di komputer sendiri

## 2. Menyiapkan Supabase

1. Buat project baru di Supabase, pilih region Singapore supaya dekat dengan Indonesia.
2. Buka **SQL Editor**, tempel seluruh isi `supabase/schema.sql`, jalankan.
3. Masih di SQL Editor, tempel seluruh isi `supabase/seed.sql`, jalankan. Ini membuat Season 1 dan satu baris pengaturan berisi nilai contoh.

   **Kalau database Anda sudah dibuat sebelumnya** dan sudah berisi data, jalankan juga berkas migrasi berikut, sekali masing-masing, urut nomornya. Semuanya aman dijalankan berulang dan tidak menyentuh data yang sudah ada:

   - `supabase/migrasi-01-hero-dan-penanda-kabar.sql` — tabel foto hero dan kolom penanda kegiatan.
   - `supabase/migrasi-02-pengumuman.sql` — tabel pengumuman. Tanpa ini, menu Pengumuman belum berfungsi.
4. Buka **Project Settings, API**, catat dua nilai ini:
   - Project URL, misalnya `https://abcdefgh.supabase.co`
   - `service_role` key (bukan `anon` key)

Catatan keamanan: `service_role` key membuka seluruh database. Simpan hanya di env var Vercel, jangan ditempel di chat, jangan dimasukkan ke repo.

## 3. Variabel lingkungan

| Nama | Wajib | Isi |
|---|---|---|
| `ADMIN_PASSWORD` | ya | Password bersama untuk seluruh pengurus. Pakai kalimat panjang, minimal 16 karakter. |
| `NEXT_PUBLIC_SUPABASE_URL` | ya | Project URL dari Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | ya | `service_role` key dari Supabase. Hanya dibaca di server. |
| `NEXT_PUBLIC_SITE_URL` | tidak | Alamat publik app, misalnya `https://dzunnuun.vercel.app`. Dipakai untuk gambar pratinjau tautan WhatsApp. Kalau dikosongkan, alamat produksi dari Vercel yang dipakai. Isi manual kalau app sudah punya domain sendiri. Boleh ditulis tanpa `https://`. |
| `ADMIN_SESSION_SECRET` | tidak | Teks acak panjang untuk menandatangani cookie sesi. Kalau kosong, `ADMIN_PASSWORD` yang dipakai. Isi kalau Anda ingin bisa mengganti password tanpa memutus sesi yang sedang berjalan. |

Contohnya ada di `.env.example`.

## 4. Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Di Vercel, **Add New, Project**, pilih repo ini. Framework terdeteksi otomatis sebagai Next.js, biarkan pengaturan build apa adanya.
3. Buka **Settings, Environment Variables**, isi variabel di tabel atas untuk environment Production dan Preview. Yang wajib hanya `ADMIN_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL`, dan `SUPABASE_SERVICE_ROLE_KEY`. Variabel yang dibuat tetapi dibiarkan kosong diperlakukan sebagai tidak diisi, jadi tidak menggagalkan build.
4. Klik **Deploy**.
5. Kalau situs menampilkan pesan galat setelah deploy, buka `https://alamat-anda/admin/diagnosa`. Halaman itu menyebutkan bagian mana yang bermasalah, misalnya tabel belum dibuat atau kunci Supabase yang dipakai keliru.
6. Setelah live, buka `https://alamat-anda/admin`, masuk dengan `ADMIN_PASSWORD`, lalu isi halaman **Pengaturan**. Selama nomor WhatsApp masih berisi nilai contoh, halaman ringkasan admin menampilkan peringatan merah dan tombol konfirmasi donasi belum bisa dipakai jamaah.

Menjalankan di komputer sendiri:

```bash
npm install
npm run dev          # memakai Supabase, butuh env var di atas
npm run dev:lokal    # pratinjau tanpa Supabase, data disimpan di folder .data
```

`npm run dev:lokal` memakai penyimpanan file lokal. Berguna untuk mencoba tampilan, tidak untuk dipakai jamaah.

---

## 5. Panduan pengurus

Bagian ini untuk pengurus yang memegang app sehari-hari. Tidak perlu paham kode.

### Masuk ke panel pengurus

Buka alamat app, gulir ke paling bawah, tekan **Masuk pengurus**. Atau langsung ke `alamat-app/admin`. Passwordnya satu, dipakai bersama. Sesi bertahan 12 jam, setelah itu diminta masuk lagi.

### Memverifikasi donasi

Ini pekerjaan harian yang paling penting. Angka di halaman publik hanya naik dari donasi yang Anda verifikasi, jadi angka itu selalu angka yang benar-benar sudah masuk rekening.

1. Buka menu **Donasi**. Bawaannya menampilkan yang berstatus **Menunggu**.
2. Cocokkan dengan mutasi rekening atau QRIS. Setiap donasi punya nominal yang unik sampai angka terakhir, misalnya `Rp 150.137`. Angka belakang itu yang membedakan satu donatur dengan donatur lain di nominal yang sama.
3. Kalau nominalnya cocok dengan uang yang masuk, tekan **Verifikasi**. Akan muncul kotak konfirmasi berisi nama dan jumlah paketnya. Tekan **Ya, dana sudah masuk** hanya kalau Anda sudah benar-benar melihat uangnya masuk.
4. Kolom catatan boleh diisi, misalnya `masuk 12.40 lewat QRIS`. Catatan ini hanya untuk sesama pengurus, kecuali kalau Anda menolak donasi.
5. Kalau transfernya tidak ketemu, tekan **Tolak** dan tulis catatan singkat. Catatan itu ikut masuk ke pesan WhatsApp penolakan yang Anda kirim, jadi tulis dengan bahasa yang enak dibaca, misalnya `belum ada transfer masuk dengan nominal ini sampai hari Rabu`. Setelah menolak, tekan **Kirim alasan** untuk mengabari donaturnya.
6. Perlu bertanya ke donatur? Tekan **Buka WhatsApp donatur**. Pesannya sudah terisi nama, kode, dan nominal.

Yang berubah setelah verifikasi:

- Angka rupiah di beranda dan halaman season naik
- Tombol WhatsApp pada baris itu berubah jadi **Kirim kabar diterima**, dan pesannya sudah terisi ucapan terima kasih berikut berapa jamaah yang dirangkul lewat dia

**Donatur tidak punya halaman status.** Dia tidak akan tahu donasinya sudah diterima sampai Anda menekan tombol WhatsApp itu dan mengirim pesannya. Ini pekerjaan yang tidak boleh dilewat.

Kalau salah verifikasi, buka lagi donasi tersebut dan tekan **Tolak**. Angkanya akan turun kembali.

### Menulis Kabar Aksi

Kabar Aksi adalah alasan orang membuka app ini lagi. Satu kabar pendek yang rutin lebih baik daripada satu laporan panjang setahun sekali.

1. Buka menu **Kabar**, lalu isi form **Tulis kabar baru**.
2. **Penanda kegiatan** boleh dikosongkan. Isinya bebas, dipakai untuk menandai kegiatan apa yang dilaporkan, misalnya `MBKM Pekan ke-12` atau `Tahsin Pertemuan 13`. Tulis pendek, maksimal 60 huruf. Kalau dikosongkan, yang tampil hanya tanggalnya.
3. **Judul** sebaiknya pendek dan konkret. Contoh yang bagus: `Air minum untuk jamaah Subuh`. Contoh yang lemah: `Update kegiatan`.
4. **Isi kabar** cukup dua sampai empat kalimat. Beberapa aturan yang membuat kabar terasa jujur:
   - Tulis angka yang benar-benar terjadi. `Dari 15 orang di hari pertama, sekarang 40 orang` lebih kuat daripada `alhamdulillah ramai sekali`.
   - Kalau angkanya belum ada, tulis kalimat tanpa angka. Jangan mengarang jumlah.
   - Sebut satu orang atau satu kejadian nyata, bukan kata `banyak`.
   - Tidak perlu ajakan bertingkat dan emoji berderet.
5. **Foto** satu saja. Foto dari kamera HP otomatis dikecilkan di HP Anda sebelum dikirim, jadi tidak perlu diedit dulu.
6. Biarkan **Tampilkan di halaman publik** tercentang, lalu tekan **Terbitkan kabar**.

Pengunjung yang pernah membuka halaman Kabar akan melihat angka kecil di menu Kabar saat ada kabar baru yang belum dia baca.

### Mengatur foto hero

Foto besar di bagian atas beranda diambil dari menu **Foto Hero**, bukan dari poster acara. Jadi isinya sepenuhnya Anda yang pilih.

1. Buka menu **Foto Hero**, tekan pilih foto. Foto dari kamera HP otomatis dikecilkan di HP Anda sebelum dikirim.
2. **Keterangan** dipakai sebagai teks alternatif untuk yang memakai pembaca layar, misalnya `Kajian Ahad pagi`. Boleh dikosongkan.
3. **Urutan** menentukan foto mana yang tampil lebih dulu. Angka kecil tampil duluan.
4. Foto berganti sendiri setiap 6 detik. Kalau HP pengunjung disetel meminta gerak minimal, fotonya diam dan tidak berganti.
5. Tombol **Sembunyikan** membuat foto berhenti tampil tanpa menghapusnya. Pakai itu kalau ragu, hapus kalau sudah pasti tidak dipakai.

Kalau belum ada satu pun foto, hero tampil sebagai blok warna. Itu keadaan yang wajar, bukan galat. Tiga sampai lima foto sudah cukup.

### Mengisi pengumuman

Pengumuman adalah gambar yang berjalan sendiri di beranda, di bawah kotak patungan. Dipakai untuk pemberitahuan seperti `Aturan Masjid Ngopi-Ngopi` atau ucapan hari besar. Bedanya dengan Laporan Kegiatan: laporan menceritakan kegiatan yang **sudah terlaksana**, pengumuman **memberi tahu** sesuatu dan bentuk utamanya gambar.

1. Menu **Pengumuman**, tekan **Buat pengumuman baru**. Formulirnya muncul dari bawah layar.
2. **Judul** dipakai sebagai judul halaman dan sebagai teks alternatif gambarnya, jadi tulis yang menjelaskan isi gambarnya.
3. **Gambar** wajib. Bentuk persegi atau tegak paling enak dilihat di HP. Foto dari kamera otomatis dikecilkan dulu di HP Anda.
4. **Keterangan** boleh dikosongkan kalau gambarnya sudah menjelaskan sendiri.
5. **Urutan** menentukan yang tampil lebih dulu, angka kecil duluan.
6. Tombol **Sembunyikan** membuat pengumuman berhenti tampil tanpa menghapusnya.

Kalau belum ada satu pun pengumuman, bagian itu tidak muncul sama sekali di beranda. Itu wajar, bukan galat.

### Membuat acara dan menerima pendaftar

1. Menu **Acara**, isi judul, waktu mulai, lokasi, dan keterangan. Semua waktu dibaca sebagai waktu Jakarta.
2. Acara gratis: biarkan kotak **Acara berbayar** tidak tercentang. Pendaftar langsung mendapat tiket.
3. Acara berbayar: centang kotaknya dan isi harga per orang. Pendaftar mendapat nominal unik dan tombol konfirmasi WhatsApp, sama seperti alur donasi. Konfirmasi pembayarannya di menu **Pendaftar**.
4. **Kuota** boleh dikosongkan kalau tanpa batas. Kalau diisi, tombol daftar menutup sendiri begitu penuh, dan pengunjung melihat tulisan `Kuota penuh`.
5. Centang **Terbitkan acara ini** supaya muncul di halaman publik. Tanpa itu, acara hanya terlihat oleh pengurus.
6. Menu **Pendaftar** menampilkan daftar per acara, tombol **Ekspor CSV** untuk dibuka di Excel, dan tombol WhatsApp per orang.

### Mengirim kabar lewat WhatsApp

**Jamaah tidak punya halaman status.** Sejak halaman status dihapus, satu-satunya cara mereka tahu donasinya diterima atau tiketnya sudah jadi adalah pesan WhatsApp yang **Anda** kirim. Ini pekerjaan harian, bukan tambahan.

Caranya sama di dua tempat:

- Menu **Donasi**: setelah memverifikasi, tekan **Kirim kabar diterima**. Setelah menolak, tekan **Kirim alasan**.
- Menu **Pendaftar**: setelah mengonfirmasi pembayaran, tekan **Kirim tiket dan QR**.

WhatsApp terbuka dengan pesannya sudah terisi lengkap: nama, kode, nominal, dan untuk tiket juga tautan gambar QR-nya. Anda tinggal menekan kirim. Boleh diubah dulu kalau mau.

Menu **Pesan WhatsApp** memuat contoh kelima pesan itu berikut tombol salin, untuk dilihat kata-katanya atau dipakai kalau Anda mengirim dari perangkat lain.

Pengiriman tidak otomatis, dan itu disengaja. Pesan dari pengurus sungguhan lebih dipercaya jamaah daripada pesan robot.

### Check-in saat hari H

Menu **Check-in** punya dua cara yang sama sahnya:

- **Ketik kode tiket**, misalnya `DZN-9F2M`. Cara ini selalu jalan di HP apa pun.
- **Pindai QR** lewat kamera. QR-nya ada di pesan WhatsApp yang Anda kirim ke peserta. Sebagian HP, termasuk iPhone, belum mendukung pemindaian bawaan peramban. Kalau begitu, pakai cara ketik kode, hasilnya sama.

Hasilnya muncul besar: nama, jumlah orang, dan status. Kalau tiket sudah pernah dipakai, muncul peringatan berikut waktu check-in sebelumnya, bukan tanda merah menakutkan.

### Membagikan halaman ke WhatsApp

Tombol **Bagikan** di halaman acara, laporan, pengumuman, dan season membuka lembar bagikan bawaan HP. Dari situ pilih WhatsApp, lalu pilih kontak atau grupnya seperti biasa.

### Kalau app menampilkan pesan galat

Buka menu **Diagnosa** di panel pengurus. Halaman itu memeriksa sambungan ke database dan penyimpanan gambar, lalu menyebutkan bagian mana yang bermasalah berikut langkah perbaikannya. Kalau semuanya bertanda Baik tetapi situs tetap bermasalah, kirim isi halaman itu ke yang memasang app.

### Mengganti QRIS, nomor WhatsApp, dan link sosial

Semua di menu **Pengaturan**. Satu QRIS dan satu nomor WhatsApp dipakai untuk semua keperluan. Kalau link Saluran WhatsApp dikosongkan, tombolnya tidak ditampilkan di halaman mana pun, bukan ditampilkan sebagai tombol mati.

### Menutup season dan mengisi laporan

1. Menu **Season**, tekan **Ubah** pada season yang selesai.
2. Isi **Ringkasan penggunaan dana** dengan rincian yang benar-benar terpakai.
3. Hilangkan centang **Jadikan season aktif** kalau sudah ada season baru yang aktif.

Season yang tidak aktif otomatis pindah ke halaman **Arsip** berikut total yang terkumpul dan ringkasan penggunaannya.

---

## 6. Catatan teknis singkat

- Progress season dihitung dari `SUM(total_amount)` donasi berstatus `verified`. Donasi `pending` tidak pernah ikut dihitung.
- Tidak ada endpoint publik yang mengembalikan daftar donatur atau pendaftar. Halaman status per kode sudah dihapus sama sekali. Layar hasil setelah mengirim formulir dipegang kuki berumur 2 jam, bukan alamat yang bisa ditebak.
- `/api/qr/[kode]` hanya menggambar QR dari kode yang bentuknya benar, tanpa menyentuh database. Jadi alamat itu tidak bisa dipakai menebak kode mana yang benar-benar ada, dan tidak membocorkan nama atau nominal.
- Nomor WhatsApp tidak pernah tampil utuh di halaman publik, hanya tersamar seperti `0812••••789`.
- RLS menyala di semua tabel tanpa policy publik. Seluruh baca dan tulis lewat route server yang memakai service role key.
- `vercel.json` menaruh fungsi di region `sin1` (Singapore) supaya duduk dekat dengan database. Kalau project Supabase Anda ada di region lain, ganti nilai itu supaya keduanya sekota.
- Bacaan halaman publik di-cache 300 detik lewat `src/lib/cache.ts`, dan aksi pengurus memanggil `revalidateTag` supaya angkanya langsung ikut berubah setelah disimpan. Halaman status donasi, tiket, dan form pendaftaran sengaja tidak di-cache.
- Dokumen pendukung: `DESIGN.md` (arah visual), `PLAN.md` (urutan kerja dan asumsi), `DECISIONS.md` (semua keputusan berikut alasannya), `DELIVERY-GATE.md` (laporan pemeriksaan akhir).
