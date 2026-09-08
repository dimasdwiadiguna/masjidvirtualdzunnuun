import "server-only";
import { cookies } from "next/headers";

/**
 * Kuki penanda hasil kirim formulir.
 *
 * Halaman status pribadi per kode sudah dihapus: jamaah tidak pernah menyimpan
 * alamatnya, dan habitatnya ada di WhatsApp. Yang tersisa hanya satu layar
 * hasil yang muncul sesaat setelah formulir dikirim.
 *
 * Kodenya dititipkan di kuki, bukan di alamat halaman, supaya layar itu tidak
 * bisa ditebak, dibagikan, atau di-bookmark. Dan bukan di state klien, karena
 * jamaah akan berpindah ke aplikasi bank untuk transfer: saat kembali, tab
 * peramban di HP sering sudah dimuat ulang dan state klien lenyap berikut
 * nominal uniknya. Pelajaran yang sama dengan D-64.
 */
const UMUR_DETIK = 2 * 60 * 60;

export const KUKI_DONASI = "dzn-donasi";
export const KUKI_TIKET = "dzn-tiket";

export const KUKI_POLLING = "dzn-polling";

/** Umur kuki penanda polling jauh lebih panjang: satu suara per perangkat. */
const UMUR_POLLING = 365 * 24 * 60 * 60;

export async function simpanKodeHasil(nama: string, kode: string, umur = UMUR_DETIK): Promise<void> {
  (await cookies()).set(nama, kode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: umur,
  });
}

/**
 * Penanda perangkat untuk polling. Dibuat sekali lalu dipakai terus, dan
 * keunikannya ditegakkan batas unik di database, bukan pemeriksaan di sini.
 */
export async function penandaPolling(): Promise<string> {
  const ada = await bacaKodeHasil(KUKI_POLLING);
  if (ada) return ada;
  const baru = crypto.randomUUID();
  await simpanKodeHasil(KUKI_POLLING, baru, UMUR_POLLING);
  return baru;
}

export async function bacaKodeHasil(nama: string): Promise<string | null> {
  return (await cookies()).get(nama)?.value ?? null;
}
