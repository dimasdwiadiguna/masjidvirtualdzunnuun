import type { Metadata } from "next";
import KartuKabar from "@/components/KartuKabar";
import { db } from "@/lib/data";

export const metadata: Metadata = {
  title: "Kabar Aksi",
  description: "Catatan kegiatan komunitas Dzun Nuun di Masjid Fathul Ummah.",
};

export const dynamic = "force-dynamic";

export default async function HalamanKabar() {
  const kabar = await (await db()).listUpdates({ hanyaTerbit: true });

  return (
    <div className="kolom-isi py-6">
      <h1>Kabar Aksi</h1>
      <p className="mt-2 text-[0.95rem] text-ink-soft">
        Catatan dari lapangan: apa yang dikerjakan dan ke mana dananya dipakai.
      </p>

      {kabar.length > 0 ? (
        <div className="mt-5 grid gap-2">
          {kabar.map((item) => (
            <KartuKabar key={item.id} kabar={item} tingkat="h2" />
          ))}
        </div>
      ) : (
        <div className="kartu mt-5 p-4">
          <p className="font-semibold">Belum ada kabar yang terbit.</p>
          <p className="petunjuk">Catatan pertama ditulis begitu kegiatan season berjalan.</p>
        </div>
      )}
    </div>
  );
}
