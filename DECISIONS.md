# DECISIONS.md

Catatan seluruh keputusan yang diambil saat mengeksekusi `BRIEF.md`, berikut alasannya. Disusun supaya pengurus bisa menolak atau mengubah keputusan mana pun tanpa harus membaca kode lebih dulu.

Format tiap butir: keputusan, alasan, dan konsekuensinya kalau ingin diubah.

---

## A. Proses dan guardrail

### D-01 Antislop dipasang dengan membaca sumbernya, bukan lewat perintah `/plugin`

BRIEF §0 meminta `/plugin marketplace add` dan `/plugin install`. Perintah itu adalah perintah interaktif Claude Code yang tidak bisa dijalankan dari dalam sesi ini. Yang dilakukan: repositori `miqdadbadjuber/anti-slop` diambil apa adanya, lalu keenam berkas aturan dibaca penuh (`antislop` inti, `antislop-ui`, `antislop-copywriting`, `antislop-layoutmobile`, `antislop-human`, `antislop-code`) dan diterapkan selama membangun.

Konsekuensi: hasilnya sama dengan memasang plugin, tetapi aturan tidak ikut tersimpan di konfigurasi editor Anda. Kalau nanti Anda melanjutkan sendiri di Claude Code, jalankan dua perintah di BRIEF §0 supaya aturan yang sama ikut termuat di sesi Anda.

### D-02 Mode DURING, bukan audit setelah jadi

Sesuai permintaan BRIEF §0. Aturan dipakai sebagai filter saat menulis, dan Delivery Gate dijalankan di akhir. Laporannya di `DELIVERY-GATE.md`.

### D-03 Persetujuan `DESIGN.md` diubah jadi dokumen yang bisa ditolak, bukan jeda menunggu jawaban

BRIEF §0 langkah 3 meminta `DESIGN.md` ditunjukkan dan disetujui sebelum coding. Instruksi menjalankan tugas ini meminta app dieksekusi penuh dan seluruh keputusan didokumentasikan. Dua hal itu diselesaikan begini: `DESIGN.md` ditulis lebih dulu dan berdiri sendiri, semua pilihan visual di dalamnya punya alasan satu baris, dan pembangunan berjalan di atasnya.

Konsekuensi: kalau ada arah visual yang tidak Anda setujui, mengubahnya cukup di `DESIGN.md` dan token warna di `src/app/globals.css`, tanpa membongkar struktur halaman.

### D-04 Nama berkas logo mengikuti isi repo, bukan teks brief

BRIEF §9 menyebut `Logo - White background.png`. Yang ada di repo adalah `Logo - Light background.png`. Dipakai berkas yang benar-benar ada. Keduanya disalin ke `public/` sebagai `logo-terang.png` (versi putih, untuk latar gelap) dan `logo-gelap.png` (versi hitam, untuk latar krem).

### D-05 Ikon PWA dibuat dari logo yang sudah ada, bukan logo baru

R-23 melarang membuat aset identitas tanpa instruksi. Ikon 192, 512, maskable, dan apple-touch dihasilkan dengan menempatkan logo versi putih di atas kotak `#043A43` berpadding. Tidak ada bentuk baru yang dikarang.

Konsekuensi: kalau pengurus punya ikon versi kotak sendiri, ganti berkas di `public/icon-*.png` dengan ukuran yang sama.

---

## B. Stack dan struktur

### D-06 Versi yang dipakai

Next.js 15.5.25 (App Router), React 19.2.3, TypeScript 5.7, Tailwind CSS 4.3, `@supabase/supabase-js` 2.115, `qrcode` 1.5.4. Semuanya muat di Vercel free tier. Tidak ada library UI, tidak ada library kalender, tidak ada library markdown, tidak ada library animasi.

### D-07 Satu antarmuka data dengan dua driver

`src/lib/data/index.ts` mendefinisikan satu antarmuka. Ada dua implementasi: `supabase.ts` untuk produksi, dan `local.ts` yang menyimpan ke berkas JSON di `.data/`.

