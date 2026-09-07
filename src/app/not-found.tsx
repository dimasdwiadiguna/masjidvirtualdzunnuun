import Link from "next/link";

export default function TidakDitemukan() {
  return (
    <div className="kolom-isi py-16">
      <h1>Halaman ini tidak ada</h1>
      <p className="mt-3 text-ink-soft">
        Alamatnya mungkin salah ketik, atau isinya sudah dihapus pengurus.
      </p>
      <Link href="/" className="tombol-utama mt-5">
        Kembali ke beranda
      </Link>
    </div>
  );
}
