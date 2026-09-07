import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { IkonWhatsApp } from "@/components/Ikon";
import { db } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tentang kami",
  description: "Profil komunitas Dzun Nuun dan cara menghubungi pengurusnya.",
};

export const dynamic = "force-dynamic";

export default async function HalamanTentang() {
  const pengaturan = await (await db()).getSettings();
  const sosial = [
    { url: pengaturan.instagram_url, label: "Instagram" },
    { url: pengaturan.tiktok_url, label: "TikTok" },
    { url: pengaturan.youtube_url, label: "YouTube" },
  ].filter((item): item is { url: string; label: string } => Boolean(item.url));

  return (
    <div className="kolom-isi py-8">
      <Image
        src="/logo-gelap.png"
        alt="Dzun Nuun, masjid virtual"
        width={420}
        height={223}
        sizes="105px"
        className="h-14 w-[105px]"
      />
      <h1 className="mt-4">Tentang Dzun Nuun</h1>
      <Markdown sumber={pengaturan.about_markdown} className="mt-4 max-w-[60ch]" />

      <section className="mt-8">
        <h2>Cara menghubungi kami</h2>
        <p className="mt-2 max-w-[52ch] text-ink-soft">
          App ini dikelola beberapa relawan, jadi balasan tidak selalu langsung. Untuk urusan donasi, sebutkan kode
          donasi Anda supaya lebih cepat kami cocokkan.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {pengaturan.whatsapp_channel_url ? (
            <a
              href={pengaturan.whatsapp_channel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="tombol-utama"
            >
              <IkonWhatsApp />
              Ikuti Saluran WhatsApp
            </a>
          ) : null}
          {sosial.map((item) => (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tombol-kedua"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2>Laporan yang bisa Anda periksa</h2>
        <p className="mt-2 max-w-[52ch]">
          Setiap season punya halaman sendiri berisi angka yang sudah kami terima, dan setiap kegiatan dicatat di Kabar
          Aksi. Season yang sudah selesai tetap bisa dibuka di halaman arsip.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/arsip" className="tombol-kedua">
            Arsip season
          </Link>
          <Link href="/kabar" className="tombol-kedua">
            Kabar Aksi
          </Link>
        </div>
      </section>
    </div>
  );
}
