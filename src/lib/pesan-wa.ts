import { alamatSitus } from "@/lib/situs";
import { angka, rupiah, tanggalDanJam } from "@/lib/format";

/**
 * Teks pesan WhatsApp yang dikirim pengurus.
 *
 * Halaman status pribadi sudah dihapus, jadi seluruh kabar penerimaan dan
 * tiket sampai ke jamaah lewat WhatsApp. Kata-katanya ditaruh di satu tempat
 * dan dipakai dua kali: oleh halaman /admin/pesan, dan oleh tombol WhatsApp
 * per baris di /admin/donasi, /admin/pendaftar, dan /admin/loyal. Satu sumber,
 * jadi contoh dan yang benar-benar terkirim tidak pernah berbeda.
 *
 * Kata-katanya sekarang bisa diubah pengurus dari /admin/pesan. Yang di bawah
 * ini teks bawaannya: dipakai selama pengurus belum menuliskan versinya
 * sendiri, dan jadi tempat kembali kalau suntingannya ingin dibatalkan.
 *
 * Isian ditulis dalam kurung kurawal, misalnya {nama}. Aturan pengisiannya
 * satu saja dan berlaku untuk semua templat: baris yang memuat isian kosong
 * dibuang seluruhnya. Itulah yang membuat "Catatan pengurus" dan "Tempat"
 * hilang sendiri saat datanya memang tidak ada, tanpa perlu bahasa templat
 * bercabang yang harus dipelajari pengurus.
 *
 * Tidak ada pengiriman otomatis. wa.me hanya membuka WhatsApp dengan teks
 * terisi, pengurus sendiri yang menekan kirim. Alur manual ini disengaja.
 */

export type IdPesan =
  | "donasi_diterima"
  | "donasi_belum_cocok"
  | "pembuka_donasi"
  | "tiket_siap"
  | "pembayaran_tiket"
  | "pengingat_acara"
  | "pembuka_tiket"
  | "kartu_loyalitas"
  | "hadiah_loyalitas";

export type Medan = { kunci: string; arti: string };

export type Templat = {
  id: IdPesan;
  judul: string;
  kapan: string;
  bawaan: string;
  medan: Medan[];
  /** Nilai contoh untuk pratinjau di /admin/pesan. Bukan data jamaah sungguhan. */
  contoh: Record<string, string>;
};

export type TeksTemplat = Record<IdPesan, string>;

const SALAM = "Assalamualaikum";

const MEDAN_DONASI: Medan[] = [
  { kunci: "nama", arti: "nama donatur" },
  { kunci: "kode", arti: "kode donasi, misalnya DZN-4K7P" },
  { kunci: "nominal", arti: "nominal transfer lengkap, misalnya Rp 150.284" },
  { kunci: "paket", arti: "jumlah paket" },
  { kunci: "catatan", arti: "catatan yang Anda tulis di kotak konfirmasi. Kosong kalau tidak diisi" },
  { kunci: "tautan_season", arti: "alamat halaman patungan yang sedang berjalan" },
];

const MEDAN_TIKET: Medan[] = [
  { kunci: "nama", arti: "nama pendaftar" },
  { kunci: "kode", arti: "kode tiket, misalnya DZN-9F2M" },
  { kunci: "acara", arti: "judul acara" },
  { kunci: "waktu", arti: "tanggal dan jam acara" },
  { kunci: "tempat", arti: "nama lokasi. Kosong kalau acaranya belum punya lokasi" },
  { kunci: "jumlah", arti: "jumlah orang di tiket itu" },
  { kunci: "nominal", arti: "nominal yang dibayar. Kosong untuk acara gratis" },
  { kunci: "tautan_qr", arti: "alamat gambar QR tiket" },
];

const MEDAN_KARTU: Medan[] = [
  { kunci: "nama", arti: "nama jamaah" },
  { kunci: "hadir", arti: "jumlah kehadiran yang tercatat" },
  { kunci: "kurang", arti: "sisa kehadiran menuju hadiah berikutnya" },
  { kunci: "tautan_kartu", arti: "alamat kartu kehadiran miliknya" },
];

const CONTOH_DONASI = {
  nama: "Budi",
  kode: "DZN-4K7P",
  nominal: "Rp 150.284",
  paket: "10",
  catatan: "belum ada transfer masuk dengan nominal ini sampai hari Rabu",
  tautan_season: `${"{alamat}"}/season/season-1`,
};

const CONTOH_TIKET = {
  nama: "Sari",
  kode: "DZN-9F2M",
  acara: "Kelas menulis dakwah",
  waktu: "Ahad, 12 Oktober 2026, 09.00 WIB",
  tempat: "Aula Masjid Fathul Ummah",
  jumlah: "2",
  nominal: "Rp 50.284",
  tautan_qr: `${"{alamat}"}/api/qr/DZN-9F2M`,
};

