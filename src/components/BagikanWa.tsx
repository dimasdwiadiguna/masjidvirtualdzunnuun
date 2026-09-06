"use client";

import { useEffect, useState } from "react";
import { IkonWhatsApp } from "./Ikon";

/**
 * Alamat halaman diambil dari peramban supaya tautan yang dibagikan selalu
 * cocok dengan domain yang sedang dibuka, termasuk saat pratinjau.
 */
export default function BagikanWa({ teks, jalurCadangan }: { teks: string; jalurCadangan: string }) {
  const [alamat, setAlamat] = useState(jalurCadangan);

  useEffect(() => {
    setAlamat(window.location.href);
  }, []);

  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(`${teks}\n${alamat}`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="tombol-kedua"
    >
      <IkonWhatsApp />
      Bagikan ke WhatsApp
    </a>
  );
}
