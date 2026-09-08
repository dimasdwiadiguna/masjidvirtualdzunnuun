import type { Metadata } from "next";
import Link from "next/link";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import BarisTabel from "@/components/admin/BarisTabel";
import FormKabar from "@/components/admin/FormKabar";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import LaciForm from "@/components/admin/LaciForm";
import TabelAdmin from "@/components/admin/TabelAdmin";
import { db } from "@/lib/data";
import { tanggalPendek } from "@/lib/format";
import { hapusKabar } from "./actions";

export const metadata: Metadata = { title: "Laporan Kegiatan", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ edit?: string; tersimpan?: string }> };

export default async function AdminKabar({ searchParams }: Props) {
  const { edit, tersimpan } = await searchParams;
  const data = await db();
  const [daftar, season] = await Promise.all([data.listUpdates(), data.getActiveSeason()]);
  const diedit = edit ? await data.getUpdateById(edit) : null;

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Laporan Kegiatan</h1>
      <p className="mt-1 text-ink-soft">
        Laporan dari kegiatan yang sudah terlaksana di season ini. Satu foto, judul pendek, dan dua sampai empat
        kalimat sudah cukup.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      <div className="mt-5">
        <LaciForm
          labelPemicu="Tulis laporan baru"
          judul="Laporan baru"
          penjelasan="Tulis angka yang benar-benar terjadi. Kalau angkanya belum ada, tulis tanpa angka."
        >
          <FormKabar season={season} />
        </LaciForm>
      </div>

      {diedit ? (
        <LaciForm
          labelPemicu="Lanjut mengubah"
          judul={`Ubah: ${diedit.title}`}
          terbukaAwal
          alamatTutup="/admin/kabar"
        >
          <FormKabar kabar={diedit} season={season} />
        </LaciForm>
      ) : null}

      <section className="mt-8">
        <h2>Laporan yang sudah ada</h2>
        {daftar.length === 0 ? (
          <div className="kartu mt-3 p-4">
            <p className="font-semibold">Belum ada laporan yang ditulis.</p>
            <p className="petunjuk">Laporan yang rutin adalah alasan orang membuka app ini lagi.</p>
          </div>
        ) : (
          <TabelAdmin
            className="mt-3"
            keterangan="Daftar laporan kegiatan berikut status terbitnya"
            kepala={
              <tr>
                <th scope="col">Laporan</th>
                <th scope="col">Status</th>
                <th scope="col" className="hidden sm:table-cell">
                  Tanggal
                </th>
                <th scope="col" className="sel-aksi">
                  Aksi
                </th>
              </tr>
            }
          >
            {daftar.map((kabar) => (
              <BarisTabel
                key={kabar.id}
                kolom={4}
                judulBaris={kabar.title}
                ringkas={
                  <>
                    <td>
                      {kabar.activity_label ? (
                        <span className="block text-xs font-semibold text-gold-ink">{kabar.activity_label}</span>
                      ) : null}
                      <span className="font-semibold">{kabar.title}</span>
                      <span className="block text-xs text-ink-soft sm:hidden">
                        {tanggalPendek(kabar.published_at)}
                      </span>
                    </td>
                    <td>
                      <span className={`label-status ${kabar.is_published ? "status-baik" : "status-diam"}`}>
                        {kabar.is_published ? "Terbit" : "Draf"}
                      </span>
                    </td>
                  </>
                }
                tambahan={
                  <td className="hidden whitespace-nowrap sm:table-cell">{tanggalPendek(kabar.published_at)}</td>
                }
                rincian={<p>Terbit {tanggalPendek(kabar.published_at)}</p>}
                aksi={
                  <>
                    <Link prefetch={false} href={`/admin/kabar?edit=${kabar.id}`} className="tombol-kecil">
                      Ubah
                    </Link>
                    {kabar.is_published ? (
                      <Link prefetch={false} href={`/kabar/${kabar.id}`} className="tombol-kecil">
                        Lihat
                      </Link>
                    ) : null}
                    <KonfirmasiAksi
                      aksi={hapusKabar}
                      tersembunyi={{ id: kabar.id }}
                      labelPemicu="Hapus"
                      judul={`Hapus laporan ${kabar.title}`}
                      penjelasan="Laporan ini hilang dari halaman publik dan tidak bisa dikembalikan."
                      labelKonfirmasi="Ya, hapus laporan ini"
                      nadaBahaya
                    />
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
