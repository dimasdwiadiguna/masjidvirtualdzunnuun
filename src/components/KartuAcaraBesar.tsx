import Image from "next/image";
import Link from "next/link";
import { jam, rupiah, sudahLewat, tanggalPendek } from "@/lib/format";
import { IkonLokasi } from "./Ikon";
import type { EventItem } from "@/lib/data/types";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function tanggalBlok(iso: string): { hari: string; bulan: string } {
  const bagian = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Jakarta",
  }).formatToParts(new Date(iso));
  return {
    hari: bagian.find((p) => p.type === "day")?.value ?? "",
    bulan: BULAN[Number(bagian.find((p) => p.type === "month")?.value ?? "1") - 1],
  };
}

/**
 * Kartu acara untuk sorotan di beranda: poster jadi kepala kartu, keterangan
 * dan tombol daftar di separuh bawah. Acara tanpa poster memakai blok tanggal
 * besar, bukan kotak abu-abu kosong.
 */
export default function KartuAcaraBesar({ acara, sisaKuota }: { acara: EventItem; sisaKuota: number | null }) {
  const blok = tanggalBlok(acara.starts_at);
  const penuh = sisaKuota !== null && sisaKuota <= 0;
  const tenggatLewat = acara.registration_deadline ? sudahLewat(acara.registration_deadline) : false;
  const acaraLewat = sudahLewat(acara.ends_at ?? acara.starts_at);
  const bisaDaftar = !penuh && !tenggatLewat && !acaraLewat;

  return (
    <article className="kartu flex h-full flex-col overflow-hidden">
      <Link href={`/acara/${acara.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-teal-deep">
          {acara.poster_url ? (
            <Image
              src={acara.poster_url}
              alt={`Poster ${acara.title}`}
              fill
              sizes="(max-width: 640px) 86vw, 320px"
              className="object-cover"
            />
          ) : (
            <div className="di-gelap flex h-full flex-col items-center justify-center text-cream">
              <span className="font-[family-name:var(--font-judul)] text-4xl font-bold leading-none">{blok.hari}</span>
              <span className="mt-1 text-sm">{blok.bulan}</span>
            </div>
          )}
          <span className="absolute left-2 top-2 label-status bg-paper/95 text-ink">
            {tanggalPendek(acara.starts_at)}, {jam(acara.starts_at)}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link href={`/acara/${acara.slug}`} className="block">
          <h3 className="line-clamp-2 leading-snug">{acara.title}</h3>
        </Link>
        {acara.location_name ? (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-soft">
            <IkonLokasi className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{acara.location_name}</span>
          </p>
        ) : null}

        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="label-status bg-teal/12 text-teal-ink">{acara.is_paid ? rupiah(acara.price) : "Gratis"}</span>
          {penuh ? (
            <span className="label-status bg-bahaya/10 text-bahaya">Kuota penuh</span>
          ) : sisaKuota !== null ? (
            <span className="text-ink-soft">Sisa {sisaKuota} tempat</span>
          ) : null}
        </p>

        <div className="mt-3 pt-0.5">
          {bisaDaftar ? (
            <Link href={`/acara/${acara.slug}/daftar`} className="tombol-utama w-full">
              Daftar
            </Link>
          ) : (
            <p className="rounded-[8px] bg-cream px-3 py-2 text-center text-sm font-semibold text-ink-soft">
              {acaraLewat ? "Acara sudah lewat" : penuh ? "Kuota penuh" : "Pendaftaran ditutup"}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
