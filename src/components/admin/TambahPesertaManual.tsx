"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { tambahPesertaManual, type HasilTambah } from "@/app/admin/scan/actions";
import { useTahanPengosongan } from "@/lib/form";
import { rupiah, tanggalPendek } from "@/lib/format";

export type AcaraPilihan = {
  id: string;
  judul: string;
  mulai: string;
  lewat: boolean;
  berbayar: boolean;
  harga: number;
};

function TombolCatat() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="tombol-utama" disabled={pending}>
      {pending ? "Mencatat..." : "Catat hadir"}
    </button>
  );
}

/**
 * Menambah peserta yang datang tanpa mendaftar lebih dulu, langsung dari meja
 * check-in.
 *
 * Satu tombol menyelesaikan dua hal sekaligus: tiketnya dibuat dan langsung
 * ditandai hadir. Panitia tidak perlu pindah ke menu Pendaftar lalu kembali ke
 * sini, karena orangnya sedang menunggu di depan meja.
 *
 * Setelah berhasil, nama, nomor, dan jumlah dikosongkan sedangkan acaranya
 * tetap, karena orang berikutnya di antrean datang ke acara yang sama.
 */
export default function TambahPesertaManual({ daftarAcara }: { daftarAcara: AcaraPilihan[] }) {
  const [hasil, aksi] = useActionState<HasilTambah, FormData>(tambahPesertaManual, {});
  const form = useRef<HTMLFormElement>(null);
  const nama = useRef<HTMLInputElement>(null);
  const whatsapp = useRef<HTMLInputElement>(null);
  const jumlah = useRef<HTMLInputElement>(null);
  const [dipilih, setDipilih] = useState(daftarAcara[0]?.id ?? "");

  // Kiriman yang ditolak tidak boleh menghapus isian yang sudah diketik.
  useTahanPengosongan(form);

  useEffect(() => {
    if (!hasil.sukses) return;
    if (nama.current) nama.current.value = "";
    if (whatsapp.current) whatsapp.current.value = "";
    if (jumlah.current) jumlah.current.value = "1";
    nama.current?.focus();
  }, [hasil]);

  if (daftarAcara.length === 0) {
    return (
      <p className="mt-3 rounded-[4px] border border-garis bg-paper p-3">
        Belum ada acara yang bisa dipilih. Buat acaranya dulu di menu Acara.
      </p>
    );
  }

  const acaraDipilih = daftarAcara.find((acara) => acara.id === dipilih);
  const akanDatang = daftarAcara.filter((acara) => !acara.lewat);
  const sudahLewat = daftarAcara.filter((acara) => acara.lewat);

  return (
    <>
      <form ref={form} action={aksi} className="mt-3 grid gap-4">
        {hasil.pesan ? (
          <p role="alert" className="rounded-[4px] border border-bahaya bg-paper p-3 text-bahaya">
            {hasil.pesan}
          </p>
        ) : null}

        <div>
          <label className="label-isian" htmlFor="acara-manual">
            Acara
          </label>
          <select
            id="acara-manual"
            name="acara"
            className="isian"
            value={dipilih}
            onChange={(peristiwa) => setDipilih(peristiwa.target.value)}
          >
            {akanDatang.length > 0 ? (
              <optgroup label="Terdekat dan sedang berjalan">
                {akanDatang.map((acara) => (
                  <option key={acara.id} value={acara.id}>
                    {acara.judul} · {tanggalPendek(acara.mulai)}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {sudahLewat.length > 0 ? (
              <optgroup label="Sudah lewat">
                {sudahLewat.map((acara) => (
                  <option key={acara.id} value={acara.id}>
                    {acara.judul} · {tanggalPendek(acara.mulai)}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
        </div>

        <div>
          <label className="label-isian" htmlFor="nama-manual">
            Nama peserta
          </label>
          <input
            ref={nama}
            id="nama-manual"
            name="nama"
            type="text"
            maxLength={60}
            autoComplete="off"
            className="isian"
            placeholder="Nama yang disebutkan"
          />
        </div>

        <div>
          <label className="label-isian" htmlFor="wa-manual">
            Nomor WhatsApp (boleh dikosongkan)
          </label>
          <input
            ref={whatsapp}
            id="wa-manual"
            name="whatsapp"
            type="tel"
            inputMode="numeric"
            autoComplete="off"
            className="isian"
            placeholder="081234567890"
            aria-describedby="bantuan-wa-manual"
          />
          <p id="bantuan-wa-manual" className="petunjuk">
            Kalau nomornya diisi, kehadiran ini ikut menambah stempel di Jamaah Loyal. Tanpa nomor, kehadirannya tetap
            tercatat di daftar pendaftar.
          </p>
        </div>

        <div>
          <label className="label-isian" htmlFor="jumlah-manual">
            Datang berapa orang
          </label>
          <input
            ref={jumlah}
            id="jumlah-manual"
            name="jumlah"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            defaultValue={1}
            className="isian max-w-[140px]"
            aria-describedby="bantuan-jumlah-manual"
          />
          <p id="bantuan-jumlah-manual" className="petunjuk">
            Isi lebih dari satu hanya kalau serombongan datang bersama dan dicatat dalam satu nama.
          </p>
        </div>

        {acaraDipilih?.berbayar ? (
          <p className="rounded-[4px] border border-garis bg-paper p-3 text-[0.95rem]">
            Acara ini berbayar {rupiah(acaraDipilih.harga)} per orang. Tiket yang dicatat di sini langsung dianggap
            lunas dibayar di tempat, jadi pastikan uangnya memang sudah diterima.
          </p>
        ) : null}

        <div>
          <TombolCatat />
        </div>
      </form>

      {hasil.sukses ? (
        <div role="status" aria-live="polite" className="mt-4 rounded-[12px] border-2 border-sukses bg-paper p-4">
          <p className="font-[family-name:var(--font-judul)] text-[clamp(1.1rem,5vw,1.4rem)] font-bold leading-tight">
            {hasil.nama} tercatat hadir
          </p>
          <p className="text-ink-soft">{hasil.acara}</p>
          <p className="mt-2 kode-besar">{hasil.kode}</p>
          <p className="mt-2 text-[0.95rem]">
            Tiketnya sudah ada di menu Pendaftar dengan status sudah hadir, jadi tidak perlu dipindai lagi.
          </p>
          {hasil.lewatKuota ? (
            <p className="mt-2 text-[0.95rem] text-gold-ink">
              Kuota acara ini sekarang penuh atau terlampaui. Pendaftaran online untuk acara ini ikut tertutup.
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
