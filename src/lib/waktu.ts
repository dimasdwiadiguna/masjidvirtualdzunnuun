import "server-only";

export class KehabisanWaktu extends Error {
  constructor(batasMs: number) {
    super(`Tidak ada jawaban dalam ${Math.round(batasMs / 1000)} detik.`);
    this.name = "KehabisanWaktu";
  }
}

/**
 * Pembungkus batas waktu untuk panggilan ke database.
 *
 * Tanpa ini, satu sambungan yang menggantung membuat halaman ikut menggantung
 * sampai Vercel memutusnya, dan pengunjung hanya melihat layar kosong yang lama.
 * Lebih baik menyerah cepat lalu menampilkan keadaan galat yang jelas.
 */
export function denganBatasWaktu<T>(kerja: Promise<T>, batasMs = 8000): Promise<T> {
  return new Promise<T>((selesai, gagal) => {
    const pengatur = setTimeout(() => gagal(new KehabisanWaktu(batasMs)), batasMs);
    kerja.then(
      (hasil) => {
        clearTimeout(pengatur);
        selesai(hasil);
      },
      (galat) => {
        clearTimeout(pengatur);
        gagal(galat);
      },
    );
  });
}
