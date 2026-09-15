"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  aksi: (formData: FormData) => void | Promise<void>;
  tersembunyi: Record<string, string>;
  labelPemicu: string;
  judul: string;
  penjelasan: string;
  labelKonfirmasi: string;
  pakaiCatatan?: boolean;
  nadaBahaya?: boolean;
};

function TombolKonfirmasi({ label, nadaBahaya }: { label: string; nadaBahaya?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`tombol-utama w-full ${nadaBahaya ? "bg-bahaya" : ""}`}
    >
      {pending ? "Menyimpan..." : label}
    </button>
  );
}

/**
 * Verifikasi donasi tidak boleh jadi satu tap yang langsung mengeksekusi, jadi
 * tombolnya membuka dialog konfirmasi lebih dulu. Dialog memakai elemen dialog
 * bawaan peramban supaya bisa ditutup dengan Escape.
 *
 * Setelah aksinya selesai, halaman dimuat ulang penuh. Sebelumnya dialog ini
 * hanya mengandalkan revalidatePath di dalam server action, dan saat diukur
 * daftarnya cuma ikut segar 2 dari 6 kali untuk tombol Hapus dan 3 dari 6 kali
 * untuk tombol Tolak: datanya sudah berubah di database, tetapi baris lamanya
 * masih terpampang berikut dialognya. Untuk aksi yang menghapus, itu bacaan
 * yang menyesatkan. Alasannya sama dengan D-21: perpindahan penuh selalu
 * sampai, penyegaran router tidak selalu.
 */
export default function KonfirmasiAksi({
  aksi,
  tersembunyi,
  labelPemicu,
  judul,
  penjelasan,
  labelKonfirmasi,
  pakaiCatatan = false,
  nadaBahaya = false,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [terbuka, setTerbuka] = useState(false);

  async function jalankan(formData: FormData): Promise<void> {
    await aksi(formData);
    // Sengaja di luar try/finally: kalau aksinya mengalihkan halaman sendiri,
    // misalnya sesi pengurus sudah habis, pengalihan itu yang harus menang.
    window.location.reload();
  }

  useEffect(() => {
    const elemen = dialog.current;
    if (!elemen) return;
    if (terbuka && !elemen.open) elemen.showModal();
    if (!terbuka && elemen.open) elemen.close();
  }, [terbuka]);

  return (
    <>
      <button
        type="button"
        onClick={() => setTerbuka(true)}
        className={`tombol-kecil ${nadaBahaya ? "border-bahaya text-bahaya" : "border-ink"}`}
      >
        {labelPemicu}
      </button>

      <dialog
        ref={dialog}
        onClose={() => setTerbuka(false)}
        className="w-[min(92vw,420px)] rounded-[12px] border border-garis bg-paper p-0 text-ink backdrop:bg-ink/50"
      >
        <form action={jalankan} className="grid gap-3 p-4">
          {Object.entries(tersembunyi).map(([nama, nilai]) => (
            <input key={nama} type="hidden" name={nama} value={nilai} />
          ))}
          <h2 className="text-[1.15rem]">{judul}</h2>
          <p className="text-[0.95rem]">{penjelasan}</p>
          {pakaiCatatan ? (
            <div>
              <label className="label-isian" htmlFor={`catatan-${tersembunyi.id ?? "aksi"}`}>
                Catatan pengurus (boleh dikosongkan)
              </label>
              <textarea
                id={`catatan-${tersembunyi.id ?? "aksi"}`}
                name="catatan"
                rows={2}
                className="isian"
                placeholder="Contoh: transfer masuk 12.40 lewat QRIS"
              />
            </div>
          ) : null}
          <TombolKonfirmasi label={labelKonfirmasi} nadaBahaya={nadaBahaya} />
          <button type="button" onClick={() => setTerbuka(false)} className="tombol-kecil w-full">
            Batal
          </button>
        </form>
      </dialog>
    </>
  );
}
