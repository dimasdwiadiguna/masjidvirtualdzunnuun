import type { Metadata } from "next";
import Link from "next/link";
import FormDonasi from "@/components/FormDonasi";
import { db } from "@/lib/data";
import { rupiah } from "@/lib/format";

export const metadata: Metadata = {
  title: "Ikut patungan",
  description: "Isi nama, nomor WhatsApp, dan jumlah paket untuk ikut patungan Dzun Nuun.",
};

export const dynamic = "force-dynamic";

export default async function HalamanDonasi() {
  const season = await (await db()).getActiveSeason();

  if (!season) {
    return (
      <div className="kolom-isi py-8">
        <h1>Ikut patungan</h1>
        <p className="mt-3 text-ink-soft">
          Belum ada season patungan yang berjalan, jadi formulirnya belum dibuka. Kabar season berikutnya akan kami tulis
          di Kabar Aksi.
        </p>
        <Link href="/kabar" className="tombol-kedua mt-4">
          Baca Kabar Aksi
        </Link>
      </div>
    );
  }

  return (
    <div className="kolom-isi py-8">
      <h1>Ikut patungan</h1>
      <p className="mt-3 max-w-[46ch]">
        1 paket = {rupiah(season.package_price)} = biaya merangkul satu jamaah yang singgah ke masjid, agar amal
        ibadahnya mengalir.
      </p>
      <FormDonasi hargaPaket={season.package_price} />
    </div>
  );
}
