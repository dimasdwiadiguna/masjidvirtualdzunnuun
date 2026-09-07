# Delivery Gate antislop

Dijalankan sebelum menyerahkan pekerjaan, mode DURING. Empat blok sesuai `antislop.md`. Setiap PASS disertai bukti, bukan klaim.

Cara pengujian: aplikasi dibangun (`next build`) lalu dijalankan (`next start`), dan seluruh alur diklik satu per satu memakai Chromium pada lebar **360px dengan mode sentuh**. Skrip dan catatan mentahnya dijalankan tiga tahap, hasilnya dikutip di Blok 1 butir R-35.

Status akhir: **PASS**. Tidak ada satu pun butir FAIL.

---

## Blok 1: Hard Gate (mutlak)

Semua jawaban harus **tidak**.

| Butir | Jawaban | Bukti |
|---|---|---|
| R-02 Ada tanda hubung panjang di teks? | tidak | `grep -rn "—" src/ supabase/ DESIGN.md PLAN.md` tidak menemukan apa pun. Berkas `BRIEF.md` milik pengurus tidak diubah. |
| R-03 Ada scroll horizontal, teks keluar wadah, atau tata letak rusak di mobile? | tidak | Diukur `scrollWidth` terhadap `clientWidth` pada 360px di 9 halaman: `/`, `/donasi`, `/donasi/[kode]`, `/acara`, `/acara/[slug]`, `/tiket/[kode]`, `/tentang`, `/admin/donasi`, `/admin/pengaturan`, `/admin/pendaftar`, `/admin/scan`. Semua 360px, tidak ada kelebihan. |
| R-17 Ada angka atau statistik tanpa sumber? | tidak | Semua angka berasal dari database. Progress dihitung dari `SUM(total_amount)` donasi `verified`. Saat kosong yang tampil `Rp 0` berikut kalimat penjelas, bukan angka hiasan. |
| R-18 Ada testimoni fiktif? | tidak | Tidak ada bagian testimoni sama sekali. |
| R-23 Ada aset visual dibuat tanpa instruksi? | tidak | Logo memakai berkas yang sudah ada di repo. Ikon PWA dibuat dari logo yang sama di atas kotak warna brand (D-05). Tidak ada avatar, tidak ada ilustrasi. |
| R-24 Ada tautan navigasi ke halaman yang tidak ada? | tidak | Navigasi bawah berisi 4 tujuan, semuanya diklik dan berpindah benar: Kabar ke `/kabar`, Acara ke `/acara`, Tentang ke `/tentang`, Beranda ke `/`. Tautan sosial hanya dirender kalau alamatnya terisi di pengaturan. |
| R-25 Ada teks di bawah WCAG AA? | tidak | 11 pasangan warna dihitung dengan `contrast-check.py` bawaan antislop-human, tabel lengkap di `DESIGN.md` §3. Terendah 4.74 untuk teks normal. Emas dikunci hanya untuk permukaan gelap karena di atas krem hanya 1.93 (D-26). Lighthouse aksesibilitas 100 di lima halaman. |
| R-26 Ada tombol, dropdown, atau form yang tidak melakukan apa-apa? | tidak | Daftar klik lengkap ada di butir R-35 di bawah. Tombol yang belum bisa dipakai tidak dirender: tombol Saluran WhatsApp hilang kalau alamatnya kosong, tombol konfirmasi WhatsApp diganti kalimat penjelas selama nomor pengurus masih nilai contoh. |
| R-27 Ada tampilan data tanpa keadaan kosong, memuat, atau galat? | tidak | Keadaan kosong: beranda tanpa season, kabar kosong, acara kosong, arsip tanpa season selesai, pendaftar kosong, donasi kosong, QRIS belum dipasang. Keadaan memuat: `loading.tsx` untuk grup publik dan admin, tombol form berubah jadi "Menyimpan..." saat dikirim, QR tiket punya keadaan menyiapkan. Keadaan galat: `error.tsx` untuk grup publik dan admin, `not-found.tsx` untuk kode yang tidak ditemukan, pesan galat per isian pada semua form. |
| R-28 Ada FAQ template? | tidak | Tidak ada bagian FAQ. |
| R-32 UI tidak bisa dipakai keyboard atau tidak ada penanda fokus? | tidak | Urutan Tab di beranda: lompat ke isi, logo, Ikut patungan, Ikut patungan sekarang, Lihat rincian season, Semua kabar, dua kartu kabar. Semua elemen terfokus punya outline 3px. Enter pada tautan berpindah halaman. Dialog konfirmasi terbuka dengan Enter, fokus masuk ke dalam dialog, Escape menutupnya. |
| R-33 Ada fitur ditambal lewat skrip pengubah berkas? | tidak | Tidak ada skrip semacam itu. Satu-satunya skrip di luar aplikasi adalah pembuat ikon PWA yang dijalankan sekali, hasilnya berupa berkas gambar biasa. |
| R-34 Ada tema yang rusak? | tidak | Hanya satu tema, dan itu keputusan sadar dari identitas brand (D-29). Tidak ada tombol ganti tema, sesuai BRIEF §12. |
| R-35 Diserahkan tanpa dijalankan atau tanpa catatan klik? | tidak | Lihat daftar lengkap di bawah. |
| R-36 Ada klaim keamanan, kepatuhan, atau performa karangan? | tidak | Tidak ada klaim semacam itu di teks mana pun. |
| R-37 Dibangun tanpa arah desain? | tidak | `DESIGN.md` ditulis lebih dulu, lengkap dengan dial dan alasan tiap keputusan. |
| R-38 Ada isi karangan yang tampak nyata? | tidak | Teks awal diambil dari BRIEF §1. Nilai yang belum ada ditulis sebagai nilai contoh yang jelas (`628000000000`) dan panel admin memperingatkannya. |

