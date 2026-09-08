import { IkonInstagram, IkonTikTok } from "@/components/Ikon";
import { pengaturanPublik } from "@/lib/cache";

/**
 * Bar ajakan follow yang menempel tepat di atas navigasi bawah.
 *
 * Latar emas dipakai karena itu warna paling terang di palet brand, dan tinta
 * di atasnya berkontras 7,65 banding 1. Tautannya ikon saja supaya muat di bar
 * setinggi 38px, dengan sasaran tap 44 kali 38 piksel. Bar hanya dirender kalau ada
 * alamat sosial yang benar-benar diisi pengurus, jadi tidak pernah jadi bar
 * kosong. Ruangnya dipesan lewat padding di tata letak, jadi tidak menutup isi.
 */
export default async function BarSosial() {
  let instagram: string | null = null;
  let tiktok: string | null = null;
  try {
    const pengaturan = await pengaturanPublik();
    instagram = pengaturan.instagram_url;
    tiktok = pengaturan.tiktok_url;
  } catch {
    return null;
  }

  const tautan = [
    { url: instagram, label: "Instagram", Ikon: IkonInstagram },
    { url: tiktok, label: "TikTok", Ikon: IkonTikTok },
  ].filter((item): item is { url: string; label: string; Ikon: typeof IkonInstagram } => Boolean(item.url));

  if (tautan.length === 0) return null;

  return (
    <div className="fixed bottom-[54px] left-0 right-0 z-40 bg-gold md:hidden">
      <div className="mx-auto flex h-[38px] max-w-[600px] items-center justify-between gap-2 px-4">
        <p className="text-[0.8rem] font-semibold text-ink">Ikuti kegiatan kami</p>
        <div className="flex items-center gap-1">
          {tautan.map((item) => (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              // Ikonnya aria-hidden, jadi nama tautan datang dari sini. Tanpa
              // ini tautannya jadi tautan tanpa nama bagi pembaca layar.
              aria-label={`${item.label} Dzun Nuun, terbuka di aplikasi`}
              className="inline-flex h-[38px] min-w-[44px] items-center justify-center text-ink"
            >
              <item.Ikon />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
