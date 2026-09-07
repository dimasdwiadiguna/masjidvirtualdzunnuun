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
      ? { teks: "Sudah hadir", kelas: "bg-sukses/10 text-sukses" }
      : tiket.status === "confirmed"
        ? { teks: "Tiket siap dipakai", kelas: "bg-sukses/10 text-sukses" }
        : tiket.status === "pending"
          ? { teks: "Menunggu pembayaran", kelas: "bg-gold-ink/10 text-gold-ink" }
          : { teks: "Dibatalkan", kelas: "bg-bahaya/10 text-bahaya" };

  return (
    <div className="kolom-isi py-6">
      <span className={`label-status ${label.kelas}`}>{label.teks}</span>
      <h1 className="mt-2">{acara.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {tanggalDanJam(acara.starts_at)}
        {acara.location_name ? ` · ${acara.location_name}` : ""}
      </p>

      <div className="kartu mt-4 p-4 text-center">
        <p className="text-sm text-ink-soft">Tunjukkan kode ini di meja panitia</p>
        <p className="kode-besar mt-1 text-[clamp(1.7rem,8vw,2.2rem)] leading-none">{tiket.code}</p>
        {tiket.status === "confirmed" || tiket.status === "checked_in" ? (
          <div className="mt-3 flex justify-center">
            <QrTiket kode={tiket.code} />
          </div>
        ) : null}
        <p className="petunjuk">
          Atas nama {tiket.name}, {tiket.quantity} orang, {samarkanWa(tiket.whatsapp)}.
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
        <p className="mt-4 rounded-[8px] border border-bahaya bg-paper p-3 text-sm">
          Tiket ini dibatalkan pengurus. Hubungi pengurus dengan menyebut kode {tiket.code}.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <a href={`/acara/${acara.slug}/kalender.ics`} className="tombol-kedua">
          <IkonKalender />
          Tambah ke kalender
        </a>
        <Link href={`/acara/${acara.slug}`} className="tombol-kedua">
          Halaman acara
        </Link>
      </div>

      <section className="mt-6 border-t border-garis pt-4">
        <h2 className="text-base">Simpan halaman ini</h2>
        <p className="petunjuk">Alamat ini yang menyimpan kode tiket Anda.</p>
        <SalinTeks gunakanUrlSekarang label="Salin link" labelSelesai="Link tersalin" className="mt-2 block" />
      </section>
    </div>
  );
}
