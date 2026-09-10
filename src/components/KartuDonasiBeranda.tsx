import Image from "next/image";
import Link from "next/link";
import ProgressSeason from "@/components/ProgressSeason";
import { judulSeason, rupiah } from "@/lib/format";
import type { Season, SeasonProgress } from "@/lib/data/types";

type Props = { season: Season; progress: SeasonProgress };

/**
 * Kartu donasi di beranda.
 *
 * Judul season ikut tampil karena judul itulah yang membentuk niat orang untuk
 * ikut: sebuah judul mengajak dengan cara yang tidak bisa dilakukan angka.
 * Urutan bacaannya jadi patungan yang mana, sudah sejauh mana, berapa
 * ongkosnya, lalu ikut.
 *
 * Kepalanya hanya dirender kalau season sudah punya judul. Selama judulnya
 * masih kosong, kartu ini tampil persis seperti sebelumnya, berikut label
 * "Donasi berjalan" di tempat lamanya.
 *
 * Judulnya ditaruh di bawah foto, bukan di atasnya. Menaruh teks di atas foto
 * menuntut lapisan gelap, dan lapisan yang cukup gelap untuk meloloskan kontras
 * pada foto paling terang ternyata menutupi hampir seluruh fotonya. Fotonya
 * dipasang justru supaya terlihat.
 *
 * Ini bukan prop tambahan di ProgressSeason: halaman season sudah merender
 * judul dan gambar headernya sendiri, dan panel pengurus tidak perlu keduanya.
 * Yang berbeda tinggal komposisinya, jadi komposisinya yang dipisah.
 */
export default function KartuDonasiBeranda({ season, progress }: Props) {
  const berjudul = Boolean(season.title?.trim());

  return (
    <div className="kartu p-4">
      {berjudul ? (
        <div className="mb-4">
          {season.header_image_url ? (
            // Tinggi dipasang pasti supaya tata letak tidak bergeser saat
            // gambarnya datang, dan latarnya sudah gelap sejak awal supaya
            // tidak ada kedipan putih sebelum gambarnya termuat.
            <div className="relative mb-3 h-[96px] overflow-hidden rounded-[8px] bg-teal-deep sm:h-[140px]">
              <Image
                src={season.header_image_url}
                alt=""
                fill
                // Tanpa priority: elemen LCP beranda adalah foto hero di
                // atasnya, dan permintaan ketiga akan berebut giliran pertama
                // di jaringan seluler. Band ini ada di dalam layar awal, jadi
                // tetap eager, hanya dengan giliran yang lebih belakang.
                loading="eager"
                fetchPriority="low"
                quality={70}
                sizes="(max-width: 880px) calc(100vw - 64px), 816px"
                className="object-cover"
              />
            </div>
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-ink">Donasi berjalan</p>
          {/* Tanpa tagline. Judulnya sudah cukup membawa niatnya, dan dua baris
              tambahan di sini mendorong tombol "Ikut donasi" keluar dari layar
              pertama di HP 360x640. Taglinenya tetap ada di halaman season. */}
          <h2 className="mt-0.5 line-clamp-2 text-[1.05rem] leading-tight">{judulSeason(season)}</h2>
        </div>
      ) : null}

      <ProgressSeason
        season={season}
        progress={progress}
        label={berjudul ? undefined : "Donasi berjalan"}
        berhitung
      />

      <Link href="/donasi" className="tombol-utama mt-4 w-full">
        Ikut donasi
      </Link>
      <p className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-ink-soft">1 paket {rupiah(season.package_price)}, satu jamaah dirangkul.</span>
        <Link href={`/season/${season.slug}`} className="font-semibold text-teal-ink underline underline-offset-4">
          Rincian season
        </Link>
      </p>
    </div>
  );
}
