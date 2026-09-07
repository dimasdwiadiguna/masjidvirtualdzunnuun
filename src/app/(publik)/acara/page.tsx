import type { Metadata } from "next";
import TampilanAcara from "@/components/TampilanAcara";
import { semuaAcaraTerbit } from "@/lib/tampilan";

export const metadata: Metadata = {
  title: "Acara",
  description: "Jadwal kajian dan kegiatan komunitas Dzun Nuun di Masjid Fathul Ummah.",
};

export const dynamic = "force-dynamic";

export default async function HalamanAcara() {
  const daftar = await semuaAcaraTerbit();
  return (
    <div className="kolom-isi py-6">
      <h1>Acara</h1>
      <p className="mt-2 text-[0.95rem] text-ink-soft">Kegiatan yang terbuka untuk umum.</p>
      <TampilanAcara daftar={daftar} />
    </div>
  );
}
