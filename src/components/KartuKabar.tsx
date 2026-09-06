import Image from "next/image";
import Link from "next/link";
import { tanggalPendek } from "@/lib/format";
import { ringkas } from "@/lib/markdown";
import type { Update } from "@/lib/data/types";

export default function KartuKabar({ kabar, tingkat = "h3" }: { kabar: Update; tingkat?: "h2" | "h3" }) {
  const Judul = tingkat;
  return (
    <article className="kartu overflow-hidden">
      <Link href={`/kabar/${kabar.id}`} className="flex gap-3 p-3">
        {kabar.image_url ? (
          <Image
            src={kabar.image_url}
            alt=""
            width={160}
            height={160}
            sizes="88px"
            className="h-[88px] w-[88px] shrink-0 rounded-[4px] border border-ink-soft object-cover"
          />
        ) : null}
        <div className="min-w-0">
          {kabar.day_number ? (
            <p className="font-[family-name:var(--font-judul)] text-sm font-bold text-gold-ink">
              Hari ke-{kabar.day_number}
            </p>
          ) : null}
          <Judul className="mt-0.5 text-[1.05rem] leading-snug">{kabar.title}</Judul>
          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{ringkas(kabar.body, 90)}</p>
          <p className="mt-1 text-sm text-ink-soft">{tanggalPendek(kabar.published_at)}</p>
        </div>
      </Link>
    </article>
  );
}
