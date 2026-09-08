"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { kirimJawabanKuis, type HasilKuis } from "@/app/(publik)/interaksi/actions";
import type { SoalTampil } from "@/lib/kuis";

type Props = {
  soal: SoalTampil[];
  benih: number;
  waktu: number;
  tanda: string;
};

function TombolKirim() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="tombol-utama mt-4 w-full" disabled={pending}>
      {pending ? "Memeriksa..." : "Kirim jawaban"}
    </button>
  );
}

/**
 * Kuis tujuh soal.
 *
 * Kunci jawaban tidak pernah sampai ke komponen ini. Yang dibawa hanya benih
 * dan tanda tangannya; server menyusun ulang soal yang sama saat menilai.
 *
 * Nama dan nomor WhatsApp baru diminta setelah semua jawaban benar, supaya
 * yang sekadar iseng menjawab tidak perlu menyerahkan data apa pun.
 */
export default function Kuis({ soal, benih, waktu, tanda }: Props) {
  const [hasil, aksi] = useActionState<HasilKuis, FormData>(kirimJawabanKuis, {});
  const [jawaban, setJawaban] = useState<Record<number, number>>({});
  const dialog = useRef<HTMLDialogElement>(null);

  const menang = hasil.status === "menang";

  useEffect(() => {
    const elemen = dialog.current;
    if (!elemen) return;
    if (menang && !elemen.open) elemen.showModal();
  }, [menang]);

  const semuaTerjawab = soal.every((_, indeks) => jawaban[indeks] !== undefined);
  const perluIdentitas = hasil.benarBerapa === soal.length && !menang && hasil.status !== "kuota-habis";

  return (
    <div className="kartu p-4">
      <form action={aksi}>
        <input type="hidden" name="benih" value={benih} />
        <input type="hidden" name="waktu" value={waktu} />
        <input type="hidden" name="tanda" value={tanda} />

        {hasil.pesan ? (
          <p role="alert" className="mb-3 rounded-[8px] border border-bahaya bg-paper p-3 text-sm text-bahaya">
            {hasil.pesan}
          </p>
        ) : null}

        {hasil.status === "belum-benar" ? (
          <p role="status" className="mb-3 rounded-[8px] border border-gold-ink bg-paper p-3 text-sm">
            Benar {hasil.benarBerapa} dari {soal.length}. Hadiah hanya untuk yang benar semua. Periksa lagi jawaban
            Anda, lalu kirim ulang.
          </p>
        ) : null}

        {hasil.status === "kuota-habis" ? (
          <p role="status" className="mb-3 rounded-[8px] border border-gold-ink bg-paper p-3 text-sm">
            Jawaban Anda benar semua, tetapi kuota pemenang hari ini sudah penuh. Coba lagi besok, soalnya diacak
            ulang.
          </p>
        ) : null}

        {hasil.status === "sudah-menang" ? (
          <p role="status" className="mb-3 rounded-[8px] border border-gold-ink bg-paper p-3 text-sm">
            Nomor ini sudah menang hari ini. Satu kemenangan per hari, supaya jamaah lain kebagian.
          </p>
        ) : null}

        <ol className="grid gap-5">
          {soal.map((satu, indeks) => (
            <li key={satu.pertanyaan}>
              <fieldset>
                <legend className="font-semibold">
                  {indeks + 1}. {satu.pertanyaan}
                </legend>
                <div className="mt-2 grid gap-2">
                  {satu.pilihan.map((teks, nomor) => (
                    <label
                      key={teks}
                      className="flex min-h-[46px] cursor-pointer items-center gap-3 rounded-[8px] border border-garis-isian px-3 py-2 text-[0.95rem] has-[:checked]:border-teal has-[:checked]:bg-teal/10"
                    >
                      <input
                        type="radio"
                        name={`jawaban-${indeks}`}
                        value={nomor}
                        required
                        checked={jawaban[indeks] === nomor}
                        onChange={() => setJawaban((kini) => ({ ...kini, [indeks]: nomor }))}
                        className="h-5 w-5 accent-[#0A8074]"
                      />
                      {teks}
                    </label>
                  ))}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>

        {perluIdentitas ? (
          <div className="mt-5 grid gap-3 rounded-[8px] bg-cream p-3">
            <p className="text-[0.95rem] font-semibold">Semua jawaban benar. Isi data untuk mengambil hadiahnya.</p>
            <div>
              <label className="label-isian" htmlFor="kuis-nama">
                Nama
              </label>
              <input id="kuis-nama" name="nama" type="text" required maxLength={60} className="isian" />
            </div>
            <div>
              <label className="label-isian" htmlFor="kuis-wa">
                Nomor WhatsApp
              </label>
              <input
                id="kuis-wa"
                name="whatsapp"
                type="tel"
                required
                inputMode="numeric"
                className="isian"
                placeholder="081234567890"
              />
              <p className="petunjuk">Dipakai pengurus untuk menghubungi Anda soal hadiahnya.</p>
            </div>
          </div>
        ) : null}

        <TombolKirim />
        {!semuaTerjawab ? <p className="petunjuk">Jawab semua {soal.length} soal dulu.</p> : null}
      </form>

      <dialog
        ref={dialog}
        onClose={() => undefined}
        className="w-[min(92vw,420px)] rounded-[12px] border border-garis bg-paper p-0 text-ink backdrop:bg-ink/50"
      >
        <div className="grid gap-3 p-5 text-center">
          <p className="text-4xl" aria-hidden="true">
            🎉
          </p>
          <h2 className="text-[1.25rem]">Selamat, jawaban Anda benar semua</h2>
          <p className="text-[0.95rem]">
            Hadiahnya sudah kami catat atas nama Anda. Hubungi panitia lewat WhatsApp untuk mengambilnya, sebutkan
            bahwa Anda menang kuis hari ini.
          </p>
          <button type="button" onClick={() => dialog.current?.close()} className="tombol-utama w-full">
            Tutup
          </button>
        </div>
      </dialog>
    </div>
  );
}
