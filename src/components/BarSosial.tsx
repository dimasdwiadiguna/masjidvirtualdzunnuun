import BarBerganti, { type IsiBar, type TautanSosial } from "@/components/BarBerganti";
import { pengaturanPublik } from "@/lib/cache";
import { tanggalDanJam } from "@/lib/format";
import { acaraTerdekatTanpaKuota } from "@/lib/tampilan";

/**
 * Bar yang menempel tepat di atas navigasi bawah.
 *
 * Isinya lebih dari satu dan ditampilkan bergantian: ajakan mengikuti sosial
 * media, dan hitung mundur ke acara terdekat. Pergantiannya diurus komponen
 * klien; di sini hanya datanya yang dikumpulkan.
 *
 * Latar emas dipakai karena itu warna paling terang di palet brand, dan tinta
 * di atasnya berkontras 7,65 banding 1. Bar hanya dirender kalau ada isi yang
 * benar-benar ada: tanpa alamat sosial dan tanpa acara mendatang, barnya tidak
 * muncul sama sekali, bukan jadi bar kosong. Ruangnya dipesan lewat padding di
 * tata letak, jadi tidak menutup isi halaman.
 */
export default async function BarSosial() {
  const isi: IsiBar[] = [];

  try {
    const pengaturan = await pengaturanPublik();
    const tautan: TautanSosial[] = [
      { url: pengaturan.instagram_url, label: "Instagram" },
      { url: pengaturan.tiktok_url, label: "TikTok" },
    ].filter((item): item is TautanSosial => Boolean(item.url));
    if (tautan.length > 0) isi.push({ jenis: "sosial", tautan });
  } catch {
    // Bar ini ikut dirender lewat tata letak, jadi satu bacaan yang gagal tidak
    // boleh menjatuhkan seluruh halaman. Alasannya sama dengan D-48.
  }

  try {
    const terdekat = await acaraTerdekatTanpaKuota();
    if (terdekat) {
      isi.push({
        jenis: "hitung-mundur",
        judul: terdekat.title,
        slug: terdekat.slug,
        mulai: terdekat.starts_at,
        keterangan: `mulai ${tanggalDanJam(terdekat.starts_at)}`,
      });
    }
  } catch {
    // Sama seperti di atas: tanpa acara, barnya cukup menampilkan sisanya.
  }

  if (isi.length === 0) return null;

  return <BarBerganti isi={isi} />;
}
