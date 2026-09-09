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

### D-47 Env var kosong tidak boleh menggagalkan build

Gejala: deploy pertama di Vercel gagal dengan `Failed to collect configuration for /_not-found` dan `TypeError: Invalid URL, input: ''`. Sebabnya `NEXT_PUBLIC_SITE_URL` dibuat di Vercel tetapi nilainya kosong. Kode lama memakai `??` yang hanya menangkap nilai yang benar-benar tidak ada, bukan string kosong, sehingga `new URL("")` dijalankan dan seluruh build berhenti.

Perbaikannya di `src/lib/situs.ts`: nilai dirapikan lebih dulu, string kosong dianggap tidak diisi, alamat tanpa `https://` dilengkapi sendiri, dan kalau tetap tidak terbaca app memakai alamat produksi dari Vercel (`VERCEL_PROJECT_PRODUCTION_URL`, lalu `VERCEL_URL`). Penjagaan yang sama dipasang untuk `NEXT_PUBLIC_SUPABASE_URL` di `next.config.ts`.

Diuji dengan empat keadaan: nilai kosong, nilai berisi spasi, alamat tanpa protokol, dan tanpa `NEXT_PUBLIC_SITE_URL` sama sekali. Keempatnya berhasil dibangun, dan alamat pada gambar pratinjau tautan tetap benar.

Konsekuensi: `NEXT_PUBLIC_SITE_URL` sekarang opsional. Isi manual hanya kalau app sudah punya domain sendiri.

---

### D-48 Footer tidak boleh mematikan seluruh situs

Gejala: setelah deploy berhasil, seluruh halaman publik menampilkan "Application error: a server-side exception has occurred" tanpa keterangan apa pun.

Sebabnya rancangan saya sendiri. Footer membaca pengaturan dari database, dan footer dirender lewat layout. Galat yang terjadi di dalam layout tidak bisa ditangkap error boundary halaman di segmen yang sama, jadi satu kegagalan database menjatuhkan seluruh situs ke halaman galat bawaan Next yang tidak menjelaskan apa-apa.

Perbaikannya tiga lapis:

1. Footer menjaga bacaannya sendiri. Kalau database gagal dijawab dalam 5 detik atau melempar galat, footer tetap tampil dengan nilai bawaan dan tanpa tautan sosial. Kerangka situs selalu utuh, dan galat isi halaman ditangani error boundary halaman yang pesannya jelas.
2. Ada `global-error.tsx` sebagai jaring terakhir, berbahasa Indonesia, dengan tombol muat ulang dan penunjuk ke halaman diagnosa.
3. Setiap panggilan database yang berada di jalur render halaman diberi batas waktu, supaya sambungan yang menggantung tidak membuat pengunjung menatap layar kosong sampai Vercel memutusnya.

### D-49 Driver lokal tidak lagi dipakai diam-diam di produksi

Sebelumnya, kalau kredensial Supabase tidak lengkap, app jatuh ke driver berkas lokal tanpa memberi tahu siapa pun. Di Vercel itu berbahaya: filesystem-nya hanya bisa dibaca, jadi app akan gagal dengan pesan yang menyesatkan, dan kalaupun berhasil menulis, datanya hilang setiap deploy.

Sekarang driver lokal hanya dipakai kalau diminta lewat `DATA_DRIVER=local`, atau saat menjalankan app di komputer sendiri tanpa kredensial. Di produksi, kredensial yang kurang menghasilkan satu pesan yang jelas dan bisa ditindaklanjuti.

### D-50 Halaman diagnosa untuk pengurus

`/admin/diagnosa` memeriksa sumber data, variabel Supabase, alamat publik app, keenam tabel, dan bucket penyimpanan gambar, lalu melaporkan hasilnya satu per satu.

Alasan: React di produksi menyembunyikan pesan galat asli dari peramban demi keamanan, jadi pengurus hanya melihat kode digest yang tidak bisa dipakai apa-apa. Halaman ini menjalankan pemeriksaannya di server, berbarengan, masing-masing dibatasi 8 detik, dan menerjemahkan penyebab yang sering muncul menjadi langkah yang bisa dikerjakan: alamat project salah, kunci yang dipakai bukan service role, tabel belum dibuat, atau project sedang dijeda. Halamannya ada di balik `/admin` sehingga rincian database tidak terbuka untuk umum.

---

## K. Perubahan dari masukan pengurus setelah app dipakai

### D-51 Foto dikecilkan di perangkat sebelum diunggah

Gejala: membuat acara baru dengan poster selalu gagal. Sebabnya batas bawaan Next untuk kiriman server action hanya 1 MB, sedangkan foto dari kamera HP biasanya 3 sampai 8 MB.

Perbaikannya dua lapis. Pertama, batas kiriman dinaikkan ke 4 MB, mengikuti batas badan permintaan Vercel yang sekitar 4,5 MB. Kedua, dan ini yang lebih penting, gambar sekarang dikecilkan di perangkat sebelum dikirim: sisi terpanjang 1400 piksel, kualitas diturunkan bertahap sampai ukurannya di bawah 900 KB. Poster uji 6 MB menjadi 845 KB. QRIS tetap PNG dan tidak diturunkan kualitasnya supaya polanya tajam saat dipindai.

Efek sampingnya bagus: foto HEIC dari iPhone ikut diubah jadi JPEG, sehingga tidak lagi ditolak server, dan unggahan jauh lebih cepat di jaringan seluler. Kalau pengurus sempat memilih berkas sebelum halaman selesai dihidupkan, berkas itu tetap diolah karena isian diperiksa ulang saat komponen terpasang.

### D-52 Tombol bagikan memakai lembar bagikan bawaan sistem

Gejala: tombol bagikan hanya membuka wa.me, tidak memunculkan pilihan kontak atau grup.

Sekarang tombolnya memakai Web Share API kalau perangkat mendukung: yang terbuka adalah lembar bagikan bawaan sistem, dan dari situ pengguna memilih WhatsApp lalu memilih kontak atau grup, persis seperti membagikan tautan dari app lain. Tautan `api.whatsapp.com/send` tetap dipasang sebagai href aslinya, jadi tombol ini masih berfungsi di peramban lama dan saat JavaScript gagal dimuat.

### D-53 Tampilan diarahkan ulang jadi compact dan clean

Pengurus meminta tampilan seperti app penggalangan dana yang sudah mapan. Permintaan itu mengubah dua keputusan visual sebelumnya:

- Motif bayangan padat tanpa blur dilepas. Penggantinya garis pendek teal di atas judul bagian, yang lebih tenang dan tetap khas.
- Kartu memakai garis tipis, ukuran teks dasar turun ke 15px, padding dan jarak antar kartu dirapatkan, dan radius disederhanakan.

Larangan BRIEF §9 tetap dijaga: latar tetap krem hangat, bukan abu-abu, dan tidak ada kartu putih melayang dengan bayangan. Aturan antislop R-30 yang melarang meniru produk lain punya pengecualian untuk permintaan pemilik produk, dan ini termasuk pengecualian itu.

