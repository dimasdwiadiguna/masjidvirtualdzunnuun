import type { Metadata } from "next";
import BarisTabel from "@/components/admin/BarisTabel";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import TabelAdmin from "@/components/admin/TabelAdmin";
import { IkonWhatsApp } from "@/components/Ikon";
import { db } from "@/lib/data";
import { samarkanWa, tanggalPendek } from "@/lib/format";
import { pesanKartu, templatDari } from "@/lib/pesan-wa";
import { alamatSitus } from "@/lib/situs";
import { linkWa } from "@/lib/wa";
import { buatTautanKartu } from "./actions";

export const metadata: Metadata = { title: "Jamaah Loyal", robots: { index: false } };
export const dynamic = "force-dynamic";

const TARGET = 10;

export default async function AdminLoyal() {
  const data = await db();
  const [ringkasan, pengaturan] = await Promise.all([data.ringkasanKehadiran(), data.getSettings()]);
  // Kata-kata pesannya diambil sekali untuk seluruh tabel, bukan per baris.
  const templat = templatDari(pengaturan);

  // Tautan yang sudah pernah dibuat, diambil sekali. Membuka halaman ini tidak
  // membuat token baru: token lahir saat pengurus menekan tombolnya.
  const tautan = await data.semuaTautanKartu();

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Jamaah Loyal</h1>
      <p className="mt-1 text-ink-soft">
        Dihitung dari tiket yang benar-benar di-check-in, bukan dari yang mendaftar. Satu tiket dihitung satu kehadiran
        walaupun dipakai untuk beberapa orang. Tiap {TARGET} kehadiran berhak hadiah khusus.
      </p>

      {ringkasan.length === 0 ? (
        <div className="kartu mt-5 p-4">
          <p className="font-semibold">Belum ada kehadiran yang tercatat.</p>
          <p className="petunjuk">Baris muncul begitu ada tiket yang di-check-in di menu Check-in.</p>
        </div>
      ) : (
        <TabelAdmin
          className="mt-5"
          keterangan="Daftar jamaah berikut jumlah kehadirannya"
          kepala={
            <tr>
              <th scope="col">Jamaah</th>
              <th scope="col">Hadir</th>
              <th scope="col" className="hidden sm:table-cell">
                Terakhir
              </th>
              <th scope="col" className="sel-aksi">
                Aksi
              </th>
            </tr>
          }
        >
          {ringkasan.map((satu) => {
            const token = tautan.get(satu.whatsapp);
            const alamat = token ? `${alamatSitus()}/kartu/${token}` : "";
            const stempel = satu.hadir % TARGET;
            const penuh = satu.hadir > 0 && stempel === 0;
            const isi = {
              nama: satu.nama,
              tautan: alamat,
              hadir: satu.hadir,
              kurang: penuh ? 0 : TARGET - stempel,
            };

            return (
              <BarisTabel
                key={satu.whatsapp}
                kolom={4}
                judulBaris={satu.nama}
                ringkas={
                  <>
                    <td>
                      <span className="font-semibold">{satu.nama}</span>
                      <span className="block text-xs text-ink-soft">{samarkanWa(satu.whatsapp)}</span>
                    </td>
                    <td>
                      <span className={`label-status ${penuh ? "status-baik" : "status-diam"}`}>
                        {satu.hadir}
                        {penuh ? " · berhak hadiah" : ""}
                      </span>
                    </td>
                  </>
                }
                tambahan={
                  <td className="hidden whitespace-nowrap sm:table-cell">
                    {satu.terakhir ? tanggalPendek(satu.terakhir) : "-"}
                  </td>
                }
                rincian={
                  <>
                    <p>{satu.terakhir ? `Terakhir hadir ${tanggalPendek(satu.terakhir)}` : "Belum ada tanggal"}</p>
                    <p>{penuh ? "Kartu penuh, berhak hadiah" : `Kurang ${TARGET - stempel} lagi`}</p>
                  </>
                }
                aksi={
                  <>
                    {alamat ? (
                      <a
                        href={linkWa(
                          satu.whatsapp,
                          pesanKartu(templat, penuh ? "hadiah_loyalitas" : "kartu_loyalitas", isi),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tombol-kecil"
                      >
                        <IkonWhatsApp className="mr-2" />
                        {penuh ? "Kabari hadiah" : "Kirim kartu"}
                      </a>
                    ) : null}
                    {alamat ? (
                      <KonfirmasiAksi
                        aksi={buatTautanKartu}
                        tersembunyi={{ whatsapp: satu.whatsapp }}
                        labelPemicu="Ganti tautan"
                        judul={`Ganti tautan kartu ${satu.nama}`}
                        penjelasan="Tautan lama langsung tidak bisa dibuka lagi. Pakai ini kalau tautannya terlanjur tersebar ke orang lain."
                        labelKonfirmasi="Ya, ganti tautannya"
                      />
                    ) : (
                      <form action={buatTautanKartu}>
                        <input type="hidden" name="whatsapp" value={satu.whatsapp} />
                        <button type="submit" className="tombol-kecil">
                          Buat tautan kartu
                        </button>
                      </form>
                    )}
                  </>
                }
              />
            );
          })}
        </TabelAdmin>
      )}
    </div>
  );
}
