"use client";

import { useState } from "react";
import { IkonSalin } from "./Ikon";

type Props = {
  teks: string;
  label: string;
  labelSelesai?: string;
  className?: string;
};

export default function SalinTeks({
  teks,
  label,
  labelSelesai = "Tersalin",
  className,
}: Props) {
  const [status, setStatus] = useState<"diam" | "selesai" | "gagal">("diam");

  const salin = async () => {
    const isi = teks;
    try {
      await navigator.clipboard.writeText(isi);
      setStatus("selesai");
    } catch {
      setStatus("gagal");
    }
    window.setTimeout(() => setStatus("diam"), 2500);
  };

  return (
    <span className={className}>
      <button type="button" onClick={salin} className="tombol-kecil w-full">
        <IkonSalin className="mr-2" />
        {status === "selesai" ? labelSelesai : label}
      </button>
      <span aria-live="polite" className="sr-only">
        {status === "selesai" ? labelSelesai : ""}
        {status === "gagal" ? "Perangkat menolak menyalin. Silakan salin manual." : ""}
      </span>
      {status === "gagal" ? (
        <span className="mt-1 block text-sm text-bahaya">
          Peramban menolak menyalin otomatis. Silakan tekan lama teksnya lalu salin manual.
        </span>
      ) : null}
    </span>
  );
}
