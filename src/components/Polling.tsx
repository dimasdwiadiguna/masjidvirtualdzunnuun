"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { kirimSuaraPolling, type HasilPolling } from "@/app/(publik)/interaksi/actions";
import { angka, persen } from "@/lib/format";

type Props = {
  pertanyaan: string;
  pilihan: string[];
  hasil: number[];
  sudahMemilih: boolean;
};

function TombolKirim() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="tombol-utama mt-4 w-full" disabled={pending}>
      {pending ? "Mengirim..." : "Kirim jawaban"}
    </button>
  );
}

/**
 * Hasil polling digambar sebagai batang mendatar satu warna.
 *
 * Satu warna, bukan warna per pilihan: warna di sini menyatakan besaran, bukan
 * identitas, dan mewarnai yang tertinggi berbeda berarti mewarnai peringkat.
 * Angka dan persennya ditulis di tiap batang, jadi tidak ada data yang hanya
 * bisa didapat dengan menyentuh batangnya.
 */
export default function Polling({ pertanyaan, pilihan, hasil, sudahMemilih }: Props) {
  const [balasan, aksi] = useActionState<HasilPolling, FormData>(kirimSuaraPolling, {});
  const tampilkanHasil = sudahMemilih || Boolean(balasan.sukses);
  const total = hasil.reduce((jumlah, satu) => jumlah + satu, 0);

  return (
    <div className="kartu p-4">
      <h3 className="text-[1.05rem]">{pertanyaan}</h3>

      {tampilkanHasil ? (
        <>
          <ul className="mt-4 grid gap-3">
            {pilihan.map((teks, indeks) => {
              const jumlah = hasil[indeks] ?? 0;
              const bagian = total > 0 ? persen(jumlah, total) : 0;
              return (
                <li key={teks}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.95rem]">{teks}</span>
                    <span className="shrink-0 text-sm font-semibold text-ink-soft">
                      {angka(jumlah)} · {bagian}%
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-cream ring-1 ring-garis"
                    role="img"
                    aria-label={`${teks}: ${angka(jumlah)} suara, ${bagian} persen`}
                  >
                    <div
                      className="h-full rounded-full bg-teal transition-[width] duration-500"
                      style={{ width: `${bagian}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="petunjuk mt-3">
            {total === 0
              ? "Belum ada yang menjawab. Jadilah yang pertama."
              : `${angka(total)} jawaban masuk. Terima kasih sudah ikut.`}
          </p>
          {balasan.pesan ? (
            <p role="status" className="petunjuk">
              {balasan.pesan}
            </p>
          ) : null}
        </>
      ) : (
        <form action={aksi} className="mt-4">
          {balasan.pesan ? (
            <p role="alert" className="mb-3 rounded-[8px] border border-bahaya bg-paper p-3 text-sm text-bahaya">
              {balasan.pesan}
            </p>
          ) : null}
          <fieldset className="grid gap-2">
            <legend className="sr-only">{pertanyaan}</legend>
            {pilihan.map((teks, indeks) => (
              <label
                key={teks}
                className="flex min-h-[46px] cursor-pointer items-center gap-3 rounded-[8px] border border-garis-isian px-3 py-2 text-[0.95rem] has-[:checked]:border-teal has-[:checked]:bg-teal/10"
              >
                <input type="radio" name="pilihan" value={indeks} required className="h-5 w-5 accent-[#0A8074]" />
                {teks}
              </label>
            ))}
          </fieldset>
          <TombolKirim />
          <p className="petunjuk">Satu jawaban per perangkat. Hasilnya langsung terlihat setelah Anda menjawab.</p>
        </form>
      )}
    </div>
  );
}
