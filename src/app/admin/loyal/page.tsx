import type { Metadata } from "next";
import BarisTabel from "@/components/admin/BarisTabel";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import TabelAdmin from "@/components/admin/TabelAdmin";
import TombolAksi from "@/components/admin/TombolAksi";
import { IkonWhatsApp } from "@/components/Ikon";
import { db } from "@/lib/data";
import { samarkanWa, tanggalPendek } from "@/lib/format";
import { pesanKartu, templatDari } from "@/lib/pesan-wa";
import { alamatSitus } from "@/lib/situs";
import { linkWa } from "@/lib/wa";
import { buatTautanKartu, terbitkanKartu, terbitkanSemuaKartu } from "./actions";

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
  // dan tombolnya hanya untuk jamaah yang hadir sebelum kode jamaah ada.
  const kartu = await data.semuaKartuJamaah();
  const belumBerkode = ringkasan.filter((satu) => !kartu.get(satu.whatsapp)?.kode).length;

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Jamaah Loyal</h1>
      <p className="mt-1 text-ink-soft">
        Dihitung dari tiket yang benar-benar di-check-in, bukan dari yang mendaftar. Satu tiket dihitung satu kehadiran
        walaupun dipakai untuk beberapa orang. Tiap {TARGET} kehadiran berhak hadiah khusus.
      </p>
      <p className="petunjuk">
        Tiap jamaah punya kode 5 karakter: dua huruf lalu tiga angka. Kartunya bisa dibuka dengan menyebut kodenya
        saja, lewat alamat <span className="font-semibold">{alamatSitus().replace(/^https?:\/\//, "")}/jamaah/KM472</span>.
        Kode terbit sendiri saat orangnya pertama kali di-check-in.
      </p>

      {belumBerkode > 0 ? (
        <div className="kartu mt-4 p-4">
          <p className="font-semibold">
            {belumBerkode} jamaah belum punya kode.
          </p>
          <p className="petunjuk">
            Jamaah yang hadir sebelum kode ini ada. Menerbitkan kode tidak mematikan tautan kartu yang sudah pernah
            Anda kirim ke mereka.
          </p>
          <div className="mt-3">
            <TombolAksi
              aksi={terbitkanSemuaKartu}
              label={`Terbitkan kode untuk ${belumBerkode} jamaah`}
              labelSibuk="Menerbitkan..."
            />
          </div>
        </div>
      ) : null}

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
              <th scope="col">Kode</th>
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
            const kodeJamaah = punya?.kode ?? null;
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
                      {kodeJamaah ? (
                        <span className="kode-besar text-sm">{kodeJamaah}</span>
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
                    {kodeJamaah ? <p>Alamat kartu: /jamaah/{kodeJamaah}</p> : null}
                  </>
                }
                aksi={
                  <>
                    {kodeJamaah || token ? (
                      // Dibuka di tab lain supaya daftar ini tidak ikut
                      // berpindah. Alamat pendek yang dipakai kalau nomornya
                      // sudah ada, jadi yang dilihat pengurus persis alamat
                      // yang dia bacakan ke jamaahnya.
                      <a
                        href={kodeJamaah ? `/jamaah/${kodeJamaah}` : `/kartu/${token}`}
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
                    {kodeJamaah ? null : (
                      // Jamaah yang hadir sebelum kode jamaah ada. Aksinya
                      // melengkapi kodenya tanpa menyentuh token, jadi tautan
                      // yang sudah pernah dikirim ke orang itu tetap hidup.
                      <TombolAksi
                        aksi={terbitkanKartu}
                        tersembunyi={{ whatsapp: satu.whatsapp }}
                        label="Terbitkan kode"
                        labelSibuk="Menerbitkan..."
                      />
                    )}
                    {alamat ? (
                      <KonfirmasiAksi
                        aksi={buatTautanKartu}
                        tersembunyi={{ whatsapp: satu.whatsapp }}
                        labelPemicu="Ganti tautan"
                        judul={`Ganti tautan kartu ${satu.nama}`}
                        penjelasan="Tautan panjang yang lama langsung tidak bisa dibuka lagi. Pakai ini kalau tautannya terlanjur tersebar ke orang lain. Kode jamaahnya tidak ikut berubah, karena kode itu memang untuk dihafal orangnya."
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
