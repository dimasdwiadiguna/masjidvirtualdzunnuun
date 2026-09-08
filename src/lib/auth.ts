export const COOKIE_SESI = "dzn_admin";
const UMUR_SESI_DETIK = 60 * 60 * 12;

/**
 * Dua peran, dua password bersama.
 *
 * "admin" adalah superadmin yang bisa mengurus semuanya. "panitia" adalah
 * pengurus acara: bisa mengurus acara, pendaftar, check-in, laporan,
 * pengumuman, dan foto hero, tetapi tidak menyentuh donasi, season, sponsor,
 * pengaturan, dan diagnosa.
 *
 * Tetap tidak ada tabel pengguna dan tidak ada Supabase Auth. Perannya cuma
 * satu kata di dalam token sesi, dan kata itu sudah ikut ditandatangani sejak
 * awal, jadi skema tanda tangannya tidak berubah dan sesi superadmin yang
 * sedang berjalan tetap sah.
 */
export type Peran = "admin" | "panitia";

const PERAN_SAH: Peran[] = ["admin", "panitia"];

function rahasia(): string {
  const nilai = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!nilai) throw new Error("ADMIN_PASSWORD atau ADMIN_SESSION_SECRET belum diisi di env var");
  return nilai;
}

export async function tandaTangan(pesan: string): Promise<string> {
  const kunci = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(rahasia()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const tanda = await crypto.subtle.sign("HMAC", kunci, new TextEncoder().encode(pesan));
  return Array.from(new Uint8Array(tanda))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function buatToken(peran: Peran): Promise<{ nilai: string; maxAge: number }> {
  const kadaluarsa = Date.now() + UMUR_SESI_DETIK * 1000;
  const isi = `${peran}.${kadaluarsa}`;
  return { nilai: `${isi}.${await tandaTangan(isi)}`, maxAge: UMUR_SESI_DETIK };
}

/** Mengembalikan peran pemegang token, atau null kalau tokennya tidak sah. */
export async function peranToken(token: string | undefined): Promise<Peran | null> {
  if (!token) return null;
  const bagian = token.split(".");
  if (bagian.length !== 3) return null;
  const [subjek, kadaluarsa, tanda] = bagian;
  if (!PERAN_SAH.includes(subjek as Peran)) return null;
  const waktu = Number(kadaluarsa);
  if (!Number.isFinite(waktu) || waktu < Date.now()) return null;
  const harusnya = await tandaTangan(`${subjek}.${kadaluarsa}`);
  if (harusnya.length !== tanda.length) return null;
  let beda = 0;
  for (let i = 0; i < harusnya.length; i += 1) beda |= harusnya.charCodeAt(i) ^ tanda.charCodeAt(i);
  return beda === 0 ? (subjek as Peran) : null;
}

function samaPersis(masukan: string, asli: string): boolean {
  const a = new TextEncoder().encode(masukan);
  const b = new TextEncoder().encode(asli);
  let beda = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    beda |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return beda === 0;
}

/**
 * Password dibandingkan dengan panjang waktu tetap supaya tidak bocor lewat
 * timing. Kedua password selalu diperiksa, bukan berhenti di yang pertama
 * cocok, supaya lama pemeriksaannya tidak memberi tahu password mana yang kena.
 */
export function cocokkanPassword(masukan: string): Peran | null {
  const superadmin = process.env.ADMIN_PASSWORD ?? "";
  const panitia = process.env.ADMIN_PASSWORD_PANITIA ?? "";

  const kenaSuperadmin = superadmin.length > 0 && samaPersis(masukan, superadmin);
  const kenaPanitia = panitia.length > 0 && samaPersis(masukan, panitia);

  if (kenaSuperadmin) return "admin";
  if (kenaPanitia) return "panitia";
  return null;
}

/**
 * Halaman panel yang boleh dibuka panitia. Dicocokkan sebagai awalan alamat,
 * jadi /admin/pendaftar ikut menutupi /admin/pendaftar/csv yang penjagaannya
 * memang hanya dari middleware.
 */
const BOLEH_PANITIA = [
  "/admin/acara",
  "/admin/pendaftar",
  "/admin/scan",
  "/admin/kabar",
  "/admin/pengumuman",
  "/admin/hero",
  "/admin/pesan",
  "/admin/keluar",
];

export function bolehBuka(peran: Peran, jalur: string): boolean {
  if (peran === "admin") return true;
  if (jalur === "/admin") return true;
  return BOLEH_PANITIA.some((awalan) => jalur === awalan || jalur.startsWith(`${awalan}/`));
}

/** Perbandingan tanda tangan dengan panjang waktu tetap. */
export async function tandaCocok(pesan: string, tanda: string): Promise<boolean> {
  const harusnya = await tandaTangan(pesan);
  if (harusnya.length !== tanda.length) return false;
  let beda = 0;
  for (let i = 0; i < harusnya.length; i += 1) beda |= harusnya.charCodeAt(i) ^ tanda.charCodeAt(i);
  return beda === 0;
}
