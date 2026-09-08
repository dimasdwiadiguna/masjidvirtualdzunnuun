import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import BarisTabel from "@/components/admin/BarisTabel";
import FormPengumuman from "@/components/admin/FormPengumuman";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import LaciForm from "@/components/admin/LaciForm";
import TabelAdmin from "@/components/admin/TabelAdmin";
import { db } from "@/lib/data";
import { hapusPengumuman, ubahAktifPengumuman } from "./actions";

export const metadata: Metadata = { title: "Pengumuman", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ edit?: string; tersimpan?: string }> };

export default async function AdminPengumuman({ searchParams }: Props) {
  const { edit, tersimpan } = await searchParams;
  const daftar = await (await db()).listAnnouncements();
  const diedit = edit ? daftar.find((satu) => satu.id === edit) : undefined;

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Pengumuman</h1>
      <p className="mt-1 text-ink-soft">
        Gambar yang berjalan sendiri di beranda, di atas Laporan Kegiatan. Dipakai untuk pemberitahuan seperti aturan
        masjid atau ucapan hari besar.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      <div className="mt-5">
        <LaciForm
          labelPemicu="Buat pengumuman baru"
          judul="Pengumuman baru"
          penjelasan="Gambar wajib. Keterangannya boleh dikosongkan."
        >
          <FormPengumuman urutanBerikut={daftar.length} />
        </LaciForm>
      </div>

      {diedit ? (
        <LaciForm
          labelPemicu="Lanjut mengubah"
          judul={`Ubah: ${diedit.title}`}
          terbukaAwal
          alamatTutup="/admin/pengumuman"
        >
          <FormPengumuman pengumuman={diedit} urutanBerikut={daftar.length} />
        </LaciForm>
      ) : null}

      <section className="mt-8">
        <h2>Pengumuman yang ada</h2>
        {daftar.length === 0 ? (
          <div className="kartu mt-3 p-4">
            <p className="font-semibold">Belum ada pengumuman.</p>
            <p className="petunjuk">Selama kosong, bagian ini tidak muncul sama sekali di beranda.</p>
          </div>
        ) : (
          <TabelAdmin
            className="mt-3"
            keterangan="Daftar pengumuman yang tampil di beranda"
            kepala={
              <tr>
                <th scope="col">Pengumuman</th>
                <th scope="col">Status</th>
                <th scope="col" className="hidden sm:table-cell">
                  Urutan
                </th>
                <th scope="col" className="sel-aksi">
                  Aksi
                </th>
              </tr>
            }
          >
            {daftar.map((satu) => (
              <BarisTabel
                key={satu.id}
                kolom={4}
                judulBaris={satu.title}
                ringkas={
                  <>
                    <td>
                      <div className="flex items-center gap-3">
                        <Image
                          src={satu.image_url}
                          alt=""
                          width={160}
                          height={160}
                          sizes="56px"
                          className="h-[44px] w-[44px] shrink-0 rounded-[8px] object-cover"
                        />
                        <span className="font-semibold">{satu.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`label-status ${satu.is_active ? "status-baik" : "status-diam"}`}>
                        {satu.is_active ? "Tampil" : "Disembunyikan"}
                      </span>
                    </td>
                  </>
                }
                tambahan={<td className="hidden sm:table-cell">{satu.sort_order}</td>}
                rincian={<p>Urutan {satu.sort_order}</p>}
                aksi={
                  <>
                    <Link
                      prefetch={false}
                      href={`/admin/pengumuman?edit=${satu.id}`}
                      className="tombol-kecil"
                    >
                      Ubah
                    </Link>
                    {satu.is_active ? (
                      <Link prefetch={false} href={`/pengumuman/${satu.slug}`} className="tombol-kecil">
                        Lihat
                      </Link>
                    ) : null}
                    <form action={ubahAktifPengumuman}>
                      <input type="hidden" name="id" value={satu.id} />
                      <button type="submit" className="tombol-kecil">
                        {satu.is_active ? "Sembunyikan" : "Tampilkan"}
                      </button>
                    </form>
                    <KonfirmasiAksi
                      aksi={hapusPengumuman}
                      tersembunyi={{ id: satu.id }}
                      labelPemicu="Hapus"
                      judul={`Hapus pengumuman ${satu.title}`}
                      penjelasan="Pengumuman ini hilang dari beranda dan tidak bisa dikembalikan."
                      labelKonfirmasi="Ya, hapus pengumuman ini"
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
