"use client";

import { useState } from "react";
import type { InteraksiMode } from "@/lib/data/types";

const PILIHAN: { nilai: InteraksiMode; label: string; bantuan: string }[] = [
  { nilai: "mati", label: "Tidak menampilkan apa-apa", bantuan: "Bagian ini hilang sama sekali dari beranda." },
  { nilai: "kuis", label: "Kuis berhadiah", bantuan: "Tujuh soal acak, benar semua berhak hadiah." },
  { nilai: "polling", label: "Polling pendapat", bantuan: "Satu pertanyaan, hasilnya langsung terlihat." },
];

/**
 * Pilihan mode dibuat terkendali, bukan mengandalkan defaultChecked.
 *
 * Kalau penyimpanan ditolak karena bank soalnya belum benar, form dirender
 * ulang dengan pesan galat, dan radio yang tidak terkendali kembali ke nilai
 * awalnya. Pengurus mengira modenya masih terpilih padahal sudah balik ke
 * "mati". Ini bentuk kegagalan yang sama dengan D-21 dan D-64.
 */
export default function PilihMode({ awal }: { awal: InteraksiMode }) {
  const [mode, setMode] = useState<InteraksiMode>(awal);

  return (
    <fieldset>
      <legend className="label-isian">Yang ditampilkan di beranda</legend>
      <div className="mt-1 grid gap-2">
        {PILIHAN.map((satu) => (
          <label
            key={satu.nilai}
            className="flex min-h-[46px] cursor-pointer items-start gap-3 rounded-[8px] border border-garis-isian px-3 py-2 text-[0.95rem] has-[:checked]:border-teal has-[:checked]:bg-teal/10"
          >
            <input
              type="radio"
              name="interaksi_mode"
              value={satu.nilai}
              checked={mode === satu.nilai}
              onChange={() => setMode(satu.nilai)}
              className="mt-0.5 h-5 w-5 accent-[#0A8074]"
            />
            <span>
              {satu.label}
              <span className="block text-sm text-ink-soft">{satu.bantuan}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
