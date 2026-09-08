import Link from "next/link";

export default function TidakDitemukanPublik() {
  return (
    <div className="kolom-isi py-16">
      <h1>Halaman ini tidak ada</h1>
      <p className="mt-3 max-w-[44ch] text-ink-soft">
Halaman status donasi dan tiket sudah tidak ada. Kabar penerimaan donasi dan tiket acara kami kirim
        lewat WhatsApp ke nomor yang Anda isi saat mendaftar.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/" className="tombol-utama">
          Kembali ke beranda
        </Link>
        <Link href="/kabar" className="tombol-kedua">
          Baca Laporan Kegiatan
        </Link>
      </div>
    </div>
  );
}
