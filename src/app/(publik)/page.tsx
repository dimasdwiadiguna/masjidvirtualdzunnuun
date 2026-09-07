import Link from "next/link";
import BarisAcara from "@/components/BarisAcara";
import HeroCarousel from "@/components/HeroCarousel";
import KartuKabar from "@/components/KartuKabar";
import ProgressSeason from "@/components/ProgressSeason";
import { db } from "@/lib/data";
import { rupiah } from "@/lib/format";
import { ringkas } from "@/lib/markdown";
import { acaraTerdekat, fotoHero } from "@/lib/tampilan";

export const dynamic = "force-dynamic";

export default async function Beranda() {
  const data = await db();
  const [season, pengaturan] = await Promise.all([data.getActiveSeason(), data.getSettings()]);
  const [progress, kabar, acara, foto] = await Promise.all([
    season ? data.seasonProgress(season.id) : Promise.resolve(null),
    data.listUpdates({ hanyaTerbit: true, limit: 3 }),
    acaraTerdekat(3),
    fotoHero(),
  ]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-teal-deep">
        <HeroCarousel foto={foto} />
        <div className="selubung-hero absolute inset-0" aria-hidden="true" />
        <div className="di-gelap relative flex min-h-[260px] flex-col justify-end sm:min-h-[320px]">
          <div className="kolom-lebar py-6">
            <p className="teks-hero text-sm font-semibold text-gold">Teman Beriman dan Bertumbuh</p>
            <h1 className="teks-hero mt-1.5 max-w-[18ch]">Masjid jadi tempat anak muda betah singgah</h1>
          </div>
        </div>
      </section>

      <div className="kolom-lebar -mt-5 relative z-10">
        {season && progress ? (
          <div className="kartu p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-ink">Patungan berjalan</p>
            <div className="mt-2">
              <ProgressSeason season={season} progress={progress} />
            </div>
            <div className="mt-4 flex gap-2">
              <Link href="/donasi" className="tombol-utama flex-1">
                Ikut patungan
              </Link>
              <Link href={`/season/${season.slug}`} className="tombol-kedua">
                Rincian
              </Link>
            </div>
            <p className="petunjuk">1 paket {rupiah(season.package_price)} untuk merangkul satu jamaah.</p>
          </div>
        ) : (
          <div className="kartu p-4">
            <p className="font-semibold">Belum ada patungan yang berjalan.</p>
            <p className="petunjuk">Kabar season berikutnya kami tulis di halaman Kabar Aksi.</p>
          </div>
        )}
      </div>

      <section className="kolom-lebar mt-8">
        <div className="judul-bagian">
          <h2>Kabar Aksi</h2>
          <Link href="/kabar" className="text-sm font-semibold text-teal-ink underline underline-offset-4">
            Semua
          </Link>
        </div>
        {kabar.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {kabar.map((item) => (
              <KartuKabar key={item.id} kabar={item} />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">Belum ada kabar yang terbit.</p>
        )}
      </section>

      <section className="kolom-lebar mt-8">
        <div className="judul-bagian">
          <h2>Acara terdekat</h2>
          <Link href="/acara" className="text-sm font-semibold text-teal-ink underline underline-offset-4">
            Semua
          </Link>
        </div>
        {acara.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {acara.map((item) => (
              <BarisAcara key={item.acara.id} acara={item.acara} sisaKuota={item.sisaKuota} />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">Belum ada acara yang dijadwalkan.</p>
        )}
      </section>

      <section className="kolom-lebar mt-8">
        <div className="judul-bagian">
          <h2>Tentang Dzun Nuun</h2>
        </div>
        <p className="mt-3 text-[0.98rem]">{ringkas(pengaturan.about_markdown, 150)}</p>
        <Link href="/tentang" className="tombol-kedua mt-3">
          Kenali komunitasnya
        </Link>
      </section>
    </>
  );
}
