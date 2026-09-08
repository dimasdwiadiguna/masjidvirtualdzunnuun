"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { kirimPendaftaran, type HasilFormDaftar } from "@/app/(publik)/acara/[slug]/daftar/actions";
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
  sisaKuota: number | null;
};

export default function FormPendaftaran({ slug, berbayar, harga, sisaKuota }: Props) {
  const [hasil, aksi] = useActionState<HasilFormDaftar, FormData>(kirimPendaftaran, {});
  const [jumlah, setJumlah] = useState(1);

  const maksimal = sisaKuota === null ? 10 : Math.max(1, Math.min(10, sisaKuota));

  return (
    <form action={aksi} className="mt-5 grid gap-4" noValidate>
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

      <div>
        <label className="label-isian" htmlFor="jumlah">
          Datang berapa orang
        </label>
        <input
          id="jumlah"
          name="jumlah"
          type="number"
          inputMode="numeric"
          min={1}
          max={maksimal}
          required
          value={jumlah}
          onChange={(event) => setJumlah(Number(event.target.value))}
          className="isian"
          aria-describedby="hitung-bayar"
        />
        {hasil.galat?.jumlah ? (
          <p role="alert" className="galat-isian">
            {hasil.galat.jumlah}
          </p>
        ) : null}
        <p id="hitung-bayar" aria-live="polite" className="mt-2 rounded-[8px] bg-teal/10 px-3 py-2 text-sm font-semibold">
          {berbayar
            ? `${jumlah > 0 ? jumlah : 0} orang = ${rupiah(Math.max(0, jumlah) * harga)} sebelum angka pembeda`
            : "Acara ini gratis. Tiket langsung jadi."}
        </p>
      </div>

      <TombolKirim berbayar={berbayar} />
    </form>
  );
}
