"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  labelPemicu: string;
  judul: string;
  penjelasan?: string;
  /** Laci terbuka sendiri saat halaman dibuka, dipakai untuk mode ubah lewat ?edit=. */
  terbukaAwal?: boolean;
  /**
   * Kalau diisi, menutup laci memindahkan peramban ke alamat ini. Dipakai mode
   * ubah supaya ?edit= ikut hilang, jadi laci tidak terbuka lagi setelahnya.
   */
  alamatTutup?: string;
  children: ReactNode;
};

/**
 * Laci formulir yang naik dari bawah layar.
 *
 * Memakai <dialog> bawaan peramban seperti KonfirmasiAksi, jadi Escape untuk
 * menutup, jebakan fokus, dan lapisan paling atas didapat gratis.
 *
 * Laci sengaja tidak punya <form> sendiri: FormAksi sudah merender <form>, dan
 * form bersarang akan rusak.
 */
export default function LaciForm({
  labelPemicu,
  judul,
  penjelasan,
  terbukaAwal = false,
  alamatTutup,
  children,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [terbuka, setTerbuka] = useState(terbukaAwal);

  useEffect(() => {
    const elemen = dialog.current;
    if (!elemen) return;
    if (terbuka && !elemen.open) elemen.showModal();
    if (!terbuka && elemen.open) elemen.close();
  }, [terbuka]);

  return (
    <>
      <button type="button" onClick={() => setTerbuka(true)} className="tombol-utama">
        {labelPemicu}
      </button>

      <dialog
        ref={dialog}
        aria-label={judul}
        onClose={() => {
          setTerbuka(false);
          if (alamatTutup) window.location.assign(alamatTutup);
        }}
        className="laci"
      >
        <div className="mx-auto w-full max-w-[560px] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
          <div className="flex justify-center">
            <span className="pegangan-laci" aria-hidden="true" />
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[1.15rem]">{judul}</h2>
              {penjelasan ? <p className="petunjuk">{penjelasan}</p> : null}
            </div>
            <button type="button" onClick={() => setTerbuka(false)} className="tombol-kecil shrink-0">
              Tutup
            </button>
          </div>

          <div className="mt-4">{children}</div>
        </div>
      </dialog>
    </>
  );
}