### R-35: catatan klik, elemen per elemen

Dijalankan pada build produksi, lebar 360px, mode sentuh. **Tidak ada satu pun galat konsol pada ketiga tahap.**

**Alur donasi, dari sisi jamaah**

| Elemen yang diklik | Yang benar-benar terjadi |
|---|---|
| Buka `/` | Judul halaman "Dzun Nuun, komunitas pemuda Masjid Fathul Ummah", tanpa scroll horizontal |
| Navigasi bawah Kabar, Acara, Tentang, Beranda | Berpindah ke `/kabar`, `/acara`, `/tentang`, `/` |
| Tombol "Ikut patungan sekarang" di hero | Membuka `/donasi` |
| Kirim form donasi kosong | Muncul galat per isian: "Tulis nama Anda, minimal 2 huruf", "Nomor WhatsApp belum benar" |
| Chip "10 paket" | Baris konversi berubah jadi "10 paket = Rp 150.000 = 10 jamaah dirangkul" |
| Kirim form donasi terisi | Pindah ke `/donasi/DZN-RY4H` |
| Halaman status donasi | Nominal `Rp 150.345`, nomor WA tersamar `0812••••890` |
| Tombol "Salin nominal" | Papan klip berisi `150345` |
| Tombol "Salin link halaman ini" | Papan klip berisi alamat penuh halaman itu |
| QRIS belum dipasang | Muncul kalimat jujur "Gambar QRIS belum dipasang" berikut jalan keluarnya, bukan kotak kosong |
| Nomor pengurus masih contoh | Tombol konfirmasi WhatsApp diganti peringatan bahwa nomornya masih nilai contoh |

**Panel pengurus**

| Elemen yang diklik | Yang benar-benar terjadi |
|---|---|
| Buka `/admin/donasi` tanpa sesi | Dialihkan ke `/admin/masuk` dengan tujuan tersimpan di alamat |
| Masuk dengan password salah | "Password belum cocok. Coba periksa huruf besar kecilnya." |
| Masuk dengan password benar | Masuk ke `/admin/donasi` |
| Tombol "Verifikasi" | Dialog konfirmasi terbuka, tidak langsung mengeksekusi |
| Escape di dialog | Dialog tertutup |
| Tombol "Ya, dana sudah masuk" | Status berubah jadi Terverifikasi |
| Beranda setelah verifikasi | Progress naik jadi `Rp 150.345` (2 persen) |
| Halaman status donatur setelah verifikasi | Berubah jadi "Alhamdulillah, donasi Anda sudah kami terima" berikut "10 jamaah dirangkul lewat Anda" |
| Simpan pengaturan (nomor WA, saluran, unggah QRIS) | "Perubahan tersimpan." |
| Unggah berkas bukan gambar | Ditolak: "Format gambar harus JPG, PNG, atau WebP." |
| Buat acara gratis | "Perubahan tersimpan.", acara langsung tampil di daftar |
| Buat acara berbayar dengan poster dan kuota 2 | "Perubahan tersimpan." |
| Form kabar baru | Nomor hari terisi otomatis (nilai 1, dihitung dari tanggal mulai season) |
| Terbitkan kabar | "Perubahan tersimpan." |
| Simpan sponsor | "Perubahan tersimpan." |

