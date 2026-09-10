"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { kirimDonasi, type HasilFormDonasi } from "@/app/(publik)/donasi/actions";
import { IkonPaket } from "@/components/Ikon";
import { BATAS_PAKET } from "@/lib/donasi";
import { useTahanPengosongan } from "@/lib/form";
import { angka, rupiah } from "@/lib/format";

/**
 * Empat pilihan, tiga di antaranya jumlah tetap.
 *
 * Ikonnya menggambarkan datanya sendiri: sebanyak paket, sebanyak sosok
 * jamaah. Jadi jumlah paket terbaca sebelum angkanya dibaca, dan kalimat kunci
 * "1 paket = 1 jamaah" ikut terulang tanpa perlu ditulis lagi.
 */
const PILIHAN = [
  { nilai: "1", judul: "1 paket", sosok: 1 },
  { nilai: "5", judul: "5 paket", sosok: 5 },
  { nilai: "10", judul: "10 paket", sosok: 10 },
  { nilai: "bebas", judul: "Berapapun", sosok: 3 },
] as const;

type NilaiPilihan = (typeof PILIHAN)[number]["nilai"];

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
  const [pilihan, setPilihan] = useState<NilaiPilihan>("1");
  const [bebas, setBebas] = useState("");
  const kotakBebas = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);

  // Tanpa ini, kiriman yang ditolak mengosongkan formulir: radio di dalam kartu
  // yang tersorot ikut terhapus, jadi titik pilihannya tidak lagi sesuai dengan
  // kartu yang terlihat terpilih.
  useTahanPengosongan(form);

  const memilihBebas = pilihan === "bebas";
  const jumlah = Number(memilihBebas ? bebas : pilihan);
  const terbaca = Number.isInteger(jumlah) && jumlah > 0 ? jumlah : 0;

  // Fokus pindah ke kotak angka begitu "Berapapun" dipilih. Ini akibat langsung
  // dari tap orangnya, bukan fokus yang direbut sendiri oleh halaman.
  useEffect(() => {
    if (memilihBebas) kotakBebas.current?.focus();
  }, [memilihBebas]);

  return (
    <form ref={form} action={aksi} className="mt-5 grid gap-4" noValidate>
      {hasil.pesan ? (
        <p role="alert" className="rounded-[8px] border border-bahaya bg-paper p-3 text-sm text-bahaya">
          {hasil.pesan}
        </p>
      ) : null}

      <div>
        <fieldset>
          <legend className="label-isian">Berapa paket yang ingin Anda ambil?</legend>
          <div className="grid grid-cols-2 gap-2">
            {PILIHAN.map((satu) => {
              const terpilih = pilihan === satu.nilai;
              const itemBebas = satu.nilai === "bebas";
              return (
                <label
                  key={satu.nilai}
                  className={`flex cursor-pointer flex-col rounded-[8px] border p-3 ${
                    terpilih ? "border-teal bg-teal/10 ring-1 ring-teal" : "border-garis-isian bg-paper"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <IkonPaket
                      jumlah={satu.sosok}
                      tambah={itemBebas}
                      className={`h-9 w-auto ${terpilih ? "text-teal" : "text-ink-soft"}`}
                    />
                    <input
                      type="radio"
                      name="pilihan"
                      value={satu.nilai}
                      checked={terpilih}
                      onChange={() => setPilihan(satu.nilai)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[#0A8074]"
                    />
                  </span>
                  <span className="mt-2 font-[family-name:var(--font-judul)] text-[0.95rem] font-semibold">
                    {satu.judul}
                  </span>
                  <span className="text-sm text-ink-soft">
                    {itemBebas ? `Kelipatan ${rupiah(hargaPaket)}` : rupiah(satu.sosok * hargaPaket)}
                  </span>
                  <span className="mt-1 text-[0.78rem] font-semibold text-teal-ink">
                    {itemBebas ? "Anda yang tentukan" : `${angka(satu.sosok)} jamaah dirangkul`}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Hanya satu elemen bernama "paket" yang boleh ada dalam satu waktu.
            FormData.get mengambil yang pertama, jadi dua elemen bernama sama
            akan diam-diam mengirim angka yang salah. */}
        {memilihBebas ? (
          <div className="mt-3">
            <label className="label-isian" htmlFor="paket">
              Jumlah paket
            </label>
            {/* Kotak teks yang disaring jadi angka, bukan type="number".
                Di kotak angka, mengetik "1.5" diterima peramban lalu ditulis
                ulang jadi "15" oleh penyaring ini, dan angka yang berubah
                sendiri di depan mata orang yang sedang mengetik itu bentuk
                kegagalan tersendiri. Di kotak teks, titiknya tidak pernah
                sempat muncul. Papan ketik angka tetap didapat dari inputMode. */}
            <input
              ref={kotakBebas}
              id="paket"
              name="paket"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={bebas}
              onChange={(event) => setBebas(event.target.value.replace(/\D/g, ""))}
              className="isian"
              placeholder="Contoh: 25"
              aria-invalid={hasil.galat?.paket ? true : undefined}
              aria-describedby={hasil.galat?.paket ? "galat-paket konversi" : "konversi"}
            />
            <p className="petunjuk">Paling banyak {angka(BATAS_PAKET)} paket sekali kirim.</p>
          </div>
        ) : (
          <input type="hidden" name="paket" value={pilihan} />
        )}

        {hasil.galat?.paket ? (
          <p id="galat-paket" role="alert" className="galat-isian">
            {hasil.galat.paket}
          </p>
        ) : null}

        <p id="konversi" aria-live="polite" className="mt-2 rounded-[8px] bg-teal/10 px-3 py-2 text-sm font-semibold">
          {terbaca > 0
            ? `${angka(terbaca)} paket = ${rupiah(terbaca * hargaPaket)} = ${angka(terbaca)} jamaah dirangkul`
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
