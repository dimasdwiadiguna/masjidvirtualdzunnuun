import type { Metadata } from "next";
import { headers } from "next/headers";
import KartuKehadiran, { KartuTidakDitemukan } from "@/components/KartuKehadiran";
import { db } from "@/lib/data";
import { BENTUK_KODE_JAMAAH } from "@/lib/kode";
import { ipDari, lewatBatas } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kartu kehadiran",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ kode: string }> };

/**
 * Kode jamaah pendek memang dibuat untuk dibacakan di depan pintu, jadi
 * panjangnya terbatas. Ruang tebakannya 270.848, cukup untuk membuat
 * coba-coba tidak menghasilkan apa-apa, tetapi bukan angka yang bisa disebut
 * mustahil disapu. Jadi yang dijaga tiga lapis, bukan panjang kodenya saja.
 *
 * Pertama, kartunya tidak memuat apa pun yang rahasia: nama depan, jumlah
 * kehadiran, dan jumlah menang kuis. Nomor WhatsApp tidak pernah ikut keluar,
 * sesuai BRIEF §7.
 *
 * Kedua, yang dibatasi per IP hanya kode yang salah, bukan tiap kunjungan.
 * Jamaah boleh membuka kartunya sendiri sesering apa pun. Alasannya sama
 * dengan D-17 pada percobaan masuk pengurus: yang dihitung hanya yang gagal.
 *
 * Ketiga, batasnya dibuat tinggi, 30 kali salah per sepuluh menit, dengan
 * alasan yang sama seperti D-16: di Indonesia banyak jamaah berbagi satu
 * alamat IP lewat jaringan seluler, jadi batas yang ketat akan mengunci orang
 * yang cuma salah ketik. Dengan batas ini satu IP butuh lebih dari dua bulan
 * untuk menyapu seluruh ruang kode, dan yang terkena batas pun tidak
 * kehilangan kartunya: tautan panjang dari WhatsApp tidak lewat sini.
 */
const BATAS_SALAH = 30;
const JENDELA_DETIK = 600;

export default async function KartuLewatKode({ params }: Props) {
  const { kode } = await params;
  const ip = ipDari(await headers());
  const kunci = `jamaah:${ip}`;

  // Diperiksa tanpa dicatat lebih dulu, supaya pengunjung yang sudah kena batas
  // tidak terus menambah hitungannya sendiri.
  if (lewatBatas(kunci, BATAS_SALAH, JENDELA_DETIK, false)) {
    return (
      <KartuTidakDitemukan
        judul="Terlalu banyak kode yang dicoba"
        penjelasan="Dari jaringan ini sudah puluhan kali dicoba kode yang tidak ada, jadi pencarian kode dijeda sekitar sepuluh menit. Tautan kartu yang dikirim pengurus lewat WhatsApp tetap bisa dibuka sekarang. Kalau kode Anda lupa, tanyakan ke pengurus Dzun Nuun."
      />
    );
  }

  // Jamaah mengetik kodenya sendiri di bilah alamat, dan HP Android sering
  // mengirimnya huruf kecil. Dirapikan dulu, baru dicari.
  const bersih = decodeURIComponent(kode).trim().toUpperCase();
  const kartu = BENTUK_KODE_JAMAAH.test(bersih) ? await (await db()).kartuLewatKode(bersih) : null;

  if (!kartu) {
    lewatBatas(kunci, BATAS_SALAH, JENDELA_DETIK);
    return (
      <KartuTidakDitemukan
        judul="Kode jamaah ini belum ada"
        penjelasan="Periksa lagi hurufnya. Kode jamaah selalu dua huruf lalu tiga angka, misalnya KM472, dan diberikan pengurus setelah Anda pertama kali check-in di acara. Belum pernah ikut acara? Kodenya memang belum terbit."
      />
    );
  }

  return <KartuKehadiran kartu={kartu} />;
}
