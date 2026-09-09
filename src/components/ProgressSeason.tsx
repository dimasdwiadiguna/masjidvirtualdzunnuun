import { angka, persen, rupiah, sisaHari } from "@/lib/format";
import type { Season, SeasonProgress } from "@/lib/data/types";

type Props = {
  season: Season;
  progress: SeasonProgress;
  label?: string;
};

/**
 * Angka utama tetap rupiah, dan jumlah jamaah jadi baris kecil di bawahnya,
 * sesuai urutan yang diminta BRIEF §4. Tiga kolom statistik dipakai supaya
 * kemajuan patungan terbaca sekali lihat tanpa harus membaca kalimat.
 */
export default function ProgressSeason({ season, progress, label }: Props) {
  const capai = persen(progress.collected, season.target_amount);
  const hari = sisaHari(season.end_date);

  const statistik = [
    { nilai: angka(progress.packages), label: "Jamaah terlayani" },
    { nilai: angka(progress.donors), label: "Donasi masuk" },
    { nilai: hari > 0 ? angka(hari) : "0", label: hari > 0 ? "Sisa hari" : "Hari tersisa" },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          {label ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-ink">{label}</p>
          ) : null}
           <p className="petunjuk mt-0">Sedekah ini digunakan untuk pelaksanaan seluruh kegiatan selama 1 season (3 bulan)</p>
          <p className="mt-1 font-[family-name:var(--font-judul)] text-[clamp(1.7rem,7vw,2.15rem)] font-bold leading-none">
            {rupiah(progress.collected)}
          </p>
          <p className="mt-1 text-sm text-ink-soft">dari {rupiah(season.target_amount)}</p>
        </div>
        <span className="label-status shrink-0 bg-teal/12 text-sm text-teal-ink">{capai}%</span>
      </div>

      <div
        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-cream ring-1 ring-garis"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={capai}
        aria-label={`Terkumpul ${capai} persen dari target`}
      >
        <div className="h-full rounded-full bg-teal transition-[width] duration-500" style={{ width: `${capai}%` }} />
      </div>

      <dl className="mt-4 grid grid-cols-3 divide-x divide-garis rounded-[8px] bg-cream/70 py-2.5">
        {statistik.map((item) => (
          <div key={item.label} className="px-2 text-center">
            <dd className="font-[family-name:var(--font-judul)] text-lg font-bold leading-none">{item.nilai}</dd>
            <dt className="mt-1 text-[0.72rem] leading-tight text-ink-soft">{item.label}</dt>
          </div>
        ))}
      </dl>

      {progress.collected === 0 ? (
        <>
        <p className="petunjuk">Angka yang ditampilkan adalah sedekah yang sudah dikonfirmasi oleh relawan</p>
        </>
      ) : null}
    </div>
  );
}
