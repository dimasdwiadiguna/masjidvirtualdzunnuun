const CADANGAN = "http://localhost:3000";

function bersihkan(nilai: string | undefined): string | null {
  const teks = nilai?.trim();
  if (!teks) return null;
  // Pengurus sering menempel alamat tanpa "https://" dari bilah alamat peramban.
  const lengkap = /^https?:\/\//i.test(teks) ? teks : `https://${teks}`;
  try {
    return new URL(lengkap).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

/**
 * Alamat publik app, dipakai untuk metadata dan gambar pratinjau tautan.
 *
 * Urutannya: nilai yang diisi pengurus, lalu alamat produksi yang disediakan
 * Vercel, lalu alamat deployment yang sedang berjalan. Env var yang ada tetapi
 * kosong diperlakukan sebagai tidak diisi. Tanpa penjagaan ini, satu variabel
 * kosong di Vercel menggagalkan seluruh build.
 */
export function alamatSitus(): string {
  return (
    bersihkan(process.env.NEXT_PUBLIC_SITE_URL) ??
    bersihkan(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    bersihkan(process.env.VERCEL_URL) ??
    CADANGAN
  );
}
