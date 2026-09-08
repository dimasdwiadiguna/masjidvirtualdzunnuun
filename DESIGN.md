# DESIGN.md, Arah Visual Web App Dzun Nuun

Dokumen ini adalah **sumber arah visual**. Antislop dipakai sebagai filter di atasnya, bukan sebagai pengganti dokumen ini.

Sumber isi: BRIEF.md §9 dan §10, file logo di root repo, dan brand color yang sudah ditetapkan pengurus.

---

## 1. Design Read

> Membaca ini sebagai: **web app komunitas masjid** untuk **jamaah muda dan warga sekitar yang membuka link dari grup WhatsApp di HP Android kelas menengah**, dengan bahasa visual **poster cetak komunitas: kertas hangat, tinta tebal, bayangan padat tanpa blur**, dial **ENERGY 2 / RHYTHM 2 / MOTION 1**.

Kenapa dial-nya begitu:

- **ENERGY 2.** Ini komunitas pemuda, bukan situs layanan publik yang datar, tapi juga bukan portofolio agensi. Halaman harus menyapa dengan hangat lalu cepat masuk ke isi (nominal, tanggal, tombol).
- **RHYTHM 2.** Komposisi antar section memang berbeda (hero gelap, feed kabar, daftar acara, blok arsip), tapi tetap ada pola yang konsisten supaya pengurus non-teknis gampang menambah konten tanpa merusak tampilan.
- **MOTION 2.** Hanya dua gerak yang dipakai: pergantian foto di hero, dan perubahan state pada tombol. Tidak ada animasi scroll, sesuai larangan BRIEF §12. Pergantian foto berhenti sendiri kalau perangkat meminta gerak minimal.

## 2. Karakter

Hangat, jujur, buatan manusia. Rasanya seperti poster kegiatan yang ditempel di papan pengumuman masjid: tinta tebal, kertas sedikit krem, tidak licin, tidak korporat.

Uji identitas: kalau logo dan nama dicopot, halaman ini masih harus terasa milik satu komunitas tertentu karena tiga hal, yaitu kertas krem hangat, bayangan padat tanpa blur di elemen penting, dan judul Geologica yang tebal dan rapat.

## 3. Warna

Palet aktif: **2 warna inti (teal, teal gelap) + 1 aksen (emas)**, di atas netral hangat (krem dan tinta). Sesuai batas R-29.

| Token | Hex | Dipakai untuk |
|---|---|---|
| `--cream` | `#F7F3EA` | Latar halaman. Krem hangat, bukan putih murni. |
| `--paper` | `#FFFDF7` | Permukaan yang naik satu tingkat: kartu, input, sheet. |
| `--ink` | `#06232A` | Teks utama. Gelap kehijauan, bukan hitam murni. |
| `--ink-soft` | `#47615F` | Teks sekunder, garis batas input, ikon. |
| `--teal` | `#0A8074` | Warna brand 1. Tombol utama, blok besar, badge. |
| `--teal-ink` | `#075F57` | Versi teal yang aman untuk teks kecil di atas krem. |
| `--teal-deep` | `#043A43` | Warna brand 1 gelap. Blok hero, footer, kartu progress. |
| `--gold` | `#C6B066` | Warna brand 2. **Hanya di atas permukaan gelap.** |
| `--gold-ink` | `#6E5410` | Versi emas yang aman untuk teks kecil di atas krem. |
| `--success` | `#1E6B3A` | Status terverifikasi, tiket terkonfirmasi. |
| `--danger` | `#8A1F1F` | Status ditolak, error form. |

Aksen emas dipakai **hanya di tiga tempat**: kalimat pembuka di hero (emas di atas foto gelap), penanda kegiatan di Kabar Aksi (memakai `--gold-ink` karena label itu duduk di atas krem), dan latar bar sosial yang menempel di atas navigasi bawah (tinta gelap di atas emas, rasio 7,65 banding 1). Progress bar memakai teal karena barnya kini duduk di kartu terang, dan emas tidak lolos kontras di sana.

Garis kartu memakai `--garis` (`#DED5C2`) yang sengaja tipis dan tenang, sedangkan garis isian memakai `--garis-isian` (`#7B8886`, rasio 3.62 terhadap kertas) karena batas komponen yang bisa diisi wajib memenuhi kontras non-teks 3:1.

### Bukti kontras (WCAG AA, dihitung dengan `contrast-check.py` dari antislop-human)

