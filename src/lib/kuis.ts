import { tandaTangan } from "@/lib/auth";

/**
 * Bank soal kuis dalam teks berformat, supaya pengurus bisa memperbaruinya
 * lewat satu kotak teks tanpa menyentuh kode dan tanpa deploy ulang.
 *
 * Satu soal per blok, blok dipisah baris kosong. Baris "#" adalah pertanyaan,
 * baris "*" jawaban benar, baris "-" jawaban salah:
 *
 *   # Masjid tempat Dzun Nuun berkegiatan?
 *   * Masjid Fathul Ummah
 *   - Masjid Al-Ikhlas
 *   - Masjid An-Nur
 *
 * Galat dikembalikan, bukan dibuang diam-diam. Bank soal yang rusak tidak boleh
 * berubah jadi kuis yang tidak mungkin dimenangkan siapa pun.
 */
export type Soal = {
  pertanyaan: string;
  pilihan: string[];
  /** Indeks jawaban benar di dalam `pilihan`. */
  benar: number;
};

export type HasilBaca = { soal: Soal[]; galat: string[] };

export const JUMLAH_SOAL = 7;

export function bacaBankSoal(teks: string): HasilBaca {
  const soal: Soal[] = [];
  const galat: string[] = [];

  const blok = teks
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((satu) => satu.trim())
    .filter(Boolean);

  blok.forEach((satu, indeks) => {
    const nomor = indeks + 1;
    const baris = satu
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);

    const pertanyaan = baris.filter((b) => b.startsWith("#")).map((b) => b.slice(1).trim());
    const jawaban = baris.filter((b) => b.startsWith("*") || b.startsWith("-"));

    if (pertanyaan.length === 0) {
      galat.push(`Soal ${nomor} belum punya baris pertanyaan yang diawali tanda pagar.`);
      return;
    }
    if (pertanyaan.length > 1) {
      galat.push(`Soal ${nomor} punya lebih dari satu baris pertanyaan.`);
      return;
    }
    if (!pertanyaan[0]) {
      galat.push(`Soal ${nomor} pertanyaannya kosong.`);
      return;
    }
    if (jawaban.length < 2) {
      galat.push(`Soal ${nomor} baru punya ${jawaban.length} pilihan. Minimal dua.`);
      return;
    }

    const benar = jawaban.filter((b) => b.startsWith("*"));
    if (benar.length === 0) {
      galat.push(`Soal ${nomor} belum punya jawaban benar. Beri tanda bintang di depan jawaban yang benar.`);
      return;
    }
    if (benar.length > 1) {
      galat.push(`Soal ${nomor} punya ${benar.length} jawaban benar. Hanya boleh satu.`);
      return;
    }

    const pilihan = jawaban.map((b) => b.slice(1).trim());
    if (pilihan.some((p) => !p)) {
      galat.push(`Soal ${nomor} punya pilihan yang kosong.`);
      return;
    }

    soal.push({
      pertanyaan: pertanyaan[0],
      pilihan,
      benar: jawaban.findIndex((b) => b.startsWith("*")),
    });
  });

  if (blok.length > 0 && soal.length > 0 && soal.length < JUMLAH_SOAL) {
    galat.push(
      `Baru ada ${soal.length} soal yang benar formatnya. Kuis butuh ${JUMLAH_SOAL} soal untuk bisa dibuka.`,
    );
  }

  return { soal, galat };
}

/** Acak Fisher-Yates dengan urutan yang bisa diulang dari benih yang sama. */
export function acak<T>(daftar: T[], benih: number): T[] {
  const hasil = [...daftar];
  let keadaan = benih || 1;
  const berikut = () => {
    keadaan = (keadaan * 1103515245 + 12345) & 0x7fffffff;
    return keadaan / 0x7fffffff;
  };
  for (let i = hasil.length - 1; i > 0; i -= 1) {
    const j = Math.floor(berikut() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
}

export type SoalTampil = { pertanyaan: string; pilihan: string[] };

/**
 * Menyusun satu percobaan kuis dari benih.
 *
 * Kunci jawaban tidak pernah dikirim ke klien. Yang dikirim hanya benih dan
 * tanda tangannya; server menyusun ulang soal yang sama persis saat menilai,
 * jadi pengirim tidak bisa mengarang nomor soal atau menukar urutan pilihan.
 */
export function susunKuis(bank: string, benih: number): { tampil: SoalTampil[]; kunci: number[] } {
  const { soal } = bacaBankSoal(bank);
  const terpilih = acak(soal, benih).slice(0, JUMLAH_SOAL);

  const tampil: SoalTampil[] = [];
  const kunci: number[] = [];

  terpilih.forEach((satu, indeks) => {
    const berlabel = satu.pilihan.map((teks, asli) => ({ teks, asli }));
    const diacak = acak(berlabel, benih + indeks + 1);
    tampil.push({ pertanyaan: satu.pertanyaan, pilihan: diacak.map((p) => p.teks) });
    kunci.push(diacak.findIndex((p) => p.asli === satu.benar));
  });

  return { tampil, kunci };
}

/** Tanda tangan percobaan kuis, mengikat benih ke waktunya. */
export async function tandaPercobaan(benih: number, waktu: number): Promise<string> {
  return tandaTangan(`kuis.${benih}.${waktu}`);
}
