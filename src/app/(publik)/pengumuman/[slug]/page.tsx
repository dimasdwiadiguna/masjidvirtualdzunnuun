import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Bagikan from "@/components/Bagikan";
import Markdown from "@/components/Markdown";
import { satuPengumuman } from "@/lib/cache";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const satu = await satuPengumuman(slug);
  if (!satu || !satu.is_active) return { title: "Pengumuman tidak ditemukan" };
  return {
    title: satu.title,
    description: satu.body ?? `Pengumuman dari komunitas Dzun Nuun: ${satu.title}.`,
    openGraph: { title: satu.title, description: satu.body ?? undefined, type: "article" },
  };
}

export default async function DetailPengumuman({ params }: Props) {
  const { slug } = await params;
  const satu = await satuPengumuman(slug);
  if (!satu || !satu.is_active) notFound();

  return (
    <article className="kolom-isi py-6">
      <p className="text-xs font-semibold text-gold-ink">Pengumuman</p>
      <h1 className="mt-1.5">{satu.title}</h1>

      <Image
        src={satu.image_url}
        alt={satu.title}
        width={1200}
        height={1200}
        sizes="(max-width: 640px) 100vw, 600px"
        priority
        className="mt-4 h-auto w-full rounded-[12px] object-cover"
      />

      {satu.body ? <Markdown sumber={satu.body} className="mt-4" /> : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Bagikan
          judul={satu.title}
          teks={`${satu.title} — pengumuman dari Dzun Nuun`}
          jalurCadangan={`/pengumuman/${satu.slug}`}
        />
        <Link href="/" className="tombol-kedua">
          Kembali ke beranda
        </Link>
      </div>
    </article>
  );
}
