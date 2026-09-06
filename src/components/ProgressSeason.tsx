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
    <div className="di-gelap blok-gelap bayang-padat rounded-[10px] border-2 border-ink p-5">
      <p className="font-[family-name:var(--font-judul)] text-[clamp(1.7rem,7vw,2.3rem)] font-bold leading-tight">
        {rupiah(progress.collected)}
      </p>
      <p className="text-cream/90">dari {rupiah(season.target_amount)}</p>

      <div
        className="mt-4 h-4 w-full overflow-hidden rounded-[4px] border-2 border-cream/70 bg-teal-deep"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={capai}
        aria-label={`Terkumpul ${capai} persen dari target`}
      >
        <div className="h-full bg-gold" style={{ width: `${capai}%` }} />
      </div>

      <p className="mt-3 text-sm text-cream/90">
        {progress.packages > 0
          ? `${angka(progress.packages)} jamaah sudah dirangkul lewat ${angka(progress.donors)} donasi yang sudah kami terima.`
          : "Belum ada donasi yang masuk ke season ini. Angka di halaman ini hanya menghitung donasi yang sudah kami cek satu per satu."}
      </p>

      {!ringkas ? (
        <p className="mt-1 text-sm text-cream/90">
          {hari > 0 ? `Sisa ${angka(hari)} hari sampai ${season.end_date.split("-").reverse().join("/")}.` : "Season ini sudah lewat masa waktunya."}
        </p>
      ) : null}
    </div>
  );
}
