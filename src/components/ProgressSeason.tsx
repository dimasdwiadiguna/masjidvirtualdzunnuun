import { angka, persen, rupiah, sisaHari } from "@/lib/format";
import type { Season, SeasonProgress } from "@/lib/data/types";

type Props = {
  season: Season;
  progress: SeasonProgress;
  ringkas?: boolean;
};

export default function ProgressSeason({ season, progress, ringkas = false }: Props) {
  const capai = persen(progress.collected, season.target_amount);
  const hari = sisaHari(season.end_date);

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-[family-name:var(--font-judul)] text-[clamp(1.5rem,6vw,1.9rem)] font-bold leading-none">
            {rupiah(progress.collected)}
          </p>
          <p className="mt-1 text-sm text-ink-soft">dari {rupiah(season.target_amount)}</p>
        </div>
        <p className="font-[family-name:var(--font-judul)] text-lg font-bold text-teal-ink">{capai}%</p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream ring-1 ring-garis"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={capai}
        aria-label={`Terkumpul ${capai} persen dari target`}
      >
        <div className="h-full rounded-full bg-teal" style={{ width: `${capai}%` }} />
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-1.5">
          <dt className="text-ink-soft">Jamaah dirangkul</dt>
          <dd className="font-semibold">{angka(progress.packages)}</dd>
        </div>
        {!ringkas ? (
          <div className="flex gap-1.5">
            <dt className="text-ink-soft">Sisa waktu</dt>
            <dd className="font-semibold">{hari > 0 ? `${angka(hari)} hari` : "sudah lewat"}</dd>
          </div>
        ) : null}
      </dl>

      {progress.packages === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">Angka ini hanya menghitung donasi yang sudah dicek pengurus.</p>
      ) : null}
    </div>
  );
}
