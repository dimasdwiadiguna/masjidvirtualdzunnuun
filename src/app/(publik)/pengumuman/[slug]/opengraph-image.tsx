import { ImageResponse } from "next/og";
import { KartuOg, TIPE_OG, UKURAN_OG } from "@/lib/og";
import { satuPengumuman } from "@/lib/cache";

export const alt = "Pengumuman Dzun Nuun";
export const size = UKURAN_OG;
export const contentType = TIPE_OG;

type Props = { params: Promise<{ slug: string }> };

export default async function GambarPengumuman({ params }: Props) {
  const { slug } = await params;
  const satu = await satuPengumuman(slug);

  if (!satu) {
    return new ImageResponse(<KartuOg label="Pengumuman" judul="Pengumuman tidak ditemukan" />, size);
  }

  return new ImageResponse(<KartuOg label="Pengumuman" judul={satu.title} />, size);
}
