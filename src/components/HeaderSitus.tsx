import Image from "next/image";
import Link from "next/link";

const TAUTAN = [
  { href: "/kabar", label: "Laporan" },
  { href: "/acara", label: "Acara" },
  { href: "/arsip", label: "Arsip" },
  { href: "/tentang", label: "Tentang" },
];

export default function HeaderSitus() {
  return (
    <header className="sticky top-0 z-30 border-b border-garis bg-cream/95 backdrop-blur-sm">
      <div className="kolom-lebar flex min-h-[56px] items-center justify-between gap-3">
        <Link href="/" className="flex items-center py-2" aria-label="Beranda Dzun Nuun">
          <Image
            src="/logo-gelap.png"
            alt="Dzun Nuun, masjid virtual"
            width={240}
            height={127}
            sizes="58px"
            priority
            className="h-[30px] w-[58px]"
          />
        </Link>
        <nav aria-label="Navigasi halaman" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {TAUTAN.map((tautan) => (
              <li key={tautan.href}>
                <Link
                  href={tautan.href}
                  className="inline-flex min-h-[44px] items-center rounded-[8px] px-3 text-sm font-semibold text-ink hover:text-teal-ink"
                >
                  {tautan.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/donasi" className="tombol-utama min-h-[38px] px-4 py-2 text-sm">
          Ikut patungan
        </Link>
      </div>
    </header>
  );
}