**Alur acara dan tiket**

| Elemen yang diklik | Yang benar-benar terjadi |
|---|---|
| `/acara` tampilan bawaan | 2 acara tampil sebagai kartu |
| Tombol "Kalender" | Grid bulanan muncul dengan 33 tombol tanggal |
| Muat ulang halaman | Tampilan kalender tetap aktif (tersimpan di `localStorage`) |
| Tap tanggal berisi acara | Daftar acara hari itu muncul di bawah kalender |
| Tombol "Kartu" | Kembali ke tampilan kartu |
| Tombol "Tambah ke kalender" | Berkas `ngopi-subuh-bareng-anak-muda.ics` terunduh, isinya diawali `BEGIN:VCALENDAR` |
| Tombol "Bagikan ke WhatsApp" | Menuju `wa.me` dengan judul dan waktu acara terisi |
| Tombol "Daftar ikut acara ini" (gratis) | Form pendaftaran, lalu langsung jadi tiket `DZN-PKKC` berstatus "Tiket siap dipakai" |
| Halaman tiket | Gambar QR tampil, kode besar terbaca |
| Isi jumlah pada acara berbayar | Hitungan hidup: "2 orang = Rp 50.000 sebelum angka pembeda" |
| Kirim pendaftaran berbayar | Tiket `DZN-3P3C` berstatus menunggu pembayaran, QRIS tampil |
| Tombol "Unduh QRIS" | Berkas `qris-dzun-nuun.png` terunduh |
| Tombol "Konfirmasi lewat WhatsApp" | Menuju `wa.me/6281298765432` dengan nama, kode, dan nominal terisi |
| Buka acara yang kuotanya sudah penuh | Muncul penjelasan "Kuota penuh", bukan tombol mati tanpa keterangan |
| Buka halaman daftar acara yang penuh | Halaman "Pendaftaran tertutup" berikut tautan ke acara lain |
| Tombol "Ekspor CSV" | Berkas `pendaftar-ngopi-subuh-bareng-anak-muda.csv` terunduh dengan baris judul lengkap |
| Ganti acara di daftar pendaftar | Menampilkan pendaftar "Kelas menulis dakwah" |
| Tombol "Konfirmasi pembayaran" lalu "Ya, sudah dibayar" | Status jadi Terkonfirmasi |
| Check-in dengan mengetik kode | "Silakan masuk", nama dan jumlah orang tampil besar |
| Check-in kode yang sama untuk kedua kali | Peringatan "Tiket ini sudah dipakai check-in" berikut waktu kehadiran sebelumnya, bukan galat merah |
| Check-in kode ngawur `DZN-XXXX` | "Kode tidak ditemukan" berikut penjelasan bentuk kode yang benar |
| Badge kabar belum dibaca | Setelah membuka `/kabar` lalu ada kabar baru terbit, badge menampilkan angka 1 di navigasi |
| `/arsip` tanpa season selesai | Keadaan kosong yang jujur, bukan kartu contoh |
| `/tentang` | Tombol Saluran WhatsApp tampil setelah alamatnya diisi pengurus |
| Gambar pratinjau tautan `/`, `/season/season-1`, `/acara/[slug]`, `/kabar` | Keempatnya 200 OK, PNG 1200x630, ukuran 42 sampai 50 KB |

Yang belum bisa diklik di lingkungan ini dan perlu dicek pengurus sekali sebelum live: kamera check-in di HP fisik, tampilan pratinjau tautan di dalam aplikasi WhatsApp, dan koneksi ke instance Supabase sungguhan. Ketiganya dicatat terbuka di `DECISIONS.md` bagian J.

---

## Blok 2: Purpose-Gate (teknik boleh, alasan wajib tertulis)

FAIL kalau teknik muncul sebagai bawaan tanpa alasan tertulis.

