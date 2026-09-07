import type { Metadata } from "next";
import Link from "next/link";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import FormSeason from "@/components/admin/FormSeason";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import { db } from "@/lib/data";
import { judulSeason, rupiah } from "@/lib/format";
import { aktifkanSeason } from "./actions";

export const metadata: Metadata = { title: "Season", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ edit?: string; tersimpan?: string }> };

export default async function AdminSeason({ searchParams }: Props) {
  const { edit, tersimpan } = await searchParams;
  const data = await db();
  const daftar = await data.listSeasons();
  const diedit = edit ? await data.getSeasonById(edit) : null;

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Season</h1>
      <p className="mt-1 text-ink-soft">
        Hanya satu season boleh aktif. Season aktif itu yang tampil di beranda dan yang menerima donasi baru.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      <section className="mt-6">
        <h2>{diedit ? `Ubah: ${judulSeason(diedit)}` : "Buat season baru"}</h2>
        <div className="mt-3">
          <FormSeason season={diedit ?? undefined} />
        </div>
        {diedit ? (
          <Link prefetch={false} href="/admin/season" className="tombol-kecil mt-3">
            Batal mengubah, kembali ke form season baru
          </Link>
        ) : null}
      </section>

      <section className="mt-10">
        <h2>Daftar season</h2>
        {daftar.length === 0 ? (
          <p className="mt-2 text-ink-soft">Belum ada season sama sekali.</p>
        ) : (
          <div className="mt-3 grid gap-3">
            {daftar.map((season) => (
              <article key={season.id} className="kartu p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[1.05rem]">{judulSeason(season)}</h3>
                    <p className="text-sm text-ink-soft">
                      {season.start_date} sampai {season.end_date}, target {rupiah(season.target_amount)}
                    </p>
                  </div>
                  {season.is_active ? (
                    <p className="rounded-[4px] border border-sukses px-2 py-1 text-sm font-semibold text-sukses">
                      Aktif
                    </p>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link prefetch={false} href={`/admin/season?edit=${season.id}`} className="tombol-kecil">
                    Ubah
                  </Link>
                  <Link prefetch={false} href={`/season/${season.slug}`} className="tombol-kecil">
                    Lihat halaman publik
                  </Link>
                  {!season.is_active ? (
                    <KonfirmasiAksi
                      aksi={aktifkanSeason}
                      tersembunyi={{ id: season.id }}
                      labelPemicu="Jadikan aktif"
                      judul="Ganti season aktif"
                      penjelasan="Season yang sekarang aktif akan dinonaktifkan, dan beranda langsung menampilkan season ini."
                      labelKonfirmasi="Ya, ganti season aktif"
                    />
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
