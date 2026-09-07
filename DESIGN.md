# DESIGN.md, Arah Visual Web App Dzun Nuun

Dokumen ini adalah **sumber arah visual**. Antislop dipakai sebagai filter di atasnya, bukan sebagai pengganti dokumen ini.

Sumber isi: BRIEF.md §9 dan §10, file logo di root repo, dan brand color yang sudah ditetapkan pengurus.

---

## 1. Design Read

> Membaca ini sebagai: **web app komunitas masjid** untuk **jamaah muda dan warga sekitar yang membuka link dari grup WhatsApp di HP Android kelas menengah**, dengan bahasa visual **poster cetak komunitas: kertas hangat, tinta tebal, bayangan padat tanpa blur**, dial **ENERGY 2 / RHYTHM 2 / MOTION 1**.

Kenapa dial-nya begitu:

- **ENERGY 2.** Ini komunitas pemuda, bukan situs layanan publik yang datar, tapi juga bukan portofolio agensi. Halaman harus menyapa dengan hangat lalu cepat masuk ke isi (nominal, tanggal, tombol).
- **RHYTHM 2.** Komposisi antar section memang berbeda (hero gelap, feed kabar, daftar acara, blok arsip), tapi tetap ada pola yang konsisten supaya pengurus non-teknis gampang menambah konten tanpa merusak tampilan.
- **MOTION 1.** Hanya state hover, active, dan focus. Tidak ada animasi scroll. Alasannya dua: BRIEF §12 melarang animasi scroll sepanjang halaman, dan target perangkatnya HP kelas menengah-bawah dengan koneksi lambat.

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

Aksen emas dipakai **hanya di tiga tempat**: isi progress bar donasi di kartu gelap, badge jumlah kabar baru di navigasi, dan label "Hari ke-N" di Kabar Aksi (memakai `--gold-ink` karena label itu duduk di atas krem). Di luar itu emas tidak muncul, supaya aksennya tetap terasa aksen (Part 3 antislop, one deliberate accent).

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

Satu motif, diambil langsung dari logo: **bayangan padat tanpa blur** (`box-shadow: 3px 3px 0`). Di logo, wordmark "Dzun nuun" punya bayangan offset padat. Motif itu dipakai ulang di:

- tombol utama (donasi, daftar acara, konfirmasi WhatsApp)
- kartu progress season
- badge kode donasi dan kode tiket

Tidak ada bayangan blur lembut di elemen lain. Elemen biasa duduk rata di atas kertas, dibatasi garis `--ink-soft` setebal 1.5px. Ini yang membedakan halaman ini dari kartu putih melayang yang dilarang BRIEF §9.

## 6. Bentuk dan jarak

- Radius: `4px` untuk input dan badge, `10px` untuk kartu, `14px` untuk tombol utama. Variasi ini disengaja sebagai penanda hierarki (R-11). Tidak ada elemen berbentuk pil.
- Skala jarak: 4, 8, 12, 16, 24, 32, 48, 64. Section di mobile memakai padding vertikal 32 sampai 40, bukan 96 seperti desktop.
- Lebar konten maksimal 640px. Ini app satu kolom, bukan landing page lebar.
- Target tap minimal 44x44px, dengan jarak antar target minimal 8px.

## 7. Komposisi per halaman (RHYTHM 2)

Setiap halaman punya komposisi berbeda, bukan pengulangan "judul di tengah + grid kartu":

- **Beranda**: blok hero gelap penuh lebar berisi progress season, lalu feed kabar (kartu horizontal, foto kiri teks kanan), lalu daftar acara (baris dengan tanggal sebagai blok kiri), lalu paragraf tentang kami rata kiri, lalu footer gelap.
- **Season**: foto header lebar, judul, progress besar di kartu gelap, deskripsi mengalir, feed kabar, logo sponsor sebagai baris sederhana.
- **Donasi**: form satu kolom, chip paket sebagai grid 2x2 di 360px, konversi hidup tepat di bawah input.
- **Status donasi**: nominal sebagai angka terbesar di halaman, sisanya menurun tajam. Ini satu-satunya halaman dengan satu fokus tunggal sebesar itu.
- **Acara**: toggle dua tampilan. Tampilan kartu memakai blok tanggal gelap di kiri sebagai penanda cepat, tampilan kalender memakai grid bulanan buatan sendiri.
- **Kabar**: feed kronologis, foto kecil di kiri, dan label "Hari ke-N" sebagai penanda hitungan hari yang naik terus.
- **Admin**: tabel dan form rapat, tanpa hero, tanpa kartu statistik hiasan. Layout dibangun dari satu keputusan yang diambil pengurus di layar itu.

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
