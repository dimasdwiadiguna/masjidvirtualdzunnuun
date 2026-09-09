"use client";

import { useEffect, type RefObject } from "react";

/**
 * Menahan pengosongan formulir yang dilakukan React setiap aksi selesai.
 *
 * Sejak React 19, `<form action={...}>` mengosongkan isinya begitu aksinya
 * selesai, termasuk saat aksinya menolak kiriman. Untuk formulir di app ini itu
 * merugikan: galat validasi memang ditahan di halaman yang sama supaya isian
 * yang sudah diketik tidak hilang, dan pilihan yang dikosongkan diam-diam bisa
 * membuat radio di dalam kartu tidak lagi sesuai dengan kartu yang tersorot.
 *
 * Pembatalnya dipasang sebagai penyimak asli lewat `ref`, bukan lewat prop
 * `onReset`: pembatalan dari prop itu diuji dan tidak sampai membatalkan
 * pengosongannya.
 *
 * Aman untuk semua formulir di app ini karena tidak ada satu pun yang
 * mengandalkan dikosongkan: yang berhasil selalu berpindah halaman atau
 * berganti tampilan.
 */
export function useTahanPengosongan(form: RefObject<HTMLFormElement | null>): void {
  useEffect(() => {
    const elemen = form.current;
    if (!elemen) return;
    const tahan = (peristiwa: Event) => peristiwa.preventDefault();
    elemen.addEventListener("reset", tahan);
    return () => elemen.removeEventListener("reset", tahan);
  }, [form]);
}
