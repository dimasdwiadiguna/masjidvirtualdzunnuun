import { ImageResponse } from "next/og";
import { KartuOg, TIPE_OG, UKURAN_OG } from "@/lib/og";

export const alt = "Dzun Nuun, komunitas pemuda Masjid Fathul Ummah";
export const size = UKURAN_OG;
export const contentType = TIPE_OG;

export default async function Gambar() {
  return new ImageResponse(
    (
      <KartuOg
        label="Teman Beriman dan Bertumbuh"
        judul="Masjid jadi tempat anak muda betah singgah"
        catatan="Patungan, acara, dan laporan kegiatan komunitas Dzun Nuun."
      />
    ),
    size,
  );
}