### D-54 Hero memakai foto asli yang berganti pelan

Foto latar hero diambil dari gambar yang benar-benar diunggah pengurus: foto header season, foto Kabar Aksi, lalu poster acara, maksimal lima. Tidak ada foto stok, sesuai R-38.

Di atas foto ada lapisan gelap bergradasi. Teks hero hanya diletakkan di area yang lapisan gelapnya minimal 0,88, dan di titik itu kontras teks krem tetap 7,8 banding 1 sekalipun fotonya putih polos. Angkanya dihitung, bukan dikira-kira.

Kalau belum ada satu pun foto, hero tampil sebagai blok warna tanpa carousel. Foto pertama diambil segera, sisanya menyusul, supaya jaringan seluler tidak dipakai untuk gambar yang belum terlihat. Tanpa penundaan itu, skor performa beranda turun ke 82 dan muncul galat konsol; setelah diperbaiki, kembali ke 95 tanpa galat.

### D-55 Navigasi bawah memakai ikon

Empat ikon digambar sendiri (rumah, kabar, kalender, orang), tetap berdampingan dengan labelnya. Ikon yang aktif diisi penuh, yang tidak aktif hanya garis. Jumlah kabar yang belum dibaca muncul sebagai titik angka merah di sudut ikon Kabar.

### D-56 Teks dipendekkan di seluruh halaman

Kalimat penjelas yang panjang dipangkas jadi satu baris atau dihapus kalau isinya sudah jelas dari tampilan. Contohnya keterangan nomor unik di halaman status, penjelasan tampilan kalender, dan pengantar setiap halaman. Aturan copywriting BRIEF §8 tidak berubah, yang berubah hanya panjangnya.

---

## L. Masukan pengurus putaran kedua

Enam masukan setelah app dipakai sehari-hari, ditambah satu bug yang ketahuan saat memverifikasinya.

### D-57 Fungsi Vercel dipindah ke Singapore

Bawaan Vercel menempatkan fungsi di Amerika, sedangkan Supabase pengurus ada di Singapore. Setiap kueri menyeberang Pasifik dua kali, dan halaman yang memanggil database belasan kali membayar ongkos itu berkali-kali. `vercel.json` menyetel `regions: ["sin1"]` supaya fungsi duduk di sebelah database. Ini penyebab terbesar dari keluhan "sedang mengambil data" yang lama.

### D-58 Bacaan publik dibungkus cache bertanda, bukan ISR

Semua halaman publik `force-dynamic` (D-23), jadi setiap kunjungan membaca database dari nol. Bacaan publik sekarang dibungkus `unstable_cache` bertanda di `src/lib/cache.ts` dengan umur 300 detik, dan aksi tulis memanggil `revalidateTag` supaya angka tidak pernah basi setelah pengurus mengubah sesuatu.

ISR penuh (`export const revalidate`) sengaja tidak dipakai: halaman akan dirender saat build, dan build ikut gagal kalau Supabase tidak terjangkau saat itu. Build project ini pernah gagal sekali karena env var (D-47), jadi ketergantungan tambahan pada build dihindari.

Yang sengaja tidak ikut di-cache: `/donasi/[code]`, `/tiket/[code]`, `/acara/[slug]/daftar`, dan `/api/kabar-terbaru`. Isinya status pribadi dan sisa kuota, dua hal yang harus selalu terbaru. Kuota acara di-cache 30 detik saja dengan alasan yang sama.

### D-59 Kuota acara diambil sekali untuk banyak acara

`acaraTerdekat()` dulu memanggil `eventCapacity()` satu per satu untuk tiap acara, jadi lima acara berarti lima kueri. Antarmuka `DataDriver` dapat metode baru `eventCapacities(eventIds)` yang mengambil semuanya dalam satu kueri `in('event_id', ids)`. `fotoHero()` juga tidak lagi mengambil ulang season, kabar, dan acara yang sudah diambil halaman.

### D-60 Foto hero punya tabel sendiri

Hero dulu memungut gambar dari poster acara dan foto Kabar Aksi, jadi isinya berubah sendiri mengikuti data lain dan pengurus tidak bisa mengaturnya. Tabel `hero_photos` dan menu **Foto Hero** memberi pengurus daftar khusus berikut urutan, keterangan, dan tombol sembunyikan. Poster acara tidak lagi dipungut sama sekali. Kalau daftarnya kosong, hero kembali jadi blok warna, bukan kotak kosong.

Keterangan foto dipakai sebagai teks alternatif. Kalau dikosongkan, dipakai "Kegiatan komunitas Dzun Nuun".

### D-61 Penanda kegiatan menggantikan hitungan hari

"Hari ke-N" mengandaikan satu rangkaian kegiatan yang berjalan terus, padahal yang dilaporkan pengurus bermacam-macam. Kolom `activity_label` menggantikannya dengan teks bebas maksimal 60 huruf, misalnya `MBKM Pekan ke-12` atau `Tahsin Pertemuan 13`. Kabar tanpa penanda hanya menampilkan tanggal.

Kolom `day_number` dibiarkan ada di database supaya data lama tidak hilang, tetapi tidak lagi dibaca app. Kabar lama tidak dikonversi otomatis, karena "Hari ke-12" justru bentuk yang tidak diinginkan.

### D-62 Agenda terdekat jadi carousel kartu

Poster acara naik jadi header kartu dengan rasio 4:3, dan separuh bawah berisi tanggal, judul, lokasi, harga, sisa kuota, lalu tombol **Daftar** penuh lebar. Acara tanpa poster memakai blok teal gelap berisi tanggal besar, bukan kotak abu-abu kosong. Kartu selebar 85% layar supaya kartu berikutnya terlihat mengintip, jadi jelas bahwa daftarnya bisa digeser.

Wadah gesernya `<ul>` yang bisa difokus keyboard, dibungkus `<section aria-label="Agenda terdekat">` supaya pembaca layar mengenalinya sebagai satu bagian tanpa kehilangan semantik daftar. Yang menggeser hanya wadahnya, halaman tidak ikut bergeser di lebar 360px.

Halaman `/acara` tetap daftar vertikal yang rapat, karena di situ orang memindai banyak acara sekaligus, bukan melihat sorotan.

### D-63 Bar sosial menempel di atas navigasi bawah

Tautan sosial di footer nyaris tidak pernah terlihat karena footer ada di ujung halaman. Bar setinggi 38px sekarang menempel tepat di atas navigasi bawah, hanya di layar HP. Latarnya emas brand `#C6B066` dengan teks tinta `#06232A`, rasio kontras 7,65 banding 1 (dihitung, bukan dikira-kira), dan ini warna paling terang di palet sehingga mencolok tanpa keluar dari BRIEF §9.

