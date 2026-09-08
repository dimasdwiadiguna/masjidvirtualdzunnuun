import type { Metadata } from "next";
import Image from "next/image";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import BarisTabel from "@/components/admin/BarisTabel";
import FormAksi from "@/components/admin/FormAksi";
import LaciForm from "@/components/admin/LaciForm";
import PilihGambar from "@/components/admin/PilihGambar";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import TabelAdmin from "@/components/admin/TabelAdmin";
import { db } from "@/lib/data";
import { judulSeason } from "@/lib/format";
import { hapusSponsor, simpanSponsor } from "./actions";

export const metadata: Metadata = { title: "Sponsor", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ tersimpan?: string }> };

export default async function AdminSponsor({ searchParams }: Props) {
  const { tersimpan } = await searchParams;
  const data = await db();
  const seasons = await data.listSeasons();
  const aktif = seasons.find((s) => s.is_active) ?? seasons[0] ?? null;
  const sponsor = aktif ? await data.listSponsors(aktif.id) : [];

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Sponsor</h1>
      <p className="mt-1 text-ink-soft">
        Bagian sponsor di halaman season hanya muncul kalau ada isinya. Kalau kosong, halaman tetap rapi tanpa kotak
        kosong.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      {seasons.length === 0 ? (
        <p className="mt-4 text-ink-soft">Buat season lebih dulu sebelum menambahkan sponsor.</p>
      ) : (
        <>
          <div className="mt-5">
            <LaciForm
              labelPemicu="Tambah sponsor baru"
              judul="Sponsor baru"
              penjelasan="Bagian sponsor hanya muncul di halaman season kalau ada isinya."
            >
            <FormAksi aksi={simpanSponsor} labelKirim="Simpan sponsor">
              <div>
                <label className="label-isian" htmlFor="season_id">
                  Season
                </label>
                <select id="season_id" name="season_id" className="isian" defaultValue={aktif?.id}>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {judulSeason(season)}
                      {season.is_active ? " (aktif)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-isian" htmlFor="name">
                  Nama sponsor
                </label>
                <input id="name" name="name" required className="isian" />
              </div>
              <div>
                <label className="label-isian" htmlFor="link_url">
                  Link (boleh dikosongkan)
                </label>
                <input id="link_url" name="link_url" className="isian" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-isian" htmlFor="tier">
                    Jenis dukungan
                  </label>
                  <select id="tier" name="tier" className="isian" defaultValue="pendukung">
                    <option value="utama">Utama</option>
                    <option value="pendukung">Pendukung</option>
                  </select>
                </div>
                <div>
                  <label className="label-isian" htmlFor="sort_order">
                    Urutan tampil
                  </label>
                  <input id="sort_order" name="sort_order" type="number" defaultValue={0} className="isian" />
                </div>
              </div>
              <PilihGambar
                name="logo"
                label="Logo"
                bantuan="Kalau logonya belum ada, nama sponsor yang ditampilkan sebagai teks."
              />
            </FormAksi>
            </LaciForm>
          </div>

          <section className="mt-8">
            <h2>Sponsor {aktif ? judulSeason(aktif) : ""}</h2>
            {sponsor.length === 0 ? (
              <div className="kartu mt-3 p-4">
                <p className="font-semibold">Belum ada sponsor untuk season ini.</p>
                <p className="petunjuk">Halaman season tetap rapi tanpa kotak kosong selama bagian ini kosong.</p>
              </div>
            ) : (
              <TabelAdmin
                className="mt-3"
                keterangan="Daftar sponsor season ini"
                kepala={
                  <tr>
                    <th scope="col">Sponsor</th>
                    <th scope="col">Jenis</th>
                    <th scope="col" className="hidden sm:table-cell">
                      Urutan
                    </th>
                    <th scope="col" className="sel-aksi">
                      Aksi
                    </th>
                  </tr>
                }
              >
                {sponsor.map((item) => (
                  <BarisTabel
                    key={item.id}
                    kolom={4}
                    judulBaris={item.name}
                    ringkas={
                      <>
                        <td>
                          <div className="flex items-center gap-3">
                            {item.logo_url ? (
                              <Image
                                src={item.logo_url}
                                alt=""
                                width={160}
                                height={80}
                                sizes="80px"
                                className="h-8 w-auto shrink-0"
                              />
                            ) : null}
                            <span className="font-semibold">{item.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`label-status ${item.tier === "utama" ? "status-baik" : "status-diam"}`}>
                            {item.tier === "utama" ? "Utama" : "Pendukung"}
                          </span>
                        </td>
                      </>
                    }
                    tambahan={<td className="hidden sm:table-cell">{item.sort_order}</td>}
                    rincian={<p>Urutan {item.sort_order}</p>}
                    aksi={
                      <KonfirmasiAksi
                        aksi={hapusSponsor}
                        tersembunyi={{ id: item.id }}
                        labelPemicu="Hapus"
                        judul={`Hapus sponsor ${item.name}`}
                        penjelasan="Sponsor ini hilang dari halaman season."
                        labelKonfirmasi="Ya, hapus sponsor ini"
                        nadaBahaya
                      />
                    }
                  />
                ))}
              </TabelAdmin>
            )}
          </section>
        </>
      )}
    </div>
  );
}
