"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { kirimPendaftaran, type HasilFormDaftar } from "@/app/(publik)/acara/[slug]/daftar/actions";
import { rupiah } from "@/lib/format";

function TombolKirim({ berbayar }: { berbayar: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="tombol-utama w-full" disabled={pending}>
      {pending ? "Menyiapkan tiket Anda..." : berbayar ? "Lanjut ke cara bayar" : "Ambil tiket gratis"}
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

  // Sama seperti form donasi: perpindahan ke halaman tiket dilakukan peramban,
  // bukan pengalihan dari dalam server action.
  useEffect(() => {
    if (hasil.kode) window.location.assign(`/tiket/${hasil.kode}`);
  }, [hasil]);
  const maksimal = sisaKuota === null ? 10 : Math.max(1, Math.min(10, sisaKuota));

  return (
    <form action={aksi} className="mt-6 grid gap-5" noValidate>
      <input type="hidden" name="slug" value={slug} />

      {hasil.pesan ? (
        <p role="alert" className="rounded-[4px] border-2 border-bahaya bg-paper p-3 text-bahaya">
          {hasil.pesan}
        </p>
      ) : null}

      <div>
        <label className="label-isian" htmlFor="nama">
          Nama Anda
        </label>
        <input id="nama" name="nama" type="text" autoComplete="name" required maxLength={60} className="isian" placeholder="Nama yang biasa dipakai" />
        {hasil.galat?.nama ? (
          <p role="alert" className="mt-1 text-sm font-semibold text-bahaya">
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
        <p id="bantuan-wa" className="mt-1 text-sm text-ink-soft">
          Dipakai kalau ada perubahan jadwal. Tidak ditampilkan utuh di halaman mana pun.
        </p>
        {hasil.galat?.whatsapp ? (
          <p role="alert" className="mt-1 text-sm font-semibold text-bahaya">
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
          <p role="alert" className="mt-1 text-sm font-semibold text-bahaya">
            {hasil.galat.jumlah}
          </p>
        ) : null}
        <p id="hitung-bayar" aria-live="polite" className="mt-2 rounded-[4px] border-l-4 border-teal bg-paper p-3 font-semibold">
          {berbayar
            ? `${jumlah > 0 ? jumlah : 0} orang = ${rupiah(Math.max(0, jumlah) * harga)} sebelum angka pembeda`
            : "Acara ini gratis. Tiket langsung jadi setelah tombol ditekan."}
        </p>
      </div>

      <TombolKirim berbayar={berbayar} />
    </form>
  );
}
