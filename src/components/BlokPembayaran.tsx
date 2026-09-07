import Image from "next/image";
import SalinTeks from "@/components/SalinTeks";
import { rupiah } from "@/lib/format";
import { IkonUnduh, IkonWhatsApp } from "@/components/Ikon";
import { linkWa } from "@/lib/wa";
import { PLACEHOLDER_WA } from "@/lib/data/seed";

type Props = {
  nominal: number;
  qrisUrl: string | null;
  adminWa: string;
  teksKonfirmasi: string;
};

/** Blok cara bayar yang sama dipakai halaman status donasi dan halaman tiket berbayar. */
export default function BlokPembayaran({ nominal, qrisUrl, adminWa, teksKonfirmasi }: Props) {
  const waSiap = adminWa && adminWa !== PLACEHOLDER_WA;

  return (
    <section className="mt-5">
      <div className="judul-bagian">
        <h2>Cara bayar</h2>
      </div>

      <div className="kartu mt-3 p-4">
        <p className="text-sm text-ink-soft">Transfer persis sampai angka terakhir</p>
        <p className="mt-1 font-[family-name:var(--font-judul)] text-[clamp(1.8rem,8vw,2.4rem)] font-bold leading-none">
          {rupiah(nominal)}
        </p>
        <SalinTeks teks={String(nominal)} label="Salin nominal" labelSelesai="Tersalin" className="mt-3 block" />
        <p className="petunjuk">
          Angka belakangnya sengaja dibedakan supaya pengurus bisa mengenali transfer Anda.
        </p>
      </div>

      {qrisUrl ? (
        <div className="kartu mt-3 p-4">
          <p className="font-semibold">Bayar lewat QRIS</p>
          <Image
            src={qrisUrl}
            alt="Kode QRIS Dzun Nuun"
            width={640}
            height={640}
            sizes="(max-width: 640px) 80vw, 300px"
            className="mt-2 h-auto w-full max-w-[280px] rounded-[8px] border border-garis bg-paper"
          />
          <a href="/api/qris" className="tombol-kedua mt-3">
            <IkonUnduh />
            Unduh QRIS
          </a>
        </div>
      ) : (
        <div className="kartu mt-3 p-4">
          <p className="font-semibold">QRIS belum dipasang</p>
          <p className="petunjuk">Tanyakan cara transfernya lewat tombol WhatsApp di bawah.</p>
        </div>
      )}

      {waSiap ? (
        <a
          href={linkWa(adminWa, teksKonfirmasi)}
          target="_blank"
          rel="noopener noreferrer"
          className="tombol-utama mt-3 w-full"
        >
          <IkonWhatsApp />
          Konfirmasi lewat WhatsApp
        </a>
      ) : (
        <p className="mt-3 rounded-[8px] border border-bahaya bg-paper p-3 text-sm">
          Nomor WhatsApp pengurus masih nilai contoh, jadi tombol konfirmasi belum bisa dipakai.
        </p>
      )}
    </section>
  );
}
