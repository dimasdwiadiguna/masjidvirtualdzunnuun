import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { IkonWhatsApp } from "@/components/Ikon";
import { pengaturanPublik } from "@/lib/cache";

export const metadata: Metadata = {
  title: "Tentang kami",
  description: "Profil komunitas Dzun Nuun dan cara menghubungi pengurusnya.",
};

export const dynamic = "force-dynamic";

export default async function HalamanTentang() {
  const pengaturan = await pengaturanPublik();
  const sosial = [
    { url: pengaturan.instagram_url, label: "Instagram" },
    { url: pengaturan.tiktok_url, label: "TikTok" },
    { url: pengaturan.youtube_url, label: "YouTube" },
  ].filter((item): item is { url: string; label: string } => Boolean(item.url));

  return (
    <div className="kolom-isi py-6">
      <Image
        src="/logo-gelap.png"
        alt="Dzun Nuun, masjid virtual"
        width={420}
        height={223}
        sizes="96px"
        className="h-[50px] w-[96px]"
      />
      <h1 className="mt-3">Tentang Dzun Nuun</h1>
      <Markdown sumber={pengaturan.about_markdown} className="mt-3" />

      <section className="mt-7">
        <div className="judul-bagian">
          <h2>Hubungi kami</h2>
        </div>
        <p className="mt-2 text-[0.95rem] text-ink-soft">
          Untuk urusan donasi, sebutkan kode donasi Anda supaya cepat kami cocokkan.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {pengaturan.whatsapp_channel_url ? (
            <a href={pengaturan.whatsapp_channel_url} target="_blank" rel="noopener noreferrer" className="tombol-utama">
              <IkonWhatsApp />
              Saluran WhatsApp
            </a>
          ) : null}
          {sosial.map((item) => (
            <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer" className="tombol-kedua">
              {item.label}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="judul-bagian">
          <h2>Laporan yang bisa diperiksa</h2>
        </div>
        <p className="mt-2 text-[0.95rem]">
          Setiap season punya halaman sendiri, dan setiap kegiatan dicatat di Laporan Kegiatan.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/arsip" className="tombol-kedua">
            Arsip season
          </Link>
          <Link href="/kabar" className="tombol-kedua">
            Laporan Kegiatan
          </Link>
        </div>
      </section>
    </div>
  );
}
