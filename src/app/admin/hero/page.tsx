import type { Metadata } from "next";
import Image from "next/image";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import FormAksi from "@/components/admin/FormAksi";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import PilihGambar from "@/components/admin/PilihGambar";
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

      <section className="mt-6">
        <h2>Tambah foto</h2>
        <FormAksi aksi={tambahFotoHero} labelKirim="Tambah foto hero" className="mt-3 max-w-[520px]">
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
      </section>

      <section className="mt-10">
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
              {aktif.length > 5 ? " Yang tampil di beranda hanya lima teratas." : ""}
            </p>
            <ul className="mt-3 grid gap-3">
              {foto.map((item) => (
                <li key={item.id} className="kartu flex flex-wrap items-center gap-3 p-3">
                  <Image
                    src={item.image_url}
                    alt={item.caption ?? ""}
                    width={240}
                    height={160}
                    sizes="120px"
                    className="h-[72px] w-[110px] rounded-[8px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.caption ?? "Tanpa keterangan"}</p>
                    <p className="text-sm text-ink-soft">
                      Urutan {item.sort_order}, {item.is_active ? "aktif" : "tidak aktif"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                      labelKonfirmasi="Ya, hapus foto"
                      nadaBahaya
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
