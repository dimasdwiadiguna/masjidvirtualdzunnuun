import { ImageResponse } from "next/og";
import { db } from "@/lib/data";
import { tanggalDanJam } from "@/lib/format";
import { KartuOg, TIPE_OG, UKURAN_OG } from "@/lib/og";

export const alt = "Acara komunitas Dzun Nuun";
export const size = UKURAN_OG;
export const contentType = TIPE_OG;

export default async function Gambar({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const acara = await (await db()).getEventBySlug(slug);
  if (!acara) {
    return new ImageResponse(<KartuOg label="Acara" judul="Acara tidak ditemukan" />, size);
  }
  return new ImageResponse(
    (
      <KartuOg
        label={acara.is_paid ? "Acara berbayar" : "Acara gratis"}
        judul={acara.title}
        catatan={`${tanggalDanJam(acara.starts_at)}${acara.location_name ? `, ${acara.location_name}` : ""}`}
      />
    ),
    size,
  );
}
