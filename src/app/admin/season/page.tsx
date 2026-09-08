import type { Metadata } from "next";
import Link from "next/link";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import BarisTabel from "@/components/admin/BarisTabel";
import FormSeason from "@/components/admin/FormSeason";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import LaciForm from "@/components/admin/LaciForm";
import TabelAdmin from "@/components/admin/TabelAdmin";
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

      <div className="mt-5">
        <LaciForm
          labelPemicu="Buat season baru"
          judul="Season baru"
          penjelasan="Season baru tidak langsung aktif kecuali kotak aktifnya dicentang."
        >
          <FormSeason />
        </LaciForm>
      </div>

      {diedit ? (
        <LaciForm
          labelPemicu="Lanjut mengubah"
          judul={`Ubah: ${judulSeason(diedit)}`}
          terbukaAwal
          alamatTutup="/admin/season"
        >
          <FormSeason season={diedit} />
        </LaciForm>
      ) : null}

      <section className="mt-8">
        <h2>Daftar season</h2>
        {daftar.length === 0 ? (
          <div className="kartu mt-3 p-4">
            <p className="font-semibold">Belum ada season sama sekali.</p>
            <p className="petunjuk">Formulir donasi baru bisa dipakai setelah ada season aktif.</p>
          </div>
        ) : (
          <TabelAdmin
            className="mt-3"
            keterangan="Daftar season berikut target dan status aktifnya"
            kepala={
              <tr>
                <th scope="col">Season</th>
                <th scope="col">Status</th>
                <th scope="col" className="hidden sm:table-cell">
                  Periode
                </th>
                <th scope="col" className="hidden sm:table-cell">
                  Target
                </th>
                <th scope="col" className="sel-aksi">
                  Aksi
                </th>
              </tr>
            }
          >
            {daftar.map((season) => (
              <BarisTabel
                key={season.id}
                kolom={5}
                judulBaris={judulSeason(season)}
                ringkas={
                  <>
                    <td>
                      <span className="font-semibold">{judulSeason(season)}</span>
                      <span className="block text-xs text-ink-soft sm:hidden">
                        {season.start_date} sampai {season.end_date}
                      </span>
                    </td>
                    <td>
                      <span className={`label-status ${season.is_active ? "status-baik" : "status-diam"}`}>
                        {season.is_active ? "Aktif" : "Selesai"}
                      </span>
                    </td>
                  </>
                }
                tambahan={
                  <>
                    <td className="hidden whitespace-nowrap sm:table-cell">
                      {season.start_date} sampai {season.end_date}
                    </td>
                    <td className="hidden whitespace-nowrap sm:table-cell">{rupiah(season.target_amount)}</td>
                  </>
                }
                rincian={
                  <>
                    <p>
                      {season.start_date} sampai {season.end_date}
                    </p>
                    <p>Target {rupiah(season.target_amount)}</p>
                  </>
                }
                aksi={
                  <>
                    <Link prefetch={false} href={`/admin/season?edit=${season.id}`} className="tombol-kecil">
                      Ubah
                    </Link>
                    <Link prefetch={false} href={`/season/${season.slug}`} className="tombol-kecil">
                      Lihat
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
                  </>
                }
              />
            ))}
          </TabelAdmin>
        )}
      </section>
    </div>
  );
}
