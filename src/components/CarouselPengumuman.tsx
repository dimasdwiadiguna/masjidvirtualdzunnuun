"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Announcement } from "@/lib/data/types";

const JEDA_MS = 5000;

/**
 * Carousel pengumuman di beranda.
 *
 * Rel gesernya sama dengan carousel acara, jadi di HP tetap bisa digeser jari
 * dan gambar berikutnya terlihat mengintip. Bedanya carousel ini berjalan
 * sendiri.
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

  // Titik penanda ikut posisi geser, termasuk saat digeser jari.
  const saatGeser = () => {
    const elemen = wadah.current;
    if (!elemen) return;
    const lebar = elemen.clientWidth;
    if (lebar === 0) return;
    setAktif(Math.round(elemen.scrollLeft / lebar));
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
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {daftar.map((satu) => (
          <li key={satu.id} className="w-[86%] max-w-[340px] shrink-0 snap-start sm:w-[340px]">
            <Link href={`/pengumuman/${satu.slug}`} className="kartu kartu-tekan block overflow-hidden">
              <Image
                src={satu.image_url}
                alt={satu.title}
                width={800}
                height={800}
                sizes="(max-width: 640px) 86vw, 340px"
                // Carousel ini duduk di bawah lipatan layar. Menandainya priority
                // membuatnya berebut jalur dengan foto hero, dan LCP hero jadi
                // mundur. Semua gambar di sini menyusul belakangan.
                loading="lazy"
                quality={72}
                className="aspect-square w-full object-cover"
              />
              <p className="px-3 py-2.5 text-[0.95rem] font-semibold">{satu.title}</p>
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
