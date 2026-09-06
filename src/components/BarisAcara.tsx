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
  const Judul = tingkat;
  const blok = tanggalBlok(acara.starts_at);
  return (
    <article className="kartu">
      <Link href={`/acara/${acara.slug}`} className="flex gap-3 p-3">
        <div className="flex h-[64px] w-[56px] shrink-0 flex-col items-center justify-center rounded-[4px] border-2 border-ink bg-teal-deep text-cream">
          <span className="font-[family-name:var(--font-judul)] text-xl font-bold leading-none">{blok.hari}</span>
          <span className="text-xs">{blok.bulan}</span>
        </div>
        <div className="min-w-0 flex-1">
          <Judul className="text-[1.05rem] leading-snug">{acara.title}</Judul>
          <p className="mt-1 text-sm text-ink-soft">
            {jam(acara.starts_at)}
            {acara.location_name ? `, ${acara.location_name}` : ""}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-semibold text-teal-ink">
              {acara.is_paid ? rupiah(acara.price) : "Gratis"}
            </span>
            {sisaKuota !== null ? (
              <span className={sisaKuota > 0 ? "text-ink-soft" : "font-semibold text-bahaya"}>
                {sisaKuota > 0 ? `Sisa ${sisaKuota} tempat` : "Kuota penuh"}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
