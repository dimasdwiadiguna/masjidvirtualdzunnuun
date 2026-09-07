"use client";

import { useEffect, useState } from "react";
import { IkonBagikan } from "./Ikon";

type Props = {
  judul: string;
  teks: string;
  jalurCadangan: string;
  gaya?: "kedua" | "kecil";
};

/**
 * Tombol bagikan.
 *
 * Kalau perangkat mendukung Web Share API, yang dibuka adalah lembar bagikan
 * bawaan sistem: dari situ pengguna memilih WhatsApp lalu memilih kontak atau
 * grup, persis seperti membagikan tautan dari app lain. Tautan wa.me dipakai
 * sebagai cadangan, dan tetap menjadi href aslinya supaya tombol ini masih
 * berfungsi walaupun JavaScript gagal dimuat.
 */
export default function Bagikan({ judul, teks, jalurCadangan, gaya = "kedua" }: Props) {
  const [alamat, setAlamat] = useState(jalurCadangan);

  useEffect(() => {
    setAlamat(window.location.href);
  }, []);

  const pesan = `${teks}\n${alamat}`;
  const cadangan = `https://api.whatsapp.com/send?text=${encodeURIComponent(pesan)}`;

  const bagikan = async (peristiwa: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof navigator === "undefined" || !navigator.share) return;
    peristiwa.preventDefault();
    try {
      await navigator.share({ title: judul, text: teks, url: alamat });
    } catch (galat) {
      if (galat instanceof Error && galat.name === "AbortError") return;
      window.open(cadangan, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <a
      href={cadangan}
      target="_blank"
      rel="noopener noreferrer"
      onClick={bagikan}
      className={gaya === "kecil" ? "tombol-kecil" : "tombol-kedua"}
    >
      <IkonBagikan />
      Bagikan
    </a>
  );
}