Alasan: BRIEF §13 menuntut setiap alur dijalankan sungguhan dan setiap elemen interaktif diklik satu per satu (R-35). Tanpa driver lokal, app tidak bisa dijalankan sama sekali di lingkungan ini, dan laporan Delivery Gate akan jadi klaim tanpa bukti. Driver lokal dipilih otomatis hanya kalau `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` kosong, atau `DATA_DRIVER=local`. Di Vercel dengan env var terisi, yang jalan selalu Supabase.

Konsekuensi: ada satu lapisan tipis di antara halaman dan Supabase. Kalau Anda ingin memanggil Supabase langsung dari halaman, hapus `local.ts` dan panggilan `db()`.

### D-08 Halaman publik dan admin dipisah lewat route group

`src/app/(publik)/` memakai header, footer, dan navigasi bawah. `src/app/admin/` memakai kerangkanya sendiri. Alamat halaman tidak berubah karena nama grup dalam kurung tidak masuk URL.

---

## C. Model data

### D-09 Kolom tambahan `seasons.fund_usage_summary`

BRIEF §3 tidak menyebut kolom ini, tetapi BRIEF §4 mewajibkan halaman `/arsip` menampilkan ringkasan penggunaan dana. Kolomnya ditambahkan dan diisi manual dari `/admin/season`. Selama kosong, halaman arsip menulis apa adanya bahwa ringkasannya belum ditulis, bukan menampilkan teks karangan.

### D-10 Keunikan nominal dijaga di database, bukan hanya di kode

Selain memilih angka unik yang belum terpakai saat submit, ada indeks unik parsial `donations (season_id, total_amount) where status = 'pending'` dan pasangannya untuk `registrations`. Alasan: dua orang bisa menekan tombol pada saat yang sama, dan pengecekan di kode saja bisa kebobolan. Kalau tabrakan terjadi, penyimpanan gagal dan pengunjung diminta mencoba jumlah paket yang sedikit berbeda.

### D-11 Alfabet kode menghindari huruf dan angka yang mirip

Kode `DZN-XXXX` diambil dari `23456789ABCDEFGHJKMNPQRSTUVWXYZ`. Nol, O, satu, I, dan L dibuang. Alasan: kode ini diketik ulang panitia saat check-in di depan pintu.

### D-12 Hanya satu season aktif, dijaga indeks unik parsial

`create unique index ... on seasons (is_active) where is_active`. Menandai season lain sebagai aktif otomatis menonaktifkan yang lama, baik lewat driver Supabase maupun driver lokal.

---

## D. Keamanan dan privasi

### D-13 RLS menyala tanpa satu pun policy publik

Ketujuh tabel memakai RLS dan tidak diberi policy apa pun. Artinya `anon` key tidak bisa membaca atau menulis apa pun. Seluruh akses lewat route server yang memakai `service_role` key, yang memang melewati RLS. Bucket storage `media` dibuat publik untuk dibaca saja, karena isinya foto header, poster, logo sponsor, dan QRIS yang memang tampil di halaman publik.

### D-14 Sesi admin memakai cookie bertanda tangan, bukan tabel pengguna

Satu password bersama di env var, dibandingkan di server dengan perbandingan yang panjang waktunya tetap, lalu cookie `httpOnly` + `secure` + `sameSite=lax` yang ditandatangani HMAC SHA-256 dan berumur 12 jam. Middleware menjaga seluruh `/admin/*`, dan setiap server action admin memeriksa ulang sesinya sendiri.

### D-15 Nomor WhatsApp tidak pernah utuh di halaman publik

Halaman `/donasi/[kode]` dan `/tiket/[kode]` bisa dibuka siapa saja yang punya tautannya, jadi nomor ditampilkan tersamar (`0812••••890`). Nomor utuh hanya muncul di panel pengurus dan di dalam tautan `wa.me` yang dibuat di server saat pengurus menekan tombolnya. Ekspor CSV pendaftar memuat nomor utuh karena berkas itu hanya bisa diunduh dari balik `/admin`.

### D-16 Batas pengiriman per IP dilonggarkan jadi 12 per 10 menit

