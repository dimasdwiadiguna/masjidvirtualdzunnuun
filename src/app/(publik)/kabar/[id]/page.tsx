import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { db } from "@/lib/data";
import { tanggalPanjang } from "@/lib/format";
import { ringkas } from "@/lib/markdown";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const kabar = await (await db()).getUpdateById(id);
  if (!kabar || !kabar.is_published) return { title: "Kabar tidak ditemukan" };
  return {
    title: kabar.title,
    description: ringkas(kabar.body),
    openGraph: { title: kabar.title, description: ringkas(kabar.body), type: "article" },
  };
}

export default async function DetailKabar({ params }: Props) {
  const { id } = await params;
  const kabar = await (await db()).getUpdateById(id);
  if (!kabar || !kabar.is_published) notFound();

  return (
    <article className="kolom-isi py-8">
      {kabar.day_number ? (
        <p className="font-[family-name:var(--font-judul)] font-bold text-gold-ink">Hari ke-{kabar.day_number}</p>
      ) : null}
      <h1 className="mt-1">{kabar.title}</h1>
      <p className="mt-2 text-ink-soft">{tanggalPanjang(kabar.published_at)}</p>

      {kabar.image_url ? (
        <Image
          src={kabar.image_url}
          alt=""
          width={1200}
          height={800}
          sizes="(max-width: 640px) 100vw, 640px"
          className="mt-5 h-auto w-full rounded-[10px] border-2 border-ink object-cover"
        />
      ) : null}

      <Markdown sumber={kabar.body} className="mt-5 max-w-[60ch]" />

      <div className="mt-8 flex flex-wrap gap-3 border-t-2 border-ink-soft pt-5">
        <Link href="/kabar" className="tombol-kedua">
          Kabar lainnya
        </Link>
        <Link href="/donasi" className="tombol-utama">
          Ikut patungan
        </Link>
      </div>
    </article>
  );
}
