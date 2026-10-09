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
import { buatTautanKartu, terbitkanKartu } from "./actions";

export const metadata: Metadata = { title: "Jamaah Loyal", robots: { index: false } };
export const dynamic = "force-dynamic";

const TARGET = 10;

export default async function AdminLoyal() {
  const data = await db();
  const [ringkasan, pengaturan] = await Promise.all([data.ringkasanKehadiran(), data.getSettings()]);
  // Kata-kata pesannya diambil sekali untuk seluruh tabel, bukan per baris.
  const templat = templatDari(pengaturan);

  // Kartu yang sudah pernah dibuat, diambil sekali. Membuka halaman ini tidak
  // membuat kartu baru: kartu lahir saat jamaahnya pertama kali di-check-in,
  // dan tombol di tiap baris hanya untuk jamaah yang hadir sebelum nomor
  // jamaah ada.
  const kartu = await data.semuaKartuJamaah();

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Jamaah Loyal</h1>
      <p className="mt-1 text-ink-soft">
        Dihitung dari tiket yang benar-benar di-check-in, bukan dari yang mendaftar. Satu tiket dihitung satu kehadiran
        walaupun dipakai untuk beberapa orang. Tiap {TARGET} kehadiran berhak hadiah khusus.
      </p>
      <p className="petunjuk">
        Tiap jamaah punya nomor 4 angka. Kartunya bisa dibuka dengan menyebut nomornya saja, lewat alamat{" "}
        <span className="font-semibold">{alamatSitus().replace(/^https?:\/\//, "")}/jamaah/3239</span>. Nomor terbit
        sendiri saat orangnya pertama kali di-check-in.
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
              <th scope="col">Nomor</th>
              <th scope="col" className="hidden sm:table-cell">
                Hadir
              </th>
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
            const punya = kartu.get(satu.whatsapp);
            const token = punya?.token;
            const nomorJamaah = punya?.nomor ?? null;
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
                kolom={5}
                judulBaris={satu.nama}
                ringkas={
                  <>
                    <td>
                      <span className="font-semibold">{satu.nama}</span>
                      <span className="block text-xs text-ink-soft">{samarkanWa(satu.whatsapp)}</span>
                      <span className="block text-xs text-ink-soft sm:hidden">
                        {satu.hadir} kali hadir{penuh ? " · berhak hadiah" : ""}
                      </span>
                    </td>
                    <td>
                      {nomorJamaah ? (
                        <span className="kode-besar text-sm">{nomorJamaah}</span>
                      ) : (
                        <span className="text-xs text-ink-soft">belum ada</span>
                      )}
                    </td>
                  </>
                }
                tambahan={
                  <>
                    <td className="hidden sm:table-cell">
                      <span className={`label-status ${penuh ? "status-baik" : "status-diam"}`}>
                        {satu.hadir}
                        {penuh ? " · berhak hadiah" : ""}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap sm:table-cell">
                      {satu.terakhir ? tanggalPendek(satu.terakhir) : "-"}
                    </td>
                  </>
                }
                rincian={
                  <>
                    <p>{satu.terakhir ? `Terakhir hadir ${tanggalPendek(satu.terakhir)}` : "Belum ada tanggal"}</p>
                    <p>{penuh ? "Kartu penuh, berhak hadiah" : `Kurang ${TARGET - stempel} lagi`}</p>
                    {nomorJamaah ? <p>Alamat kartu: /jamaah/{nomorJamaah}</p> : null}
                  </>
                }
                aksi={
                  <>
                    {nomorJamaah || token ? (
                      // Dibuka di tab lain supaya daftar ini tidak ikut
                      // berpindah. Alamat pendek yang dipakai kalau nomornya
                      // sudah ada, jadi yang dilihat pengurus persis alamat
                      // yang dia bacakan ke jamaahnya.
                      <a
                        href={nomorJamaah ? `/jamaah/${nomorJamaah}` : `/kartu/${token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tombol-kecil"
                      >
                        Lihat kartu
                      </a>
                    ) : null}
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
                    {nomorJamaah ? null : (
                      // Jamaah yang hadir sebelum nomor jamaah ada. Aksinya
                      // melengkapi nomornya tanpa menyentuh token, jadi tautan
                      // yang sudah pernah dikirim ke orang itu tetap hidup.
                      <form action={terbitkanKartu}>
                        <input type="hidden" name="whatsapp" value={satu.whatsapp} />
                        <button type="submit" className="tombol-kecil">
                          Terbitkan kartu
                        </button>
                      </form>
                    )}
                    {alamat ? (
                      <KonfirmasiAksi
                        aksi={buatTautanKartu}
                        tersembunyi={{ whatsapp: satu.whatsapp }}
                        labelPemicu="Ganti tautan"
                        judul={`Ganti tautan kartu ${satu.nama}`}
                        penjelasan="Tautan panjang yang lama langsung tidak bisa dibuka lagi. Pakai ini kalau tautannya terlanjur tersebar ke orang lain. Nomor jamaahnya tidak ikut berubah, karena nomor itu memang untuk dihafal orangnya."
                        labelKonfirmasi="Ya, ganti tautannya"
                      />
                    ) : null}
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