Bar hanya dirender kalau Instagram atau TikTok terisi, jadi tidak pernah jadi bar kosong. Padding bawah halaman publik naik jadi 96px supaya isi terakhir tidak tertutup. Di layar lebar tautannya tetap di footer.

### D-64 Pendaftaran dialihkan dari server, bukan dari state klien

Ketahuan saat memverifikasi D-58. `FormPendaftaran` dulu memindahkan peramban ke halaman tiket lewat `useEffect` yang membaca kode dari `useActionState`. Begitu aksi pendaftaran memanggil `revalidateTag`, halaman dirender ulang; dan kalau pendaftaran itu sendiri yang membuat kuota penuh, formnya berganti jadi keadaan "Kuota penuh" dan komponennya lepas sebelum efeknya sempat jalan. Akibatnya pendaftar yang baru saja membayar tidak pernah sampai ke halaman tiketnya.

Aksi sekarang memanggil `redirect()` dari server, jadi perpindahannya tidak bergantung pada state klien yang bisa hilang. Ini gejala yang sama dengan D-21, dan pelajarannya sama: jangan menaruh langkah penting pada state yang bisa lenyap saat komponen dipasang ulang.

---

## M. Masukan pengurus putaran ketiga

Enam masukan, tiga untuk sisi jamaah dan tiga untuk sisi pengurus. Yang
mendasari sisi jamaah: habitat sebenarnya jamaah ada di WhatsApp, bukan di web
app ini.

### D-65 Halaman status pribadi dihapus

`/donasi/[kode]` dan `/tiket/[kode]` mengandaikan orang menyimpan sebuah alamat
lalu kembali membukanya. Dalam pemakaian nyata itu tidak terjadi. Keduanya
dihapus, dan seluruh kabar penerimaan berikut QR tiket dikirim pengurus lewat
nomor WhatsApp yang diisi jamaah.

Efek sampingnya bagus: nomor WhatsApp jadi punya alasan yang jelas untuk diisi
dengan benar, karena di situlah tiketnya datang.

Perlu dicatat terbuka bahwa ini mencabut BRIEF §6 butir 3, yang menyebut
halaman status donasi sebagai mekanisme retensi dan menandainya "jangan
dipangkas". Pencabutan itu keputusan pemilik produk berdasarkan pemakaian
nyata, bukan kelalaian. Retensi sekarang bersandar pada tiga mekanisme sisanya
(Laporan Kegiatan, badge belum dibaca, Saluran WhatsApp) ditambah percakapan
WhatsApp yang justru lebih personal daripada satu halaman status.

Ikut hilang bersamanya: mode salin alamat halaman di `SalinTeks`, dan blok
ucapan terima kasih pada donasi terverifikasi. Yang terakhir pindah ke template
pesan WhatsApp (D-70), bukan dibuang.

### D-66 Layar hasil dipegang kuki, bukan state klien

Donatur tetap butuh nominal unik dan QRIS untuk bisa transfer. Layar hasil
sekali tampil menggantikan halaman status: `/donasi/selesai` dan
`/acara/selesai`, tanpa kode di alamatnya, jadi tidak bisa ditebak, dibagikan,
atau di-bookmark.

Kodenya dititipkan di kuki `httpOnly` berumur 2 jam, bukan di state klien.
Alasannya konkret: jamaah akan berpindah ke aplikasi bank untuk transfer, dan
saat kembali, tab peramban di HP sering sudah dimuat ulang. Kalau nominalnya
hanya hidup di state klien, nominal itu lenyap justru pada saat paling
dibutuhkan, dan transfernya jadi tidak bisa dicocokkan pengurus. Ini bentuk
kegagalan yang sama dengan D-21 dan D-64.

Diuji: kirim donasi, catat nominal, muat ulang halaman, nominal tetap sama.
Tanpa kuki, halamannya menampilkan kalimat jujur berikut jalan keluarnya,
bukan galat.

### D-67 QR tiket jadi gambar ber-alamat yang tidak menyentuh database

wa.me hanya bisa mengisi teks, tidak bisa melampirkan berkas. Supaya QR tetap
bisa dikirim, dibuat rute `/api/qr/[kode]` yang mengembalikan PNG.

Rute ini sengaja **tidak menyentuh database**. Kodenya hanya diperiksa
bentuknya lalu digambar. Jadi tidak ada yang bisa memakai alamat ini untuk
menebak kode mana yang benar-benar ada, dan tidak ada nama atau nominal yang
bisa bocor lewat sini. Kode yang tidak terdaftar pun tetap digambar, dan itu
justru yang membuatnya aman.

Isi QR tetap kode telanjang `DZN-XXXX`, bukan alamat halaman. Ini wajib:
`PapanCheckIn` menulis hasil pindaian kamera langsung ke kolom kode, jadi
mengisinya dengan URL akan merusak check-in. Diuji dengan membaca ulang PNG
yang dihasilkan memakai pembaca QR terpisah, lalu memasukkan nilai hasil
bacaannya ke check-in sungguhan sampai berhasil.

### D-68 "Kabar Aksi" jadi "Laporan Kegiatan", alamatnya tetap

Yang dimasukkan pengurus adalah laporan dari kegiatan yang sudah terlaksana,
jadi namanya disesuaikan. Hanya teks yang dilihat pengguna yang berubah.
Alamat `/kabar`, `/admin/kabar`, `/api/kabar-terbaru`, nama tabel `updates`,
dan seluruh nama variabel dibiarkan, supaya tautan yang sudah disebar di grup
WhatsApp tidak mati. Nama folder di kode jadi tidak sama dengan labelnya, dan
itu diterima: yang melihatnya hanya yang menggarap kode.

Satu jebakan yang hampir terlewat: `NavBawah` memasang badge belum dibaca
dengan membandingkan `label === "Kabar"`. Mengganti labelnya saja akan
mematikan badge itu diam-diam. Perbandingannya diubah memakai `href`, yang
memang tidak ikut berubah.

Kunci `localStorage` penanda sudah dibaca juga dibiarkan. Menggantinya akan
mereset penanda semua pengunjung tanpa alasan.

### D-69 Pengumuman jadi jenis isi tersendiri

Pengumuman bergambar seperti "Aturan Masjid Ngopi-Ngopi" atau ucapan hari besar
tidak cocok dimasukkan ke Laporan Kegiatan: laporan menceritakan kegiatan yang
sudah terlaksana, pengumuman memberi tahu sesuatu dan bentuk utamanya gambar.
Jadi dibuat tabel `announcements` sendiri.

Carousel-nya menggabungkan dua pola yang sudah ada: rel geser dari
`CarouselAcara` supaya di HP tetap bisa digeser jari, dan pergantian otomatis
dari `HeroCarousel`. Jalannya berhenti kalau perangkat meminta gerak minimal,
saat disentuh, saat kursor di atasnya, dan saat ada tautan di dalamnya yang
menerima fokus keyboard. Carousel yang berjalan terus tanpa bisa dihentikan
menyulitkan orang yang membaca pelan atau memakai keyboard, dan itu bukan soal
selera.

