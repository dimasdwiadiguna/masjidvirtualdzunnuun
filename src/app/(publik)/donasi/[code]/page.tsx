import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlokPembayaran from "@/components/BlokPembayaran";
import KartuKabar from "@/components/KartuKabar";
import SalinTeks from "@/components/SalinTeks";
import { IkonWhatsApp } from "@/components/Ikon";
import { db } from "@/lib/data";
import { angka, rupiah, samarkanWa, tanggalPendek } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Status donasi",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ code: string }> };

export default async function StatusDonasi({ params }: Props) {
  const { code } = await params;
  const data = await db();
  const donasi = await data.getDonationByCode(decodeURIComponent(code));
  if (!donasi) notFound();

  const [pengaturan, kabar] = await Promise.all([
    data.getSettings(),
    donasi.status === "verified" ? data.listUpdates({ hanyaTerbit: true, limit: 3 }) : Promise.resolve([]),
  ]);

  const teksKonfirmasi = [
    `Assalamualaikum, saya ${donasi.donor_name}.`,
    "Saya sudah transfer untuk patungan Dzun Nuun.",
    `Kode: ${donasi.code}`,
    `Jumlah: ${donasi.package_count} paket`,
    `Nominal: ${rupiah(donasi.total_amount)}`,
  ].join("\n");

  const label =
    donasi.status === "verified"
      ? { teks: "Sudah diterima", kelas: "bg-sukses/10 text-sukses" }
      : donasi.status === "rejected"
        ? { teks: "Belum cocok", kelas: "bg-bahaya/10 text-bahaya" }
        : { teks: "Menunggu konfirmasi", kelas: "bg-gold-ink/10 text-gold-ink" };

  return (
    <div className="kolom-isi py-6">
      <span className={`label-status ${label.kelas}`}>{label.teks}</span>
      <h1 className="mt-2">
        {donasi.status === "verified"
          ? "Alhamdulillah, donasi Anda sudah kami terima"
          : donasi.status === "rejected"
            ? "Donasi ini belum bisa kami cocokkan"
            : "Menunggu konfirmasi pengurus"}
      </h1>

      <dl className="kartu mt-4 grid gap-2 p-4 text-[0.95rem]">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Kode</dt>
          <dd className="kode-besar">{donasi.code}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Nama</dt>
          <dd className="font-semibold">{donasi.donor_name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">WhatsApp</dt>
          <dd className="font-semibold">{samarkanWa(donasi.whatsapp)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Paket</dt>
          <dd className="font-semibold">{angka(donasi.package_count)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Dicatat</dt>
          <dd className="font-semibold">{tanggalPendek(donasi.created_at)}</dd>
        </div>
      </dl>

      {donasi.status === "pending" ? (
        <>
          <BlokPembayaran
            nominal={donasi.total_amount}
            qrisUrl={pengaturan.qris_image_url}
            adminWa={pengaturan.admin_whatsapp}
            teksKonfirmasi={teksKonfirmasi}
          />
          <p className="mt-4 rounded-[8px] bg-teal/10 px-3 py-2 text-sm">
            Halaman ini berubah sendiri begitu pengurus mencocokkan transfer Anda.
          </p>
        </>
      ) : null}

      {donasi.status === "verified" ? (
        <section className="mt-5">
          <div className="di-gelap blok-gelap rounded-[12px] p-4">
            <p className="font-[family-name:var(--font-judul)] text-[clamp(1.3rem,5.5vw,1.7rem)] font-bold leading-tight">
              {angka(donasi.package_count)} jamaah dirangkul lewat Anda
            </p>
            <p className="mt-1.5 text-sm text-cream/90">
              {rupiah(donasi.total_amount)} sudah masuk hitungan progress di halaman publik.
            </p>
          </div>

          {kabar.length > 0 ? (
            <>
              <div className="judul-bagian mt-6">
                <h2>Yang sedang berjalan</h2>
              </div>
              <div className="mt-3 grid gap-2">
                {kabar.map((item) => (
                  <KartuKabar key={item.id} kabar={item} />
                ))}
              </div>
            </>
          ) : null}

          {pengaturan.whatsapp_channel_url ? (
            <a
              href={pengaturan.whatsapp_channel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="tombol-utama mt-4 w-full"
            >
              <IkonWhatsApp />
              Ikuti Saluran WhatsApp
            </a>
          ) : null}
        </section>
      ) : null}

      {donasi.status === "rejected" ? (
        <section className="mt-5">
          <p className="rounded-[8px] border border-bahaya bg-paper p-3 text-sm">
            Pengurus belum menemukan transfer yang cocok.
            {donasi.admin_note ? ` Catatan: ${donasi.admin_note}` : ""}
          </p>
          <p className="mt-3 text-[0.95rem]">
            Kalau Anda sudah mengirim, hubungi pengurus dengan menyebut kode {donasi.code}.
          </p>
          <Link href="/donasi" className="tombol-kedua mt-3">
            Isi ulang formulir
          </Link>
        </section>
      ) : null}

      <section className="mt-6 border-t border-garis pt-4">
        <h2 className="text-base">Simpan halaman ini</h2>
        <p className="petunjuk">Alamat ini satu-satunya cara membuka kembali status donasi Anda.</p>
        <SalinTeks gunakanUrlSekarang label="Salin link" labelSelesai="Link tersalin" className="mt-2 block" />
      </section>
    </div>
  );
}
