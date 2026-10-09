import type { Metadata } from "next";
import { headers } from "next/headers";
import KartuKehadiran, { KartuTidakDitemukan } from "@/components/KartuKehadiran";
import { db } from "@/lib/data";
import { BENTUK_NOMOR_JAMAAH } from "@/lib/kode";
import { ipDari, lewatBatas } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kartu kehadiran",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ nomor: string }> };

/**
 * Nomor jamaah pendek sengaja mudah ditebak: cuma 4 angka, dan itu memang
 * tujuannya supaya bisa dibacakan di depan pintu. Yang dijaga bukan nomornya,
 * melainkan dua hal lain.
 *
 * Pertama, kartunya tidak memuat apa pun yang rahasia: nama depan, jumlah
 * kehadiran, dan jumlah menang kuis. Nomor WhatsApp tidak pernah ikut keluar,
 * sesuai BRIEF §7.
 *
 * Kedua, yang dibatasi per IP hanya nomor yang salah, bukan tiap kunjungan.
 * Jamaah boleh membuka kartunya sendiri sesering apa pun. Alasannya sama
 * dengan D-17 pada percobaan masuk pengurus: yang dihitung hanya yang gagal.
 *
 * Batasnya dibuat tinggi, 30 kali salah per sepuluh menit, dengan alasan yang
 * sama seperti D-16: di Indonesia banyak jamaah berbagi satu alamat IP lewat
 * jaringan seluler, jadi batas yang ketat akan mengunci orang yang cuma salah
 * ketik. Tiga puluh kali salah dari satu IP bukan lagi salah ketik, dan
 * menyapu 9.000 nomor berhenti jauh sebelum selesai. Yang terkena batas pun
 * tidak kehilangan kartunya: tautan panjang dari WhatsApp tidak lewat sini.
 */
const BATAS_SALAH = 30;
const JENDELA_DETIK = 600;

export default async function KartuLewatNomor({ params }: Props) {
  const { nomor } = await params;
  const ip = ipDari(await headers());
  const kunci = `jamaah:${ip}`;

  // Diperiksa tanpa dicatat lebih dulu, supaya pengunjung yang sudah kena batas
  // tidak terus menambah hitungannya sendiri.
  if (lewatBatas(kunci, BATAS_SALAH, JENDELA_DETIK, false)) {
    return (
      <KartuTidakDitemukan
        judul="Terlalu banyak nomor yang dicoba"
        penjelasan="Dari jaringan ini sudah puluhan kali dicoba nomor yang tidak ada, jadi pencarian nomor dijeda sekitar sepuluh menit. Tautan kartu yang dikirim pengurus lewat WhatsApp tetap bisa dibuka sekarang. Kalau nomor Anda lupa, tanyakan ke pengurus Dzun Nuun."
      />
    );
  }

  const kartu = BENTUK_NOMOR_JAMAAH.test(nomor) ? await (await db()).kartuLewatNomor(nomor) : null;

  if (!kartu) {
    lewatBatas(kunci, BATAS_SALAH, JENDELA_DETIK);
    return (
      <KartuTidakDitemukan
        judul="Nomor jamaah ini belum ada"
        penjelasan="Periksa lagi angkanya. Nomor jamaah terdiri dari 4 angka dan diberikan pengurus setelah Anda pertama kali check-in di acara. Belum pernah ikut acara? Nomornya memang belum terbit."
      />
    );
  }

  return <KartuKehadiran kartu={kartu} />;
}