Kalau belum ada pengumuman, seluruh bagian itu tidak dirender sama sekali.

### D-70 Pesan WhatsApp punya satu sumber kata-kata

`src/lib/pesan-wa.ts` memuat lima template. Dipakai dua kali: oleh halaman
contoh `/admin/pesan`, dan oleh tombol WhatsApp per baris di `/admin/donasi`
dan `/admin/pendaftar`. Satu sumber, jadi contoh dan yang benar-benar terkirim
tidak pernah berbeda.

Tombolnya sekarang mengikuti status baris. Donasi terverifikasi memakai pesan
penerimaan lengkap dengan jumlah jamaah yang dirangkul, donasi ditolak memakai
pesan yang memuat catatan pengurus, pendaftar terkonfirmasi memakai pesan yang
memuat tautan gambar QR. Sebelumnya tombol itu hanya menulis satu kalimat
pembuka dan pengurus mengetik sisanya sendiri.

Catatan penolakan (`admin_note`) dulunya hanya pernah tampil di
`/donasi/[kode]`. Tanpa template ini, alasan penolakan tidak akan pernah sampai
ke donatur.

Template tidak bisa disunting dari panel. Itu disengaja: pengurus masih bisa
mengubah kalimatnya di WhatsApp sebelum menekan kirim, dan menyimpan template
di database menambah satu tabel dan satu formulir untuk manfaat yang belum
tentu dipakai. Kalau nanti ternyata sering diubah, memindahkannya ke pengaturan
itu pekerjaan kecil.

> Dicabut sebagian oleh D-85. Templatnya sekarang bisa disunting di
> `/admin/pesan`. Yang tetap berlaku dari keputusan ini: satu sumber kata-kata,
> dan tidak ada tabel baru.

Tidak ada pengiriman otomatis. wa.me hanya membuka WhatsApp dengan teks terisi,
pengurus sendiri yang menekan kirim, sesuai BRIEF §1.

### D-71 Daftar di panel pengurus jadi tabel

Tujuh daftar yang dulunya kartu bertumpuk sekarang tabel. Kartu boros tempat
saat pengurus mencocokkan puluhan baris donasi dengan mutasi rekening.

Karena panel dibuka dari HP dan laptop sama seringnya, satu tabel melayani
keduanya: kolom sekunder disembunyikan di bawah `sm`, dan baris bisa dibuka
untuk menampilkan sisanya berikut tombol aksinya. Di layar lebar semua kolom
dan semua tombol langsung terlihat.

Pembungkus `overflow-x-auto` bukan hiasan: `body` memasang
`overflow-x: hidden`, jadi tabel yang meluber tanpa pembungkus sendiri tidak
akan bisa digeser sama sekali.

Sekalian dirapikan: chip status dulu ditulis ulang sendiri-sendiri di tiap
halaman sehingga bentuknya berbeda-beda, padahal `.label-status` sudah ada dan
justru tidak dipakai panel pengurus. Sekarang semuanya memakai kelas itu
ditambah satu kelas warna.

### D-72 Formulir "buat baru" masuk laci bawah

Formulir yang selalu terbuka di atas daftar mendorong daftarnya jauh ke bawah,
padahal yang paling sering dilihat pengurus adalah daftarnya. Formulir sekarang
di balik tombol, muncul sebagai laci dari bawah layar.

Memakai `<dialog>` bawaan peramban seperti `KonfirmasiAksi`, jadi Escape untuk
menutup, jebakan fokus, dan lapisan paling atas didapat gratis, bukan
ditiru-tiru dengan `div`. Laci tidak punya `<form>` sendiri karena `FormAksi`
sudah merender `<form>` dan form bersarang akan rusak.

Mode ubah tetap satu formulir saja lewat `?edit=`, sekarang di dalam laci yang
terbuka sendiri. Menutupnya memindahkan peramban ke alamat tanpa `?edit=`,
supaya lacinya tidak terbuka lagi.

Dua hal yang harus dijaga dan sudah ditangani: `PilihGambar` dulu memakai id
yang tidak dibedakan per record, jadi laci "buat baru" berdampingan dengan
formulir ubah akan menghasilkan `#gambar-poster` ganda; sekarang ada prop
`kunci`. Dan tombol pemicu laci foto hero dulu punya nama yang sama persis
dengan tombol simpan di dalamnya, dua tombol satu nama dalam satu halaman;
tombol simpannya diganti jadi "Simpan foto hero".

---

## N. Masukan pengurus putaran keempat

Tujuh masukan. Dua di antaranya mencabut aturan yang ditulis di `BRIEF.md`.
Keduanya keputusan pemilik produk, dicatat terbuka di sini supaya tidak
terbaca sebagai kelalaian.

### D-73 BRIEF §5 "jangan bikin role" dicabut, dua password bersama

Panitia acara perlu bisa mengurus acara dan pendaftar tanpa ikut melihat
donasi, pengaturan, dan diagnosa. Sebelumnya semua pengurus memakai satu
password yang membuka segalanya.

Yang dibuat bukan sistem role bertabel. Tidak ada tabel pengguna, tidak ada
Supabase Auth. Yang ada dua password bersama di env var dan satu kata peran di
dalam cookie yang sudah ada. Larangan §5 yang sesungguhnya, yaitu tabel user
dan Supabase Auth, tetap dipatuhi. Kalimat "jangan bikin role" yang memang
tidak berlaku lagi.

Token sesi sudah berbentuk `subjek.kedaluwarsa.tandatangan` sejak awal, dan
subjeknya ikut ditandatangani. Jadi menambah peran kedua tidak mengubah skema
tanda tangan sama sekali, dan sesi superadmin yang sedang berjalan tetap sah
setelah perubahan ini dipasang.

`ADMIN_PASSWORD_PANITIA` boleh dikosongkan. Kalau kosong, app berjalan persis
seperti sebelumnya dengan satu password.

Penjagaannya tiga lapis: middleware mencocokkan awalan alamat (ini yang juga
menjaga `/admin/pendaftar/csv`, satu-satunya rute admin tanpa pemeriksaan
sendiri di dalamnya), `pastikanAdmin("admin")` pada sembilan aksi milik
superadmin, dan penyaringan menu. Halaman ringkasan tidak sekadar
menyembunyikan angka donasi dari panitia: datanya memang tidak diambil.

Kedua password selalu diperiksa keduanya, bukan berhenti di yang pertama
cocok, supaya lama pemeriksaan tidak memberi tahu password mana yang kena. Dan
kegagalan dicatat ke pembatas laju paling banyak sekali per kiriman, kalau
tidak batas delapan kali diam-diam jadi empat.

### D-74 BRIEF §12 "profil pengguna" disentuh oleh kartu loyalitas