| Butir | Jawaban | Alasan yang tertulis |
|---|---|---|
| R-01 Gradien atau glow sebagai bawaan? | tidak | Tidak ada gradien dan tidak ada glow sama sekali. Warna solid dari palet brand. |
| R-04 Ikon generik atau satu set garis tipis seragam? | tidak | Enam ikon digambar sendiri, hanya untuk hal yang butuh penanda cepat, selalu berdampingan dengan teks (`DESIGN.md` §8, D-28). |
| R-06 Monospace besar atau uppercase bertracking lebar? | tidak | Geologica untuk judul dan Raleway untuk isi, keduanya dari brand, alasannya di `DESIGN.md` §4. Tidak ada monospace dekoratif. |
| R-07 Latar grid, blueprint, atau titik-titik? | tidak | Latar polos krem hangat. |
| R-08 Panah di hampir semua tombol? | tidak | Tidak ada panah dekoratif. |
| R-09 Badge kapsul dekoratif? | tidak | Badge hanya untuk status nyata (Terverifikasi, Terbit, Draf, Gratis, Kuota penuh) dan untuk kode donasi atau tiket. |
| R-10 Glassmorphism lebih dari 1 sampai 2 elemen? | tidak | Tidak ada blur sama sekali. |
| R-12 Bayangan besar di semua komponen? | tidak | Bayangan hanya bayangan padat tanpa blur, dan hanya di tombol utama, kartu progress, dan badge kode. Alasannya di `DESIGN.md` §5 dan D-27. |
| R-13 Glow di banyak elemen sekaligus? | tidak | Tidak ada glow. |
| R-14 Semua kartu identik tanpa alasan hierarki? | tidak | Kartu kabar memakai foto kiri dan teks kanan, baris acara memakai blok tanggal gelap di kiri, kartu progress berbeda sendiri sebagai blok gelap. |
| R-19 Animasi template menumpuk? | tidak | Gerak hanya pada hover, active, dan focus tombol, ditambah `prefers-reduced-motion` yang mematikannya. Sesuai dial MOTION 1. |
| R-22 Ilustrasi stok tanpa hubungan? | tidak | Tidak ada ilustrasi. Gambar yang tampil hanya foto asli yang diunggah pengurus. |

---

## Blok 3: Liveliness

Semua jawaban harus **ya**.

| Butir | Jawaban | Bukti |
|---|---|---|
| Dial ditetapkan eksplisit? | ya | ENERGY 2 / RHYTHM 2 / MOTION 1, tertulis di `DESIGN.md` §1. |
| Hasil sesuai dial? | ya | Komposisi tiap halaman memang berbeda (`DESIGN.md` §7): beranda memakai blok hero gelap penuh lebar, kabar memakai feed foto kiri, acara memakai blok tanggal atau grid kalender, admin tanpa hero sama sekali. Gerak berhenti di hover, active, dan focus, sesuai MOTION 1. |
| Ada satu focal point per layar? | ya | Beranda dan season pada angka rupiah, halaman status pada nominal transfer, detail acara pada tombol daftar, check-in pada hasil pemindaian yang dicetak besar. |
| Ruang kosong dipakai sebagai struktur? | ya | Skala jarak tetap (4 sampai 64), padding section mobile 32 sampai 40 bukan ukuran desktop, lebar isi dikunci 640px. |
| Ada satu aksen yang disengaja? | ya | Emas hanya di tiga tempat: isi progress bar, badge kabar baru, dan label "Hari ke-N". Selebihnya tidak muncul (D-26). |
| Ada motif identitas yang diulang? | ya | Bayangan padat tanpa blur yang diambil dari wordmark logo (D-27). |
| Design Read dideklarasikan sebelum membangun? | ya | `DESIGN.md` §1, ditulis sebelum baris kode pertama. |

---

## Blok 4: Craftsmanship dan Quality Locks

Semua jawaban harus **tidak**.