Awalnya 5 per 10 menit. Saat diuji, batas itu terkena sendiri dalam pemakaian normal. Di Indonesia banyak jamaah memakai jaringan seluler yang berbagi satu alamat IP, sehingga satu masjid bisa terlihat sebagai satu pengunjung. Batas dinaikkan ke 12 per 10 menit untuk donasi dan pendaftaran. Pesannya juga diubah supaya menyarankan menghubungi pengurus, bukan sekadar menyuruh menunggu.

Batas ini disimpan di memori proses, jadi pada Vercel yang menjalankan beberapa instance angkanya tidak persis global. Sesuai permintaan BRIEF §7 yang meminta rate limit sederhana saja.

### D-17 Percobaan masuk yang dihitung hanya yang gagal

Batas 8 percobaan gagal per 10 menit per IP. Percobaan yang berhasil tidak ikut dihitung, supaya pengurus yang salah ketik sekali lalu benar tidak ikut terkunci.

### D-18 Unggahan dibatasi tipe dan ukuran di dua tempat

Route server menolak selain JPG, PNG, WebP, dan menolak berkas di atas 3 MB. Bucket Supabase juga dikonfigurasi dengan `file_size_limit` dan `allowed_mime_types` yang sama, sehingga batasnya tetap berlaku walaupun ada jalur unggah lain di kemudian hari.

---

## E. Keputusan yang lahir dari bug yang ditemukan saat pengujian

Empat butir berikut adalah perubahan rancangan, bukan sekadar perbaikan kecil. Semuanya ditemukan karena app benar-benar dijalankan dan diklik, bukan hanya dibaca.

### D-19 Driver lokal menulis berkas secara berurutan dan atomik

Gejala: data yang baru disimpan hilang, dan berkas JSON sesekali kembali ke isi awal. Sebabnya dua permintaan yang datang bersamaan sama-sama membaca lalu menimpa berkas, dan tulisan yang terpotong membuat berkas gagal dibaca sehingga ditimpa data awal. Perbaikannya: seluruh operasi berkas diantrikan satu per satu, dan setiap penulisan lewat berkas sementara yang lalu di-`rename`.

Hanya menyentuh driver pratinjau lokal. Supabase tidak pernah punya masalah ini.

### D-20 Login dan logout memakai kiriman form biasa ke route handler, bukan server action

Gejala: setelah salah password sekali, percobaan berikutnya yang benar tidak memindahkan halaman sama sekali. Diukur, 0 dari 6 percobaan berhasil. Sebabnya cookie sesi yang dipasang lewat server action belum terbaca middleware ketika router langsung mengambil halaman tujuan, sehingga pengurus dilempar balik ke halaman masuk.

Perbaikannya: `POST /admin/masuk/kirim` dan `POST /admin/keluar` sebagai route handler biasa. Peramban memasang cookie lebih dulu, baru mengikuti pengalihan. Setelah perubahan: 6 dari 6 berhasil. Bonusnya, halaman masuk tetap berfungsi walaupun JavaScript gagal dimuat.

### D-21 Form admin memberi umpan balik lewat muat ulang penuh

Gejala: setelah menyimpan, pesan "tersimpan" kadang muncul kadang tidak. Diukur, 3 dari 6 pengiriman kehilangan pesannya. Sebabnya `revalidatePath` di dalam server action memasang ulang komponen form, dan state yang menyimpan pesan ikut hilang. Pola pengalihan dari dalam aksi juga sempat dicoba dan ternyata tidak selalu diikuti router.

Perbaikannya: galat validasi tetap ditahan di halaman yang sama supaya isian yang sudah diketik tidak hilang, sedangkan keberhasilan memicu muat ulang penuh dengan penanda `?tersimpan=1` di alamat, dan pesannya dirender server. Setelah perubahan: 6 dari 6 pengiriman menampilkan pesan, dan daftar di bawah form selalu ikut segar.

### D-22 Form donasi dan pendaftaran memindahkan peramban sendiri

Server action mengembalikan kodenya, lalu komponen form memindahkan peramban ke `/donasi/[kode]` atau `/tiket/[kode]`. Alasannya sama dengan D-21: perpindahan penuh selalu sampai, sedangkan pengalihan dari dalam aksi bergantung pada router. Untuk alur donasi, kegagalan diam adalah kegagalan terburuk: uangnya sudah tercatat tapi donatur melihat formulir yang seolah tidak bereaksi.

