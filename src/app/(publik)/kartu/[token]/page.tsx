import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kartu kehadiran",
  robots: { index: false, follow: false },
};

const TARGET = 10;

type Props = { params: Promise<{ token: string }> };

export default async function KartuLoyalitas({ params }: Props) {
  const { token } = await params;
  const data = await db();
  const nomor = await data.kartuLewatToken(token);

  if (!nomor) {
    return (
      <div className="kolom-isi py-10">
        <h1>Kartu ini tidak ditemukan</h1>
        <p className="mt-2 text-[0.95rem]">
          Tautannya mungkin sudah diganti pengurus. Minta tautan baru lewat WhatsApp ke pengurus Dzun Nuun.
        </p>
        <Link href="/acara" className="tombol-utama mt-4">
          Lihat acara terdekat
        </Link>
      </div>
    );
  }

  const [hadir, menang, ringkasan] = await Promise.all([
    data.hitungKehadiran(nomor),
    data.hitungKemenangan(nomor),
    data.ringkasanKehadiran(),
  ]);

  const nama = ringkasan.find((satu) => satu.whatsapp === nomor)?.nama ?? "Jamaah Dzun Nuun";
  const namaDepan = nama.split(" ")[0];
  const hadiah = Math.floor(hadir / TARGET);
  const terisi = hadir % TARGET;
  // Kartu yang pas penuh ditampilkan penuh, bukan kembali kosong.
  const stempel = hadir > 0 && terisi === 0 ? TARGET : terisi;
  const kurang = TARGET - stempel;

  return (
    <div className="kolom-isi py-6">
      <p className="text-xs font-semibold text-gold-ink">Kartu kehadiran</p>
      <h1 className="mt-1.5">{namaDepan}</h1>
      <p className="mt-1 text-[0.95rem] text-ink-soft">
        {hadir === 0
          ? "Belum ada kehadiran yang tercatat. Stempel pertama masuk begitu Anda check-in di acara."
          : `${hadir} kali hadir di acara Dzun Nuun.`}
      </p>

      <div className="kartu mt-5 p-4">
        <div className="grid grid-cols-5 gap-2" aria-hidden="true">
          {Array.from({ length: TARGET }, (_, indeks) => (
            <div
              key={indeks}
              className={`flex aspect-square items-center justify-center rounded-full border-2 text-[0.95rem] font-bold ${
                indeks < stempel ? "border-teal bg-teal text-paper" : "border-garis text-garis-isian"
              }`}
            >
              {indeks + 1}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[0.95rem] font-semibold">
          {stempel === TARGET
            ? "Kartu penuh. Hubungi pengurus untuk hadiahnya."
            : `Kurang ${kurang} kehadiran lagi menuju hadiah berikutnya.`}
        </p>
      </div>

      {hadiah > 0 || menang > 0 ? (
        <dl className="kartu mt-4 grid gap-2 p-4 text-[0.95rem]">
          {hadiah > 0 ? (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Kartu penuh yang sudah dicapai</dt>
              <dd className="font-semibold">{hadiah} kali</dd>
            </div>
          ) : null}
          {menang > 0 ? (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Menang kuis</dt>
              <dd className="font-semibold">{menang} kali</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <div className="kartu mt-4 bg-cream p-4">
        <h2 className="text-base">Cara menambah stempel</h2>
        <p className="petunjuk">
          Daftar acara lewat app ini, lalu tunjukkan kode tiket Anda ke panitia saat hari H. Stempel bertambah setelah
          panitia mencatat kehadiran Anda, bukan saat mendaftar.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/acara" className="tombol-utama">
          Lihat acara terdekat
        </Link>
      </div>
    </div>
  );
}
