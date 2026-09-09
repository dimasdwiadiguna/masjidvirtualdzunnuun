import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Bagikan from "@/components/Bagikan";
import KartuKabar from "@/components/KartuKabar";
import Markdown from "@/components/Markdown";
import ProgressSeason from "@/components/ProgressSeason";
import { kabarSeason, progressSeason, seasonLewatSlug, sponsorSeason } from "@/lib/cache";
import { judulSeason, rupiah } from "@/lib/format";
import { ringkas } from "@/lib/markdown";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const season = await seasonLewatSlug(slug);
  if (!season) return { title: "Season tidak ditemukan" };
  const deskripsi = season.tagline ?? ringkas(season.description ?? "");
  return {
    title: judulSeason(season),
    description: deskripsi,
    openGraph: { title: judulSeason(season), description: deskripsi, type: "website" },
  };
}

export default async function HalamanSeason({ params }: Props) {
  const { slug } = await params;
  const season = await seasonLewatSlug(slug);
  if (!season) notFound();

  const [progress, kabar, sponsor] = await Promise.all([
    progressSeason(season.id),
    kabarSeason(season.id),
    sponsorSeason(season.id),
  ]);

  return (
    <div className="pb-24 md:pb-8">
      {season.header_image_url ? (
        <Image
          src={season.header_image_url}
          alt=""
          width={1200}
          height={675}
          priority
          sizes="(max-width: 640px) 100vw, 600px"
          className="h-[180px] w-full object-cover sm:h-[240px]"
        />
      ) : null}

      <div className="kolom-isi py-5">
        <h1>{judulSeason(season)}</h1>
        {season.tagline ? <p className="mt-1.5 text-[0.95rem] text-ink-soft">{season.tagline}</p> : null}

        <div className="kartu mt-4 p-4">
          <ProgressSeason season={season} progress={progress} label="Donasi berjalan" berhitung />
          <p className="petunjuk">1 paket {rupiah(season.package_price)} untuk merangkul satu jamaah.</p>
          <div className="mt-3 flex gap-2">
            <Link href="/donasi" className="tombol-utama flex-1">
              Ikut donasi
            </Link>
            <Bagikan
              judul={judulSeason(season)}
              teks={`${judulSeason(season)}, ${rupiah(progress.collected)} dari ${rupiah(season.target_amount)}`}
              jalurCadangan={`/season/${season.slug}`}
            />
          </div>
        </div>

        {season.description ? <Markdown sumber={season.description} className="mt-5" /> : null}

        <section className="mt-8">
          <div className="judul-bagian">
            <h2>Laporan Kegiatan season ini</h2>
          </div>
          {kabar.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {kabar.map((item) => (
                <KartuKabar key={item.id} kabar={item} />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">Belum ada laporan untuk season ini.</p>
          )}
        </section>

        {sponsor.length > 0 ? (
          <section className="mt-8">
            <div className="judul-bagian">
              <h2>Didukung oleh</h2>
            </div>
            <ul className="mt-3 flex flex-wrap items-center gap-4">
              {sponsor.map((item) => {
                const isi = item.logo_url ? (
                  <Image
                    src={item.logo_url}
                    alt={item.name}
                    width={240}
                    height={120}
                    sizes="120px"
                    className={item.tier === "utama" ? "h-11 w-auto" : "h-8 w-auto"}
                  />
                ) : (
                  <span className={item.tier === "utama" ? "font-semibold" : "text-sm font-semibold"}>{item.name}</span>
                );
                return (
                  <li key={item.id}>
                    {item.link_url ? (
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center"
                      >
                        {isi}
                      </a>
                    ) : (
                      <span className="inline-flex min-h-[44px] items-center">{isi}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>

      <div className="fixed bottom-[92px] left-0 right-0 z-30 border-t border-garis bg-paper p-3 md:hidden">
        <div className="kolom-isi">
          <Link href="/donasi" className="tombol-utama w-full">
            Ikut donasi
          </Link>
        </div>
      </div>
    </div>
  );
}