---

## F. Kesegaran data dan cache

### D-23 Halaman publik selalu dirender segar, dan aksi form tidak memanggil `revalidatePath`

Konsekuensi dari D-21. Halaman publik yang menampilkan angka uang atau isi yang diubah pengurus memakai `dynamic = "force-dynamic"`, jadi setiap kunjungan membaca database. Aksi yang memakai dialog konfirmasi (verifikasi donasi, hapus, aktifkan season, konfirmasi pendaftar) tetap memanggil `revalidatePath` karena tidak punya state pesan yang bisa hilang.

Alasan memilih kesegaran daripada cache: angka donasi adalah angka uang. Lebih baik satu permintaan database per kunjungan daripada jamaah melihat angka yang tertinggal satu menit. Trafik app komunitas ini jauh di bawah batas gratis Supabase dan Vercel. Hasil Lighthouse setelah keputusan ini tetap 98 ke atas.

### D-24 Prefetch dimatikan untuk seluruh tautan di panel admin

Halaman admin semuanya dinamis, jadi prefetch tidak mempercepat apa pun dan hanya menghabiskan kuota data pengurus. Selain itu, saat diuji, gelombang prefetch sempat mengganggu perpindahan halaman setelah menyimpan.

---

## G. Keputusan tampilan dan teks

### D-25 Dial ENERGY 2 / RHYTHM 2 / MOTION 1

Alasan lengkapnya di `DESIGN.md` §1. Ringkasnya: hangat tapi cepat masuk ke isi, komposisi antar section berbeda tapi tetap terpola, dan gerak hanya pada hover, active, serta focus karena BRIEF §12 melarang animasi scroll dan targetnya HP kelas menengah-bawah.

### D-26 Emas dikunci hanya untuk permukaan gelap

`#C6B066` di atas krem `#F7F3EA` hanya berasio 1.93, gagal untuk teks maupun untuk elemen non-teks. Jadi emas hanya dipakai di atas `#043A43` (rasio 5.80), dan untuk teks emas di atas krem dipakai varian gelap `#6E5410` (rasio 6.45). Seluruh pasangan warna diperiksa dengan `contrast-check.py` bawaan antislop-human, tabelnya ada di `DESIGN.md` §3.

### D-27 Motif identitas berupa bayangan padat tanpa blur

Diambil dari wordmark logo yang memang punya bayangan offset padat. Dipakai di tombol utama, kartu progress, dan badge kode. Elemen lain duduk rata dengan garis 1.5px. Ini yang membuat halaman tidak jatuh ke pola kartu putih melayang yang dilarang BRIEF §9.

### D-28 Ikon digambar sendiri, sedikit saja

Enam ikon SVG inline (WhatsApp, unduh, salin, centang, kalender, lokasi). Tidak memakai satu set ikon garis tipis seragam, sesuai larangan BRIEF §9 dan R-04. Ikon hanya muncul di tempat yang butuh penanda cepat di layar kecil, dan selalu berdampingan dengan teks.

### D-29 Tidak ada dark mode

BRIEF §12 melarangnya. R-21 tetap terpenuhi karena temanya adalah pilihan sadar dari identitas brand: kertas krem hangat dengan tinta gelap, meniru poster pengumuman masjid. Satu tema itu dibuat berfungsi penuh, bukan setengah jadi.

### D-30 Bagian kosong tidak dirender, bukan diisi kotak abu-abu

Sponsor kosong berarti bagian sponsor hilang sama sekali. Foto belum ada berarti blok gambar tidak muncul. QRIS belum dipasang berarti muncul kalimat jujur bahwa pengurus belum mengunggahnya, berikut jalan keluarnya lewat WhatsApp. Link Saluran WhatsApp kosong berarti tombolnya tidak ada, bukan tombol mati.

### D-31 Judul season yang kosong diganti periode, bukan teks "Tanpa Judul"

Season 1 memang belum dinamai. UI menampilkan `Patungan Oktober sampai Desember 2026`. Begitu pengurus mengisi judul, seluruh halaman ikut berubah.

### D-32 Semua angka di halaman publik berasal dari database

