import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import KartuKabar from "@/components/KartuKabar";
import Markdown from "@/components/Markdown";
import ProgressSeason from "@/components/ProgressSeason";
import { db } from "@/lib/data";
import { judulSeason, rupiah } from "@/lib/format";
import { ringkas } from "@/lib/markdown";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const season = await (await db()).getSeasonBySlug(slug);
  if (!season) return { title: "Season tidak ditemukan" };
  return {
    title: judulSeason(season),
    description: season.tagline ?? ringkas(season.description ?? ""),
    openGraph: {
      title: judulSeason(season),
      description: season.tagline ?? ringkas(season.description ?? ""),
      type: "website",
    },
  };
}

export default async function HalamanSeason({ params }: Props) {
  const { slug } = await params;
  const data = await db();
  const season = await data.getSeasonBySlug(slug);
  if (!season) notFound();

  const [progress, kabar, sponsor] = await Promise.all([
    data.seasonProgress(season.id),
    data.listUpdates({ hanyaTerbit: true, seasonId: season.id }),
    data.listSponsors(season.id),
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
          sizes="100vw"
          className="h-[200px] w-full border-b-2 border-ink object-cover sm:h-[280px]"
        />
      ) : null}

      <div className="kolom-isi py-8">
        <h1>{judulSeason(season)}</h1>
        {season.tagline ? <p className="mt-2 max-w-[42ch] text-ink-soft">{season.tagline}</p> : null}

        <div className="mt-5">
          <ProgressSeason season={season} progress={progress} />
        </div>

        <p className="mt-4 rounded-[4px] border-l-4 border-teal bg-paper p-3">
          1 paket = {rupiah(season.package_price)} = biaya merangkul satu jamaah yang singgah ke masjid, agar amal
          ibadahnya mengalir.
        </p>

        {season.description ? <Markdown sumber={season.description} className="mt-6 max-w-[60ch]" /> : null}

        <Link href="/donasi" className="tombol-utama mt-4 hidden md:inline-flex">
          Ikut patungan sekarang
        </Link>

        <section className="mt-10">
          <h2>Kabar Aksi season ini</h2>
          {kabar.length > 0 ? (
            <div className="mt-3 grid gap-3">
              {kabar.map((item) => (
                <KartuKabar key={item.id} kabar={item} />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-ink-soft">
              Belum ada kabar untuk season ini. Catatan pertama ditulis begitu kegiatannya jalan.
            </p>
          )}
        </section>

        {sponsor.length > 0 ? (
          <section className="mt-10">
            <h2>Didukung oleh</h2>
            <ul className="mt-3 flex flex-wrap items-center gap-4">
              {sponsor.map((item) => {
                const isi = item.logo_url ? (
                  <Image
                    src={item.logo_url}
                    alt={item.name}
                    width={240}
                    height={120}
                    sizes="140px"
                    className={item.tier === "utama" ? "h-14 w-auto" : "h-9 w-auto"}
                  />
                ) : (
                  <span className={item.tier === "utama" ? "text-lg font-semibold" : "font-semibold"}>{item.name}</span>
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

      <div className="fixed bottom-[64px] left-0 right-0 z-30 border-t-2 border-ink bg-paper p-3 md:hidden">
        <Link href="/donasi" className="tombol-utama w-full">
          Ikut patungan sekarang
        </Link>
      </div>
    </div>
  );
}
