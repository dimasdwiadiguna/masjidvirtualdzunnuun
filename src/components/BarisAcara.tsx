import Link from "next/link";
import { jam, rupiah } from "@/lib/format";
import type { EventItem } from "@/lib/data/types";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function tanggalBlok(iso: string): { hari: string; bulan: string } {
  const bagian = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Jakarta",
  }).formatToParts(new Date(iso));
  const hari = bagian.find((p) => p.type === "day")?.value ?? "";
  const bulan = Number(bagian.find((p) => p.type === "month")?.value ?? "1");
  return { hari, bulan: BULAN[bulan - 1] };
}

export default function BarisAcara({
  acara,
  sisaKuota,
  tingkat = "h3",
}: {
  acara: EventItem;
  sisaKuota: number | null;
  tingkat?: "h2" | "h3";
}) {
  const blok = tanggalBlok(acara.starts_at);
  const penuh = sisaKuota !== null && sisaKuota <= 0;
  const Judul = tingkat;

  return (
    <article className="kartu kartu-tekan">
      <Link href={`/acara/${acara.slug}`} className="flex items-center gap-3 p-3">
        <div className="flex h-[52px] w-[48px] shrink-0 flex-col items-center justify-center rounded-[8px] bg-teal-deep text-cream">
          <span className="font-[family-name:var(--font-judul)] text-lg font-bold leading-none">{blok.hari}</span>
          <span className="mt-0.5 text-[0.68rem]">{blok.bulan}</span>
        </div>
        <div className="min-w-0 flex-1">
          <Judul className="line-clamp-2 text-[0.98rem] leading-snug">{acara.title}</Judul>
          <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">
            {jam(acara.starts_at)}
            {acara.location_name ? ` · ${acara.location_name}` : ""}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="label-status bg-teal/10 text-teal-ink">
              {acara.is_paid ? rupiah(acara.price) : "Gratis"}
            </span>
            {penuh ? <span className="label-status bg-bahaya/10 text-bahaya">Kuota penuh</span> : null}
            {!penuh && sisaKuota !== null ? <span className="text-ink-soft">Sisa {sisaKuota} tempat</span> : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