Kartu loyalitas menyimpan riwayat kehadiran per orang, dan itu memang dekat
dengan "profil". Yang tidak dibuat: akun, password, dan login jamaah. Identitas
diambil dari nomor WhatsApp yang sudah diisi jamaah tiap mendaftar acara, dan
`normalkanWa()` sudah memampatkan semua bentuk penulisan jadi satu bentuk
`62812…` sejak lama, jadi kuncinya sudah ada tanpa tabel baru.

Larangan "leaderboard donatur" di §12 tetap dipatuhi: tidak ada peringkat
publik, dan daftar jamaah loyal hanya terlihat superadmin.

### D-75 Aturan hitung kehadiran

Satu kehadiran sama dengan satu tiket berstatus `checked_in`. Bukan per kepala:
satu orang yang mendaftarkan lima orang tetap dihitung satu, karena yang punya
nomor itu yang hadir.

Dihitung dari `status`, bukan dari `checked_in_at`. Bedanya nyata:
`batalkanPendaftar` bisa dijalankan pada tiket yang sudah check-in dan tidak
mengosongkan `checked_in_at`. Tiket yang dibatalkan tidak boleh ikut menambah
stempel. Diuji: tiga kehadiran, satu dibatalkan, hitungannya turun jadi dua.

Aturannya ditaruh di `src/lib/data/kehadiran.ts` dan dipakai kedua driver,
supaya keduanya tidak pernah berbeda jawaban.

### D-76 Tautan kartu memakai tabel pemetaan, bukan nomor di alamat

Godaan termudah adalah menandatangani nomor WhatsApp lalu menaruhnya di alamat
halaman. Itu ditolak: BRIEF §7 melarang nomor utuh muncul di halaman publik,
dan alamat halaman ikut tercatat di riwayat peramban serta bisa terbawa ke
header referer.

Jadi ada tabel `loyalty_links` berisi token acak 16 karakter. Selain menutup
nomornya, ini juga membuat tautan bisa dicabut: menekan tombolnya sekali lagi
membuat token baru dan menghanguskan yang lama.

Membuka halaman daftar jamaah loyal tidak membuat token. Token lahir saat
pengurus menekan tombolnya, jadi permintaan baca tidak menulis apa pun.

### D-77 Post sosmed memakai embed resmi, dan ongkosnya diterima sadar

Menarik post terbaru otomatis butuh akun Instagram Business tersambung Halaman
Facebook, aplikasi terdaftar di Meta dan TikTok Developer, review dari
keduanya, dan token yang harus diperpanjang berkala. Terlalu berat untuk
komunitas ini, dan bisa mati sendiri saat tokennya kedaluwarsa.

Yang dipakai embed resmi: pengurus menempel tautan post, skrip platform yang
menampilkan isinya. Konsekuensinya diterima sadar dan perlu disebut apa adanya:
**skrip itu melacak pengunjung**, dan itu skrip pihak ketiga pertama di app ini.

Yang dijaga supaya ongkosnya tidak menular ke performa:

- Skrip tidak dimuat saat beranda dibuka. Wadahnya dirender lebih dulu dengan
  tinggi pasti, dan skripnya baru diminta saat bagian itu mendekati layar
  lewat `IntersectionObserver` dengan `rootMargin` 400px.
- Tiap embed dibungkus wadah rasio tetap, supaya iframe yang tingginya baru
  diketahui belakangan tidak menggeser isi di bawahnya.
- Sebelum skripnya dimuat, wadahnya sudah berupa tautan yang bisa dibuka. Kalau
  embed-nya gagal atau diblokir, yang tersisa tetap berguna.
- Alamat yang diterima hanya dari kedua platform itu. Alamat lain ditolak saat
  disimpan, bukan dibiarkan jadi kotak kosong di beranda.

### D-78 Bank soal kuis berupa teks, bukan tabel soal

Pengurus perlu bisa memperbarui soal tanpa deploy dan tanpa menyentuh kode.
Tabel soal berarti satu menu CRUD lagi untuk isi yang sebenarnya cocok ditulis
sekali jalan. Jadi bank soal disimpan sebagai satu teks berformat di
pengaturan, disunting lewat satu kotak teks.

Formatnya sengaja hanya punya tiga tanda: pagar untuk pertanyaan, bintang untuk
jawaban benar, strip untuk jawaban salah, blok dipisah baris kosong.

Parsernya mengembalikan galat, bukan membuang soal yang rusak diam-diam. Bank
soal yang rusak tidak boleh berubah jadi kuis yang tidak mungkin dimenangkan
siapa pun, dan galatnya ditampilkan di halaman pengurus.

### D-79 Isian kuis dan polling selalu tersimpan, yang dijaga tampilnya

Awalnya penyimpanan ditolak kalau bank soalnya belum lengkap. Itu ternyata
menciptakan bug: balasan aksi merender ulang seluruh pohon komponen server,
komponen klien di dalamnya dipasang ulang, dan pilihan mode yang belum
tersimpan kembali ke nilai lama. Pengurus mengira modenya sudah "kuis" padahal
sudah balik ke "mati". Bentuk kegagalan yang sama dengan D-21 dan D-64, dan
terbukti masih terjadi walaupun pilihannya sudah dibuat terkendali.

Perbaikannya bukan menambal, tetapi menghapus jalur penolakannya: isian selalu
tersimpan termasuk yang setengah jadi, dan yang dijaga adalah tampilnya di
beranda. `BagianInteraksi` tidak merender apa pun kalau isinya belum lengkap,
dan pesan setelah menyimpan menyebutkan dengan jujur kenapa belum tampil.

Sekalian jadi lebih enak dipakai: pengurus bisa menyimpan draf bank soal lalu
melanjutkan besok.

### D-80 Kunci jawaban tidak pernah dikirim ke peramban

Yang dikirim ke klien hanya soal, pilihan, sebuah benih, dan tanda tangan
benih itu. Server menyusun ulang soal yang sama persis dari benih tersebut saat
menilai, jadi kunci jawaban tidak pernah meninggalkan server dan pengirim tidak
bisa mengarang nomor soal atau menukar urutan pilihan.

Benih diikat ke waktunya di dalam tanda tangan dan hanya berlaku 30 menit,
supaya jawaban tidak bisa dicoba berulang seharian dengan satu set soal.

Diuji dengan mengubah tanda tangan dan mengubah benih lewat DOM lalu mengirim
form sungguhan: keduanya ditolak, dan modal menang tidak muncul.

### D-81 Keunikan polling ditegakkan batas unik database

Keunikan pengisi polling ditegakkan batas unik `(poll_key, penanda)` di
database, bukan pemeriksaan di aplikasi. Pemeriksaan di aplikasi bisa dilewati
dua permintaan yang datang bersamaan.

Penandanya id acak di kuki perangkat. **IP sengaja tidak dipakai sebagai
identitas**: komentar di aksi donasi sudah menjelaskan bahwa satu masjid sering
berbagi satu IP seluler, jadi IP hanya dipakai sebagai rem banjir. Kuki bisa
dihapus orang, dan itu diterima: polling ini mengukur pendapat, bukan
pemungutan suara resmi.

