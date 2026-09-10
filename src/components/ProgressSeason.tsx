import type { CSSProperties } from "react";
import { angka, persen, rupiah, sisaHari } from "@/lib/format";
import type { Season, SeasonProgress } from "@/lib/data/types";

type Props = {
  season: Season;
  progress: SeasonProgress;
  label?: string;
  /** Angka rupiah berhitung naik saat halaman dibuka. Dimatikan di panel pengurus. */
  berhitung?: boolean;
};

/**
 * Skrip yang membuat angka rupiah berhitung naik.
 *
 * Dijalankan sebagai skrip sebaris, bukan lewat useEffect, dan itu disengaja.
 * useEffect baru jalan setelah cat pertama, jadi di HP kelas menengah angka
 * aslinya sempat terlihat lalu melompat balik ke nol. Itu terbaca sebagai
 * kerusakan, bukan animasi. Skrip ini jalan saat HTML masih diurai, jadi
 * hitungannya sudah mulai sebelum ada yang tergambar.
 *
 * HTML dari server tetap memuat angka yang sebenarnya. Perangkat tanpa
 * JavaScript, dan pengambil pratinjau tautan WhatsApp, tidak pernah membaca
 * "Rp 0".
 *
 * Berhenti sendiri kalau perangkat meminta gerak minimal, dan selalu berakhir
 * tepat di angka aslinya.
 */
const SKRIP_HITUNG = `(function(){
  var e=document.currentScript&&document.currentScript.previousElementSibling;
  if(!e||!e.dataset||!e.dataset.hitung)return;
  var akhir=Number(e.dataset.hitung);
  if(!isFinite(akhir)||akhir<=0)return;
  try{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;}catch(x){return;}
  var f=new Intl.NumberFormat("id-ID");
  var lama=1000,mulai=0;
  function tulis(n){e.textContent="Rp "+f.format(n)}
  tulis(0);
  function langkah(t){
    if(!mulai)mulai=t;
    var p=Math.min(1,(t-mulai)/lama);
    tulis(Math.round(akhir*(1-Math.pow(1-p,3))));
    if(p<1)requestAnimationFrame(langkah);else tulis(akhir);
  }
  requestAnimationFrame(langkah);
})();`;

/**
 * Angka utama tetap rupiah, dan jumlah jamaah jadi baris kecil di bawahnya,
 * sesuai urutan yang diminta BRIEF §4. Tiga kolom statistik dipakai supaya
 * kemajuan patungan terbaca sekali lihat tanpa harus membaca kalimat.
 */
export default function ProgressSeason({ season, progress, label, berhitung }: Props) {
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
          <p
            // Skrip di bawah mengubah teks ini sebelum React menghidrasi
            // halaman, jadi ketidakcocokannya memang disengaja.
            suppressHydrationWarning
            data-hitung={berhitung ? progress.collected : undefined}
            className="mt-1 font-[family-name:var(--font-judul)] text-[clamp(1.7rem,7vw,2.15rem)] font-bold leading-none"
          >
            {rupiah(progress.collected)}
          </p>
          {berhitung ? <script dangerouslySetInnerHTML={{ __html: SKRIP_HITUNG }} /> : null}
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
        <div className="bar-terisi h-full bg-teal" style={{ "--capai": `${capai}%` } as CSSProperties} />
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