const CONTOH_KARTU = {
  nama: "Rian",
  hadir: "7",
  kurang: "3",
  tautan_kartu: `${"{alamat}"}/kartu/K7P2NQ4RSTUV8WXY`,
};

/** Contoh memuat alamat situs, dan alamatnya baru diketahui saat dijalankan. */
function isiAlamat(contoh: Record<string, string>): Record<string, string> {
  const alamat = alamatSitus();
  return Object.fromEntries(
    Object.entries(contoh).map(([kunci, nilai]) => [kunci, nilai.replace("{alamat}", alamat)]),
  );
}

export const TEMPLAT: Templat[] = [
  {
    id: "donasi_diterima",
    judul: "Donasi sudah diterima",
    kapan: "Dikirim setelah Anda menekan Verifikasi di menu Donasi.",
    medan: MEDAN_DONASI,
    contoh: CONTOH_DONASI,
    bawaan: [
      `${SALAM} {nama}, ini pengurus Dzun Nuun.`,
      "",
      "Donasi Anda sudah kami terima. Alhamdulillah.",
      "Kode: {kode}",
      "Jumlah: {paket} paket, {nominal}",
      "",
      "Lewat Anda, {paket} jamaah ikut dirangkul di kegiatan season ini.",
      "",
      "Perkembangannya bisa dilihat di {tautan_season}",
      "",
      "Terima kasih banyak. Semoga jadi amal jariyah.",
    ].join("\n"),
  },
  {
    id: "donasi_belum_cocok",
    judul: "Donasi belum bisa dicocokkan",
    kapan:
      "Dikirim setelah Anda menekan Tolak. Catatan yang Anda tulis di kotak konfirmasi ikut masuk lewat isian {catatan}, jadi tulis alasannya dengan bahasa yang enak dibaca.",
    medan: MEDAN_DONASI,
    contoh: CONTOH_DONASI,
    bawaan: [
      `${SALAM} {nama}, ini pengurus Dzun Nuun.`,
      "",
      "Kami belum menemukan transfer yang cocok untuk donasi berikut.",
      "Kode: {kode}",
      "Nominal yang kami tunggu: {nominal}",
      "",
      "Catatan pengurus: {catatan}",
      "",
      "Kalau Anda sudah transfer, boleh dibalas dengan bukti transfernya. Kalau belum, nominalnya masih bisa dipakai.",
    ].join("\n"),
  },
  {
    id: "pembuka_donasi",
    judul: "Pembuka untuk bertanya soal donasi",
    kapan:
      "Dipakai tombol WhatsApp pada donasi yang masih menunggu, saat Anda hanya ingin bertanya. Sisa kalimatnya Anda ketik sendiri di WhatsApp.",
    medan: MEDAN_DONASI,
    contoh: CONTOH_DONASI,
    bawaan: `${SALAM} {nama}, ini pengurus Dzun Nuun. Terkait donasi kode {kode} sebesar {nominal}.`,
  },
  {
    id: "tiket_siap",
    judul: "Tiket gratis siap dipakai",
    kapan: "Dikirim begitu ada yang mendaftar acara gratis.",
    medan: MEDAN_TIKET,
    contoh: CONTOH_TIKET,
    bawaan: [
      `${SALAM} {nama}, ini pengurus Dzun Nuun.`,
      "",
      "Tiket Anda untuk {acara} sudah siap.",
      "Kode tiket: {kode}",
      "Jumlah: {jumlah} orang",
      "Waktu: {waktu}",
      "Tempat: {tempat}",
      "",
      "Kode QR-nya: {tautan_qr}",
      "Tunjukkan QR itu di meja panitia. Kalau tidak terbaca, sebutkan saja kodenya.",
    ].join("\n"),
  },
  {
    id: "pembayaran_tiket",
    judul: "Pembayaran tiket sudah diterima",
    kapan: "Dikirim setelah Anda menekan Konfirmasi pembayaran di menu Pendaftar.",
    medan: MEDAN_TIKET,
    contoh: CONTOH_TIKET,
    bawaan: [
      `${SALAM} {nama}, ini pengurus Dzun Nuun.`,
      "",
      "Pembayaran Anda untuk {acara} sudah kami terima.",
      "Nominal: {nominal}",
      "Kode tiket: {kode}",
      "Jumlah: {jumlah} orang",
      "Waktu: {waktu}",
      "Tempat: {tempat}",
      "",
      "Kode QR-nya: {tautan_qr}",
      "Sampai bertemu di lokasi.",
    ].join("\n"),
  },
  {
    id: "pengingat_acara",
    judul: "Pengingat sehari sebelum acara",
    kapan: "Dikirim manual sehari sebelum hari H, satu per satu dari menu Pendaftar.",
    medan: MEDAN_TIKET,
    contoh: CONTOH_TIKET,
    bawaan: [
      `${SALAM} {nama}, ini pengurus Dzun Nuun.`,
      "",
      "Mengingatkan, besok ada {acara}.",
      "Waktu: {waktu}",
      "Tempat: {tempat}",
      "Kode tiket Anda: {kode}",
      "",
      "QR-nya: {tautan_qr}",
      "Ditunggu kehadirannya.",
    ].join("\n"),
  },
  {
    id: "pembuka_tiket",
    judul: "Pembuka untuk bertanya soal pendaftaran",
    kapan:
      "Dipakai tombol WhatsApp pada pendaftar yang belum dikonfirmasi. Sisa kalimatnya Anda ketik sendiri di WhatsApp.",
    medan: MEDAN_TIKET,
    contoh: CONTOH_TIKET,
    bawaan: `${SALAM} {nama}, ini pengurus Dzun Nuun. Terkait pendaftaran acara {acara} dengan kode {kode}.`,
  },
  {
    id: "kartu_loyalitas",
    judul: "Tautan kartu kehadiran",
    kapan: "Dikirim dari menu Jamaah Loyal setelah Anda membuat tautan kartunya.",
    medan: MEDAN_KARTU,
    contoh: CONTOH_KARTU,
    bawaan: [
      `${SALAM} {nama}, ini pengurus Dzun Nuun.`,
      "",
      "Terima kasih sudah ikut kegiatan kami. Sampai sekarang Anda tercatat hadir {hadir} kali.",
      "Kurang {kurang} kehadiran lagi menuju hadiah berikutnya.",
      "",
      "Kartu kehadiran Anda: {tautan_kartu}",
      "Simpan tautannya, isinya ikut bertambah sendiri tiap Anda check-in di acara.",
    ].join("\n"),
  },
  {
    id: "hadiah_loyalitas",
    judul: "Kartu kehadiran sudah penuh",
    kapan: "Dikirim dari menu Jamaah Loyal saat kehadirannya sudah genap sepuluh.",
    medan: MEDAN_KARTU,
    contoh: CONTOH_KARTU,
    bawaan: [
      `${SALAM} {nama}, ini pengurus Dzun Nuun.`,
      "",
      "Kartu kehadiran Anda penuh. {hadir} kali hadir, alhamdulillah.",
      "Ada hadiah khusus yang sudah kami siapkan. Balas pesan ini untuk mengaturnya.",
      "",
      "Kartu Anda: {tautan_kartu}",
    ].join("\n"),
  },
];

