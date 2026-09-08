import type { Metadata } from "next";
import Link from "next/link";
import ProgressSeason from "@/components/ProgressSeason";
import { peranSekarang } from "@/lib/admin";
import { db, memakaiSupabase } from "@/lib/data";
import { PLACEHOLDER_WA } from "@/lib/data/seed";
import { angka, judulSeason } from "@/lib/format";

export const metadata: Metadata = { title: "Ringkasan pengurus", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ akses?: string }> };

export default async function RingkasanAdmin({ searchParams }: Props) {
  const { akses } = await searchParams;
  const peran = await peranSekarang();
  const superadmin = peran === "admin";
  const data = await db();

  // Panitia tidak melihat angka donasi sama sekali, jadi datanya juga tidak
  // diambil, bukan diambil lalu disembunyikan di tampilan.
  const [pengaturan, season, donasiPending, pendaftar] = await Promise.all([
    data.getSettings(),
    data.getActiveSeason(),
    superadmin ? data.listDonations({ status: "pending" }) : Promise.resolve([]),
    data.listRegistrations(),
  ]);
  const progress = superadmin && season ? await data.seasonProgress(season.id) : null;
  const pendaftarPending = pendaftar.filter((r) => r.status === "pending");

  const perluDiisi = [
    pengaturan.admin_whatsapp === PLACEHOLDER_WA ? "nomor WhatsApp pengurus" : null,
    pengaturan.qris_image_url ? null : "gambar QRIS",
    pengaturan.whatsapp_channel_url ? null : "link Saluran WhatsApp",
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Ringkasan</h1>

      {akses === "terbatas" ? (
        <p role="status" className="mt-4 rounded-[4px] border border-garis bg-cream p-3 text-[0.95rem]">
          Halaman itu hanya untuk pengurus inti. Yang bisa Anda urus ada di menu atas.
        </p>
      ) : null}

      {perluDiisi.length > 0 && superadmin ? (
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
        {superadmin ? (
          <Link prefetch={false} href="/admin/donasi?status=pending" className="kartu block p-4">
            <p className="text-ink-soft">Donasi menunggu verifikasi</p>
            <p className="mt-1 font-[family-name:var(--font-judul)] text-3xl font-bold">
              {angka(donasiPending.length)}
            </p>
            <p className="mt-1 text-sm text-teal-ink underline underline-offset-4">Buka daftar donasi</p>
          </Link>
        ) : null}
        <Link prefetch={false} href="/admin/pendaftar" className="kartu block p-4">
          <p className="text-ink-soft">Pendaftar acara menunggu konfirmasi</p>
          <p className="mt-1 font-[family-name:var(--font-judul)] text-3xl font-bold">
            {angka(pendaftarPending.length)}
          </p>
          <p className="mt-1 text-sm text-teal-ink underline underline-offset-4">Buka daftar pendaftar</p>
        </Link>
      </div>

      {superadmin ? (
      <section className="mt-8">
        <h2>Season aktif</h2>
        {season && progress ? (
          <>
            <p className="mt-1 text-ink-soft">{judulSeason(season)}</p>
            <div className="mt-3 max-w-[520px]">
              <ProgressSeason season={season} progress={progress} label="Donasi berjalan" />
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
      ) : null}
    </div>
  );
}
