"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useTahanPengosongan } from "@/lib/form";

export type HasilAksi = { pesan?: string; sukses?: boolean };

function Tombol({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="tombol-utama" disabled={pending}>
      {pending ? "Menyimpan..." : label}
    </button>
  );
}

/**
 * Pembungkus form admin.
 *
 * Galat validasi ditahan di halaman yang sama supaya isian yang sudah diketik
 * tidak hilang. Setelah berhasil, halaman dimuat ulang penuh dengan penanda
 * tersimpan di alamatnya. Cara ini dipilih setelah dua pola lain terbukti
 * kehilangan pesan pada sebagian pengiriman: revalidatePath di dalam aksi
 * memasang ulang form ini, dan pengalihan dari dalam aksi kadang tidak diikuti
 * router. Muat ulang penuh selalu sampai, dan daftar di bawah form ikut segar.
 */
export default function FormAksi({
  aksi,
  labelKirim,
  children,
  className,
  alamatSukses,
}: {
  aksi: (sebelumnya: HasilAksi, formData: FormData) => Promise<HasilAksi>;
  labelKirim: string;
  children: React.ReactNode;
  className?: string;
  /**
   * Alamat tujuan setelah berhasil. Tanpa ini, alamat yang sedang dibuka yang
   * dimuat ulang. Dipakai formulir di dalam laci yang dibuka lewat penanda di
   * alamat, misalnya ?ubah=, supaya penandanya ikut hilang dan lacinya tidak
   * langsung terbuka lagi setelah disimpan.
   */
  alamatSukses?: string;
}) {
  const [hasil, dispatch] = useActionState<HasilAksi, FormData>(aksi, {});
  const form = useRef<HTMLFormElement>(null);

  useTahanPengosongan(form);

  useEffect(() => {
    if (!hasil.sukses) return;
    const alamat = new URL(alamatSukses ?? window.location.href, window.location.href);
    alamat.searchParams.set("tersimpan", "1");
    window.location.assign(alamat.toString());
  }, [hasil, alamatSukses]);

  return (
    <form ref={form} action={dispatch} className={`grid gap-4 ${className ?? ""}`}>
      {hasil.pesan && !hasil.sukses ? (
        <p role="alert" className="rounded-[4px] border border-bahaya bg-paper p-3 text-bahaya">
          {hasil.pesan}
        </p>
      ) : null}
      {children}
      <div>
        <Tombol label={labelKirim} />
      </div>
    </form>
  );
}