| Pasangan | Rasio | Teks normal 4.5 | Teks besar 3.0 |
|---|---|---|---|
| `--ink` di atas `--cream` | 14.80 | PASS | PASS |
| `--ink-soft` di atas `--cream` | 6.03 | PASS | PASS |
| `--teal-ink` di atas `--cream` | 6.81 | PASS | PASS |
| `--gold-ink` di atas `--cream` | 6.45 | PASS | PASS |
| `--paper` di atas `--teal` | 4.74 | PASS | PASS |
| `--cream` di atas `--teal-deep` | 11.21 | PASS | PASS |
| `--gold` di atas `--teal-deep` | 5.80 | PASS | PASS |
| `--ink` di atas `--gold` | 7.65 | PASS | PASS |
| `--success` di atas `--cream` | 5.89 | PASS | PASS |
| `--danger` di atas `--cream` | 8.26 | PASS | PASS |
| `--teal` di atas `--cream` (non-teks) | 4.36 | (untuk garis dan blok, batas 3.0) | PASS |

Yang **tidak boleh**: `--gold` sebagai teks atau garis di atas `--cream` (rasio 1.93, gagal untuk teks maupun non-teks). Karena itu emas dikunci hanya untuk permukaan gelap.

## 4. Tipografi

- **Geologica** untuk heading, angka besar, dan label tombol. Alasan: brand sudah memakainya, hurufnya tebal dan rapat sehingga cocok menahan judul pendek di layar 360px, dan bobot variabelnya menghemat request font.
- **Raleway** untuk body dan isi markdown. Alasan: brand sudah memakainya, tinggi-x nya nyaman dibaca di paragraf pendek.
- Keduanya dimuat lewat `next/font/google` dengan `display: swap` dan subset latin saja.
- Skala tipe memakai `clamp()` supaya ikut mengecil di 360px tanpa media query terpisah.
- **Tidak ada** label uppercase dengan letter-spacing lebar, dan tidak ada monospace dekoratif.

## 5. Motif identitas

Satu motif: **garis pendek teal di atas setiap judul bagian** (22 x 3 piksel). Motif itu diulang di beranda, halaman season, halaman tentang, dan blok cara bayar, sehingga bagian-bagian halaman mudah dipindai sambil digulir cepat.

Kartu memakai garis tipis, bukan bayangan. Tidak ada bayangan melayang di elemen mana pun, jadi halaman tetap jauh dari pola kartu putih melayang yang dilarang BRIEF §9, sekaligus terasa rapat dan tenang seperti app penggalangan dana yang sudah mapan.

Motif bayangan padat tanpa blur yang sebelumnya dipakai sudah dilepas atas permintaan pengurus, yang meminta tampilan yang lebih compact dan clean. Alasannya dicatat di `DECISIONS.md` butir D-53.

## 6. Bentuk dan jarak

- Radius: `8px` untuk input, chip, dan label status, `10px` untuk tombol, `12px` untuk kartu. Variasi ini disengaja sebagai penanda hierarki (R-11). Tidak ada elemen berbentuk pil, kecuali titik penanda foto hero yang memang bulat.
- Skala jarak: 4, 8, 12, 16, 24, 32. Jarak antar kartu 8px, padding kartu 16px, jarak antar bagian 32px.
- Ukuran teks dasar 15px dengan tinggi baris 1,55. Halaman jadi lebih rapat tanpa mengorbankan keterbacaan.
- Lebar konten 600px untuk halaman isi, 880px untuk beranda dan daftar.
- Target tap minimal 44x44px, dengan jarak antar target minimal 8px.

## 7. Komposisi per halaman (RHYTHM 2)

Setiap halaman punya komposisi berbeda, bukan pengulangan "judul di tengah + grid kartu":

