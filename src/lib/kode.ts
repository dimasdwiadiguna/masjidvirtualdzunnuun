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

/** Alfabet kode jamaah, dipecah supaya bentuknya bisa dijaga per posisi. */
const HURUF_JAMAAH = "ABCDEFGHJKMNPQRSTUVWXYZ";
const ANGKA_JAMAAH = "23456789";

export const BENTUK_KODE_JAMAAH = new RegExp(`^[${HURUF_JAMAAH}]{2}[${ANGKA_JAMAAH}]{3}$`);

/**
 * Kode jamaah: dua huruf lalu tiga angka, misalnya `KM472`.
 *
 * Bentuknya dibuat tetap, bukan lima karakter campur acak, karena kode ini
 * dibacakan di depan pintu dan diketik ulang jamaah di bilah alamat. Orang
 * mengingat "dua huruf, tiga angka" jauh lebih mudah daripada urutan yang
 * berubah-ubah, dan bentuk tetap juga membuat salah ketik bisa ditolak
 * sebelum menyentuh database.
 *
 * Huruf I, L, O dan angka 0, 1 dibuang, alasannya sama dengan D-11 pada kode
 * tiket: kode ini dieja lewat telepon dan ditulis ulang di kertas. Ongkosnya
 * ruang tebakan jadi 23 pangkat 2 kali 8 pangkat 3, yaitu 270.848, bukan
 * 676.000 kalau seluruh abjad dipakai. Selisih itu diterima sadar: yang
 * menahan penyapuan adalah pembatas per IP, bukan panjang kodenya sendiri.
 */
export function pilihKodeJamaah(terpakai: Set<string>): string {
  for (let percobaan = 0; percobaan < 500; percobaan += 1) {
    let kandidat = "";
    for (let i = 0; i < 2; i += 1) kandidat += HURUF_JAMAAH[randomInt(HURUF_JAMAAH.length)];
    for (let i = 0; i < 3; i += 1) kandidat += ANGKA_JAMAAH[randomInt(ANGKA_JAMAAH.length)];
    if (!terpakai.has(kandidat)) return kandidat;
  }
  throw new Error("Kode jamaah sulit dicarikan yang kosong. Hubungi yang memasang app ini.");
}
