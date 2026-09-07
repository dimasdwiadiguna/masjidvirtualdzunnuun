import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlokPembayaran from "@/components/BlokPembayaran";
import QrTiket from "@/components/QrTiket";
import SalinTeks from "@/components/SalinTeks";
import { IkonKalender } from "@/components/Ikon";
import { db } from "@/lib/data";
import { rupiah, samarkanWa, tanggalDanJam } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tiket acara",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ code: string }> };

export default async function HalamanTiket({ params }: Props) {
  const { code } = await params;
  const data = await db();
  const tiket = await data.getRegistrationByCode(decodeURIComponent(code));
  if (!tiket) notFound();

  const [acara, pengaturan] = await Promise.all([data.getEventById(tiket.event_id), data.getSettings()]);
  if (!acara) notFound();

  const teksKonfirmasi = [
    `Assalamualaikum, saya ${tiket.name}.`,
    `Saya sudah transfer untuk acara ${acara.title}.`,
    `Kode tiket: ${tiket.code}`,
    `Jumlah orang: ${tiket.quantity}`,
    `Nominal: ${rupiah(tiket.total_amount)}`,
  ].join("\n");

  const label =
    tiket.status === "checked_in"
      ? "Sudah hadir, terima kasih"
      : tiket.status === "confirmed"
        ? "Tiket siap dipakai"
        : tiket.status === "pending"
          ? "Menunggu konfirmasi pembayaran"
          : "Tiket dibatalkan";

  return (
    <div className="kolom-isi py-8">
      <p className="text-sm text-ink-soft">Tiket acara</p>
      <h1 className="mt-1">{acara.title}</h1>
      <p className="mt-2 text-ink-soft">{tanggalDanJam(acara.starts_at)}</p>
      {acara.location_name ? <p className="text-ink-soft">{acara.location_name}</p> : null}

      <div className="kartu bayang-padat mt-5 p-4">
        <p className="font-semibold text-ink-soft">{label}</p>
        <p className="mt-2 font-[family-name:var(--font-judul)] text-[clamp(1.9rem,9vw,2.6rem)] font-bold leading-none tracking-wide">
          {tiket.code}
        </p>
        <p className="mt-2 text-[0.95rem]">
          Atas nama {tiket.name}, {tiket.quantity} orang. Nomor WhatsApp {samarkanWa(tiket.whatsapp)}.
        </p>
        {tiket.status === "confirmed" || tiket.status === "checked_in" ? <QrTiket kode={tiket.code} /> : null}
        <p className="mt-3 text-[0.95rem] text-ink-soft">
          Tunjukkan kode ini di meja panitia. Kalau kameranya bermasalah, panitia bisa mengetik kodenya.
        </p>
      </div>

      {tiket.status === "pending" ? (
        <BlokPembayaran
          nominal={tiket.total_amount}
          qrisUrl={pengaturan.qris_image_url}
          adminWa={pengaturan.admin_whatsapp}
          teksKonfirmasi={teksKonfirmasi}
        />
      ) : null}

      {tiket.status === "cancelled" ? (
        <p className="mt-5 rounded-[4px] border-2 border-bahaya bg-paper p-3">
          Tiket ini dibatalkan pengurus. Kalau menurut Anda keliru, hubungi pengurus dengan menyebut kode {tiket.code}.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={`/acara/${acara.slug}/kalender.ics`} className="tombol-kedua">
          <IkonKalender />
          Tambah ke kalender
        </a>
        <Link href={`/acara/${acara.slug}`} className="tombol-kedua">
          Buka halaman acara
        </Link>
      </div>

      <section className="mt-8 border-t-2 border-ink-soft pt-5">
        <h2 className="text-[1.15rem]">Simpan halaman ini</h2>
        <p className="mt-1 text-[0.98rem] text-ink-soft">
          Alamat halaman ini yang menyimpan kode tiket Anda. Simpan di catatan atau kirim ke diri sendiri lewat
          WhatsApp.
        </p>
        <SalinTeks gunakanUrlSekarang label="Salin link tiket" labelSelesai="Link tersalin" className="mt-3 block" />
      </section>
    </div>
  );
}
