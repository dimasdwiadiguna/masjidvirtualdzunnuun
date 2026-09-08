"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type FotoHero = { url: string; keterangan: string };

const JEDA_MS = 6000;

/**
 * Latar hero berupa daftar foto khusus yang diunggah pengurus lewat menu Foto
 * Hero. Poster acara dan foto Laporan Kegiatan tidak ikut dipungut, supaya isi
 * sepenuhnya dipilih pengurus. Tidak ada foto stok.
 * Pergantiannya berhenti sendiri kalau perangkat meminta gerak minimal.
 */
export default function HeroCarousel({ foto }: { foto: FotoHero[] }) {
  const [aktif, setAktif] = useState(0);

  useEffect(() => {
    if (foto.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pengatur = window.setInterval(() => setAktif((kini) => (kini + 1) % foto.length), JEDA_MS);
    return () => window.clearInterval(pengatur);
  }, [foto.length]);

  if (foto.length === 0) return null;

  return (
    <>
      {foto.map((item, indeks) => (
        <Image
          key={item.url}
          src={item.url}
          alt={indeks === aktif ? item.keterangan : ""}
          fill
          // Hanya foto pertama yang diambil segera. Sisanya menyusul supaya
          // jaringan seluler tidak dipakai untuk gambar yang belum terlihat.
          priority={indeks === 0}
          loading={indeks === 0 ? "eager" : "lazy"}
          quality={68}
          sizes="100vw"
          aria-hidden={indeks === aktif ? undefined : true}
          className={`object-cover transition-opacity duration-700 ${indeks === aktif ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {foto.length > 1 ? (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-ink/45 px-1.5">
          {foto.map((item, indeks) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setAktif(indeks)}
              aria-label={`Tampilkan foto ${indeks + 1} dari ${foto.length}`}
              aria-current={indeks === aktif}
              className="flex h-11 w-6 items-center justify-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${
                  indeks === aktif ? "w-5 bg-cream" : "w-1.5 bg-cream/60"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
