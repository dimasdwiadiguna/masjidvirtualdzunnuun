import { ImageResponse } from "next/og";
import { db } from "@/lib/data";
import { judulSeason, rupiah } from "@/lib/format";
import { KartuOg, TIPE_OG, UKURAN_OG } from "@/lib/og";

export const alt = "Progress patungan Dzun Nuun";
export const size = UKURAN_OG;
export const contentType = TIPE_OG;

export default async function Gambar({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await db();
  const season = await data.getSeasonBySlug(slug);
  if (!season) {
    return new ImageResponse(<KartuOg label="Patungan" judul="Season tidak ditemukan" />, size);
  }
  const progress = await data.seasonProgress(season.id);
  return new ImageResponse(
    (
      <KartuOg
        label="Patungan Dzun Nuun"
        judul={judulSeason(season)}
        catatan={`${rupiah(progress.collected)} dari ${rupiah(season.target_amount)} sudah kami terima`}
      />
    ),
    size,
  );
}