- **Beranda**: hero berupa foto kegiatan pilihan pengurus yang berganti pelan dengan lapisan gelap di atasnya, judul pendek di bagian bawah foto, lalu kartu progress yang sedikit menumpuk ke atas foto, lalu agenda terdekat sebagai carousel kartu, feed kabar, dan paragraf tentang kami.
- **Kartu progress**: label "Patungan berjalan" dan badge persentase di baris atas, rupiah sebagai angka utama dengan target sebagai baris kecil di bawahnya (urutan BRIEF §4), bar setebal 10px berujung membulat, lalu tiga kolom dipisah garis tipis: Jamaah dirangkul, Donasi masuk, Sisa hari. Tombol "Ikut patungan" penuh lebar di dalam kartu, dan "Rincian season" sebagai tautan teks di bawahnya supaya tidak ada dua tombol yang bersaing. Saat belum ada donasi, ketiga kolom tetap tampil berisi nol, tidak disembunyikan.
- **Kartu acara di carousel**: poster jadi header rasio 4:3, separuh bawah berisi tanggal, judul dua baris, lokasi, harga, sisa kuota, dan tombol Daftar penuh lebar. Acara tanpa poster memakai blok teal gelap berisi tanggal besar. Kuota penuh atau tenggat lewat diganti keterangan, bukan tombol mati.
- **Season**: foto header lebar, judul, progress besar di kartu gelap, deskripsi mengalir, feed kabar, logo sponsor sebagai baris sederhana.
- **Donasi**: form satu kolom, chip paket sebagai grid 2x2 di 360px, konversi hidup tepat di bawah input.
- **Status donasi**: nominal sebagai angka terbesar di halaman, sisanya menurun tajam. Ini satu-satunya halaman dengan satu fokus tunggal sebesar itu.
- **Acara**: toggle dua tampilan. Tampilan kartu memakai blok tanggal gelap di kiri sebagai penanda cepat, tampilan kalender memakai grid bulanan buatan sendiri.
- **Kabar**: feed kronologis, foto kecil di kiri, dan penanda kegiatan yang diisi bebas oleh pengurus (misalnya `Tahsin Pertemuan 13`) sebagai konteks di atas judul. Kabar tanpa penanda hanya menampilkan tanggal.
- **Pengumuman**: carousel gambar persegi tepat di bawah kartu progress, berjalan sendiri tiap 5 detik dan berhenti begitu disentuh, di-hover, atau ada tautan di dalamnya yang menerima fokus keyboard. Judulnya duduk di bawah gambar, bukan di atasnya, supaya gambar buatan pengurus tidak tertutup teks. Kalau belum ada pengumuman, seluruh bagian ini tidak dirender.
- **Bar sosial**: menempel tepat di atas navigasi bawah, tinggi 38px, hanya di layar HP. Latar emas dengan teks tinta, satu-satunya blok emas penuh di app, jadi mata langsung menemukannya tanpa perlu ukuran besar. Hanya muncul kalau tautannya memang diisi.
- **Admin**: tabel dan form rapat, tanpa hero, tanpa kartu statistik hiasan. Layout dibangun dari satu keputusan yang diambil pengurus di layar itu.
- **Tabel pengurus**: satu tabel melayani HP dan laptop. Kolom sekunder disembunyikan di bawah `sm`, dan baris bisa dibuka untuk menampilkan sisanya. Tombol aksi dirender sekali saja lalu ditampilkan atau disembunyikan, bukan digandakan, supaya id di dalamnya tidak pernah dobel. Chip status memakai `.label-status` plus satu kelas warna, menggantikan pil yang dulu ditulis ulang sendiri-sendiri di tiap halaman.
- **Laci formulir**: formulir "buat baru" naik dari bawah layar sebagai `<dialog>` bawaan peramban, jadi Escape, jebakan fokus, dan lapisan paling atas didapat gratis. Ada batang penarik kecil di atasnya sebagai penanda bahwa ini lembar yang bisa ditutup, dan padding bawah mengikuti `env(safe-area-inset-bottom)` supaya tombol simpan tidak tertutup garis home iPhone.

Satu focal point per layar: di beranda dan season itu angka rupiah, di halaman status itu nominal transfer, di detail acara itu tombol daftar.

## 8. Ikon dan gambar

- Ikon dipakai **sangat sedikit** dan hanya bila menambah arti (WhatsApp, unduh, kalender). Digambar sendiri sebagai SVG inline sederhana, bukan mengimpor satu set ikon garis tipis seragam. Alasan: BRIEF §9 melarang deretan ikon garis tipis seragam.
- Tidak ada ilustrasi stok, tidak ada emoji di UI.
- Gambar nyata (foto header season, poster acara, foto kabar) adalah elemen visual utama. Kalau gambarnya belum ada, blok gambar tidak dirender, bukan diganti kotak abu-abu.
- Logo: memakai file yang sudah ada di root repo. Versi terang untuk latar krem, versi putih untuk latar gelap. Tidak membuat logo baru.

## 9. Yang dilarang di project ini

Diambil dari BRIEF §9 dan diperkuat filter antislop:

gradien ungu-biru, kartu putih melayang dengan bayangan seragam, bento grid, deretan ikon garis tipis seragam, angka statistik hiasan tanpa sumber, foto stok orang berjabat tangan, pemisah section bergelombang, badge kapsul dekoratif, glassmorphism, latar grid atau titik-titik, tanda hubung panjang di teks UI, CTA generik seperti "Selengkapnya" tanpa konteks, dan animasi scroll.

## 10. Nada teks

Diatur penuh di BRIEF §8. Ringkasnya: angka konkret bukan superlatif, donatur sebagai pelaku kebaikan bukan sumber dana, tidak memelas, tidak ada urgensi palsu, laporan sebagai bentuk hormat. Semua teks Bahasa Indonesia.

Kalimat kunci yang dipakai konsisten di seluruh app:

> 1 paket = Rp 15.000 = biaya merangkul satu jamaah yang singgah ke masjid, agar amal ibadahnya mengalir.