const PETA_TEMPLAT = new Map(TEMPLAT.map((satu) => [satu.id, satu]));

export function templatBawaan(): TeksTemplat {
  return Object.fromEntries(TEMPLAT.map((satu) => [satu.id, satu.bawaan])) as TeksTemplat;
}

/** Suntingan yang tersimpan apa adanya, termasuk yang isiannya masih salah tulis. */
export function templatTersimpan(pengaturan: {
  wa_templat?: Record<string, string> | null;
}): Partial<Record<IdPesan, string>> {
  const simpanan = pengaturan.wa_templat;
  if (!simpanan || typeof simpanan !== "object") return {};
  const hasil: Partial<Record<IdPesan, string>> = {};
  for (const satu of TEMPLAT) {
    const teks = simpanan[satu.id];
    if (typeof teks === "string" && teks.trim()) hasil[satu.id] = teks;
  }
  return hasil;
}

/**
 * Teks yang berlaku sekarang: bawaan, ditimpa suntingan pengurus kalau ada.
 * Suntingan kosong dianggap belum menyunting, jadi menghapus isi kotaknya sama
 * dengan mengembalikan teks bawaan.
 *
 * Suntingan yang isiannya salah tulis dilewati, dan teks bawaannya yang
 * dipakai. Suntingan itu tetap tersimpan supaya pengurus bisa membetulkannya,
 * tetapi pesan berisi {nma} tidak boleh sampai ke jamaah hanya karena satu
 * huruf terlewat saat mengetik.
 */
export function templatDari(pengaturan: { wa_templat?: Record<string, string> | null }): TeksTemplat {
  const hasil = templatBawaan();
  for (const [id, teks] of Object.entries(templatTersimpan(pengaturan)) as [IdPesan, string][]) {
    if (periksaTemplat(id, teks).length === 0) hasil[id] = teks;
  }
  return hasil;
}

const POLA_ISIAN = /\{([a-z_]+)\}/g;

