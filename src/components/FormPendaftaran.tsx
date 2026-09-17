"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { kirimPendaftaran, type HasilFormDaftar } from "@/app/(publik)/acara/[slug]/daftar/actions";
import { useTahanPengosongan } from "@/lib/form";
import { rupiah } from "@/lib/format";

function TombolKirim({ berbayar }: { berbayar: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="tombol-utama w-full" disabled={pending}>
      {pending ? "Menyiapkan..." : berbayar ? "Lanjut ke cara bayar" : "Ambil tiket gratis"}
    </button>
  );
}

type Props = {
  slug: string;
  berbayar: boolean;
  harga: number;
};

/**
 * Isian jumlah orang sudah tidak ada. Satu pendaftaran berarti satu orang, dan
 * yang datang berombongan mendaftar sendiri-sendiri. Alasannya di DECISIONS
 * D-99: tinggal dua isian, dan kehadiran jadi bisa dihitung per nomor.
 */
export default function FormPendaftaran({ slug, berbayar, harga }: Props) {
  const [hasil, aksi] = useActionState<HasilFormDaftar, FormData>(kirimPendaftaran, {});
  const form = useRef<HTMLFormElement>(null);

  // Kiriman yang ditolak tidak boleh menghapus isian yang sudah diketik.
  useTahanPengosongan(form);

  return (
    <form ref={form} action={aksi} className="mt-5 grid gap-4" noValidate>
      <input type="hidden" name="slug" value={slug} />

      {hasil.pesan ? (
        <p role="alert" className="rounded-[8px] border border-bahaya bg-paper p-3 text-sm text-bahaya">
          {hasil.pesan}
        </p>
      ) : null}

      <div>
        <label className="label-isian" htmlFor="nama">
          Nama
        </label>
        <input
          id="nama"
          name="nama"
          type="text"
          autoComplete="name"
          required
          maxLength={60}
          className="isian"
          placeholder="Nama yang biasa dipakai"
        />
        {hasil.galat?.nama ? (
          <p role="alert" className="galat-isian">
            {hasil.galat.nama}
          </p>
        ) : null}
      </div>

      <div>
        <label className="label-isian" htmlFor="whatsapp">
          Nomor WhatsApp
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          required
          className="isian"
          placeholder="081234567890"
          aria-describedby="bantuan-wa"
        />
        <p id="bantuan-wa" className="petunjuk">
          Dipakai kalau ada perubahan jadwal.
        </p>
        {hasil.galat?.whatsapp ? (
          <p role="alert" className="galat-isian">
            {hasil.galat.whatsapp}
          </p>
        ) : null}
      </div>

      <p className="rounded-[8px] bg-teal/10 px-3 py-2 text-sm font-semibold">
        {berbayar
          ? `Satu tiket untuk satu orang, ${rupiah(harga)} sebelum angka pembeda. Yang datang bersama mendaftar sendiri-sendiri supaya tiketnya masing-masing.`
          : "Acara ini gratis. Satu tiket untuk satu orang, dan tiketnya langsung jadi."}
      </p>

      <TombolKirim berbayar={berbayar} />
    </form>
  );
}
