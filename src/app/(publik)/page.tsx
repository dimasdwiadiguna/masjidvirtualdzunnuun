import Image from "next/image";
import Link from "next/link";
import BarisAcara from "@/components/BarisAcara";
import KartuKabar from "@/components/KartuKabar";
import Markdown from "@/components/Markdown";
import ProgressSeason from "@/components/ProgressSeason";
import { db } from "@/lib/data";
import { acaraTerdekat } from "@/lib/tampilan";

export const dynamic = "force-dynamic";

export default async function Beranda() {
  const data = await db();
  const [season, pengaturan] = await Promise.all([data.getActiveSeason(), data.getSettings()]);
  const [progress, kabar, acara] = await Promise.all([
    season ? data.seasonProgress(season.id) : Promise.resolve(null),
    data.listUpdates({ hanyaTerbit: true, limit: 3 }),
    acaraTerdekat(3),
  ]);

  const sosial = [
    { url: pengaturan.instagram_url, label: "Instagram" },
    { url: pengaturan.tiktok_url, label: "TikTok" },
    { url: pengaturan.youtube_url, label: "YouTube" },
    { url: pengaturan.whatsapp_channel_url, label: "Saluran WhatsApp" },
  ].filter((item): item is { url: string; label: string } => Boolean(item.url));

  return (
    <>
      <section className="di-gelap blok-gelap border-b-2 border-ink">
        <div className="kolom-isi py-8 md:max-w-[900px]">
          <p className="font-[family-name:var(--font-judul)] text-gold">Teman Beriman dan Bertumbuh</p>
          <h1 className="mt-2 max-w-[20ch]">Masjid jadi tempat anak muda betah singgah</h1>

          {season && progress ? (
            <>
              {season.header_image_url ? (
                <Image
                  src={season.header_image_url}
                  alt=""
                  width={1200}
                  height={675}
                  priority
                  sizes="(max-width: 640px) 100vw, 640px"
                  className="mt-5 h-auto w-full rounded-[10px] border-2 border-ink object-cover"
                />
              ) : null}
              <p className="mt-5 max-w-[38ch] text-cream/90">{season.tagline}</p>
              <div className="mt-4">
                <ProgressSeason season={season} progress={progress} />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href="/donasi" className="tombol-utama bayang-padat-terang">
                  Ikut patungan sekarang
                </Link>
                <Link
                  href={`/season/${season.slug}`}
                  className="tombol-kedua border-cream text-cream hover:bg-cream/10"
                >
                  Lihat rincian season
                </Link>
              </div>
              <p className="mt-3 text-sm text-cream/80">
                1 paket Rp 15.000 untuk merangkul satu jamaah yang singgah ke masjid.
              </p>
            </>
          ) : (
            <div className="mt-5 rounded-[10px] border-2 border-cream/60 p-4">
              <p className="font-semibold">Belum ada season patungan yang berjalan.</p>
              <p className="mt-1 text-cream/90">
                Kalau Anda pengurus, buka /admin/season untuk membuat season baru dan menandainya aktif.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="kolom-isi py-8 md:max-w-[900px]">
        <div className="flex items-baseline justify-between gap-3">
          <h2>Kabar Aksi</h2>
          <Link href="/kabar" className="font-semibold text-teal-ink underline underline-offset-4">
            Semua kabar
          </Link>
        </div>
        {kabar.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {kabar.map((item) => (
              <KartuKabar key={item.id} kabar={item} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-ink-soft">
            Belum ada kabar yang ditulis. Catatan kegiatan pertama akan muncul di sini begitu season berjalan.
          </p>
        )}
      </section>

      <section className="border-y-2 border-ink bg-paper py-8">
        <div className="kolom-isi md:max-w-[900px]">
          <div className="flex items-baseline justify-between gap-3">
            <h2>Acara terdekat</h2>
            <Link href="/acara" className="font-semibold text-teal-ink underline underline-offset-4">
              Semua acara
            </Link>
          </div>
          {acara.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {acara.map((item) => (
                <BarisAcara key={item.acara.id} acara={item.acara} sisaKuota={item.sisaKuota} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-ink-soft">
              Belum ada acara yang dijadwalkan. Kalau Anda pengurus, tambahkan lewat /admin/acara.
            </p>
          )}
        </div>
      </section>

      <section className="kolom-isi py-8 md:max-w-[900px]">
        <h2>Tentang Dzun Nuun</h2>
        <Markdown sumber={pengaturan.about_markdown} className="mt-3 max-w-[60ch]" />
        <Link href="/tentang" className="tombol-kedua mt-2">
          Kenali komunitasnya
        </Link>

        {sosial.length > 0 ? (
          <>
            <h3 className="mt-8">Ikuti kegiatan harian kami</h3>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              {sosial.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center font-semibold text-teal-ink underline underline-offset-4"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
    </>
  );
}
