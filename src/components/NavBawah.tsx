"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IkonAcaraNav, IkonBeranda, IkonKabar, IkonTentang } from "./Ikon";

const TAUTAN = [
  { href: "/", label: "Beranda", Ikon: IkonBeranda },
  { href: "/kabar", label: "Laporan", Ikon: IkonKabar },
  { href: "/acara", label: "Acara", Ikon: IkonAcaraNav },
  { href: "/tentang", label: "Tentang", Ikon: IkonTentang },
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
        return;
      }
      if (batal) return;

      const paling = terbit.reduce((puncak, waktu) => (waktu > puncak ? waktu : puncak), "");
      const terbaca = window.localStorage.getItem(KUNCI_TERBACA);

      if (jalur.startsWith("/kabar") || terbaca === null) {
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
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-garis bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-[600px]">
        {TAUTAN.map(({ href, label, Ikon }) => {
          const aktif = href === "/" ? jalur === "/" : jalur.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={aktif ? "page" : undefined}
                className={`flex min-h-[54px] flex-col items-center justify-center gap-0.5 py-1.5 text-[0.7rem] font-semibold ${
                  aktif ? "text-teal-ink" : "text-ink-soft"
                }`}
              >
                <span className="relative">
                  <Ikon aktif={aktif} />
                  {href === "/kabar" && kabarBaru > 0 ? (
                    <span className="absolute -right-2 -top-1 min-w-[16px] rounded-full bg-bahaya px-1 text-center text-[0.62rem] font-bold leading-4 text-paper">
                      {kabarBaru}
                    </span>
                  ) : null}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
