"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TAUTAN = [
  { href: "/", label: "Beranda" },
  { href: "/kabar", label: "Kabar" },
  { href: "/acara", label: "Acara" },
  { href: "/tentang", label: "Tentang" },
];

/**
 * Yang disimpan adalah waktu terbit kabar terbaru yang sudah dilihat pengunjung,
 * bukan waktu kunjungan menurut jam perangkat. Jam HP sering meleset, dan
 * membandingkan dua waktu dari server membuat hitungan badge tetap benar.
 */
const KUNCI_TERBACA = "dzn:kabar-terakhir-terbaca";

export default function NavBawah() {
  const jalur = usePathname();
  const [kabarBaru, setKabarBaru] = useState(0);

  useEffect(() => {
    let batal = false;

    const perbarui = async () => {
      let terbit: string[] = [];
      try {
        const respons = await fetch("/api/kabar-terbaru", { cache: "no-store" });
        if (!respons.ok) return;
        terbit = ((await respons.json()) as { terbit: string[] }).terbit;
      } catch {
        // Badge hanya penunjuk tambahan. Kalau gagal diambil, navigasi tetap jalan.
        return;
      }
      if (batal) return;

      const paling = terbit.reduce((puncak, waktu) => (waktu > puncak ? waktu : puncak), "");
      const terbaca = window.localStorage.getItem(KUNCI_TERBACA);
      const diHalamanKabar = jalur.startsWith("/kabar");

      if (diHalamanKabar || terbaca === null) {
        window.localStorage.setItem(KUNCI_TERBACA, paling);
        setKabarBaru(0);
        return;
      }

      setKabarBaru(terbit.filter((waktu) => waktu > terbaca).length);
    };

    void perbarui();
    return () => {
      batal = true;
    };
  }, [jalur]);

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-ink bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-[640px]">
        {TAUTAN.map((tautan) => {
          const aktif = tautan.href === "/" ? jalur === "/" : jalur.startsWith(tautan.href);
          return (
            <li key={tautan.href} className="flex-1">
              <Link
                href={tautan.href}
                aria-current={aktif ? "page" : undefined}
                className={`flex min-h-[52px] flex-col items-center justify-center gap-1 px-2 py-2 text-[0.78rem] font-semibold ${
                  aktif ? "text-teal-ink" : "text-ink-soft"
                }`}
              >
                <span className="flex items-center gap-1">
                  {tautan.label}
                  {tautan.label === "Kabar" && kabarBaru > 0 ? (
                    <span className="rounded-[4px] bg-teal-deep px-1.5 py-0.5 text-[0.7rem] font-bold text-gold">
                      {kabarBaru}
                    </span>
                  ) : null}
                </span>
                <span
                  aria-hidden="true"
                  className={`h-[3px] w-6 rounded-full ${aktif ? "bg-teal" : "bg-transparent"}`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