| Butir | Jawaban | Bukti |
|---|---|---|
| C-1 Ada keputusan yang alasannya cuma "bawaan AI"? | tidak | Setiap keputusan visual punya alasan satu baris di `DESIGN.md`, setiap keputusan teknis punya butir di `DECISIONS.md`. |
| C-2 Ada elemen interaktif yang tidak berfungsi? | tidak | Daftar klik R-35 di atas. |
| C-3 Ada section yang hanya mengisi template? | tidak | Setiap section berasal dari kebutuhan di BRIEF §4. Bagian sponsor hilang total kalau datanya kosong. |
| C-4 UI rusak di suatu keadaan, tema, breakpoint, atau tanpa tetikus? | tidak | Keadaan kosong, memuat, dan galat ada di semua tampilan data. Keyboard diuji (R-32). Lebar 360px diuji di 11 halaman. |
| C-5 Ada testimoni, statistik, atau klaim karangan? | tidak | Tidak ada satu pun. |
| R-05 Tata letak mengikuti template AI? | tidak | Tidak ada hero dengan tiga kartu, tidak ada "How It Works" tiga langkah, tidak ada logo bar, tidak ada bento grid, tidak ada jendela terminal palsu, tidak ada tiga kolom harga. Footer satu kolom mengalir, bukan empat kolom Product/Company/Resources/Legal. |
| R-11 Semua elemen berbentuk pil? | tidak | Tiga radius dipakai sengaja: 4px isian dan badge, 10px kartu, 14px tombol utama. |
| R-15 CTA masih generik? | tidak | "Ikut patungan sekarang", "Lanjut ke cara transfer", "Konfirmasi lewat WhatsApp", "Ambil tiket gratis", "Daftar ikut acara ini", "Ya, dana sudah masuk". Tidak ada "Selengkapnya" atau "Pelajari lebih lanjut" tanpa konteks. |
| R-16 Ada buzzword pemasaran? | tidak | Tidak ada "platform", "solusi terpadu", "ekosistem", "revolusioner". Tidak ada ajakan bertingkat dan tidak ada emoji berderet, sesuai BRIEF §8. |
| R-20 Desain masih generik kalau logo diganti? | tidak | Kertas krem hangat, bayangan padat tanpa blur, dan judul Geologica yang tebal membuat halaman ini tetap punya wajah sendiri tanpa logo. |
| R-21 Dark mode dipaksa atau ditunda dengan alasan? | tidak | Satu tema terang, dipilih dari identitas brand, dan dibuat berfungsi penuh (D-29). BRIEF §12 melarang tombol ganti tema. |
| R-29 Palet melebihi 2 sampai 3 warna inti dan 1 aksen? | tidak | Teal dan teal gelap sebagai inti, emas sebagai aksen, sisanya netral krem dan tinta. Warna status hijau dan merah hanya untuk status, bukan warna identitas. |
| R-30 Meniru produk populer? | tidak | Rujukan rasanya poster pengumuman masjid, bukan produk lain. |
| R-31 Ada keputusan besar yang alasannya tidak bisa ditulis satu baris? | tidak | `DESIGN.md` dan `DECISIONS.md` memuat alasan untuk warna, tipografi, jarak, bentuk, motif, komposisi, dan setiap keputusan teknis yang mengubah rancangan. |

---

## Pemeriksaan tambahan di luar gate

Diminta BRIEF §13.

| Pemeriksaan | Hasil |
|---|---|
| Lighthouse mobile, performa | `/` 98, `/season/season-1` 96, `/kabar` 98, `/donasi` 98, `/acara` 98, `/tentang` 98, `/arsip` 99. Ambang brief 85. |
| Lighthouse mobile, aksesibilitas | 100 di ketujuh halaman. Ambang brief 95. |
| Lighthouse mobile, praktik terbaik dan SEO | 100 di ketujuh halaman. |
| Cumulative Layout Shift | 0 di enam halaman, 0.061 di halaman season. Batas "baik" menurut Core Web Vitals adalah 0.1. Dicapai setelah ukuran logo dipasang pasti (D-42) dan keadaan memuat diberi tinggi minimal (D-44). |
| Metadata pratinjau tautan | Judul, deskripsi, dan `og:image` diperiksa benar-benar berada di dalam `<head>` pada HTML mentah, bukan menyusul di akhir dokumen (D-45). |
| Kunci rahasia di bundle klien | Build dijalankan dengan nilai rahasia penanda, lalu `grep` pada `.next/static/` dan seluruh `.next/`: tidak ditemukan sama sekali. |
| Build dengan env var kosong atau salah bentuk | Diuji empat keadaan: `NEXT_PUBLIC_SITE_URL` kosong, berisi spasi, tanpa protokol, dan tidak ada sama sekali. Semuanya berhasil dibangun (D-47). |
| `tsc --noEmit` | Bersih. |
| `next lint` | Bersih, tanpa peringatan. |
| Teks Inggris yang terlihat pengguna | Tidak ada. Seluruh antarmuka Bahasa Indonesia. |
| Lorem ipsum atau teks isian sementara | Tidak ada. |
