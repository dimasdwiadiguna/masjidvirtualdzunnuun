import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlokPembayaran from "@/components/BlokPembayaran";
import { IkonKalender } from "@/components/Ikon";
import { db } from "@/lib/data";
import { KUKI_TIKET, bacaKodeHasil } from "@/lib/kuki-hasil";
import { rupiah, tanggalDanJam } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pendaftaran terkirim",
  robots: { index: false, follow: false },
};

export default async function AcaraSelesai() {
  const kode = await bacaKodeHasil(KUKI_TIKET);
  const data = await db();
  const tiket = kode ? await data.getRegistrationByCode(kode) : null;

  if (!tiket) {
    return (
      <div className="kolom-isi py-6">
        <h1>Halaman ini sudah lewat</h1>
        <p className="mt-2 text-[0.95rem]">
          Layar ini hanya terbuka sesaat setelah Anda mengirim formulir pendaftaran. Kalau Anda sudah mendaftar, tiket
          dan kodenya kami kirim lewat WhatsApp ke nomor yang Anda isi.
        </p>
        <Link href="/acara" className="tombol-utama mt-4">
          Lihat daftar acara
        </Link>
      </div>
    );
  }

  const [acara, pengaturan] = await Promise.all([data.getEventById(tiket.event_id), data.getSettings()]);
  if (!acara) {
    return (
      <div className="kolom-isi py-6">
        <h1>Acaranya tidak ditemukan</h1>
        <p className="mt-2 text-[0.95rem]">
          Pendaftaran Anda tercatat dengan kode {tiket.code}. Hubungi pengurus lewat WhatsApp dengan menyebut kode itu.
        </p>
      </div>
    );
  }

  const berbayar = tiket.status === "pending";

  const teksKonfirmasi = [
    `Assalamualaikum, saya ${tiket.name}.`,
    `Saya sudah transfer untuk acara ${acara.title}.`,
    `Kode tiket: ${tiket.code}`,
    `Jumlah orang: ${tiket.quantity}`,
    `Nominal: ${rupiah(tiket.total_amount)}`,
  ].join("\n");

  return (
    <div className="kolom-isi py-6">
      <span className={`label-status ${berbayar ? "bg-gold-ink/10 text-gold-ink" : "bg-sukses/10 text-sukses"}`}>
        {berbayar ? "Tinggal bayar" : "Tiket siap dipakai"}
      </span>
      <h1 className="mt-2">{berbayar ? "Pendaftaran terkirim" : "Tiket Anda sudah jadi"}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {acara.title} · {tanggalDanJam(acara.starts_at)}
        {acara.location_name ? ` · ${acara.location_name}` : ""}
      </p>

      <div className="kartu mt-4 p-4 text-center">
        <p className="text-sm text-ink-soft">Kode tiket atas nama {tiket.name}</p>
        <p className="kode-besar mt-1 text-[clamp(1.7rem,8vw,2.2rem)] leading-none">{tiket.code}</p>
        {berbayar ? null : (
          <div className="mt-3 flex justify-center">
            <Image
              src={`/api/qr/${tiket.code}`}
              alt={`Kode QR untuk tiket ${tiket.code}`}
              width={320}
              height={320}
              unoptimized
              className="h-[220px] w-[220px] rounded-[8px]"
            />
          </div>
        )}
        <p className="petunjuk">{tiket.quantity} orang</p>
      </div>

      {berbayar ? (
        <BlokPembayaran
          nominal={tiket.total_amount}
          qrisUrl={pengaturan.qris_image_url}
          adminWa={pengaturan.admin_whatsapp}
          teksKonfirmasi={teksKonfirmasi}
        />
      ) : null}

      <div className="kartu mt-5 bg-cream p-4">
        <h2 className="text-base">Selanjutnya lewat WhatsApp</h2>
        <p className="petunjuk">
          {berbayar
            ? "Setelah pengurus mencocokkan transfer Anda, tiket berikut kode QR-nya kami kirim ke nomor WhatsApp yang Anda isi. Simpan kodenya, itu yang dipakai saat check-in."
            : "Kode dan QR ini juga kami kirim ke nomor WhatsApp yang Anda isi, jadi tidak perlu menyimpan halaman ini. Kalau QR tidak terbaca, panitia bisa mengetik kodenya."}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <a href={`/acara/${acara.slug}/kalender.ics`} className="tombol-kedua">
          <IkonKalender />
          Tambah ke kalender
        </a>
        <Link href={`/acara/${acara.slug}`} className="tombol-kedua">
          Halaman acara
        </Link>
      </div>
    </div>
  );
}
