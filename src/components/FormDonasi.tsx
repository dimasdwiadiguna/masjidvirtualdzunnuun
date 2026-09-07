"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { kirimDonasi, type HasilFormDonasi } from "@/app/(publik)/donasi/actions";
import { angka, rupiah } from "@/lib/format";

const CEPAT = [1, 5, 10, 33];

function TombolKirim() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="tombol-utama w-full" disabled={pending}>
      {pending ? "Menyiapkan nominal Anda..." : "Lanjut ke cara transfer"}
    </button>
  );
}

export default function FormDonasi({ hargaPaket }: { hargaPaket: number }) {
  const [hasil, aksi] = useActionState<HasilFormDonasi, FormData>(kirimDonasi, {});
  const [paket, setPaket] = useState(1);

  // Perpindahan ke halaman kode dilakukan penuh oleh peramban. Pengalihan dari
  // dalam server action pernah tidak diikuti router, dan donatur melihat
  // formulir yang seolah tidak bereaksi padahal donasinya sudah tercatat.
  useEffect(() => {
    if (hasil.kode) window.location.assign(`/donasi/${hasil.kode}`);
  }, [hasil]);

  const jumlah = Number.isFinite(paket) && paket > 0 ? Math.floor(paket) : 0;

  return (
    <form action={aksi} className="mt-6 grid gap-5" noValidate>
      {hasil.pesan ? (
        <p role="alert" className="rounded-[4px] border-2 border-bahaya bg-paper p-3 text-bahaya">
          {hasil.pesan}
        </p>
      ) : null}

      <div>
        <label className="label-isian" htmlFor="nama">
          Nama Anda
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
          aria-describedby={hasil.galat?.nama ? "galat-nama" : undefined}
        />
        {hasil.galat?.nama ? (
          <p id="galat-nama" role="alert" className="mt-1 text-sm font-semibold text-bahaya">
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
          aria-describedby={`bantuan-wa${hasil.galat?.whatsapp ? " galat-wa" : ""}`}
        />
        <p id="bantuan-wa" className="mt-1 text-sm text-ink-soft">
          Dipakai pengurus untuk mengabari kalau donasi Anda sudah masuk. Tidak ditampilkan utuh di halaman mana pun.
        </p>
        {hasil.galat?.whatsapp ? (
          <p id="galat-wa" role="alert" className="mt-1 text-sm font-semibold text-bahaya">
            {hasil.galat.whatsapp}
          </p>
        ) : null}
      </div>

      <div>
        <span className="label-isian" id="label-paket">
          Jumlah paket
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-labelledby="label-paket">
          {CEPAT.map((nilai) => (
            <button
              key={nilai}
              type="button"
              onClick={() => setPaket(nilai)}
              aria-pressed={jumlah === nilai}
              className={`min-h-[48px] rounded-[4px] border-2 px-3 font-[family-name:var(--font-judul)] font-semibold ${
                jumlah === nilai
                  ? "border-ink bg-teal text-paper"
                  : "border-ink-soft bg-paper text-ink hover:bg-teal/10"
              }`}
            >
              {nilai} paket
            </button>
          ))}
        </div>
        <label className="label-isian mt-3" htmlFor="paket">
          Atau isi sendiri
        </label>
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
          className="isian"
          aria-describedby={`konversi${hasil.galat?.paket ? " galat-paket" : ""}`}
        />
        {hasil.galat?.paket ? (
          <p id="galat-paket" role="alert" className="mt-1 text-sm font-semibold text-bahaya">
            {hasil.galat.paket}
          </p>
        ) : null}
        <p
          id="konversi"
          aria-live="polite"
          className="mt-2 rounded-[4px] border-l-4 border-teal bg-paper p-3 font-semibold"
        >
          {jumlah > 0
            ? `${angka(jumlah)} paket = ${rupiah(jumlah * hargaPaket)} = ${angka(jumlah)} jamaah dirangkul`
            : "Isi jumlah paketnya dulu, nanti nominalnya muncul di sini."}
        </p>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="anonim"
          name="anonim"
          type="checkbox"
          value="ya"
          className="mt-1 h-6 w-6 shrink-0 accent-[#0A8074]"
        />
        <label htmlFor="anonim" className="text-[0.98rem]">
          Sembunyikan nama saya. Pengurus tetap melihatnya untuk mencocokkan transfer, tapi nama Anda tidak dipakai di
          halaman mana pun.
        </label>
      </div>

      <TombolKirim />
      <p className="text-sm text-ink-soft">
        Setelah ini Anda akan dibawa ke halaman berisi nominal transfer, QRIS, dan tombol konfirmasi WhatsApp.
      </p>
    </form>
  );
}
