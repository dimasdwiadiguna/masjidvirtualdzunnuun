"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GalatPublik({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="kolom-isi py-16">
      <h1>Halaman ini gagal dimuat</h1>
      <p className="mt-3 max-w-[44ch] text-ink-soft">
        Kemungkinan koneksinya terputus sebentar. Coba muat ulang. Kalau masih sama, kabari pengurus lewat WhatsApp.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="tombol-utama">
          Muat ulang halaman
        </button>
        <Link href="/" className="tombol-kedua">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
