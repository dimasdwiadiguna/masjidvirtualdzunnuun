import type { Metadata } from "next";
import KartuKabar from "@/components/KartuKabar";
import { kabarTerbit } from "@/lib/cache";

export const metadata: Metadata = {
  title: "Laporan Kegiatan",
  description: "Laporan kegiatan yang sudah terlaksana di komunitas Dzun Nuun, Masjid Fathul Ummah.",
};

export const dynamic = "force-dynamic";

export default async function HalamanKabar() {
  const kabar = await kabarTerbit();

  return (
    <div className="kolom-isi py-6">
      <h1>Laporan Kegiatan</h1>
      <p className="mt-2 text-[0.95rem] text-ink-soft">
        Kegiatan yang sudah terlaksana, dan ke mana dananya dipakai.
      </p>

      {kabar.length > 0 ? (
        <div className="mt-5 grid gap-2">
          {kabar.map((item) => (
            <KartuKabar key={item.id} kabar={item} tingkat="h2" />
          ))}
        </div>
      ) : (
        <div className="kartu mt-5 p-4">
          <p className="font-semibold">Belum ada laporan yang terbit.</p>
          <p className="petunjuk">Laporan pertama ditulis begitu kegiatan season berjalan.</p>
        </div>
      )}
    </div>
  );
}
