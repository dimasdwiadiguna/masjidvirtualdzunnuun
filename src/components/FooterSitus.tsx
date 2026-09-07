import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/data";
import { IkonWhatsApp } from "./Ikon";

const HALAMAN = [
  { href: "/", label: "Beranda" },
  { href: "/donasi", label: "Ikut patungan" },
  { href: "/kabar", label: "Kabar Aksi" },
  { href: "/acara", label: "Acara" },
  { href: "/arsip", label: "Arsip season" },
  { href: "/tentang", label: "Tentang kami" },
];

export default async function FooterSitus() {
  const pengaturan = await (await db()).getSettings();
  const sosial = [
    { url: pengaturan.instagram_url, label: "Instagram" },
    { url: pengaturan.tiktok_url, label: "TikTok" },
    { url: pengaturan.youtube_url, label: "YouTube" },
  ].filter((item): item is { url: string; label: string } => Boolean(item.url));

  return (
    <footer className="di-gelap blok-gelap mt-12 border-t-2 border-ink">
      <div className="kolom-isi py-8 md:max-w-[900px]">
        <Image
          src="/logo-terang.png"
          alt="Dzun Nuun, masjid virtual"
          width={304}
          height={159}
          sizes="76px"
          className="h-10 w-[76px]"
        />
        <p className="mt-3 max-w-[34ch] text-cream/90">
          Teman Beriman dan Bertumbuh. Dikelola relawan Dzun Nuun untuk Masjid Fathul Ummah.
        </p>

        {pengaturan.whatsapp_channel_url ? (
          <a
            href={pengaturan.whatsapp_channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="tombol-utama bayang-padat-terang mt-5 bg-teal text-paper"
          >
            <IkonWhatsApp />
            Ikuti Saluran WhatsApp kami
          </a>
        ) : null}

        <nav aria-label="Peta halaman" className="mt-6">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {HALAMAN.map((halaman) => (
              <li key={halaman.href}>
                <Link
                  href={halaman.href}
                  className="inline-flex min-h-[44px] items-center text-cream underline underline-offset-4"
                >
                  {halaman.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {sosial.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            {sosial.map((item) => (
              <li key={item.label}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center text-gold underline underline-offset-4"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-6 text-sm text-cream/80">
          <Link href="/admin" className="underline underline-offset-4">
            Masuk pengurus
          </Link>
        </p>
      </div>
    </footer>
  );
}
