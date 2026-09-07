"use client";

import { useMemo, useState } from "react";
import BarisAcara from "./BarisAcara";
import { tanggalJakarta, tanggalPanjang } from "@/lib/format";
import type { EventItem } from "@/lib/data/types";

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ahad"];
const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

type Item = { acara: EventItem; sisaKuota: number | null };

function kunciHari(tahun: number, bulan: number, hari: number): string {
  return `${tahun}-${String(bulan + 1).padStart(2, "0")}-${String(hari).padStart(2, "0")}`;
}

/** Grid bulanan sederhana, dibuat sendiri supaya tidak menarik library kalender. */
export default function Kalender({ daftar }: { daftar: Item[] }) {
  const awal = daftar[0] ? new Date(daftar[0].acara.starts_at) : new Date();
  const [tahun, setTahun] = useState(awal.getFullYear());
  const [bulan, setBulan] = useState(awal.getMonth());
  const [dipilih, setDipilih] = useState<string | null>(null);

  const perHari = useMemo(() => {
    const peta = new Map<string, Item[]>();
    for (const item of daftar) {
      const kunci = tanggalJakarta(item.acara.starts_at);
      peta.set(kunci, [...(peta.get(kunci) ?? []), item]);
    }
    return peta;
  }, [daftar]);

  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
  const geser = (new Date(tahun, bulan, 1).getDay() + 6) % 7;
  const sel = [
    ...Array.from({ length: geser }, () => null),
    ...Array.from({ length: jumlahHari }, (_, i) => i + 1),
  ];

  const pindahBulan = (arah: number) => {
    const tanggal = new Date(tahun, bulan + arah, 1);
    setTahun(tanggal.getFullYear());
    setBulan(tanggal.getMonth());
    setDipilih(null);
  };

  const acaraTerpilih = dipilih ? (perHari.get(dipilih) ?? []) : [];

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => pindahBulan(-1)} className="tombol-kecil" aria-label="Bulan sebelumnya">
          Sebelumnya
        </button>
        <p aria-live="polite" className="font-[family-name:var(--font-judul)] font-bold">
          {BULAN[bulan]} {tahun}
        </p>
        <button type="button" onClick={() => pindahBulan(1)} className="tombol-kecil" aria-label="Bulan berikutnya">
          Berikutnya
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-ink-soft" aria-hidden="true">
        {HARI.map((nama) => (
          <span key={nama}>{nama}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {sel.map((hari, indeks) => {
          if (hari === null) return <span key={`kosong-${indeks}`} />;
          const kunci = kunciHari(tahun, bulan, hari);
          const isi = perHari.get(kunci) ?? [];
          const aktif = dipilih === kunci;
          return (
            <button
              key={kunci}
              type="button"
              onClick={() => setDipilih(aktif ? null : kunci)}
              disabled={isi.length === 0}
              aria-pressed={aktif}
              aria-label={
                isi.length > 0
                  ? `${tanggalPanjang(`${kunci}T00:00:00+07:00`)}, ${isi.length} acara`
                  : `${tanggalPanjang(`${kunci}T00:00:00+07:00`)}, tidak ada acara`
              }
              className={`flex min-h-[44px] flex-col items-center justify-center rounded-[4px] border-2 text-sm ${
                aktif
                  ? "border-ink bg-teal text-paper"
                  : isi.length > 0
                    ? "border-ink bg-paper font-semibold text-ink"
                    : "border-transparent text-ink-soft"
              }`}
            >
              {hari}
              <span
                aria-hidden="true"
                className={`mt-0.5 h-[5px] w-[5px] rounded-full ${
                  isi.length > 0 ? (aktif ? "bg-paper" : "bg-teal") : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {dipilih ? (
          acaraTerpilih.length > 0 ? (
            <>
              <h2 className="text-base">Acara pada {tanggalPanjang(`${dipilih}T00:00:00+07:00`)}</h2>
              <div className="mt-2 grid gap-2">
                {acaraTerpilih.map((item) => (
                  <BarisAcara key={item.acara.id} acara={item.acara} sisaKuota={item.sisaKuota} />
                ))}
              </div>
            </>
          ) : null
        ) : (
          <p className="text-ink-soft">
            Tanggal bertanda titik berarti ada acara. Tap tanggalnya untuk melihat daftar acara hari itu.
          </p>
        )}
      </div>
    </div>
  );
}
