import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

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
