# PLAN.md, Urutan Kerja, Asumsi, dan Pertanyaan Terbuka

Status: dieksekusi penuh dalam satu sesi. Semua keputusan yang diambil tercatat di `DECISIONS.md`.

---

## 1. Urutan kerja

Mengikuti BRIEF §11, supaya kalau waktu mepet bagian terpenting sudah jalan duluan.

| Tahap | Isi | Status |
|---|---|---|
| 0 | Guardrail antislop, `DESIGN.md`, `PLAN.md`, `DECISIONS.md` | selesai |
| 1 | Skema DB, RLS, auth admin satu password, halaman pengaturan | selesai |
| 2 | Season, halaman fundraising, form donasi, halaman status, admin donasi | selesai |
| 3 | Kabar Aksi, badge belum dibaca, Saluran WhatsApp, OG image dinamis | selesai |
| 4 | Acara, pendaftaran, tiket dengan QR, kalender, check-in | selesai |
| 5 | Tentang, arsip, sponsor | selesai |
| 6 | PWA, optimasi gambar, README pengurus, Delivery Gate | selesai |

Target live pengurus: 25 September 2026. Season mulai 1 Oktober 2026.

## 2. Arsitektur singkat

```
src/
  app/                      route publik + admin + OG image
  components/               komponen UI dipakai lintas halaman
  lib/
    data/                   satu antarmuka data, dua driver
      types.ts              tipe baris tabel
      index.ts              pemilih driver
      supabase.ts           driver Supabase (produksi)
      local.ts              driver file JSON (pratinjau lokal)
    format.ts               format rupiah, tanggal Asia/Jakarta, samarkan nomor WA
    kode.ts                 pembuat kode DZN-XXXX dan angka unik
    wa.ts                   normalisasi nomor WhatsApp dan teks prefilled
    auth.ts                 cookie sesi admin bertanda tangan
    ratelimit.ts            pembatas submit per IP
supabase/
  schema.sql                tabel, index, RLS, bucket storage
  seed.sql                  data awal season 1 dan settings placeholder
```

Semua tulis ke database lewat Server Action atau Route Handler di server. Tidak ada kunci Supabase di bundle klien.

## 3. Asumsi yang diambil

Semua asumsi di bawah dicatat lengkap beserta alasannya di `DECISIONS.md`. Ringkasnya:

1. Nama file logo di repo adalah `Logo - Light background.png`, sedangkan BRIEF §9 menyebut `Logo - White background.png`. Yang dipakai adalah file yang benar-benar ada.
2. Approval `DESIGN.md` sebelum coding diminta BRIEF §0 langkah 3, tetapi instruksi menjalankan tugas ini meminta seluruh keputusan didokumentasikan, bukan ditanyakan satu per satu. Jadi `DESIGN.md` ditulis lebih dulu sebagai dokumen terpisah yang bisa ditolak atau diubah, dan pekerjaan lanjut jalan di atasnya.
3. Plugin antislop tidak bisa dipasang lewat perintah `/plugin` di lingkungan ini. Isinya dibaca langsung dari sumber resminya dan diterapkan sebagai mode DURING. Lihat `DECISIONS.md` butir D-01.
4. Harga paket `15000` disimpan di kolom `package_price` per season, jadi season berikutnya bisa punya harga lain tanpa ubah kode.
5. Season 1 belum punya judul. UI memakai periode season sebagai pengganti judul, bukan teks "Tanpa Judul".

## 4. Pertanyaan yang masih menggantung untuk pengurus

Tidak ada satu pun yang memblokir jalannya app. Semua sudah punya nilai default yang aman dan bisa diubah dari `/admin/pengaturan` tanpa menyentuh kode.

1. **Nomor WhatsApp admin, gambar QRIS, dan link sosial** masih placeholder. Harus diisi lewat `/admin/pengaturan` sebelum app dibagikan ke jamaah. App menampilkan peringatan di dashboard admin selama masih placeholder.
2. **Teks "tentang kami"** saat ini berisi deskripsi singkat dan tagline dari BRIEF §1. Kalau pengurus punya versi yang lebih panjang, ganti lewat `/admin/pengaturan`.
3. **Ringkasan penggunaan dana** di halaman arsip diisi manual per season lewat `/admin/season`. Belum ada season yang selesai, jadi halaman arsip saat ini menampilkan keadaan kosong yang jujur.
4. **Judul season 1**: kalau nanti dinamai, isi lewat `/admin/season` dan seluruh halaman ikut berubah.
5. **Kapasitas dan tenggat acara** perlu dicek ulang pengurus saat membuat acara pertama, karena tombol daftar menutup otomatis berdasarkan dua nilai itu.

## 5. Cara memverifikasi tanpa Supabase

Supaya setiap elemen interaktif benar-benar bisa diklik dan dicatat sebagai bukti R-35, app punya driver data lokal berbasis file JSON. Dijalankan dengan `npm run dev:lokal`. Driver ini hanya untuk pratinjau dan pengujian, tidak dipakai di Vercel. Detail di `DECISIONS.md` butir D-06.
