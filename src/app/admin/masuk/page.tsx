import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Masuk pengurus", robots: { index: false } };
export const dynamic = "force-dynamic";

const PESAN_GALAT: Record<string, string> = {
  salah: "Password belum cocok. Coba periksa huruf besar kecilnya.",
  batas: "Terlalu banyak percobaan. Tunggu sekitar sepuluh menit sebelum mencoba lagi.",
  "belum-disetel": "ADMIN_PASSWORD belum diisi di env var server. Hubungi yang memasang app ini.",
};

type Props = { searchParams: Promise<{ tujuan?: string; galat?: string }> };

export default async function HalamanMasuk({ searchParams }: Props) {
  const { tujuan, galat } = await searchParams;
  const tujuanAman = tujuan && tujuan.startsWith("/admin") && !tujuan.startsWith("/admin/masuk") ? tujuan : "/admin";
  const pesan = galat ? (PESAN_GALAT[galat] ?? PESAN_GALAT.salah) : null;

  return (
    <div className="kolom-isi py-10">
      <h1>Panel pengurus</h1>
      <p className="mt-2 text-ink-soft">
        Satu password dipakai bersama semua pengurus. Kalau lupa, tanyakan ke yang memasang app ini.
      </p>

      <form method="post" action="/admin/masuk/kirim" className="mt-6 grid gap-4">
        <input type="hidden" name="tujuan" value={tujuanAman} />
        {pesan ? (
          <p role="alert" className="rounded-[4px] border-2 border-bahaya bg-paper p-3 text-bahaya">
            {pesan}
          </p>
        ) : null}
        <div>
          <label className="label-isian" htmlFor="password">
            Password bersama
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="isian"
          />
        </div>
        <div>
          <button type="submit" className="tombol-utama w-full">
            Masuk panel pengurus
          </button>
        </div>
      </form>

      <Link href="/" className="tombol-kedua mt-6">
        Kembali ke halaman publik
      </Link>
    </div>
  );
}
