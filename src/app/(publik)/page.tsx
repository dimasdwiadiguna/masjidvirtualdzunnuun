import Link from "next/link";
import CarouselAcara from "@/components/CarouselAcara";
import CarouselPengumuman from "@/components/CarouselPengumuman";
import HeroCarousel from "@/components/HeroCarousel";
import KartuKabar from "@/components/KartuKabar";
import ProgressSeason from "@/components/ProgressSeason";
import { kabarTerbit, pengaturanPublik, pengumumanAktif, progressSeason, seasonAktif } from "@/lib/cache";
import { rupiah } from "@/lib/format";
import { ringkas } from "@/lib/markdown";
import { acaraTerdekat, fotoHero } from "@/lib/tampilan";

export const dynamic = "force-dynamic";

export default async function Beranda() {
  const [season, pengaturan] = await Promise.all([seasonAktif(), pengaturanPublik()]);
  const [progress, kabar, acara, foto, pengumuman] = await Promise.all([
    season ? progressSeason(season.id) : Promise.resolve(null),
    kabarTerbit(3),
    acaraTerdekat(5),
    fotoHero(),
    pengumumanAktif(),
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
            <ProgressSeason season={season} progress={progress} label="Patungan berjalan" />
            <Link href="/donasi" className="tombol-utama mt-4 w-full">
              Ikut patungan
            </Link>
            <p className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-ink-soft">1 paket {rupiah(season.package_price)}, satu jamaah dirangkul.</span>
              <Link href={`/season/${season.slug}`} className="font-semibold text-teal-ink underline underline-offset-4">
                Rincian season
              </Link>
            </p>
          </div>
        ) : (
          <div className="kartu p-4">
            <p className="font-semibold">Belum ada patungan yang berjalan.</p>
            <p className="petunjuk">Kegiatan season berikutnya kami tulis di halaman Laporan Kegiatan.</p>
          </div>
        )}
      </div>

      {pengumuman.length > 0 ? (
        <div className="kolom-lebar mt-8 overflow-hidden">
          <CarouselPengumuman daftar={pengumuman} />
        </div>
      ) : null}

      <section className="kolom-lebar mt-8">
        <div className="judul-bagian">
          <h2>Laporan Kegiatan</h2>
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
          <p className="mt-2 text-sm text-ink-soft">Belum ada laporan yang terbit.</p>
        )}
      </section>

      <section className="kolom-lebar mt-8 overflow-hidden">
        <div className="judul-bagian">
          <h2>Acara terdekat</h2>
          <Link href="/acara" className="text-sm font-semibold text-teal-ink underline underline-offset-4">
            Semua
          </Link>
        </div>
        {acara.length > 0 ? (
          <div className="mt-3">
            <CarouselAcara daftar={acara} />
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
