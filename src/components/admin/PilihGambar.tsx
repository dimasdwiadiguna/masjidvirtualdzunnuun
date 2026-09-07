"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  name: string;
  label: string;
  bantuan?: string;
  /** QRIS dipertahankan sebagai PNG supaya polanya tetap tajam saat dipindai. */
  jenis?: "foto" | "qris";
};

const BATAS_SISI = { foto: 1400, qris: 1200 } as const;
const SASARAN_BITA = 900 * 1024;
const KUALITAS = [0.8, 0.68, 0.55];

function ukuranTerbaca(bita: number): string {
  return bita >= 1024 * 1024 ? `${(bita / 1048576).toFixed(1)} MB` : `${Math.round(bita / 1024)} KB`;
}

async function keGambar(berkas: File): Promise<HTMLImageElement> {
  const alamat = URL.createObjectURL(berkas);
  try {
    const gambar = new Image();
    gambar.src = alamat;
    await gambar.decode();
    return gambar;
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(alamat), 10_000);
  }
}

/**
 * Foto dari kamera HP biasanya 3 sampai 8 MB, sedangkan server action Next
 * hanya menerima kiriman kecil dan jaringan jamaah sering lambat. Gambar
 * karena itu dikecilkan di perangkat sebelum dikirim. Sebagai bonus, foto
 * HEIC dari iPhone ikut berubah jadi JPEG yang bisa diterima server.
 */
export default function PilihGambar({ name, label, bantuan, jenis = "foto" }: Props) {
  const isian = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  const olah = async (berkas: File) => {
    setSibuk(true);
    setStatus("Menyiapkan gambar...");
    try {
      let gambar: HTMLImageElement;
      try {
        gambar = await keGambar(berkas);
      } catch {
        throw new Error("berkas ini bukan gambar yang bisa dibaca. Pilih foto JPG, PNG, HEIC, atau WebP.");
      }
      const sisiMaks = BATAS_SISI[jenis];
      const skala = Math.min(1, sisiMaks / Math.max(gambar.naturalWidth, gambar.naturalHeight));
      const lebar = Math.max(1, Math.round(gambar.naturalWidth * skala));
      const tinggi = Math.max(1, Math.round(gambar.naturalHeight * skala));

      const kanvas = document.createElement("canvas");
      kanvas.width = lebar;
      kanvas.height = tinggi;
      const konteks = kanvas.getContext("2d");
      if (!konteks) throw new Error("Peramban ini tidak bisa mengolah gambar.");
      konteks.drawImage(gambar, 0, 0, lebar, tinggi);

      const tipe = jenis === "qris" ? "image/png" : "image/jpeg";
      const keluar = async (kualitas?: number) =>
        new Promise<Blob | null>((selesai) => kanvas.toBlob(selesai, tipe, kualitas));

      let gumpalan: Blob | null = null;
      if (jenis === "qris") {
        gumpalan = await keluar();
      } else {
        // Turunkan kualitas bertahap sampai ukurannya masuk akal untuk
        // dikirim lewat jaringan seluler.
        for (const kualitas of KUALITAS) {
          gumpalan = await keluar(kualitas);
          if (gumpalan && gumpalan.size <= SASARAN_BITA) break;
        }
      }
      if (!gumpalan) throw new Error("Gambar gagal diolah di perangkat ini.");

      const nama = `${berkas.name.replace(/\.[^.]+$/, "")}.${tipe === "image/png" ? "png" : "jpg"}`;
      const hasil = new File([gumpalan], nama, { type: tipe });

      const wadah = new DataTransfer();
      wadah.items.add(hasil);
      if (isian.current) isian.current.files = wadah.files;

      setPratinjau(URL.createObjectURL(hasil));
      setStatus(
        hasil.size < berkas.size
          ? `Siap dikirim. Ukuran dikecilkan dari ${ukuranTerbaca(berkas.size)} jadi ${ukuranTerbaca(hasil.size)}.`
          : `Siap dikirim, ukuran ${ukuranTerbaca(hasil.size)}.`,
      );
    } catch (galat) {
      setStatus(
        galat instanceof Error
          ? `Gambar tidak bisa dipakai, ${galat.message}`
          : "Gambar tidak bisa dipakai. Coba foto lain.",
      );
      if (isian.current) isian.current.value = "";
      setPratinjau(null);
    } finally {
      setSibuk(false);
    }
  };

  // Kalau pengurus memilih berkas sebelum halaman selesai dihidupkan,
  // peristiwa change-nya hilang dan gambar akan terkirim mentah. Karena itu
  // isian diperiksa sekali setelah komponen terpasang.
  useEffect(() => {
    const berkas = isian.current?.files?.[0];
    if (berkas) void olah(berkas);
    // Sengaja hanya sekali saat terpasang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <label className="label-isian" htmlFor={`gambar-${name}`}>
        {label}
      </label>
      <input
        ref={isian}
        id={`gambar-${name}`}
        name={name}
        type="file"
        accept="image/*"
        disabled={sibuk}
        onChange={(peristiwa) => {
          const berkas = peristiwa.target.files?.[0];
          if (berkas) void olah(berkas);
        }}
        className="isian py-2"
      />
      {bantuan ? <p className="petunjuk">{bantuan}</p> : null}
      <p aria-live="polite" className="petunjuk">
        {status ?? "Foto dari HP otomatis dikecilkan supaya cepat terkirim."}
      </p>
      {pratinjau ? (
        // Pratinjau memakai blob lokal yang tidak bisa dioptimasi next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pratinjau}
          alt="Pratinjau gambar yang akan diunggah"
          className="mt-2 h-24 w-auto rounded-[8px] border border-garis"
        />
      ) : null}
    </div>
  );
}
