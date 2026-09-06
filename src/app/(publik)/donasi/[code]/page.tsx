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
    donasi.status === "verified"
      ? data.listUpdates({ hanyaTerbit: true, limit: 3 })
      : Promise.resolve([]),
  ]);

  const teksKonfirmasi = [
    `Assalamualaikum, saya ${donasi.donor_name}.`,
    `Saya sudah transfer untuk patungan Dzun Nuun.`,
    `Kode: ${donasi.code}`,
    `Jumlah: ${donasi.package_count} paket`,
    `Nominal: ${rupiah(donasi.total_amount)}`,
  ].join("\n");

  return (
    <div className="kolom-isi py-8">
      <p className="text-sm text-ink-soft">Halaman donasi Anda</p>
      <h1 className="mt-1">
        {donasi.status === "verified"
          ? "Alhamdulillah, donasi Anda sudah kami terima"
          : donasi.status === "rejected"
            ? "Donasi ini belum bisa kami cocokkan"
            : "Menunggu konfirmasi pengurus"}
      </h1>

      <dl className="kartu mt-4 grid gap-2 p-4 text-[0.98rem]">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Kode</dt>
          <dd className="badge-kode">{donasi.code}</dd>
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
          <dt className="text-ink-soft">Jumlah paket</dt>
          <dd className="font-semibold">{angka(donasi.package_count)} paket</dd>
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
          <p className="mt-4 rounded-[4px] border-l-4 border-teal bg-paper p-3">
            Status sekarang: menunggu konfirmasi. Pengurus mencocokkan transfer satu per satu, biasanya dalam hitungan
            jam. Halaman ini berubah sendiri begitu donasi Anda tercatat masuk.
          </p>
        </>
      ) : null}

      {donasi.status === "verified" ? (
        <section className="mt-6">
          <div className="di-gelap blok-gelap bayang-padat rounded-[10px] border-2 border-ink p-5">
            <p className="font-[family-name:var(--font-judul)] text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight">
              {angka(donasi.package_count)} jamaah dirangkul lewat Anda
            </p>
            <p className="mt-2 text-cream/90">
              Terima kasih. {rupiah(donasi.total_amount)} sudah kami terima dan masuk hitungan progress di halaman
              publik. Kami laporkan penggunaannya lewat Kabar Aksi.
            </p>
          </div>

          {kabar.length > 0 ? (
            <>
              <h2 className="mt-6">Yang sedang berjalan</h2>
              <div className="mt-3 grid gap-3">
                {kabar.map((item) => (
                  <KartuKabar key={item.id} kabar={item} />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-ink-soft">
              Catatan kegiatan pertama belum ditulis. Begitu ada, kabarnya muncul di halaman Kabar Aksi.
            </p>
          )}

          {pengaturan.whatsapp_channel_url ? (
            <a
              href={pengaturan.whatsapp_channel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="tombol-utama mt-5 w-full"
            >
              <IkonWhatsApp />
              Ikuti Saluran WhatsApp kami
            </a>
          ) : null}
        </section>
      ) : null}

      {donasi.status === "rejected" ? (
        <section className="mt-6">
          <p className="rounded-[4px] border-2 border-bahaya bg-paper p-3">
            Pengurus menandai donasi ini belum bisa dicocokkan dengan transfer yang masuk.
            {donasi.admin_note ? ` Catatan pengurus: ${donasi.admin_note}` : ""}
          </p>
          <p className="mt-3">
            Kalau Anda merasa sudah mengirim, hubungi pengurus lewat WhatsApp dengan menyebut kode {donasi.code}. Kami
            cek ulang.
          </p>
          <Link href="/donasi" className="tombol-kedua mt-4">
            Isi ulang formulir patungan
          </Link>
        </section>
      ) : null}

      <section className="mt-8 border-t-2 border-ink-soft pt-5">
        <h2 className="text-[1.15rem]">Simpan halaman ini</h2>
        <p className="mt-1 text-[0.98rem] text-ink-soft">
          Alamat halaman ini satu-satunya cara membuka kembali status donasi Anda. Simpan di catatan atau kirim ke diri
          sendiri lewat WhatsApp.
        </p>
        <SalinTeks
          gunakanUrlSekarang
          label="Salin link halaman ini"
          labelSelesai="Link tersalin"
          className="mt-3 block"
        />
      </section>
    </div>
  );
}
