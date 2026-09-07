import type { Metadata } from "next";
import KartuKabar from "@/components/KartuKabar";
import { db } from "@/lib/data";

export const metadata: Metadata = {
  title: "Kabar Aksi",
  description: "Catatan harian kegiatan komunitas Dzun Nuun di Masjid Fathul Ummah.",
};

export const dynamic = "force-dynamic";

export default async function HalamanKabar() {
  const kabar = await (await db()).listUpdates({ hanyaTerbit: true });

  return (
    <div className="kolom-isi py-8">
      <h1>Kabar Aksi</h1>
      <p className="mt-2 max-w-[46ch] text-ink-soft">
        Catatan apa adanya dari lapangan: apa yang dikerjakan, siapa yang datang, dan ke mana dananya dipakai.
      </p>

      {kabar.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {kabar.map((item) => (
            <KartuKabar key={item.id} kabar={item} tingkat="h2" />
          ))}
        </div>
      ) : (
        <div className="kartu mt-6 p-4">
          <p className="font-semibold">Belum ada kabar yang terbit.</p>
          <p className="mt-1 text-ink-soft">
            Catatan pertama ditulis begitu kegiatan season berjalan. Kalau Anda pengurus, tulis lewat /admin/kabar.
          </p>
        </div>
      )}
    </div>
  );
}
