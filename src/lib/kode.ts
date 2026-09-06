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
