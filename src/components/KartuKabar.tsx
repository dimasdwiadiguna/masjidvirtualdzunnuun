import Image from "next/image";
import Link from "next/link";
import { tanggalPendek } from "@/lib/format";
import type { Update } from "@/lib/data/types";

export default function KartuKabar({ kabar, tingkat = "h3" }: { kabar: Update; tingkat?: "h2" | "h3" }) {
  const Judul = tingkat;
  return (
    <article className="kartu kartu-tekan overflow-hidden">
      <Link href={`/kabar/${kabar.id}`} className="flex items-center gap-3 p-3">
        {kabar.image_url ? (
          <Image
            src={kabar.image_url}
            alt=""
            width={160}
            height={160}
            sizes="72px"
            className="h-[72px] w-[72px] shrink-0 rounded-[8px] object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gold-ink">
            {kabar.activity_label ? (
              <>
                {kabar.activity_label}
                <span className="text-ink-soft"> · {tanggalPendek(kabar.published_at)}</span>
              </>
            ) : (
              <span className="text-ink-soft">{tanggalPendek(kabar.published_at)}</span>
            )}
          </p>
          <Judul className="mt-1 line-clamp-2 text-[0.98rem] leading-snug">{kabar.title}</Judul>
        </div>
      </Link>
    </article>
  );
}
