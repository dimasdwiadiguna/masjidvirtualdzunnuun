import type { NextConfig } from "next";

// Env var yang ada tetapi kosong atau salah bentuk tidak boleh menggagalkan
// build. Kalau alamatnya tidak terbaca, optimasi gambar jarak jauh dimatikan
// dan sisanya tetap jalan.
function hostSupabase(): string | null {
  const nilai = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!nilai) return null;
  try {
    return new URL(nilai).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = hostSupabase();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
    formats: ["image/webp"],
  },
  poweredByHeader: false,
  // Metadata dikirim di dalam <head>, bukan dialirkan menyusul di akhir dokumen.
  // Pengambil pratinjau tautan WhatsApp membaca HTML mentah dan sering berhenti
  // di bagian kepala, jadi judul dan deskripsi harus sudah ada di sana.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
