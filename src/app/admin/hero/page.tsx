import type { Metadata } from "next";
import Image from "next/image";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import BarisTabel from "@/components/admin/BarisTabel";
import FormAksi from "@/components/admin/FormAksi";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import LaciForm from "@/components/admin/LaciForm";
import PilihGambar from "@/components/admin/PilihGambar";
import TabelAdmin from "@/components/admin/TabelAdmin";
import { db } from "@/lib/data";
import { hapusFotoHero, tambahFotoHero, ubahAktifFotoHero } from "./actions";

export const metadata: Metadata = { title: "Foto Hero", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ tersimpan?: string }> };

export default async function AdminHero({ searchParams }: Props) {
  const { tersimpan } = await searchParams;
  const foto = await (await db()).listHeroPhotos();
  const aktif = foto.filter((item) => item.is_active);

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Foto Hero</h1>
      <p className="mt-1 text-ink-soft">
        Foto besar yang berganti di bagian atas beranda. Yang tampil hanya foto yang ditandai aktif, maksimal lima,
        urut dari nomor urutan terkecil.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      <div className="mt-5">
        <LaciForm
          labelPemicu="Tambah foto hero"
          judul="Foto hero baru"
          penjelasan="Foto mendatar paling pas untuk latar hero."
        >
          <FormAksi aksi={tambahFotoHero} labelKirim="Simpan foto hero">
            <PilihGambar
              name="foto"
              label="Foto"
              bantuan="Foto mendatar paling pas. Wajah orang sebaiknya tidak di bagian bawah foto, karena tertutup teks."
            />
            <div>
              <label className="label-isian" htmlFor="caption">
                Keterangan foto
              </label>
              <input id="caption" name="caption" maxLength={80} className="isian" placeholder="Kajian Ahad pagi" />
              <p className="petunjuk">Dipakai pembaca layar. Kalau dikosongkan, dipakai keterangan umum.</p>
            </div>
            <div>
              <label className="label-isian" htmlFor="sort_order">
                Urutan tampil
              </label>
              <input id="sort_order" name="sort_order" type="number" defaultValue={foto.length} className="isian" />
            </div>
            <label className="flex items-start gap-2 text-[0.95rem]">
              <input
                type="checkbox"
                name="is_active"
                value="ya"
                defaultChecked
                className="mt-0.5 h-5 w-5 accent-[#0A8074]"
              />
              Tampilkan foto ini di beranda.
            </label>
          </FormAksi>
        </LaciForm>
      </div>

      <section className="mt-8">
        <h2>Foto yang ada</h2>
        {foto.length === 0 ? (
          <div className="kartu mt-3 p-4">
            <p className="font-semibold">Belum ada foto hero.</p>
            <p className="petunjuk">Selama kosong, bagian atas beranda tampil sebagai blok warna tanpa foto.</p>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-soft">
              {aktif.length} dari {foto.length} foto aktif.
            </p>
            <TabelAdmin
              className="mt-3"
              keterangan="Daftar foto hero berikut urutan dan status tampilnya"
              kepala={
                <tr>
                  <th scope="col">Foto</th>
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
              {foto.map((item) => (
                <BarisTabel
                  key={item.id}
                  kolom={4}
                  judulBaris={item.caption ?? "foto tanpa keterangan"}
                  ringkas={
                    <>
                      <td>
                        <div className="flex items-center gap-3">
                          <Image
                            src={item.image_url}
                            alt=""
                            width={240}
                            height={160}
                            sizes="80px"
                            className="h-[40px] w-[62px] shrink-0 rounded-[8px] object-cover"
                          />
                          <span className="font-semibold">{item.caption ?? "Tanpa keterangan"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`label-status ${item.is_active ? "status-baik" : "status-diam"}`}>
                          {item.is_active ? "Aktif" : "Disembunyikan"}
                        </span>
                      </td>
                    </>
                  }
                  tambahan={<td className="hidden sm:table-cell">{item.sort_order}</td>}
                  rincian={<p>Urutan {item.sort_order}</p>}
                  aksi={
                    <>
                      <form action={ubahAktifFotoHero}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="tombol-kecil">
                          {item.is_active ? "Sembunyikan" : "Tampilkan"}
                        </button>
                      </form>
                      <KonfirmasiAksi
                        aksi={hapusFotoHero}
                        tersembunyi={{ id: item.id }}
                        labelPemicu="Hapus"
                        judul="Hapus foto hero"
                        penjelasan="Foto ini hilang dari beranda dan tidak bisa dikembalikan."
                        labelKonfirmasi="Ya, hapus foto ini"
                        nadaBahaya
                      />
                    </>
                  }
                />
              ))}
            </TabelAdmin>
          </>
        )}
      </section>
    </div>
  );
}
