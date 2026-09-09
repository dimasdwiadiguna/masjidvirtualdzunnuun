declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

import Link from "next/link";
import CarouselAcara from "@/components/CarouselAcara";
import BagianInteraksi from "@/components/BagianInteraksi";
import CarouselPengumuman from "@/components/CarouselPengumuman";
import SorotanSosmed from "@/components/SorotanSosmed";
import HeroCarousel from "@/components/HeroCarousel";
import KartuKabar from "@/components/KartuKabar";
import ProgressSeason from "@/components/ProgressSeason";
import {
  kabarTerbit,
  pengaturanPublik,
  pengumumanAktif,
  postSosmedAktif,
  progressSeason,
  seasonAktif,
} from "@/lib/cache";
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
  const sosmed = await postSosmedAktif();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-teal-deep">
        <HeroCarousel foto={foto} />
        <div className="selubung-hero absolute inset-0" aria-hidden="true" />
        <div className="di-gelap relative flex min-h-[260px] flex-col justify-end sm:min-h-[320px]">
          <div className="kolom-lebar py-6">
            <p className="teks-hero text-sm font-semibold text-gold">Masjid sebagai Wadah Beriman dan Bertumbuh</p>
            <h1 className="teks-hero mt-1.5 max-w-[18ch]">Menjadikan Hati untuk Betah Pulang ke Masjid Lagi</h1>
          </div>
        </div>
      </section>

      <div className="kolom-lebar -mt-5 relative z-10">
        {season && progress ? (
          <div className="kartu p-4">
            <ProgressSeason season={season} progress={progress} label="Donasi berjalan" />
            <Link href="/donasi" className="tombol-utama mt-4 w-full">
              Ikut donasi
            </Link>
            <p className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-ink-soft">Setiap kontribusi {rupiah(season.package_price)} akan melayani 1 jama'ah.</span>
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
        <div className="kolom-lebar mt-8">
          <CarouselPengumuman daftar={pengumuman} />
        </div>
      ) : null}

      <section className="kolom-lebar mt-8 overflow-hidden">
        <div className="judul-bagian">
          <h2>Event terdekat</h2>
          <Link href="/acara" className="text-sm font-semibold text-teal-ink underline underline-offset-4">
            Lihat semua
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

      {sosmed.length > 0 ? (
        <section className="kolom-lebar mt-8">
          <div className="mt-3">
            <SorotanSosmed daftar={sosmed} />
          </div>
        </section>
      ) : null}

      <BagianInteraksi />

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
