import type { Kehadiran } from "./types";

/**
 * Aturan hitung kehadiran, ditaruh di satu tempat supaya kedua driver tidak
 * pernah berbeda jawaban.
 *
 * Satu kehadiran = satu tiket berstatus checked_in. Bukan per kepala: satu
 * orang yang mendaftarkan lima orang tetap dihitung satu, karena yang punya
 * nomor itu yang hadir.
 *
 * Dihitung dari status, bukan dari checked_in_at. Bedanya nyata: tiket yang
 * dibatalkan pengurus setelah check-in tetap menyimpan checked_in_at, dan tiket
 * seperti itu tidak boleh ikut menambah stempel.
 */
export type BarisKehadiran = { whatsapp: string; name: string; checked_in_at: string | null };

export function kumpulkanKehadiran(baris: BarisKehadiran[]): Kehadiran[] {
  const peta = new Map<string, Kehadiran>();

  for (const satu of baris) {
    const kini = peta.get(satu.whatsapp);
    if (!kini) {
      peta.set(satu.whatsapp, {
        whatsapp: satu.whatsapp,
        nama: satu.name,
        hadir: 1,
        terakhir: satu.checked_in_at,
      });
      continue;
    }
    kini.hadir += 1;
    // Nama bebas diketik ulang tiap mendaftar, jadi yang dipakai nama dari
    // kehadiran paling akhir.
    if (satu.checked_in_at && (!kini.terakhir || satu.checked_in_at > kini.terakhir)) {
      kini.terakhir = satu.checked_in_at;
      kini.nama = satu.name;
    }
  }

  return [...peta.values()].sort((a, b) => b.hadir - a.hadir || a.nama.localeCompare(b.nama));
}

export function hitungSuara(baris: { pilihan: number }[], jumlahPilihan: number): number[] {
  const hasil = new Array<number>(Math.max(0, jumlahPilihan)).fill(0);
  for (const satu of baris) {
    if (satu.pilihan >= 0 && satu.pilihan < hasil.length) hasil[satu.pilihan] += 1;
  }
  return hasil;
}

/** Tanggal hari ini menurut waktu Jakarta, dipakai untuk kuota kuis harian. */
export function hariIniJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}