function rapikan(baris: string[]): string[] {
  const hasil: string[] = [];
  for (const satu of baris) {
    if (!satu.trim() && !hasil.length) continue;
    if (!satu.trim() && !hasil[hasil.length - 1]?.trim()) continue;
    hasil.push(satu.trimEnd());
  }
  while (hasil.length && !hasil[hasil.length - 1].trim()) hasil.pop();
  return hasil;
}

/**
 * Mengisi templat. Baris yang memuat isian kosong dibuang seluruhnya, lalu
 * baris kosong yang berlebih dirapatkan supaya tidak meninggalkan celah.
 *
 * Isian yang tidak dikenal dibiarkan apa adanya, bukan dihapus diam-diam.
 * Penjagaan sesungguhnya ada di periksaTemplat() saat menyimpan, jadi isian
 * salah ketik ketahuan pengurus sebelum pesannya sampai ke jamaah.
 */
export function susunPesan(templat: string, nilai: Record<string, string>): string {
  const baris = templat.replace(/\r\n/g, "\n").split("\n");
  const terpakai: string[] = [];
  for (const satu of baris) {
    const kunci = [...satu.matchAll(POLA_ISIAN)].map((cocok) => cocok[1]);
    const adaYangKosong = kunci.some((k) => k in nilai && !nilai[k]);
    if (kunci.length > 0 && adaYangKosong) continue;
    terpakai.push(satu.replace(POLA_ISIAN, (utuh, k: string) => (k in nilai ? nilai[k] : utuh)));
  }
  return rapikan(terpakai).join("\n");
}

/** Galat yang dikembalikan ditulis untuk pengurus, bukan untuk programmer. */
export function periksaTemplat(id: IdPesan, teks: string): string[] {
  const templat = PETA_TEMPLAT.get(id);
  if (!templat) return [];
  const galat: string[] = [];
  if (!teks.trim()) return galat; // Kosong berarti kembali ke bawaan, bukan galat.

  const dikenal = new Set(templat.medan.map((m) => m.kunci));
  const asing = [...new Set([...teks.matchAll(POLA_ISIAN)].map((cocok) => cocok[1]))].filter(
    (k) => !dikenal.has(k),
  );
  if (asing.length > 0) {
    galat.push(
      `"${templat.judul}": isian ${asing.map((k) => `{${k}}`).join(", ")} tidak dikenal. Yang bisa dipakai: ${[...dikenal]
        .map((k) => `{${k}}`)
        .join(", ")}.`,
    );
  }
  if (teks.length > 1200) {
    galat.push(`"${templat.judul}": teksnya terlalu panjang, maksimal 1200 huruf.`);
  }
  return galat;
}

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

export type DataKartu = {
  nama: string;
  tautan: string;
  hadir: number;
  kurang: number;
};

/** Alamat gambar QR tiket, ditempel di pesan supaya peserta bisa membukanya. */
export function alamatQr(kode: string): string {
  return `${alamatSitus()}/api/qr/${kode}`;
}

export function nilaiDonasi(d: DataDonasi): Record<string, string> {
  return {
    nama: d.nama,
    kode: d.kode,
    nominal: rupiah(d.nominal),
    paket: angka(d.paket),
    catatan: d.catatan?.trim() ?? "",
    tautan_season: d.slugSeason ? `${alamatSitus()}/season/${d.slugSeason}` : "",
  };
}

export function nilaiTiket(t: DataTiket): Record<string, string> {
  return {
    nama: t.nama,
    kode: t.kode,
    acara: t.acara,
    waktu: tanggalDanJam(t.mulai),
    tempat: t.lokasi?.trim() ?? "",
    jumlah: angka(t.jumlah),
    nominal: t.nominal && t.nominal > 0 ? rupiah(t.nominal) : "",
    tautan_qr: alamatQr(t.kode),
  };
}

export function nilaiKartu(k: DataKartu): Record<string, string> {
  return {
    nama: k.nama,
    hadir: angka(k.hadir),
    kurang: angka(k.kurang),
    tautan_kartu: k.tautan,
  };
}

export function pesanDonasi(templat: TeksTemplat, id: IdPesan, d: DataDonasi): string {
  return susunPesan(templat[id], nilaiDonasi(d));
}

export function pesanTiket(templat: TeksTemplat, id: IdPesan, t: DataTiket): string {
  return susunPesan(templat[id], nilaiTiket(t));
}

export function pesanKartu(templat: TeksTemplat, id: IdPesan, k: DataKartu): string {
  return susunPesan(templat[id], nilaiKartu(k));
}

/** Pratinjau di /admin/pesan memakai nilai contoh, bukan data jamaah sungguhan. */
export function contohPesan(templat: Templat, teks: string): string {
  return susunPesan(teks, isiAlamat(templat.contoh));
}
