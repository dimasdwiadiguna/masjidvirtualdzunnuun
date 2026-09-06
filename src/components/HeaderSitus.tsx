import Image from "next/image";
import Link from "next/link";

const TAUTAN = [
  { href: "/kabar", label: "Kabar Aksi" },
  { href: "/acara", label: "Acara" },
  { href: "/arsip", label: "Arsip" },
  { href: "/tentang", label: "Tentang" },
];

export default function HeaderSitus() {
  return (
    <header className="border-b-2 border-ink bg-cream">
      <div className="kolom-isi flex min-h-[60px] items-center justify-between gap-3 md:max-w-[900px]">
        <Link href="/" className="flex items-center gap-2 py-2" aria-label="Beranda Dzun Nuun">
          <Image
            src="/logo-gelap.png"
            alt="Dzun Nuun, masjid virtual"
            width={240}
            height={127}
            sizes="60px"
            priority
            className="h-8 w-[60px]"
          />
        </Link>
        <nav aria-label="Navigasi halaman" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {TAUTAN.map((tautan) => (
              <li key={tautan.href}>
                <Link
                  href={tautan.href}
                  className="inline-flex min-h-[44px] items-center rounded-[4px] px-3 font-semibold text-ink hover:bg-teal/10"
                >
                  {tautan.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/donasi" className="tombol-kecil border-ink bg-paper">
          Ikut patungan
        </Link>
      </div>
    </header>
  );
}
