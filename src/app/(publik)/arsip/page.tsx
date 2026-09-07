import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { db } from "@/lib/data";
import { angka, judulSeason, persen, rupiah, tanggalPendek } from "@/lib/format";

export const metadata: Metadata = {
  title: "Arsip season",
  description: "Season patungan yang sudah selesai, berikut total terkumpul dan penggunaan dananya.",
};

export const dynamic = "force-dynamic";

export default async function HalamanArsip() {
  const data = await db();
  const semua = await data.listSeasons();
  const selesai = semua.filter((season) => !season.is_active);

  const rincian = await Promise.all(
    selesai.map(async (season) => ({ season, progress: await data.seasonProgress(season.id) })),
  );

  return (
    <div className="kolom-isi py-8">
      <h1>Arsip season</h1>
      <p className="mt-2 max-w-[48ch] text-ink-soft">
        Setiap season yang sudah ditutup kami tinggalkan di sini apa adanya: berapa yang terkumpul, dan ke mana
        dananya dipakai.
      </p>

      {rincian.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {rincian.map(({ season, progress }) => (
            <article key={season.id} className="kartu p-4">
              <h2 className="text-[1.2rem]">{judulSeason(season)}</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {tanggalPendek(`${season.start_date}T00:00:00+07:00`)} sampai{" "}
                {tanggalPendek(`${season.end_date}T00:00:00+07:00`)}
              </p>
              <p className="mt-3 font-[family-name:var(--font-judul)] text-2xl font-bold">
                {rupiah(progress.collected)}
              </p>
              <p className="text-sm text-ink-soft">
                dari target {rupiah(season.target_amount)}, tercapai {persen(progress.collected, season.target_amount)}
                persen, dari {angka(progress.donors)} donasi yang sudah kami terima
              </p>

              {season.fund_usage_summary ? (
                <div className="mt-3 border-t border-ink-soft pt-3">
                  <h3 className="text-[1rem]">Penggunaan dana</h3>
                  <Markdown sumber={season.fund_usage_summary} className="mt-1" />
                </div>
              ) : (
                <p className="mt-3 border-t border-ink-soft pt-3 text-ink-soft">
                  Ringkasan penggunaan dana season ini belum kami tulis. Kalau Anda menunggu laporannya, tanyakan saja
                  ke pengurus.
                </p>
              )}

              <Link
                href={`/season/${season.slug}`}
                className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-teal-ink underline underline-offset-4"
              >
                Buka halaman season ini
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="kartu mt-6 p-4">
          <p className="font-semibold">Belum ada season yang selesai.</p>
          <p className="mt-1 text-ink-soft">
            Season pertama masih berjalan. Begitu ditutup, ringkasannya kami taruh di halaman ini.
          </p>
        </div>
      )}
    </div>
  );
}
