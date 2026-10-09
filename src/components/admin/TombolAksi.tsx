"use client";

import { useFormStatus } from "react-dom";

type Props = {
  aksi: (formData: FormData) => void | Promise<void>;
  /** Nilai yang ikut terkirim, misalnya nomor WhatsApp barisnya. */
  tersembunyi?: Record<string, string>;
  label: string;
  labelSibuk?: string;
};

function Tombol({ label, labelSibuk }: { label: string; labelSibuk: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="tombol-kecil" disabled={pending}>
      {pending ? labelSibuk : label}
    </button>
  );
}

/**
 * Tombol aksi pengurus yang tidak perlu dialog konfirmasi.
 *
 * Alasannya ada sama dengan D-94: `revalidatePath` di dalam server action
 * tidak selalu menyegarkan layar, dan untuk aksi yang menerbitkan kode,
 * layar yang tidak berubah terbaca sebagai aksi yang gagal. Diukur pada
 * tombol terbitkan kode massal: datanya selalu tertulis, layarnya tidak ikut
 * segar. Jadi halaman dimuat ulang penuh setelah aksinya selesai, sama seperti
 * dialog konfirmasi.
 */
export default function TombolAksi({ aksi, tersembunyi = {}, label, labelSibuk = "Menyimpan..." }: Props) {
  async function jalankan(formData: FormData): Promise<void> {
    await aksi(formData);
    // Sengaja di luar try/finally: kalau aksinya mengalihkan halaman sendiri,
    // misalnya sesi pengurus sudah habis, pengalihan itu yang harus menang.
    window.location.reload();
  }

  return (
    <form action={jalankan}>
      {Object.entries(tersembunyi).map(([nama, nilai]) => (
        <input key={nama} type="hidden" name={nama} value={nilai} />
      ))}
      <Tombol label={label} labelSibuk={labelSibuk} />
    </form>
  );
}
