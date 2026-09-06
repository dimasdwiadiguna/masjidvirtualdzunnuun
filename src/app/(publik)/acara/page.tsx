import type { Metadata } from "next";
import TampilanAcara from "@/components/TampilanAcara";
import { semuaAcaraTerbit } from "@/lib/tampilan";

export const metadata: Metadata = {
  title: "Acara",
  description: "Jadwal kajian, kegiatan, dan acara komunitas Dzun Nuun di Masjid Fathul Ummah.",
};

export const dynamic = "force-dynamic";

export default async function HalamanAcara() {
  const daftar = await semuaAcaraTerbit();
  return (
    <div className="kolom-isi py-8">
      <h1>Acara</h1>
      <p className="mt-2 max-w-[46ch] text-ink-soft">
        Semua kegiatan yang terbuka untuk umum. Yang gratis bisa langsung didaftar, yang berbayar dibayar lewat QRIS.
      </p>
      <TampilanAcara daftar={daftar} />
    </div>
  );
}
