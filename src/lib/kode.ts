import { randomInt } from "crypto";

/** Tanpa 0, O, 1, I, L supaya kode tidak salah dibaca saat diketik ulang pengurus. */
const ALFABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function buatKode(): string {
  let hasil = "";
  for (let i = 0; i < 4; i += 1) {
    hasil += ALFABET[randomInt(ALFABET.length)];
  }
  return `DZN-${hasil}`;
}

export function buatSuffix(): number {
  return randomInt(100, 1000);
}

/**
 * Angka unik dipakai untuk mencocokkan transfer masuk, jadi dua transaksi pending
 * tidak boleh punya nominal yang sama. Kalau semua kandidat bentrok, pemanggil
 * menerima null dan menampilkan pesan agar mencoba lagi.
 */
export function pilihSuffix(nominalDasar: number, terpakai: Set<number>): number | null {
  const kandidat: number[] = [];
  for (let i = 100; i <= 999; i += 1) {
    if (!terpakai.has(nominalDasar + i)) kandidat.push(i);
  }
  if (kandidat.length === 0) return null;
  return kandidat[randomInt(kandidat.length)];
}

/**
 * Token acak untuk tautan kartu loyalitas. Panjang 16 dari alfabet 31 huruf,
 * jadi ruang tebakannya sekitar 10 pangkat 24. Bukan kode yang perlu diketik
 * ulang orang, jadi boleh jauh lebih panjang dari kode tiket.
 */
export function buatTokenKartu(): string {
  let hasil = "";
  for (let i = 0; i < 16; i += 1) hasil += ALFABET[randomInt(ALFABET.length)];
  return hasil;
}

export const BENTUK_NOMOR_JAMAAH = /^[1-9][0-9]{3,4}$/;

/**
 * Nomor jamaah: 4 angka, 1000 sampai 9999.
 *
 * Angka, bukan huruf, karena nomor ini dibacakan di depan pintu dan diketik
 * ulang jamaah di bilah alamat. Tidak pernah diawali nol supaya tidak hilang
 * saat ditulis ulang di kertas atau di papan pengumuman.
 *
 * Ruang 4 angka cukup untuk 9.000 orang. Kalau sampai padat, nomornya melebar
 * ke 5 angka daripada pengalokasiannya gagal.
 */
export function pilihNomorJamaah(terpakai: Set<string>): string {
  for (const [bawah, atas] of [
    [1000, 10000],
    [10000, 100000],
  ]) {
    for (let percobaan = 0; percobaan < 300; percobaan += 1) {
      const kandidat = String(randomInt(bawah, atas));
      if (!terpakai.has(kandidat)) return kandidat;
    }
  }
  throw new Error("Nomor jamaah sudah habis. Hubungi yang memasang app ini.");
}