Kunci polling berganti tiap pertanyaan atau pilihannya diubah, supaya suara
lama tidak tercampur ke pertanyaan baru dan orang yang sudah menjawab bisa
menjawab lagi di pertanyaan berikutnya.

Kuota pemenang kuis dijaga cara yang sama: batas unik `(whatsapp, won_on)`
dengan tanggal menurut waktu Jakarta.

### D-82 Carousel pengumuman selebar kartu donasi, tanpa teks

Slide dibuat selebar kartu donasi di atasnya dengan rasio 2:1, dan judulnya
dihapus dari tampilan. Semua pesan dititipkan ke gambarnya sendiri, jadi
pengurus bebas menata isinya tanpa bertabrakan dengan teks app.

`alt` tetap diisi judul pengumuman. Tanpa teks yang terlihat, keterangan itu
satu-satunya cara pembaca layar tahu isi gambarnya. Titik penanda posisi tetap
ada, dan penghitungan titik aktif diubah memakai posisi tiap slide, bukan lebar
dibagi rata, karena ada jarak antarslide yang membuat pembagian rata meleset
makin jauh di slide terakhir.

Gambar lama yang berbentuk persegi akan terpotong. Dicatat di README.

### D-83 Bar sosial jadi ikon

Teks "Instagram" dan "TikTok" diganti ikon supaya muat di bar setinggi 38px.
Ikon di app ini semuanya `aria-hidden`, jadi tiap tautan diberi `aria-label`;
tanpa itu keduanya jadi tautan tanpa nama bagi pembaca layar.

Sasaran tapnya dibuat 44 kali 38 piksel dengan melebarkan tautannya, bukan
meninggikan barnya. Meninggikan bar berarti mengubah juga ruang bawah halaman
yang sudah dipesan pas `pb-[96px]`.

### D-84 "Ikut patungan" jadi "Ikut donasi"

Tombol ajakan dan judul halaman `/donasi` ikut berubah, termasuk label kartu
progress supaya tidak campur aduk dalam satu kartu.

Yang sengaja tidak diubah: judul cadangan season dari `judulSeason()` yang
menghasilkan "Patungan 1 Jan sampai 31 Mar", dan label "Patungan Dzun Nuun" di
gambar pratinjau tautan season. Keduanya identitas season yang sudah tersebar
di tautan WhatsApp; menggantinya mengubah judul tautan lama tanpa manfaat.

---

## O. Masukan pengurus putaran kelima

Dua masukan. Yang pertama mencabut satu keputusan yang ditulis sendiri di D-70.

### D-85 Templat pesan WhatsApp pindah ke panel, D-70 dicabut sebagian

D-70 memutuskan templat tidak bisa disunting dari panel, dengan alasan
menyimpannya di database menambah satu tabel dan satu formulir untuk manfaat
yang belum tentu dipakai. Kalimat penutupnya menyebut kalau ternyata sering
diubah, memindahkannya ke pengaturan itu pekerjaan kecil. Pengurus memintanya,
jadi pekerjaan kecil itu dikerjakan.

Yang tidak jadi dibuat: tabel baru. Suntingannya satu kolom `jsonb` di baris
`settings` yang sudah ada, dipetakan dari id templat ke teksnya. Kunci yang
tidak ada berarti templat itu memakai teks bawaan, jadi keadaan awal adalah
`{}` dan bukan sembilan salinan teks bawaan yang harus ikut diperbarui sendiri
setiap kalimat bawaannya diperbaiki lewat pembaruan app.

Teks bawaannya tetap di `src/lib/pesan-wa.ts`, sekarang sebagai templat berisi
isian, bukan fungsi yang merangkai kalimat. Satu sumber kata-kata dari D-70
tetap berlaku: halaman `/admin/pesan` dan tombol WhatsApp per baris membaca
templat yang sama.

Bahasa templatnya sengaja cuma punya satu aturan: **baris yang memuat isian
kosong dibuang seluruhnya**, lalu baris kosong berlebih dirapatkan. Itu yang
dulu ditangani `if` di dalam kode untuk catatan penolakan, lokasi acara, dan
tautan season. Bahasa templat bercabang akan lebih kuat, tetapi harus
dipelajari pengurus, dan tiga cabang itu satu-satunya yang pernah dibutuhkan.
Konsekuensinya disebut terus terang di halamannya: isian yang belum tentu ada
sebaiknya ditaruh di barisnya sendiri. Teks bawaan `pembayaran_tiket` ikut
diatur ulang supaya nominalnya punya baris sendiri.

Sembilan templat yang bisa disunting, dua di antaranya pembuka singkat yang
dulu tidak ada di halaman contoh. `pesanPemenangKuis` dihapus: fungsi itu tidak
pernah punya tombol, dan menaruh templat tanpa tombol di panel hanya
membingungkan.

Suntingan yang isiannya salah tulis, misalnya `{nma}`, **tetap tersimpan** dan
tidak ditolak. Yang dijaga pemakaiannya: templat bermasalah tidak dipakai
tombol mana pun, teks bawaannya yang jalan, dan halamannya menyebutkan
masalahnya per templat. Alasannya sama dengan D-79, dan diperkuat temuan di
D-87: kiriman yang ditolak mengosongkan formulir, jadi menolak simpanan sama
dengan menghapus kalimat yang baru diketik pengurus.

Panitia acara boleh membuka halamannya dan menyalin pesannya, tetapi tidak bisa
menyunting. Kata-kata yang dikirim atas nama komunitas adalah keputusan
pengurus inti, dan aksinya dijaga `pastikanAdmin("admin")` seperti sembilan
aksi superadmin lainnya.

### D-86 Donasi bisa dicatat dan dibetulkan pengurus

Dua alur baru di `/admin/donasi`: mencatat donasi yang masuk di luar formulir
publik, dan mengubah donasi yang sudah ada. Keduanya memakai satu formulir yang
sama di dalam laci, mengikuti D-72.

Uang tunai yang diterima langsung di masjid selama ini tidak punya jalan masuk
sama sekali. Satu-satunya cara mencatatnya adalah menyuruh donaturnya mengisi
formulir publik, padahal uangnya sudah di tangan pengurus. Yang kedua, nominal
transfer sering tidak persis sama dengan yang diminta: ada yang membulatkan ke
atas, ada yang salah ketik satu angka. Sebelumnya pengurus hanya punya dua
pilihan, memverifikasi nominal yang salah atau menolak donasi yang uangnya
benar-benar masuk.

Empat keputusan di dalamnya:

**Nomor WhatsApp boleh kosong.** Berbeda dari formulir publik. Donasi tunai
sering datang tanpa nomor, dan mewajibkannya hanya akan membuat pengurus
mengarang nomor supaya formulirnya mau lewat. Tombol WhatsApp pada baris
tanpa nomor tidak dirender, dan rinciannya menulis "nomor tidak dicatat",
bukan nomor samaran yang menyesatkan.

