import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { progressSeason, semuaSeason } from "@/lib/cache";
import { angka, judulSeason, persen, rupiah, tanggalPendek } from "@/lib/format";

export const metadata: Metadata = {
  title: "Arsip season",
  description: "Season patungan yang sudah selesai berikut penggunaan dananya.",
};

export const dynamic = "force-dynamic";

export default async function HalamanArsip() {
  const semua = await semuaSeason();
  const selesai = semua.filter((season) => !season.is_active);
  const rincian = await Promise.all(
    selesai.map(async (season) => ({ season, progress: await progressSeason(season.id) })),
  );

  return (
    <div className="kolom-isi py-6">
      <h1>Arsip season</h1>
      <p className="mt-2 text-[0.95rem] text-ink-soft">
        Season yang sudah ditutup, apa adanya: berapa yang terkumpul dan ke mana dipakai.
      </p>

      {rincian.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {rincian.map(({ season, progress }) => (
            <article key={season.id} className="kartu p-4">
              <h2 className="text-base">{judulSeason(season)}</h2>
              <p className="petunjuk">
                {tanggalPendek(`${season.start_date}T00:00:00+07:00`)} sampai{" "}
                {tanggalPendek(`${season.end_date}T00:00:00+07:00`)}
              </p>
              <p className="mt-3 font-[family-name:var(--font-judul)] text-xl font-bold">
                {rupiah(progress.collected)}
              </p>
              <p className="text-sm text-ink-soft">
                {persen(progress.collected, season.target_amount)}% dari target, {angka(progress.donors)} donasi
              </p>

              {season.fund_usage_summary ? (
                <div className="mt-3 border-t border-garis pt-3">
                  <h3>Penggunaan dana</h3>
                  <Markdown sumber={season.fund_usage_summary} className="mt-1 text-[0.95rem]" />
                </div>
              ) : (
                <p className="mt-3 border-t border-garis pt-3 text-sm text-ink-soft">
                  Ringkasan penggunaan dana belum ditulis pengurus.
                </p>
              )}

              <Link
                href={`/season/${season.slug}`}
                className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-teal-ink underline underline-offset-4"
              >
                Buka halaman season
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="kartu mt-5 p-4">
          <p className="font-semibold">Belum ada season yang selesai.</p>
          <p className="petunjuk">Ringkasan season pertama muncul di sini begitu ditutup.</p>
        </div>
      )}
    </div>
  );
}
