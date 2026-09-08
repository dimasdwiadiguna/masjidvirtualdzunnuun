import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Bagikan from "@/components/Bagikan";
import Markdown from "@/components/Markdown";
import { satuKabar } from "@/lib/cache";
import { tanggalPanjang } from "@/lib/format";
import { ringkas } from "@/lib/markdown";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const kabar = await satuKabar(id);
  if (!kabar || !kabar.is_published) return { title: "Laporan tidak ditemukan" };
  return {
    title: kabar.title,
    description: ringkas(kabar.body),
    openGraph: { title: kabar.title, description: ringkas(kabar.body), type: "article" },
  };
}

export default async function DetailKabar({ params }: Props) {
  const { id } = await params;
  const kabar = await satuKabar(id);
  if (!kabar || !kabar.is_published) notFound();

  return (
    <article className="kolom-isi py-6">
      <p className="text-xs font-semibold text-gold-ink">
        {kabar.activity_label ? (
          <>
            {kabar.activity_label}
            <span className="text-ink-soft"> · {tanggalPanjang(kabar.published_at)}</span>
          </>
        ) : (
          <span className="text-ink-soft">{tanggalPanjang(kabar.published_at)}</span>
        )}
      </p>
      <h1 className="mt-1.5">{kabar.title}</h1>

      {kabar.image_url ? (
        <Image
          src={kabar.image_url}
          alt=""
          width={1200}
          height={800}
          sizes="(max-width: 640px) 100vw, 600px"
          className="mt-4 h-auto w-full rounded-[12px] object-cover"
        />
      ) : null}

      <Markdown sumber={kabar.body} className="mt-4" />

      <div className="mt-6 flex flex-wrap gap-2 border-t border-garis pt-4">
        <Link href="/donasi" className="tombol-utama">
          Ikut patungan
        </Link>
        <Bagikan judul={kabar.title} teks={kabar.title} jalurCadangan={`/kabar/${kabar.id}`} />
        <Link href="/kabar" className="tombol-kedua">
          Laporan lainnya
        </Link>
      </div>
    </article>
  );
}
