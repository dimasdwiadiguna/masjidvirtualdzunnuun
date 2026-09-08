"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { kirimDonasi, type HasilFormDonasi } from "@/app/(publik)/donasi/actions";
import { angka, rupiah } from "@/lib/format";

const CEPAT = [1, 5, 10, 33];

function TombolKirim() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="tombol-utama w-full" disabled={pending}>
      {pending ? "Menyiapkan..." : "Lanjut ke cara bayar"}
    </button>
  );
}

export default function FormDonasi({ hargaPaket }: { hargaPaket: number }) {
  const [hasil, aksi] = useActionState<HasilFormDonasi, FormData>(kirimDonasi, {});
  const [paket, setPaket] = useState(1);

  const jumlah = Number.isFinite(paket) && paket > 0 ? Math.floor(paket) : 0;

  return (
    <form action={aksi} className="mt-5 grid gap-4" noValidate>
      {hasil.pesan ? (
        <p role="alert" className="rounded-[8px] border border-bahaya bg-paper p-3 text-sm text-bahaya">
          {hasil.pesan}
        </p>
      ) : null}

      <div>
        <span className="label-isian" id="label-paket">
          Jumlah paket
        </span>
        <div className="grid grid-cols-4 gap-2" role="group" aria-labelledby="label-paket">
          {CEPAT.map((nilai) => (
            <button
              key={nilai}
              type="button"
              onClick={() => setPaket(nilai)}
              aria-pressed={jumlah === nilai}
              className={`min-h-[44px] rounded-[8px] border font-[family-name:var(--font-judul)] text-sm font-semibold ${
                jumlah === nilai
                  ? "border-teal bg-teal text-paper"
                  : "border-garis-isian bg-paper text-ink hover:border-teal"
              }`}
            >
              {nilai}
            </button>
          ))}
        </div>
        <input
          id="paket"
          name="paket"
          type="number"
          inputMode="numeric"
          min={1}
          max={2000}
          required
          value={Number.isFinite(paket) ? paket : ""}
          onChange={(event) => setPaket(Number(event.target.value))}
          className="isian mt-2"
          aria-label="Jumlah paket"
          aria-describedby="konversi"
        />
        {hasil.galat?.paket ? (
          <p role="alert" className="galat-isian">
            {hasil.galat.paket}
          </p>
        ) : null}
        <p id="konversi" aria-live="polite" className="mt-2 rounded-[8px] bg-teal/10 px-3 py-2 text-sm font-semibold">
          {jumlah > 0
            ? `${angka(jumlah)} paket = ${rupiah(jumlah * hargaPaket)} = ${angka(jumlah)} jamaah dirangkul`
            : "Isi jumlah paketnya dulu."}
        </p>
      </div>

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
          Dipakai pengurus untuk mengabari donasi Anda. Tidak tampil utuh di halaman mana pun.
        </p>
        {hasil.galat?.whatsapp ? (
          <p role="alert" className="galat-isian">
            {hasil.galat.whatsapp}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-2.5 text-[0.95rem]">
        <input id="anonim" name="anonim" type="checkbox" value="ya" className="mt-0.5 h-5 w-5 shrink-0 accent-[#0A8074]" />
        Sembunyikan nama saya di halaman publik.
      </label>

      <TombolKirim />
    </form>
  );
}
