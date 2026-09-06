"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GalatAdmin({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-12">
      <h1>Halaman pengurus gagal dimuat</h1>
      <p className="mt-3 max-w-[50ch] text-ink-soft">
        Biasanya ini karena koneksi ke database terputus, atau variabel Supabase belum lengkap. Pesan aslinya:{" "}
        {error.message}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="tombol-utama">
          Coba lagi
        </button>
        <Link href="/admin" className="tombol-kedua">
          Kembali ke ringkasan
        </Link>
      </div>
    </div>
  );
}
