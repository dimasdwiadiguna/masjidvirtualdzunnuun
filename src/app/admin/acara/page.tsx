import type { Metadata } from "next";
import Link from "next/link";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import BarisTabel from "@/components/admin/BarisTabel";
import FormAcara from "@/components/admin/FormAcara";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import LaciForm from "@/components/admin/LaciForm";
import TabelAdmin from "@/components/admin/TabelAdmin";
import { db } from "@/lib/data";
import { rupiah, tanggalDanJam } from "@/lib/format";
import { hapusAcara } from "./actions";

export const metadata: Metadata = { title: "Acara", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ edit?: string; tersimpan?: string }> };

export default async function AdminAcara({ searchParams }: Props) {
  const { edit, tersimpan } = await searchParams;
  const data = await db();
  const daftar = await data.listEvents();
  const diedit = edit ? await data.getEventById(edit) : null;

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Acara</h1>
      <p className="mt-1 text-ink-soft">
        Acara yang belum diterbitkan hanya terlihat di halaman ini. Kuota dan tenggat menutup tombol daftar secara
        otomatis.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      <div className="mt-5">
        <LaciForm
          labelPemicu="Buat acara baru"
          judul="Acara baru"
          penjelasan="Semua waktu dibaca sebagai waktu Jakarta."
        >
          <FormAcara />
        </LaciForm>
      </div>

      {diedit ? (
        <LaciForm
          labelPemicu="Lanjut mengubah"
          judul={`Ubah: ${diedit.title}`}
          terbukaAwal
          alamatTutup="/admin/acara"
        >
          <FormAcara acara={diedit} />
        </LaciForm>
      ) : null}

      <section className="mt-8">
        <h2>Daftar acara</h2>
        {daftar.length === 0 ? (
          <div className="kartu mt-3 p-4">
            <p className="font-semibold">Belum ada acara yang dibuat.</p>
            <p className="petunjuk">Tekan Buat acara baru di atas untuk mulai.</p>
          </div>
        ) : (
          <TabelAdmin
            className="mt-3"
            keterangan="Daftar acara berikut status terbitnya"
            kepala={
              <tr>
                <th scope="col">Acara</th>
                <th scope="col">Status</th>
                <th scope="col" className="hidden sm:table-cell">
                  Waktu
                </th>
                <th scope="col" className="hidden sm:table-cell">
                  Biaya
                </th>
                <th scope="col" className="sel-aksi">
                  Aksi
                </th>
              </tr>
            }
          >
            {daftar.map((acara) => (
              <BarisTabel
                key={acara.id}
                kolom={5}
                judulBaris={acara.title}
                ringkas={
                  <>
                    <td>
                      <span className="font-semibold">{acara.title}</span>
                      <span className="block text-xs text-ink-soft sm:hidden">{tanggalDanJam(acara.starts_at)}</span>
                    </td>
                    <td>
                      <span className={`label-status ${acara.is_published ? "status-baik" : "status-diam"}`}>
                        {acara.is_published ? "Terbit" : "Draf"}
                      </span>
                    </td>
                  </>
                }
                tambahan={
                  <>
                    <td className="hidden whitespace-nowrap sm:table-cell">{tanggalDanJam(acara.starts_at)}</td>
                    <td className="hidden whitespace-nowrap sm:table-cell">
                      {acara.is_paid ? rupiah(acara.price) : "Gratis"}
                    </td>
                  </>
                }
                rincian={
                  <>
                    <p>{acara.is_paid ? `${rupiah(acara.price)} per orang` : "Gratis"}</p>
                    <p>Kuota {acara.capacity ?? "tanpa batas"}</p>
                    {acara.location_name ? <p>{acara.location_name}</p> : null}
                  </>
                }
                aksi={
                  <>
                    <Link prefetch={false} href={`/admin/acara?edit=${acara.id}`} className="tombol-kecil">
                      Ubah
                    </Link>
                    <Link prefetch={false} href={`/admin/pendaftar?acara=${acara.id}`} className="tombol-kecil">
                      Pendaftar
                    </Link>
                    {acara.is_published ? (
                      <Link prefetch={false} href={`/acara/${acara.slug}`} className="tombol-kecil">
                        Lihat
                      </Link>
                    ) : null}
                    <KonfirmasiAksi
                      aksi={hapusAcara}
                      tersembunyi={{ id: acara.id }}
                      labelPemicu="Hapus"
                      judul={`Hapus acara ${acara.title}`}
                      penjelasan="Acara ini hilang dari halaman publik dan tidak bisa dikembalikan. Pendaftar yang sudah masuk ikut hilang."
                      labelKonfirmasi="Ya, hapus acara ini"
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
