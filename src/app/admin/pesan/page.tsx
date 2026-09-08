import type { Metadata } from "next";
import SalinTeks from "@/components/SalinTeks";
import { db } from "@/lib/data";
import {
  pesanDonasiBelumCocok,
  pesanDonasiDiterima,
  pesanPembayaranTiketDiterima,
  pesanPengingatAcara,
  pesanTiketSiap,
} from "@/lib/pesan-wa";

export const metadata: Metadata = { title: "Pesan WhatsApp", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Contoh dibuat dari data isian, bukan data jamaah sungguhan. Halaman ini
 * dibuka untuk melihat kata-katanya, bukan untuk mengirim.
 */
const CONTOH_DONASI = {
  nama: "Budi",
  kode: "DZN-4K7P",
  nominal: 150284,
  paket: 10,
  catatan: "belum ada transfer masuk dengan nominal ini sampai hari Rabu",
};

const CONTOH_TIKET = {
  nama: "Sari",
  kode: "DZN-9F2M",
  acara: "Kelas menulis dakwah",
  mulai: new Date(Date.now() + 86400000).toISOString(),
  lokasi: "Aula Masjid Fathul Ummah",
  jumlah: 2,
  nominal: 50284,
};

export default async function AdminPesan() {
  const season = await (await db()).getActiveSeason();
  const donasi = { ...CONTOH_DONASI, slugSeason: season?.slug ?? null };

  const daftar = [
    {
      judul: "Donasi sudah diterima",
      kapan: "Dikirim setelah Anda menekan Verifikasi di menu Donasi.",
      teks: pesanDonasiDiterima(donasi),
    },
    {
      judul: "Donasi belum bisa dicocokkan",
      kapan:
        "Dikirim setelah Anda menekan Tolak. Catatan yang Anda tulis di kotak konfirmasi ikut masuk ke pesan ini, jadi tulis alasannya dengan bahasa yang enak dibaca.",
      teks: pesanDonasiBelumCocok(donasi),
    },
    {
      judul: "Tiket gratis siap dipakai",
      kapan: "Dikirim begitu ada yang mendaftar acara gratis.",
      teks: pesanTiketSiap(CONTOH_TIKET),
    },
    {
      judul: "Pembayaran tiket sudah diterima",
      kapan: "Dikirim setelah Anda menekan Konfirmasi pembayaran di menu Pendaftar.",
      teks: pesanPembayaranTiketDiterima(CONTOH_TIKET),
    },
    {
      judul: "Pengingat sehari sebelum acara",
      kapan: "Dikirim manual sehari sebelum hari H, satu per satu dari menu Pendaftar.",
      teks: pesanPengingatAcara(CONTOH_TIKET),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Pesan WhatsApp</h1>
      <p className="mt-1 text-ink-soft">
        Jamaah tidak punya halaman status. Semua kabar penerimaan dan tiket sampai lewat WhatsApp, dikirim Anda
        sendiri. Ini kata-kata yang dipakai.
      </p>

      <div className="kartu mt-5 bg-cream p-4">
        <h2 className="text-base">Tidak perlu menyalin dari sini</h2>
        <p className="petunjuk">
          Tombol WhatsApp di menu Donasi dan Pendaftar sudah membuka WhatsApp dengan teks yang persis sama, sudah
          terisi nama, kode, dan nominal orangnya. Halaman ini untuk melihat kata-katanya, atau menyalin kalau Anda mau
          mengirim dari perangkat lain.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {daftar.map((item) => (
          <section key={item.judul} className="kartu p-4">
            <h2 className="text-[1.05rem]">{item.judul}</h2>
            <p className="petunjuk">{item.kapan}</p>
            <pre className="mt-3 whitespace-pre-wrap break-words rounded-[8px] bg-cream p-3 font-[family-name:var(--font-isi)] text-[0.9rem]">
              {item.teks}
            </pre>
            <SalinTeks teks={item.teks} label="Salin pesan" labelSelesai="Pesan tersalin" className="mt-3 block" />
          </section>
        ))}
      </div>

      <div className="kartu mt-6 p-4">
        <h2 className="text-base">Kenapa tidak terkirim otomatis</h2>
        <p className="petunjuk">
          Alur manual ini disengaja. Pengiriman otomatis butuh WhatsApp Business API berbayar dan nomor terdaftar, dan
          pesan dari pengurus sungguhan lebih dipercaya jamaah daripada pesan robot. Anda tetap bisa mengubah kalimatnya
          di WhatsApp sebelum menekan kirim.
        </p>
      </div>
    </div>
  );
}
