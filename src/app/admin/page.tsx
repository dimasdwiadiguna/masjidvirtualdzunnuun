import type { Metadata } from "next";
import Link from "next/link";
import ProgressSeason from "@/components/ProgressSeason";
import { db, memakaiSupabase } from "@/lib/data";
import { PLACEHOLDER_WA } from "@/lib/data/seed";
import { angka, judulSeason } from "@/lib/format";

export const metadata: Metadata = { title: "Ringkasan pengurus", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function RingkasanAdmin() {
  const data = await db();
  const [pengaturan, season, donasiPending, pendaftar] = await Promise.all([
    data.getSettings(),
    data.getActiveSeason(),
    data.listDonations({ status: "pending" }),
    data.listRegistrations(),
  ]);
  const progress = season ? await data.seasonProgress(season.id) : null;
  const pendaftarPending = pendaftar.filter((r) => r.status === "pending");

  const perluDiisi = [
    pengaturan.admin_whatsapp === PLACEHOLDER_WA ? "nomor WhatsApp pengurus" : null,
    pengaturan.qris_image_url ? null : "gambar QRIS",
    pengaturan.whatsapp_channel_url ? null : "link Saluran WhatsApp",
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Ringkasan</h1>

      {perluDiisi.length > 0 ? (
        <div className="mt-4 rounded-[4px] border border-bahaya bg-paper p-4">
          <p className="font-semibold text-bahaya">Belum siap dibagikan ke jamaah</p>
          <p className="mt-1">
            Yang masih kosong atau masih berisi contoh: {perluDiisi.join(", ")}. Halaman donasi tidak bisa dipakai
            sampai nomor WhatsApp pengurus benar.
          </p>
          <Link prefetch={false} href="/admin/pengaturan" className="tombol-kecil mt-3">
            Buka pengaturan
          </Link>
        </div>
      ) : null}

      {!memakaiSupabase() ? (
        <p className="mt-4 rounded-[4px] border border-garis bg-paper p-3 text-[0.95rem]">
          App ini sedang memakai penyimpanan file lokal untuk pratinjau. Isi variabel Supabase di Vercel supaya data
          tersimpan permanen.
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link prefetch={false} href="/admin/donasi?status=pending" className="kartu block p-4">
          <p className="text-ink-soft">Donasi menunggu verifikasi</p>
          <p className="mt-1 font-[family-name:var(--font-judul)] text-3xl font-bold">
            {angka(donasiPending.length)}
          </p>
          <p className="mt-1 text-sm text-teal-ink underline underline-offset-4">Buka daftar donasi</p>
        </Link>
        <Link prefetch={false} href="/admin/pendaftar" className="kartu block p-4">
          <p className="text-ink-soft">Pendaftar acara menunggu konfirmasi</p>
          <p className="mt-1 font-[family-name:var(--font-judul)] text-3xl font-bold">
            {angka(pendaftarPending.length)}
          </p>
          <p className="mt-1 text-sm text-teal-ink underline underline-offset-4">Buka daftar pendaftar</p>
        </Link>
      </div>

      <section className="mt-8">
        <h2>Season aktif</h2>
        {season && progress ? (
          <>
            <p className="mt-1 text-ink-soft">{judulSeason(season)}</p>
            <div className="mt-3 max-w-[520px]">
              <ProgressSeason season={season} progress={progress} label="Patungan berjalan" />
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              Angka ini hanya menghitung donasi berstatus terverifikasi.
            </p>
          </>
        ) : (
          <div className="kartu mt-2 p-4">
            <p className="font-semibold">Belum ada season aktif.</p>
            <p className="mt-1 text-ink-soft">Halaman donasi ikut tertutup selama tidak ada season aktif.</p>
            <Link prefetch={false} href="/admin/season" className="tombol-kecil mt-3">
              Atur season
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
