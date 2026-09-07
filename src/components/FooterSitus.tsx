import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/data";
import { SEED_SETTINGS } from "@/lib/data/seed";
import { denganBatasWaktu } from "@/lib/waktu";
import { IkonWhatsApp } from "./Ikon";
import type { Settings } from "@/lib/data/types";

const HALAMAN = [
  { href: "/donasi", label: "Ikut patungan" },
  { href: "/kabar", label: "Kabar Aksi" },
  { href: "/acara", label: "Acara" },
  { href: "/arsip", label: "Arsip" },
  { href: "/tentang", label: "Tentang" },
];

/**
 * Footer ikut dirender di setiap halaman lewat layout. Galat di dalam layout
 * tidak bisa ditangkap error boundary halaman, jadi kegagalan membaca database
 * di sini akan mematikan seluruh situs. Karena itu bacaannya dijaga: kalau
 * gagal, footer tetap tampil dengan nilai bawaan dan tanpa tautan sosial.
 */
async function ambilPengaturan(): Promise<Settings> {
  try {
    return await denganBatasWaktu((await db()).getSettings(), 5000);
  } catch (galat) {
    console.error("Footer gagal membaca pengaturan", galat);
    return { ...SEED_SETTINGS, instagram_url: null };
  }
}

export default async function FooterSitus() {
  const pengaturan = await ambilPengaturan();
  const sosial = [
    { url: pengaturan.instagram_url, label: "Instagram" },
    { url: pengaturan.tiktok_url, label: "TikTok" },
    { url: pengaturan.youtube_url, label: "YouTube" },
  ].filter((item): item is { url: string; label: string } => Boolean(item.url));

  return (
    <footer className="di-gelap blok-gelap mt-10">
      <div className="kolom-lebar py-7">
        <Image
          src="/logo-terang.png"
          alt="Dzun Nuun, masjid virtual"
          width={304}
          height={159}
          sizes="72px"
          className="h-[38px] w-[72px]"
        />
        <p className="mt-2 max-w-[32ch] text-sm text-cream/90">
          Teman Beriman dan Bertumbuh. Dikelola relawan untuk Masjid Fathul Ummah.
        </p>

        {pengaturan.whatsapp_channel_url ? (
          <a
            href={pengaturan.whatsapp_channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="tombol-utama mt-4"
          >
            <IkonWhatsApp />
            Ikuti Saluran WhatsApp
          </a>
        ) : null}

        <nav aria-label="Peta halaman" className="mt-5">
          <ul className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
            {HALAMAN.map((halaman) => (
              <li key={halaman.href}>
                <Link
                  href={halaman.href}
                  className="inline-flex min-h-[40px] items-center text-cream underline underline-offset-4"
                >
                  {halaman.label}
                </Link>
              </li>
            ))}
            {sosial.map((item) => (
              <li key={item.label}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center text-gold underline underline-offset-4"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/admin" className="inline-flex min-h-[40px] items-center text-cream/80 underline underline-offset-4">
                Masuk pengurus
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
