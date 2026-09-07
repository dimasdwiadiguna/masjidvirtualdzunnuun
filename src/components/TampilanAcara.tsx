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
      <div className="mt-5 inline-flex rounded-[4px] border-2 border-ink" role="group" aria-label="Pilih tampilan acara">
        {(["kartu", "kalender"] as Mode[]).map((pilihan) => (
          <button
            key={pilihan}
            type="button"
            onClick={() => ganti(pilihan)}
            aria-pressed={mode === pilihan}
            className={`min-h-[44px] px-4 font-[family-name:var(--font-judul)] font-semibold ${
              mode === pilihan ? "bg-teal text-paper" : "bg-paper text-ink"
            }`}
          >
            {pilihan === "kartu" ? "Kartu" : "Kalender"}
          </button>
        ))}
      </div>

      {daftar.length === 0 ? (
        <div className="kartu mt-5 p-4">
          <p className="font-semibold">Belum ada acara yang dijadwalkan.</p>
          <p className="mt-1 text-ink-soft">
            Begitu jadwal berikutnya siap, acaranya muncul di sini lengkap dengan tombol daftar.
          </p>
        </div>
      ) : mode === "kartu" ? (
        <div className="mt-5 grid gap-3">
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
