"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Announcement } from "@/lib/data/types";

const JEDA_MS = 2000;

/**
 * Carousel pengumuman di beranda.
 *
 * Lebarnya dibuat sama persis dengan kartu donasi di atasnya, satu gambar
 * penuh per slide dengan rasio 2:1. Isinya murni gambar tanpa teks, jadi
 * pengurus bebas menaruh apa pun di dalam gambarnya sendiri. Titik penanda di
 * bawah yang memberi tahu ada berapa slide dan sedang di mana.
 *
 * Carousel ini berjalan sendiri.
 *
 * Jalannya berhenti kalau perangkat meminta gerak minimal, saat disentuh, saat
 * kursor di atasnya, dan saat ada tautan di dalamnya yang menerima fokus
 * keyboard. Carousel yang berjalan terus tanpa bisa dihentikan menyulitkan
 * orang yang membaca pelan atau memakai keyboard.
 */
export default function CarouselPengumuman({ daftar }: { daftar: Announcement[] }) {
  const wadah = useRef<HTMLUListElement>(null);
  const [berhenti, setBerhenti] = useState(false);
  const [aktif, setAktif] = useState(0);

  const keSlide = useCallback((indeks: number) => {
    const elemen = wadah.current;
    if (!elemen) return;
    const anak = elemen.children[indeks] as HTMLElement | undefined;
    if (anak) elemen.scrollTo({ left: anak.offsetLeft - elemen.offsetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (daftar.length < 2 || berhenti) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pengatur = window.setInterval(() => {
      setAktif((kini) => {
        const berikut = (kini + 1) % daftar.length;
        keSlide(berikut);
        return berikut;
      });
    }, JEDA_MS);
    return () => window.clearInterval(pengatur);
  }, [daftar.length, berhenti, keSlide]);

  // Titik penanda ikut posisi geser, termasuk saat digeser jari. Dihitung dari
  // posisi tiap slide, bukan dari lebar dibagi rata, karena ada jarak antarslide
  // yang membuat pembagian rata meleset makin jauh di slide terakhir.
  const saatGeser = () => {
    const elemen = wadah.current;
    if (!elemen) return;
    const anak = Array.from(elemen.children) as HTMLElement[];
    if (anak.length === 0) return;
    const kiri = elemen.scrollLeft + elemen.offsetLeft;
    let terdekat = 0;
    let jarakTerdekat = Number.POSITIVE_INFINITY;
    anak.forEach((satu, indeks) => {
      const jarak = Math.abs(satu.offsetLeft - kiri);
      if (jarak < jarakTerdekat) {
        jarakTerdekat = jarak;
        terdekat = indeks;
      }
    });
    setAktif(terdekat);
  };

  if (daftar.length === 0) return null;

  return (
    <section
      className="relative"
      aria-label="Pengumuman"
      onPointerDown={() => setBerhenti(true)}
      onMouseEnter={() => setBerhenti(true)}
      onMouseLeave={() => setBerhenti(false)}
      onFocusCapture={() => setBerhenti(true)}
      onBlurCapture={() => setBerhenti(false)}
    >
      <ul
        ref={wadah}
        onScroll={saatGeser}
        tabIndex={0}
        aria-label="Daftar pengumuman, geser ke samping untuk melihat yang lain"
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {daftar.map((satu) => (
          <li key={satu.id} className="w-full shrink-0 snap-start">
            <Link href={`/pengumuman/${satu.slug}`} className="kartu kartu-tekan block overflow-hidden">
              <Image
                src={satu.image_url}
                // Pengumuman tampil tanpa teks sama sekali, jadi keterangan ini
                // satu-satunya cara pembaca layar tahu isi gambarnya.
                alt={satu.title}
                width={1600}
                height={800}
                sizes="(max-width: 880px) 100vw, 848px"
                // Carousel ini duduk di bawah lipatan layar. Menandainya priority
                // membuatnya berebut jalur dengan foto hero, dan LCP hero jadi
                // mundur. Semua gambar di sini menyusul belakangan.
                loading="lazy"
                quality={72}
                className="aspect-[2/1] w-full object-cover"
              />
            </Link>
          </li>
        ))}
      </ul>

      {daftar.length > 1 ? (
        <div className="mt-1 flex justify-center gap-1.5">
          {daftar.map((satu, indeks) => (
            <button
              key={satu.id}
              type="button"
              onClick={() => {
                setBerhenti(true);
                setAktif(indeks);
                keSlide(indeks);
              }}
              aria-label={`Tampilkan pengumuman ${indeks + 1} dari ${daftar.length}`}
              aria-current={indeks === aktif ? "true" : undefined}
              className="flex h-11 w-6 items-center justify-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${
                  indeks === aktif ? "w-4 bg-teal" : "w-1.5 bg-garis-isian"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
