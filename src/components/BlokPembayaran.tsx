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
    <section className="mt-6">
      <h2>Cara membayar</h2>

      <div className="kartu bayang-padat mt-3 p-4">
        <p className="text-sm font-semibold text-ink-soft">Nominal transfer, persis sampai angka terakhir</p>
        <p className="mt-1 font-[family-name:var(--font-judul)] text-[clamp(2rem,9vw,2.8rem)] font-bold leading-none">
          {rupiah(nominal)}
        </p>
        <SalinTeks
          teks={String(nominal)}
          label="Salin nominal"
          labelSelesai="Nominal tersalin"
          className="mt-3 block"
        />
        <p className="mt-3 text-[0.95rem] text-ink-soft">
          Angka belakangnya sengaja kami bedakan sedikit dari kelipatan biasa. Itu yang membuat pengurus bisa mengenali
          transfer Anda tanpa harus bertanya dua kali.
        </p>
      </div>

      {qrisUrl ? (
        <div className="kartu mt-4 p-4">
          <p className="font-semibold">Bayar lewat QRIS</p>
          <Image
            src={qrisUrl}
            alt="Kode QRIS Dzun Nuun untuk dipindai dari aplikasi bank atau dompet digital"
            width={640}
            height={640}
            sizes="(max-width: 640px) 90vw, 400px"
            className="mt-3 h-auto w-full max-w-[320px] rounded-[4px] border border-ink-soft bg-paper"
          />
          <a href="/api/qris" className="tombol-kedua mt-3">
            <IkonUnduh />
            Unduh QRIS
          </a>
        </div>
      ) : (
        <div className="kartu mt-4 p-4">
          <p className="font-semibold">Gambar QRIS belum dipasang</p>
          <p className="mt-1 text-ink-soft">
            Pengurus belum mengunggah QRIS di halaman pengaturan. Sementara ini, tanyakan cara transfernya lewat tombol
            WhatsApp di bawah.
          </p>
        </div>
      )}

      {waSiap ? (
        <a
          href={linkWa(adminWa, teksKonfirmasi)}
          target="_blank"
          rel="noopener noreferrer"
          className="tombol-utama mt-4 w-full"
        >
          <IkonWhatsApp />
          Konfirmasi lewat WhatsApp
        </a>
      ) : (
        <p className="mt-4 rounded-[4px] border-2 border-bahaya bg-paper p-3">
          Nomor WhatsApp pengurus masih berisi nilai contoh, jadi tombol konfirmasi belum bisa dipakai. Pengurus perlu
          mengisinya di halaman pengaturan admin lebih dulu.
        </p>
      )}
    </section>
  );
}
