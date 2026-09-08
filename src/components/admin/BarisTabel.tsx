"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  /** Sel yang selalu terlihat, termasuk di layar 360px. */
  ringkas: ReactNode;
  /** Sel yang hanya muncul di layar lebar, disembunyikan lewat hidden sm:table-cell. */
  tambahan?: ReactNode;
  /** Isi baris rincian yang muncul saat baris dibuka di layar sempit. */
  rincian?: ReactNode;
  aksi: ReactNode;
  /** Jumlah kolom tabel, dipakai untuk colSpan baris rincian. */
  kolom: number;
  judulBaris: string;
};

/**
 * Satu baris tabel pengurus.
 *
 * Di layar lebar semua kolom dan semua tombol aksi langsung terlihat. Di HP
 * ruang yang tersedia hanya sekitar 328px, jadi kolom sekunder disembunyikan
 * dan baris bisa dibuka untuk menampilkan sisanya berikut tombol aksinya.
 */
export default function BarisTabel({ ringkas, tambahan, rincian, aksi, kolom, judulBaris }: Props) {
  const [terbuka, setTerbuka] = useState(false);
  const idRincian = useId();

  return (
    <>
      <tr className="kartu-tekan">
        {ringkas}
        {tambahan}
        <td className="sel-aksi">
          {/* Tombol aksi dirender sekali saja. Merender dua salinan, satu untuk
              layar lebar dan satu di baris rincian, akan menggandakan id di
              dalamnya, misalnya kotak catatan pada dialog konfirmasi. */}
          <div className={`${terbuka ? "flex" : "hidden"} flex-wrap justify-end gap-2 sm:flex`}>{aksi}</div>
          <button
            type="button"
            onClick={() => setTerbuka((kini) => !kini)}
            aria-expanded={terbuka}
            aria-controls={idRincian}
            className="tombol-kecil sm:hidden"
          >
            {terbuka ? "Tutup" : "Buka"}
            <span className="sr-only"> rincian {judulBaris}</span>
          </button>
        </td>
      </tr>

      {terbuka && rincian ? (
        <tr id={idRincian} className="baris-rincian sm:hidden">
          <td colSpan={kolom}>
            <div className="grid gap-1 text-sm text-ink-soft">{rincian}</div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
