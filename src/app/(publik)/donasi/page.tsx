import type { Metadata } from "next";
import Link from "next/link";
import FormDonasi from "@/components/FormDonasi";
import { seasonAktif } from "@/lib/cache";
import { rupiah } from "@/lib/format";

export const metadata: Metadata = {
  title: "Ikut donasi",
  description: "Isi nama, nomor WhatsApp, dan jumlah paket untuk ikut donasi Dzun Nuun.",
};

export const dynamic = "force-dynamic";

export default async function HalamanDonasi() {
  const season = await seasonAktif();

  if (!season) {
    return (
      <div className="kolom-isi py-6">
        <h1>Ikut donasi</h1>
        <p className="mt-2 text-ink-soft">Belum ada patungan yang berjalan.</p>
        <Link href="/kabar" className="tombol-kedua mt-4">
          Baca Laporan Kegiatan
        </Link>
      </div>
    );
  }

  return (
    <div className="kolom-isi py-6">
      <h1>Ikut donasi</h1>
      <p className="mt-2 text-[0.98rem] text-ink-soft">
        1 paket {rupiah(season.package_price)} untuk merangkul satu jamaah yang singgah ke masjid.
      </p>
      <FormDonasi hargaPaket={season.package_price} />
    </div>
  );
}
