import type { Metadata } from "next";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import BarisTabel from "@/components/admin/BarisTabel";
import FormAksi from "@/components/admin/FormAksi";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import LaciForm from "@/components/admin/LaciForm";
import TabelAdmin from "@/components/admin/TabelAdmin";
import { db } from "@/lib/data";
import { hapusPostSosmed, simpanPostSosmed, ubahAktifPostSosmed } from "./actions";

export const metadata: Metadata = { title: "Post Sosmed", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ tersimpan?: string }> };

export default async function AdminSosmed({ searchParams }: Props) {
  const { tersimpan } = await searchParams;
  const daftar = await (await db()).listSocialPosts();

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Post Sosmed</h1>
      <p className="mt-1 text-ink-soft">
        Post Instagram dan TikTok yang ditampilkan di beranda. Isinya diambil langsung dari platformnya, jadi kalau
        postnya diubah atau dihapus di sana, yang di sini ikut berubah.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      <div className="mt-5">
        <LaciForm
          labelPemicu="Tambah post baru"
          judul="Post sosmed baru"
          penjelasan="Salin tautan post dari tombol bagikan di aplikasi Instagram atau TikTok."
        >
          <FormAksi aksi={simpanPostSosmed} labelKirim="Simpan post">
            <div>
              <label className="label-isian" htmlFor="post_url">
                Tautan post
              </label>
              <input
                id="post_url"
                name="post_url"
                type="url"
                required
                className="isian"
                placeholder="https://www.instagram.com/p/..."
              />
              <p className="petunjuk">
                Platformnya dikenali otomatis dari tautannya. Tautan profil tidak bisa dipakai, harus tautan satu post.
              </p>
            </div>
            <div>
              <label className="label-isian" htmlFor="sort_order">
                Urutan tampil
              </label>
              <input id="sort_order" name="sort_order" type="number" defaultValue={daftar.length} className="isian" />
            </div>
            <label className="flex items-center gap-2 text-[0.95rem]">
              <input type="checkbox" name="is_active" value="ya" defaultChecked className="h-5 w-5" />
              Tampilkan di beranda
            </label>
          </FormAksi>
        </LaciForm>
      </div>

      <section className="mt-8">
        <h2>Post yang ada</h2>
        {daftar.length === 0 ? (
          <div className="kartu mt-3 p-4">
            <p className="font-semibold">Belum ada post yang dipilih.</p>
            <p className="petunjuk">Selama kosong, bagian sosmed tidak muncul sama sekali di beranda.</p>
          </div>
        ) : (
          <TabelAdmin
            className="mt-3"
            keterangan="Daftar post sosmed yang tampil di beranda"
            kepala={
              <tr>
                <th scope="col">Post</th>
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
                judulBaris={satu.post_url}
                ringkas={
                  <>
                    <td>
                      <span className="font-semibold">
                        {satu.platform === "instagram" ? "Instagram" : "TikTok"}
                      </span>
                      <span className="block break-all text-xs text-ink-soft">{satu.post_url}</span>
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
                    <a href={satu.post_url} target="_blank" rel="noopener noreferrer" className="tombol-kecil">
                      Buka post
                    </a>
                    <form action={ubahAktifPostSosmed}>
                      <input type="hidden" name="id" value={satu.id} />
                      <button type="submit" className="tombol-kecil">
                        {satu.is_active ? "Sembunyikan" : "Tampilkan"}
                      </button>
                    </form>
                    <KonfirmasiAksi
                      aksi={hapusPostSosmed}
                      tersembunyi={{ id: satu.id }}
                      labelPemicu="Hapus"
                      judul="Hapus post dari beranda"
                      penjelasan="Postnya sendiri di Instagram atau TikTok tidak ikut terhapus, hanya berhenti ditampilkan di sini."
                      labelKonfirmasi="Ya, hapus dari beranda"
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