Tidak ada satu pun angka hiasan. Kalau belum ada donasi terverifikasi, yang tampil adalah `Rp 0` berikut kalimat yang menerangkan bahwa angka itu hanya menghitung donasi yang sudah dicek satu per satu. Tidak ada testimoni, tidak ada logo pendukung karangan, tidak ada FAQ template.

### D-33 Teks awal seed diambil dari brief, bukan dikarang

Deskripsi komunitas dan tagline diambil apa adanya dari BRIEF §1. Instagram `@dzunnuun.id` juga dari brief. Nomor WhatsApp diisi `628000000000` yang jelas-jelas contoh, QRIS dan Saluran WhatsApp dikosongkan, dan panel admin menampilkan peringatan merah selama ketiganya belum diisi.

---

## H. Keputusan implementasi kecil yang punya alasan

### D-34 Markdown ditangani penulis kecil sendiri

Kebutuhannya hanya paragraf, judul, daftar, tebal, miring, dan tautan. Menarik library markdown berarti menambah puluhan kilobyte untuk pengunjung berkoneksi lambat. Penulis kecil ini meng-escape seluruh HTML mentah lebih dulu dan membatasi tautan ke `http`, `https`, dan `mailto`.

### D-35 Kalender digambar sendiri

Sesuai permintaan BRIEF §4. Grid bulanan biasa, tanggal berisi acara ditandai titik, tanggal tanpa acara tidak bisa ditekan dan diberi label yang menjelaskan itu untuk pembaca layar.

### D-36 QR dibuat di perangkat pengunjung

Memakai library `qrcode` di sisi klien, tidak memanggil layanan QR luar, sesuai BRIEF §4. Kalau pembuatan QR gagal, halaman tiket menjelaskan bahwa panitia bisa memasukkan kodenya secara manual, bukan menampilkan kotak kosong.

### D-37 Unduh QRIS lewat route server

Atribut `download` pada tautan lintas domain diabaikan peramban, jadi tombol unduh mengarah ke `/api/qris` yang menyalurkan ulang gambar dengan header `Content-Disposition`. Tanpa ini, tombol unduh hanya membuka gambar.

### D-38 Berkas unggahan pratinjau lokal disajikan lewat route, bukan folder `public`

Berkas yang ditulis ke `public/` setelah aplikasi dibangun tidak ikut disajikan oleh `next start`. Gejalanya gambar QRIS yang baru diunggah tampil rusak. Driver lokal sekarang menulis ke `.data/uploads` dan menyajikannya lewat `/api/berkas/...`. Di Vercel, gambar selalu dilayani Supabase Storage, jadi route ini tidak terpakai.

### D-39 Badge kabar baru membandingkan waktu server, bukan jam perangkat

Yang disimpan di `localStorage` adalah waktu terbit kabar terbaru yang sudah dilihat pengunjung, bukan waktu kunjungan menurut jam HP. Jam HP sering meleset, dan membandingkan dua nilai yang sama-sama berasal dari server membuat hitungannya tetap benar. Pengunjung yang baru pertama kali datang tidak mendapat badge sama sekali, sesuai BRIEF §4.

### D-40 Waktu terbit kabar baru memakai presisi detik

Isian tanggal di peramban hanya berpresisi menit. Kalau pengurus membiarkan nilainya apa adanya, waktu penuh berikut detiknya yang disimpan. Tanpa ini, dua kabar yang terbit di menit yang sama punya waktu identik dan badge tidak bisa membedakannya.

### D-41 Waktu acara dibaca sebagai waktu Jakarta

Isian `datetime-local` mengikuti zona waktu perangkat pengurus. Nilainya selalu ditafsirkan sebagai `+07:00` lalu disimpan sebagai UTC, dan ditampilkan kembali dalam zona Jakarta. Formulir admin menyebutkan hal ini di bawah isian waktunya.

### D-42 Ukuran logo dipasang pasti supaya tata letak tidak bergeser

Awalnya logo memakai `w-auto`, sehingga lebarnya baru diketahui setelah gambar termuat dan footer sempat melompat. Lighthouse mencatat pergeseran tata letak 0.233 di halaman acara. Sekarang lebar dan tinggi logo dipasang pasti berikut atribut `sizes`, jadi peramban tidak lagi mengunduh versi 1920px untuk gambar setinggi 32px. Setelah perbaikan, pergeseran tata letak menjadi 0.

