import { alamatSitus } from "@/lib/situs";
import { angka, rupiah, tanggalDanJam } from "@/lib/format";

/**
 * Teks pesan WhatsApp yang dikirim pengurus.
 *
 * Halaman status pribadi sudah dihapus, jadi seluruh kabar penerimaan dan
 * tiket sampai ke jamaah lewat WhatsApp. Kata-katanya ditaruh di satu tempat
 * dan dipakai dua kali: oleh halaman contoh di /admin/pesan, dan oleh tombol
 * WhatsApp per baris di /admin/donasi dan /admin/pendaftar. Satu sumber, jadi
 * contoh dan yang benar-benar terkirim tidak pernah berbeda.
 *
 * Tidak ada pengiriman otomatis. wa.me hanya membuka WhatsApp dengan teks
 * terisi, pengurus sendiri yang menekan kirim. Alur manual ini disengaja.
 */

const SALAM = "Assalamualaikum";

export type DataDonasi = {
  nama: string;
  kode: string;
  nominal: number;
  paket: number;
  catatan?: string | null;
  slugSeason?: string | null;
};

export type DataTiket = {
  nama: string;
  kode: string;
  acara: string;
  mulai: string;
  lokasi?: string | null;
  jumlah: number;
  nominal?: number;
};

/** Alamat gambar QR tiket, ditempel di pesan supaya peserta bisa membukanya. */
export function alamatQr(kode: string): string {
  return `${alamatSitus()}/api/qr/${kode}`;
}

export function pesanDonasiDiterima(d: DataDonasi): string {
  const baris = [
    `${SALAM} ${d.nama}, ini pengurus Dzun Nuun.`,
    "",
    `Donasi Anda sudah kami terima. Alhamdulillah.`,
    `Kode: ${d.kode}`,
    `Jumlah: ${d.paket} paket, ${rupiah(d.nominal)}`,
    "",
    `Lewat Anda, ${angka(d.paket)} jamaah ikut dirangkul di kegiatan season ini.`,
  ];
  if (d.slugSeason) {
    baris.push("", `Perkembangannya bisa dilihat di ${alamatSitus()}/season/${d.slugSeason}`);
  }
  baris.push("", "Terima kasih banyak. Semoga jadi amal jariyah.");
  return baris.join("\n");
}

export function pesanDonasiBelumCocok(d: DataDonasi): string {
  const baris = [
    `${SALAM} ${d.nama}, ini pengurus Dzun Nuun.`,
    "",
    `Kami belum menemukan transfer yang cocok untuk donasi berikut.`,
    `Kode: ${d.kode}`,
    `Nominal yang kami tunggu: ${rupiah(d.nominal)}`,
  ];
  if (d.catatan) baris.push("", `Catatan pengurus: ${d.catatan}`);
  baris.push(
    "",
    "Kalau Anda sudah transfer, boleh dibalas dengan bukti transfernya. Kalau belum, nominalnya masih bisa dipakai.",
  );
  return baris.join("\n");
}

export function pesanTiketSiap(t: DataTiket): string {
  const baris = [
    `${SALAM} ${t.nama}, ini pengurus Dzun Nuun.`,
    "",
    `Tiket Anda untuk ${t.acara} sudah siap.`,
    `Kode tiket: ${t.kode}`,
    `Jumlah: ${t.jumlah} orang`,
    `Waktu: ${tanggalDanJam(t.mulai)}`,
  ];
  if (t.lokasi) baris.push(`Tempat: ${t.lokasi}`);
  baris.push(
    "",
    `Kode QR-nya: ${alamatQr(t.kode)}`,
    "Tunjukkan QR itu di meja panitia. Kalau tidak terbaca, sebutkan saja kodenya.",
  );
  return baris.join("\n");
}

export function pesanPembayaranTiketDiterima(t: DataTiket): string {
  const baris = [
    `${SALAM} ${t.nama}, ini pengurus Dzun Nuun.`,
    "",
    `Pembayaran Anda untuk ${t.acara} sudah kami terima${t.nominal ? `, ${rupiah(t.nominal)}` : ""}.`,
    `Kode tiket: ${t.kode}`,
    `Jumlah: ${t.jumlah} orang`,
    `Waktu: ${tanggalDanJam(t.mulai)}`,
  ];
  if (t.lokasi) baris.push(`Tempat: ${t.lokasi}`);
  baris.push("", `Kode QR-nya: ${alamatQr(t.kode)}`, "Sampai bertemu di lokasi.");
  return baris.join("\n");
}

export function pesanPengingatAcara(t: DataTiket): string {
  const baris = [
    `${SALAM} ${t.nama}, ini pengurus Dzun Nuun.`,
    "",
    `Mengingatkan, besok ada ${t.acara}.`,
    `Waktu: ${tanggalDanJam(t.mulai)}`,
  ];
  if (t.lokasi) baris.push(`Tempat: ${t.lokasi}`);
  baris.push(`Kode tiket Anda: ${t.kode}`, "", `QR-nya: ${alamatQr(t.kode)}`, "Ditunggu kehadirannya.");
  return baris.join("\n");
}

export type DataKartu = {
  nama: string;
  tautan: string;
  hadir: number;
  kurang: number;
};

export function pesanKartuLoyalitas(k: DataKartu): string {
  return [
    `${SALAM} ${k.nama}, ini pengurus Dzun Nuun.`,
    "",
    `Terima kasih sudah ikut kegiatan kami. Sampai sekarang Anda tercatat hadir ${k.hadir} kali.`,
    `Kurang ${k.kurang} kehadiran lagi menuju hadiah berikutnya.`,
    "",
    `Kartu kehadiran Anda: ${k.tautan}`,
    "Simpan tautannya, isinya ikut bertambah sendiri tiap Anda check-in di acara.",
  ].join("\n");
}

export function pesanHadiahLoyalitas(k: DataKartu): string {
  return [
    `${SALAM} ${k.nama}, ini pengurus Dzun Nuun.`,
    "",
    `Kartu kehadiran Anda penuh. ${k.hadir} kali hadir, alhamdulillah.`,
    "Ada hadiah khusus yang sudah kami siapkan. Balas pesan ini untuk mengaturnya.",
    "",
    `Kartu Anda: ${k.tautan}`,
  ].join("\n");
}

export function pesanPemenangKuis(nama: string): string {
  return [
    `${SALAM} ${nama}, ini pengurus Dzun Nuun.`,
    "",
    "Selamat, jawaban kuis Anda benar semua.",
    "Balas pesan ini untuk mengambil hadiahnya.",
  ].join("\n");
}

/** Pembuka umum, dipakai kalau pengurus hanya ingin bertanya. */
export function pesanPembukaDonasi(d: DataDonasi): string {
  return `${SALAM} ${d.nama}, ini pengurus Dzun Nuun. Terkait donasi kode ${d.kode} sebesar ${rupiah(d.nominal)}.`;
}

export function pesanPembukaTiket(t: DataTiket): string {
  return `${SALAM} ${t.nama}, ini pengurus Dzun Nuun. Terkait pendaftaran acara ${t.acara} dengan kode ${t.kode}.`;
}