**Nominal dan jumlah paket diisi terpisah.** Nominal yang menambah angka
rupiah di halaman publik, jumlah paket yang menghitung jamaah dirangkul.
Memaksa keduanya selalu berkelipatan akan membuat pengurus memilih antara
angka rupiah yang benar dan hitungan jamaah yang benar.

**Angka unik jadi nol untuk donasi yang dicatat manual.** Angka unik gunanya
mencocokkan transfer masuk; donasi yang dicatat pengurus tidak punya transfer
yang perlu dicocokkan. Yang dijaga satu: `base_amount + unique_suffix` selalu
sama dengan `total_amount`, di kedua jalur. Batas kolomnya di database
dilonggarkan dari 100–999 jadi 0–999 lewat `migrasi-04`.

**Donasi menunggu tetap tidak boleh punya nominal kembar.** Indeks unik
parsial dari D-10 tetap menjaganya di database, dan aksinya memeriksa lebih
dulu supaya pengurus membaca kalimat, bukan galat mesin. Donasi yang langsung
ditandai sudah masuk tidak kena aturan ini, sesuai indeksnya yang memang hanya
berlaku untuk baris `pending`.

Harga paket untuk donasi yang diubah diambil dari season milik donasi itu,
bukan season yang sedang aktif, supaya membetulkan donasi season lama tidak
ikut memakai harga baru.

Status tidak bisa diubah dari formulir ini. Verifikasi dan penolakan tetap
lewat tombolnya sendiri berikut kotak konfirmasinya (D-46), karena keduanya
yang menggeser angka publik dan mengirim kabar ke donatur.

### D-87 Formulir pengurus tidak lagi dikosongkan saat kiriman ditolak

Ditemukan saat menguji alur di atas. Sejak React 19, formulir dikosongkan
setiap aksi selesai, termasuk saat aksinya menolak kiriman. Jadi kalimat di
D-21, "galat validasi ditahan di halaman yang sama supaya isian yang sudah
diketik tidak hilang", sebenarnya tidak berlaku sejak lama, dan berlaku untuk
semua formulir pengurus, bukan cuma yang baru.

Yang paling berbahaya bukan isian teks, melainkan pilihan. Pada donasi yang
ditolak karena nominalnya kembar, pilihan "Belum masuk" berbalik sendiri ke
"Sudah masuk" tanpa terlihat. Pengurus menggeser nominalnya beberapa rupiah,
menekan simpan lagi, dan donasinya tercatat terverifikasi padahal uangnya
belum ada.

`FormAksi` sekarang membatalkan pengosongan itu. Pembatalnya dipasang sebagai
penyimak asli lewat `ref`, bukan lewat prop `onReset`: pembatalan dari prop itu
diuji dan tidak sampai membatalkan pengosongannya. Setelah berhasil, halaman
tetap dimuat ulang penuh seperti D-21, jadi isian lama ikut terbawa pergi.

Sekalian, `FormAksi` menerima `alamatSukses`. Tanpa itu, laci yang dibuka lewat
penanda di alamat seperti `?ubah=` akan terbuka lagi sendiri setelah disimpan,
karena yang dimuat ulang adalah alamat yang sedang dibuka berikut penandanya.

---

## P. Masukan pengurus putaran keenam

Dua masukan, keduanya di halaman yang dilihat calon donatur. Satu di antaranya
mencabut sebagian BRIEF §4.

### D-88 Empat pilihan paket bergambar, chip 33 dilepas

BRIEF §4 menulis "Chip pilihan cepat: 1 / 5 / 10 / 33 paket + input bebas".
Pengurus meminta empatnya diganti jadi 1 paket, 5 paket, 10 paket, dan
Berapapun, masing-masing dengan ikon dan keterangan berapa jamaah yang
terlayani. Angka 33 dilepas. Ini keputusan pemilik produk, dicatat terbuka
seperti D-73 dan D-74.

Ikonnya menggambarkan datanya sendiri: sebanyak paket, sebanyak sosok jamaah.
Satu paket satu sosok besar, lima paket satu baris lima, sepuluh paket dua
baris lima, dan Berapapun tiga sosok berikut tanda tambah.

Bentuk itu dipilih justru untuk menghindari larangan BRIEF §9 soal deretan ikon
garis tipis seragam. Empat lambang berbeda, misalnya koin, tangan, hati, dan
tanda tak hingga, persis akan jadi deretan itu, dan tidak satu pun benar-benar
menambah arti. Yang dipakai sekarang satu motif dengan jumlah yang berubah:
bentuk padat tanpa stroke tipis, dan jumlah paketnya terbaca sebelum angkanya
dibaca. Kalimat kunci `1 paket = 1 jamaah` ikut terulang tanpa perlu ditulis
ulang.

Lima sosok per baris, bukan sepuluh. Sepuluh sosok dalam satu baris jadi
sekitar 11 piksel di kartu selebar 136 piksel dan berubah jadi tekstur yang
harus dihitung satu per satu. Dua baris lima terbaca dua kali lipat massa
tintanya sekali lihat. Tidak ada satu pun nilai acak di posisinya: posisi yang
diacak akan berbeda antara gambar server dan gambar peramban, dan itu memicu
ketidakcocokan saat halaman dihidrasi.

Kotak angka bebas sekarang baru muncul saat "Berapapun" dipilih, lalu difokus.
Sebelumnya kotak itu selalu terbuka di bawah chip, menggandakan pilihan yang
sudah ditap dan memunculkan papan ketik angka pada orang yang cukup menekan
satu kartu.

Tiga keputusan kecil di dalamnya:

- **Radio asli, bukan tombol ber-`aria-pressed`.** Empat pilihan yang saling
  meniadakan memang radio: navigasi panah, satu perhentian Tab untuk seluruh
  grup, dan status terpilih yang benar di pohon aksesibilitas didapat gratis.
- **Hanya satu elemen bernama `paket` di DOM pada satu waktu.** Preset memakai
  isian tersembunyi, "Berapapun" memakai kotak yang terlihat, dan keduanya
  saling meniadakan. `FormData.get` mengambil yang pertama, jadi dua elemen
  bernama sama akan diam-diam mengirim angka yang salah.
- **Kotak bebas bertipe teks yang disaring, bukan `type="number"`.** Di kotak
  angka, mengetik "1.5" diterima peramban lalu ditulis ulang penyaring jadi
  "15". Angka yang berubah sendiri di depan mata orang yang sedang mengetik
  adalah bentuk kegagalan tersendiri. Di kotak teks, titiknya tidak pernah
  sempat muncul, dan papan ketik angka tetap didapat dari `inputMode`.

