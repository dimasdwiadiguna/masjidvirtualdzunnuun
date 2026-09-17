"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IkonInstagram, IkonTikTok } from "@/components/Ikon";

export type TautanSosial = { url: string; label: string };

export type IsiBar =
  | { jenis: "sosial"; tautan: TautanSosial[] }
  | { jenis: "hitung-mundur"; judul: string; slug: string; mulai: string; keterangan: string };

const JEDA_MS = 6500;
const GESER_MS = 620;

function dua(nilai: number): string {
  return String(nilai).padStart(2, "0");
}

/**
 * Sisa waktu menuju satu acara, dihitung ulang tiap detik di perangkat
 * pengunjung.
 *
 * Nilai awalnya sengaja kosong dan baru diisi setelah komponen terpasang. Jam
 * server dan jam HP tidak pernah sama persis, dan kalau angkanya ikut dirender
 * di server, React akan menemukan dua angka yang berbeda saat menyambung
 * halaman lalu mengeluh di konsol.
 */
function useSisaWaktu(mulai: string, jalan: boolean): string | null {
  const [sisa, setSisa] = useState<string | null>(null);

  useEffect(() => {
    if (!jalan) return;

    const hitung = () => {
      const selisih = new Date(mulai).getTime() - Date.now();
      if (!Number.isFinite(selisih) || selisih <= 0) {
        setSisa("");
        return;
      }
      const detikTotal = Math.floor(selisih / 1000);
      const hari = Math.floor(detikTotal / 86_400);
      const jam = Math.floor((detikTotal % 86_400) / 3600);
      const menit = Math.floor((detikTotal % 3600) / 60);
      const detik = detikTotal % 60;
      setSisa(hari > 0 ? `${hari} hari ${dua(jam)}:${dua(menit)}:${dua(detik)}` : `${dua(jam)}:${dua(menit)}:${dua(detik)}`);
    };

    hitung();
    const pengatur = window.setInterval(hitung, 1000);
    return () => window.clearInterval(pengatur);
  }, [mulai, jalan]);

  return sisa;
}

function SlideSosial({ tautan }: { tautan: TautanSosial[] }) {
  return (
    <div className="flex h-full w-full items-center justify-between gap-2 px-4">
      <p className="text-[0.8rem] font-semibold text-ink">Ikuti kegiatan kami</p>
      <div className="flex items-center gap-1">
        {tautan.map((item) => (
          <a
            key={item.label}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            // Ikonnya aria-hidden, jadi nama tautan datang dari sini. Tanpa
            // ini tautannya jadi tautan tanpa nama bagi pembaca layar.
            aria-label={`${item.label} Dzun Nuun, terbuka di aplikasi`}
            className="inline-flex h-[38px] min-w-[44px] items-center justify-center text-ink"
          >
            {item.label === "Instagram" ? <IkonInstagram /> : <IkonTikTok />}
          </a>
        ))}
      </div>
    </div>
  );
}

function SlideHitungMundur({
  isi,
  aktif,
}: {
  isi: Extract<IsiBar, { jenis: "hitung-mundur" }>;
  aktif: boolean;
}) {
  const sisa = useSisaWaktu(isi.mulai, aktif);
  const berlangsung = sisa === "";

  return (
    <Link
      href={`/acara/${isi.slug}`}
      // Angkanya berganti tiap detik, jadi angka itu disembunyikan dari pembaca
      // layar dan namanya diambil dari keterangan yang tidak berubah.
      aria-label={`${isi.judul}, ${isi.keterangan}. Buka halaman acaranya`}
      className="flex h-full w-full items-center justify-between gap-3 px-4 text-ink"
    >
      <span className="min-w-0 flex-1 truncate text-[0.8rem] font-semibold">
        {berlangsung ? "Sedang berlangsung" : "Menuju"} {isi.judul}
      </span>
      <span aria-hidden="true" className="shrink-0 text-[0.82rem] font-bold tabular-nums tracking-tight">
        {sisa === null ? "" : berlangsung ? "Sekarang" : sisa}
      </span>
    </Link>
  );
}

/**
 * Bar yang menempel tepat di atas navigasi bawah dan bergantian menampilkan
 * beberapa hal: ajakan mengikuti sosial media, dan hitung mundur ke acara
 * terdekat.
 *
 * Isinya digeser mendatar, bukan ditumpuk lalu ditukar, supaya jelas bahwa ada
 * lebih dari satu kartu di dalam bar yang sama. Kilau gradasi ikut menyapu
 * sekali tiap pergantian, cukup untuk menarik mata tanpa jadi lampu disko di
 * bar setinggi 38 piksel.
 *
 * Perangkat yang meminta gerak minimal tetap mendapat semua isinya: yang
 * dilepas cuma gesernya dan kilaunya, dan kartunya berganti seketika. Ini beda
 * dengan carousel hero (D-54) yang berhenti berganti sama sekali, karena di
 * sana isi tiap foto setara sedangkan di sini hitung mundur membawa kabar yang
 * tidak ada di kartu lain.
 */
export default function BarBerganti({ isi }: { isi: IsiBar[] }) {
  const [aktif, setAktif] = useState(0);
  const [pelan, setPelan] = useState(false);

  useEffect(() => {
    setPelan(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (isi.length < 2) return;
    const pengatur = window.setInterval(() => setAktif((kini) => (kini + 1) % isi.length), JEDA_MS);
    return () => window.clearInterval(pengatur);
  }, [isi.length]);

  if (isi.length === 0) return null;

  return (
    <div className="fixed bottom-[54px] left-0 right-0 z-40 overflow-hidden bg-gold md:hidden">
      <div className="relative mx-auto h-[38px] max-w-[600px] overflow-hidden">
        <div
          className="flex h-full"
          style={{
            width: `${isi.length * 100}%`,
            transform: `translateX(-${(aktif * 100) / isi.length}%)`,
            transition: pelan ? "none" : `transform ${GESER_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
          }}
        >
          {isi.map((satu, indeks) => (
            <div
              key={satu.jenis}
              className="h-full shrink-0"
              style={{ width: `${100 / isi.length}%` }}
              // Kartu yang sedang tidak tampil tidak boleh ikut ditelusuri
              // pembaca layar atau kena tab, walaupun elemennya tetap ada.
              inert={indeks !== aktif}
            >
              {satu.jenis === "sosial" ? (
                <SlideSosial tautan={satu.tautan} />
              ) : (
                <SlideHitungMundur isi={satu} aktif={indeks === aktif} />
              )}
            </div>
          ))}
        </div>

        {isi.length > 1 && !pelan ? (
          <span
            // Elemen ini dipasang ulang tiap kartu berganti, dan pemasangan
            // ulang itulah yang menjalankan kembali animasinya dari awal.
            key={aktif}
            aria-hidden="true"
            className="kilau-bar pointer-events-none absolute inset-y-0 w-1/2"
          />
        ) : null}
      </div>
    </div>
  );
}
