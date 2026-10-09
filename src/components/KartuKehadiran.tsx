import Link from "next/link";
import SalinTeks from "@/components/SalinTeks";
import { db } from "@/lib/data";
import { alamatSitus } from "@/lib/situs";
import type { KartuJamaah } from "@/lib/data/types";

export const TARGET_STEMPEL = 10;

/**
 * Isi kartu kehadiran, dipakai dua alamat yang menuju kartu yang sama:
 * `/kartu/[token]` yang panjang dan bisa dicabut, dan `/jamaah/[nomor]` yang
 * pendek dan bisa dibacakan. Isinya satu berkas supaya keduanya tidak pernah
 * berbeda tampilan.
 */
export default async function KartuKehadiran({ kartu }: { kartu: KartuJamaah }) {
  const data = await db();
  const [hadir, menang, ringkasan] = await Promise.all([
    data.hitungKehadiran(kartu.whatsapp),
    data.hitungKemenangan(kartu.whatsapp),
    data.ringkasanKehadiran(),
  ]);

  const nama = ringkasan.find((satu) => satu.whatsapp === kartu.whatsapp)?.nama ?? "Jamaah Dzun Nuun";
  const namaDepan = nama.split(" ")[0];
  const hadiah = Math.floor(hadir / TARGET_STEMPEL);
  const terisi = hadir % TARGET_STEMPEL;
  // Kartu yang pas penuh ditampilkan penuh, bukan kembali kosong.
  const stempel = hadir > 0 && terisi === 0 ? TARGET_STEMPEL : terisi;
  const kurang = TARGET_STEMPEL - stempel;
  const alamatPendek = kartu.nomor ? `${alamatSitus()}/jamaah/${kartu.nomor}` : null;

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
          {Array.from({ length: TARGET_STEMPEL }, (_, indeks) => (
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
          {stempel === TARGET_STEMPEL
            ? "Kartu penuh. Hubungi pengurus untuk hadiahnya."
            : `Kurang ${kurang} kehadiran lagi menuju hadiah berikutnya.`}
        </p>
      </div>

      {kartu.nomor ? (
        <div className="kartu mt-4 p-4">
          <h2 className="text-base">Nomor jamaah Anda</h2>
          <p className="kode-besar mt-2 text-[clamp(1.6rem,9vw,2.2rem)]">{kartu.nomor}</p>
          <p className="petunjuk">
            Hafalkan nomor ini. Kalau tautan kartunya hilang dari percakapan, kartu yang sama tetap bisa dibuka
            dengan mengetik alamat di bawah.
          </p>
          <p className="mt-2 break-all font-semibold">{alamatPendek}</p>
          {alamatPendek ? (
            <SalinTeks teks={alamatPendek} label="Salin alamat kartu" className="mt-3 block" />
          ) : null}
        </div>
      ) : null}

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

/** Layar kartu yang tidak ketemu. Penjelasannya berbeda per cara mengalamati. */
export function KartuTidakDitemukan({ judul, penjelasan }: { judul: string; penjelasan: string }) {
  return (
    <div className="kolom-isi py-10">
      <h1>{judul}</h1>
      <p className="mt-2 text-[0.95rem]">{penjelasan}</p>
      <Link href="/acara" className="tombol-utama mt-4">
        Lihat acara terdekat
      </Link>
    </div>
  );
}