`BATAS_PAKET` pindah ke `src/lib/donasi.ts` supaya batas yang ditulis di layar
dan batas yang ditegakkan aksi server selalu satu angka. Modul `"use server"`
hanya boleh mengekspor fungsi async, jadi konstantanya memang tidak bisa
tinggal di `donasi/actions.ts`.

### D-89 Judul dan foto season naik ke kartu donasi beranda

Judul season yang membentuk niat orang untuk ikut. Sebelumnya beranda hanya
menulis "Donasi berjalan" dan angka rupiah, jadi pengunjung tahu berapa yang
terkumpul tetapi tidak tahu untuk apa. Urutan bacaannya sekarang: patungan yang
mana, sudah sejauh mana, berapa ongkosnya, lalu ikut.

Kepalanya hanya dirender kalau season sudah punya judul. Selama `title` masih
kosong, kartu tampil persis seperti sebelumnya berikut label "Donasi berjalan"
di tempat lamanya. Ini permintaan pengurus, dan kebetulan juga menghindari
judul cadangan "Patungan Oktober sampai Desember 2026" dari D-31 tampil sebagai
kalimat pengajak di beranda.

**Judulnya di bawah foto, bukan di atasnya.** Rancangan pertama menaruh judul
di atas foto dengan lapisan gelap, seperti hero. Kontrasnya dihitung, dan
angkanya yang membatalkan rancangan itu: pada foto putih polos, emas baru lolos
AA di lapisan 0,95, dan lapisan setebal itu menutupi hampir seluruh foto yang
justru dipasang supaya terlihat. Dengan judul di atas kertas, fotonya utuh,
kontras judulnya 16,11 banding 1, dan tidak ada satu pun angka yang bergantung
pada seterang apa foto yang diunggah pengurus.

Season tanpa foto header tidak mendapat kotak gelap setinggi band. Yang tampil
judulnya saja di atas kertas. Kotak gelap kosong hanyalah kotak abu-abu berbaju
teal, dan bagian kosong memang tidak dirender di app ini (D-30).

Dibuat sebagai komponen pembungkus `KartuDonasiBeranda`, bukan prop baru di
`ProgressSeason`. Komponen itu dipakai tiga halaman dan hanya beranda yang mau
kepala bergambar; halaman season sudah merender judul dan gambarnya sendiri
enam baris di atas pemanggilannya, dan panel pengurus tidak perlu keduanya.

Fotonya tidak diberi `priority`. Elemen LCP beranda adalah foto hero yang sudah
memakai `priority`, dan permintaan ketiga akan berebut giliran pertama di
jaringan seluler. Yang dipakai `loading="eager"` dengan `fetchPriority="low"`,
karena band-nya memang ada di dalam layar awal. Tinggi band dipasang pasti,
jadi CLS beranda tetap nol; diukur pada build produksi, hasilnya 0.

Taglinenya tidak ikut ditampilkan. Diukur di layar 360x640: dua baris tambahan
mendorong tombol "Ikut donasi" makin jauh dari layar pertama, dan taglinenya
sudah ada di halaman season.

### D-90 Dua gerak di kartu donasi, dan kenapa yang satu memakai skrip sebaris

Pengurus meminta gerak. Yang dipasang dua, keduanya berjalan sekali saat
halaman dibuka, bukan saat digulir, jadi larangan animasi scroll di BRIEF §12
tetap dipatuhi.

**Bar terisi dari nol.** Murni CSS. Yang dianimasikan `scaleX`, bukan `width`:
`var()` tidak perlu masuk ke dalam `@keyframes`, tidak ada layout per bingkai
di HP kelas bawah, dan lebar akhirnya tetap ditulis sebagai `width` biasa, jadi
kalau animasinya tidak pernah jalan barnya tetap berada di posisi yang benar,
bukan di nol. Ujung membulat tetap aman karena yang membulat relnya, bukan
isinya. Blok `prefers-reduced-motion` yang sudah ada menetralkannya tanpa
penjagaan tambahan di komponen.

**Angka rupiah berhitung naik.** Yang harus dijaga satu: HTML dari server tetap
memuat angka yang sebenarnya, supaya perangkat tanpa JavaScript dan pengambil
pratinjau tautan WhatsApp tidak pernah membaca "Rp 0". Jadi server merender
angka aslinya, dan satu skrip sebaris yang jalan saat HTML masih diurai yang
mengubahnya jadi nol lalu menghitung naik.

`useEffect` ditolak, dan ini bukan soal selera: ia baru jalan setelah cat
pertama, jadi di HP kelas menengah angka aslinya sempat terlihat lalu melompat
balik ke nol. Itu terbaca sebagai kerusakan, bukan animasi. Karena skripnya
mengubah teks sebelum React menghidrasi, elemennya diberi
`suppressHydrationWarning`, yang memang disediakan React untuk pola ini.

Ini skrip sebaris pertama di app. Ongkosnya disebut apa adanya: pada
perpindahan halaman di dalam app skrip itu tidak dijalankan ulang, jadi
angkanya langsung tampil tanpa berhitung. Pengunjung app ini hampir selalu
datang dari tautan WhatsApp, yaitu muat penuh.

Berhitungnya dinyalakan di beranda dan halaman season, dimatikan di panel
pengurus: pengurus butuh angka pastinya seketika, bukan pertunjukan.

### D-91 Formulir tidak lagi dikosongkan saat kiriman ditolak, sekarang di semua formulir

D-87 memasang penahan pengosongan di `FormAksi`, formulir panel pengurus.
Menguji kartu pilihan paket menunjukkan masalah yang sama ada di formulir
publik: kiriman yang ditolak mengosongkan formulir, radio di dalam kartu yang
tersorot ikut terhapus, jadi titik pilihannya tidak lagi sesuai dengan kartu
yang terlihat terpilih.

Penahannya dipindah ke satu kait bersama `useTahanPengosongan` di
`src/lib/form.ts`, lalu dipasang di kelima formulir: donasi, pendaftaran acara,
kuis, polling, dan panel pengurus. Aman untuk semuanya karena tidak ada satu
pun yang mengandalkan dikosongkan: yang berhasil selalu berpindah halaman atau
berganti tampilan.

### D-92 Lapisan gelap hero dinaikkan dari 0,88 ke 0,94

Ditemukan saat menghitung kontras untuk kepala kartu donasi. `DESIGN.md` §3
mencatat emas di atas `#043A43` berasio 5,80, dan itu benar untuk warna padat.
Di hero, emasnya duduk di atas **foto** dengan lapisan 0,88, dan pada foto putih
polos rasionya cuma 4,07, di bawah ambang AA 4,5 untuk teks 14 piksel. Angka
0,88 memang pernah dihitung, tetapi untuk teks krem, bukan untuk kalimat
pembuka yang emas.

Dinaikkan ke 0,94: emas jadi 4,88 dan krem 9,43. Fotonya sedikit lebih gelap di
bagian bawah, tempat teksnya duduk, dan bagian atas hero tidak berubah.

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
