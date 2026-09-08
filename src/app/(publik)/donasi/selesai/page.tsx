import type { Metadata } from "next";
import Link from "next/link";
import BlokPembayaran from "@/components/BlokPembayaran";
import { db } from "@/lib/data";
import { KUKI_DONASI, bacaKodeHasil } from "@/lib/kuki-hasil";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Donasi terkirim",
  robots: { index: false, follow: false },
};

export default async function DonasiSelesai() {
  const kode = await bacaKodeHasil(KUKI_DONASI);
  const data = await db();
  const donasi = kode ? await data.getDonationByCode(kode) : null;

  if (!donasi) {
    return (
      <div className="kolom-isi py-6">
        <h1>Halaman ini sudah lewat</h1>
        <p className="mt-2 text-[0.95rem]">
          Layar ini hanya terbuka sesaat setelah Anda mengirim formulir. Kalau Anda sudah mengirim donasi, kabar
          penerimaannya kami kirim lewat WhatsApp ke nomor yang Anda isi.
        </p>
        <Link href="/donasi" className="tombol-utama mt-4">
          Isi formulir patungan
        </Link>
      </div>
    );
  }

  const pengaturan = await data.getSettings();

  const teksKonfirmasi = [
    `Assalamualaikum, saya ${donasi.donor_name}.`,
    "Saya sudah transfer untuk patungan Dzun Nuun.",
    `Kode: ${donasi.code}`,
    `Jumlah: ${donasi.package_count} paket`,
    `Nominal: ${rupiah(donasi.total_amount)}`,
  ].join("\n");

  return (
    <div className="kolom-isi py-6">
      <span className="label-status bg-gold-ink/10 text-gold-ink">Tinggal transfer</span>
      <h1 className="mt-2">Terima kasih, tinggal satu langkah</h1>
      <p className="mt-2 text-[0.95rem]">
        Transfer dengan nominal persis di bawah ini. Angka belakangnya yang membedakan donasi Anda dari yang lain, jadi
        jangan dibulatkan.
      </p>

      <BlokPembayaran
        nominal={donasi.total_amount}
        qrisUrl={pengaturan.qris_image_url}
        adminWa={pengaturan.admin_whatsapp}
        teksKonfirmasi={teksKonfirmasi}
      />

      <div className="kartu mt-5 bg-cream p-4">
        <h2 className="text-base">Selanjutnya lewat WhatsApp</h2>
        <p className="petunjuk">
          Begitu pengurus mencocokkan transfer Anda, kabar penerimaannya kami kirim ke nomor WhatsApp yang Anda isi
          tadi. Tidak perlu menyimpan halaman ini. Kode donasi Anda {donasi.code}, sebut itu kalau perlu bertanya.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/kabar" className="tombol-kedua">
          Baca Laporan Kegiatan
        </Link>
        <Link href="/" className="tombol-kedua">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
