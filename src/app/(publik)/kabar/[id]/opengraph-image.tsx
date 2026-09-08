import { ImageResponse } from "next/og";
import { db } from "@/lib/data";
import { tanggalPendek } from "@/lib/format";
import { KartuOg, TIPE_OG, UKURAN_OG } from "@/lib/og";

export const alt = "Kabar Aksi Dzun Nuun";
export const size = UKURAN_OG;
export const contentType = TIPE_OG;

export default async function Gambar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kabar = await (await db()).getUpdateById(id);
  if (!kabar) {
    return new ImageResponse(<KartuOg label="Kabar Aksi" judul="Kabar tidak ditemukan" />, size);
  }
  return new ImageResponse(
    (
      <KartuOg
        label={kabar.activity_label ? `Kabar Aksi, ${kabar.activity_label}` : "Kabar Aksi"}
        judul={kabar.title}
        catatan={tanggalPendek(kabar.published_at)}
      />
    ),
    size,
  );
}
