"use client";

import { useEffect, useState } from "react";
import BarisAcara from "./BarisAcara";
import Kalender from "./Kalender";
import type { EventItem } from "@/lib/data/types";

type Item = { acara: EventItem; sisaKuota: number | null };
type Mode = "kartu" | "kalender";

const KUNCI = "dzn:tampilan-acara";

export default function TampilanAcara({ daftar }: { daftar: Item[] }) {
  const [mode, setMode] = useState<Mode>("kartu");

  useEffect(() => {
    const tersimpan = window.localStorage.getItem(KUNCI);
    if (tersimpan === "kalender" || tersimpan === "kartu") setMode(tersimpan);
  }, []);

  const ganti = (baru: Mode) => {
    setMode(baru);
    window.localStorage.setItem(KUNCI, baru);
  };

  return (
    <>
      <div
        className="mt-4 inline-flex rounded-[8px] border border-garis-isian p-0.5"
        role="group"
        aria-label="Pilih tampilan acara"
      >
        {(["kartu", "kalender"] as Mode[]).map((pilihan) => (
          <button
            key={pilihan}
            type="button"
            onClick={() => ganti(pilihan)}
            aria-pressed={mode === pilihan}
            className={`min-h-[38px] rounded-[6px] px-4 font-[family-name:var(--font-judul)] text-sm font-semibold ${
              mode === pilihan ? "bg-teal text-paper" : "text-ink-soft"
            }`}
          >
            {pilihan === "kartu" ? "Daftar" : "Kalender"}
          </button>
        ))}
      </div>

      {daftar.length === 0 ? (
        <div className="kartu mt-4 p-4">
          <p className="font-semibold">Belum ada acara yang dijadwalkan.</p>
          <p className="petunjuk">Jadwal berikutnya muncul di sini lengkap dengan tombol daftar.</p>
        </div>
      ) : mode === "kartu" ? (
        <div className="mt-4 grid gap-2">
          {daftar.map((item) => (
            <BarisAcara key={item.acara.id} acara={item.acara} sisaKuota={item.sisaKuota} tingkat="h2" />
          ))}
        </div>
      ) : (
        <Kalender daftar={daftar} />
      )}
    </>
  );
}
