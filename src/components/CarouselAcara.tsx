"use client";

import { useRef } from "react";
import KartuAcaraBesar from "./KartuAcaraBesar";
import type { EventItem } from "@/lib/data/types";

type Item = { acara: EventItem; sisaKuota: number | null };

/**
 * Geseran mendatar untuk sorotan acara. Yang menggeser hanya wadah ini, jadi
 * halaman tidak ikut bisa digeser ke samping. Di HP digeser dengan jari, di
 * layar lebar disediakan dua tombol karena tidak semua orang punya trackpad
 * yang bisa menggeser mendatar.
 */
export default function CarouselAcara({ daftar }: { daftar: Item[] }) {
  const wadah = useRef<HTMLUListElement>(null);

  const geser = (arah: 1 | -1) => {
    const elemen = wadah.current;
    if (!elemen) return;
    elemen.scrollBy({ left: arah * (elemen.clientWidth * 0.86), behavior: "smooth" });
  };

  return (
    <section className="relative" aria-label="Agenda terdekat">
      <ul
        ref={wadah}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        aria-label="Daftar acara, geser ke samping untuk melihat acara lain"
      >
        {daftar.map((item) => (
          <li key={item.acara.id} className="w-[85%] max-w-[300px] shrink-0 snap-start sm:w-[300px]">
            <KartuAcaraBesar acara={item.acara} sisaKuota={item.sisaKuota} />
          </li>
        ))}
      </ul>

      {daftar.length > 1 ? (
        <div className="mt-1 hidden justify-end gap-2 sm:flex">
          <button type="button" onClick={() => geser(-1)} className="tombol-kecil" aria-label="Geser ke acara sebelumnya">
            Sebelumnya
          </button>
          <button type="button" onClick={() => geser(1)} className="tombol-kecil" aria-label="Geser ke acara berikutnya">
            Berikutnya
          </button>
        </div>
      ) : null}
    </section>
  );
}