### D-43 Tingkat judul kartu bisa diatur

Kartu kabar dan baris acara memakai `h3` kalau berada di bawah judul section `h2` (beranda, halaman season), dan `h2` kalau langsung di bawah `h1` (halaman kabar, halaman acara). Alasannya urutan heading tidak boleh melompat, karena pembaca layar memakai urutan itu untuk melompati bagian halaman. Sebelum diperbaiki, Lighthouse aksesibilitas 98; sesudahnya 100.

### D-44 Keadaan memuat diberi tinggi minimal

Gejala: footer melompat jauh saat halaman selesai mengambil data, dan Lighthouse mencatat pergeseran tata letak 0.578 di beranda. Sebabnya halaman publik mengambil data di server, sehingga kerangka halaman terkirim lebih dulu bersama keadaan memuat yang pendek. Footer sempat naik ke tengah layar lalu turun lagi begitu isinya datang.

Perbaikannya: keadaan memuat diberi tinggi minimal 80 persen tinggi layar. Setelah itu pergeseran tata letak menjadi 0 di hampir semua halaman. Font tetap memakai `display: swap` karena setelah perbaikan ini pergantian font tidak lagi menggeser apa pun, dan visitor pertama tetap melihat font brand.

### D-45 Metadata tidak dialirkan menyusul

`htmlLimitedBots` di `next.config.ts` disetel agar judul, deskripsi, dan gambar pratinjau selalu dikirim di dalam `<head>`, bukan menyusul di akhir dokumen. Bawaan Next mengalirkan metadata untuk peramban biasa dan hanya menahannya untuk daftar bot yang dikenalnya. Pengambil pratinjau WhatsApp tidak ada dalam daftar itu, dan BRIEF §6 menyebut distribusi utama app ini adalah grup WhatsApp, jadi pratinjau tautan tidak boleh bergantung pada kebetulan.

### D-46 Verifikasi donasi butuh satu konfirmasi

Sesuai BRIEF §5. Tombol membuka dialog berisi nama, nominal, dan jumlah paket, dan bisa ditutup dengan Escape. Pola yang sama dipakai untuk menolak donasi, menghapus acara atau kabar, membatalkan pendaftar, dan mengganti season aktif.

---

## I. Yang sengaja tidak dibuat

Sesuai BRIEF §12: tidak ada payment gateway, tidak ada akun pengguna, tidak ada sistem role, tidak ada notifikasi push atau email, tidak ada dashboard analitik, tidak ada dark mode, tidak ada i18n, tidak ada animasi scroll, tidak ada chatbot, dan tidak ada leaderboard donatur.

Alur pembayaran manual lewat QRIS statis dan WhatsApp dipertahankan apa adanya karena memang disengaja.

---

## J. Yang belum bisa diverifikasi di lingkungan ini

Ditulis terbuka supaya pengurus tahu apa yang masih perlu dicek sendiri sebelum 25 September 2026.

1. **Alur di HP sungguhan.** Semua alur dijalankan pada peramban Chromium dengan lebar 360px dan mode sentuh, bukan pada HP Android fisik. Perilaku kamera check-in di HP kelas menengah dan tombol unduh di peramban bawaan HP perlu dicoba sekali oleh pengurus.
2. **Pratinjau tautan di WhatsApp sungguhan.** Gambar pratinjau sudah diperiksa benar-benar dihasilkan (empat halaman, PNG 1200x630, semuanya 200 OK), tetapi tampilannya di dalam aplikasi WhatsApp hanya bisa diuji setelah app punya alamat publik. Uji ini menunggu deploy.
3. **Supabase sungguhan.** Skema, RLS, dan bucket ditulis lengkap dan siap dijalankan, tetapi belum pernah dieksekusi pada instance Supabase karena sesi ini tidak punya project Supabase. Yang diuji penuh adalah driver lokal yang memakai antarmuka data yang sama persis.
4. **QRIS asli.** Pengujian memakai gambar contoh bertuliskan `CONTOH QRIS UNTUK UJI COBA`, bukan QRIS masjid.
