import type { Metadata } from "next";
import BarisTabel from "@/components/admin/BarisTabel";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import TabelAdmin from "@/components/admin/TabelAdmin";
import { IkonUnduh, IkonWhatsApp } from "@/components/Ikon";
import { db } from "@/lib/data";
import { rupiah, tanggalDanJam, tanggalPendek } from "@/lib/format";
import {
  pesanPembayaranTiketDiterima,
  pesanPembukaTiket,
  pesanTiketSiap,
} from "@/lib/pesan-wa";
import { linkWa } from "@/lib/wa";
import { batalkanPendaftar, konfirmasiPendaftar } from "./actions";
import type { RegistrationStatus } from "@/lib/data/types";

export const metadata: Metadata = { title: "Pendaftar", robots: { index: false } };
export const dynamic = "force-dynamic";

const NAMA_STATUS: Record<RegistrationStatus, string> = {
  pending: "Menunggu bayar",
  confirmed: "Terkonfirmasi",
  checked_in: "Sudah hadir",
  cancelled: "Dibatalkan",
};

const KELAS_STATUS: Record<RegistrationStatus, string> = {
  pending: "status-tunggu",
  confirmed: "status-baik",
  checked_in: "status-baik",
  cancelled: "status-bahaya",
};

type Props = { searchParams: Promise<{ acara?: string }> };

export default async function AdminPendaftar({ searchParams }: Props) {
  const { acara: acaraId } = await searchParams;
  const data = await db();
  const semuaAcara = await data.listEvents();
  const terpilih = acaraId ? await data.getEventById(acaraId) : (semuaAcara[0] ?? null);
  const pendaftar = terpilih ? await data.listRegistrations(terpilih.id) : [];
  const totalOrang = pendaftar
    .filter((r) => r.status !== "cancelled")
    .reduce((jumlah, r) => jumlah + r.quantity, 0);

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Pendaftar</h1>

      {semuaAcara.length === 0 ? (
        <p className="mt-3 text-ink-soft">Belum ada acara. Buat acara dulu di menu Acara.</p>
      ) : (
        <>
          <form method="get" className="mt-4 flex flex-wrap items-end gap-2">
            <div className="min-w-[220px] flex-1">
              <label className="label-isian" htmlFor="acara">
                Pilih acara
              </label>
              <select id="acara" name="acara" defaultValue={terpilih?.id} className="isian">
                {semuaAcara.map((acara) => (
                  <option key={acara.id} value={acara.id}>
                    {acara.title}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="tombol-kecil">
              Tampilkan
            </button>
          </form>

          {terpilih ? (
            <>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[1.15rem]">{terpilih.title}</h2>
                  <p className="text-sm text-ink-soft">
                    {tanggalDanJam(terpilih.starts_at)}, {totalOrang} orang terdaftar
                    {terpilih.capacity ? ` dari kuota ${terpilih.capacity}` : ""}
                  </p>
                </div>
                <a href={`/admin/pendaftar/csv?acara=${terpilih.id}`} className="tombol-kecil">
                  <IkonUnduh className="mr-2" />
                  Ekspor CSV
                </a>
              </div>

              {pendaftar.length === 0 ? (
                <div className="kartu mt-4 p-4">
                  <p className="font-semibold">Belum ada yang mendaftar acara ini.</p>
                  <p className="mt-1 text-ink-soft">
                    Bagikan halaman acaranya lewat grup WhatsApp supaya pendaftaran mulai masuk.
                  </p>
                </div>
              ) : (
                <TabelAdmin
                  className="mt-4"
                  keterangan={`Daftar pendaftar acara ${terpilih.title}`}
                  kepala={
                    <tr>
                      <th scope="col">Pendaftar</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="hidden sm:table-cell">
                        Kode
                      </th>
                      <th scope="col" className="hidden sm:table-cell">
                        Bayar
                      </th>
                      <th scope="col" className="sel-aksi">
                        Aksi
                      </th>
                    </tr>
                  }
                >
                  {pendaftar.map((orang) => {
                    const isi = {
                      nama: orang.name,
                      kode: orang.code,
                      acara: terpilih.title,
                      mulai: terpilih.starts_at,
                      lokasi: terpilih.location_name,
                      jumlah: orang.quantity,
                      nominal: orang.total_amount,
                    };
                    const sudahBayar = orang.total_amount > 0;
                    const teksWa =
                      orang.status === "confirmed" || orang.status === "checked_in"
                        ? sudahBayar
                          ? pesanPembayaranTiketDiterima(isi)
                          : pesanTiketSiap(isi)
                        : pesanPembukaTiket(isi);
                    const labelWa =
                      orang.status === "confirmed" || orang.status === "checked_in"
                        ? "Kirim tiket dan QR"
                        : "WhatsApp";

                    return (
                      <BarisTabel
                        key={orang.id}
                        kolom={5}
                        judulBaris={`pendaftar ${orang.name}`}
                        ringkas={
                          <>
                            <td>
                              <span className="font-semibold">{orang.name}</span>
                              <span className="block text-xs text-ink-soft">{orang.quantity} orang</span>
                              <span className="block text-xs text-ink-soft sm:hidden">
                                <span className="kode-besar text-xs">{orang.code}</span>
                              </span>
                            </td>
                            <td>
                              <span className={`label-status ${KELAS_STATUS[orang.status]}`}>
                                {NAMA_STATUS[orang.status]}
                              </span>
                            </td>
                          </>
                        }
                        tambahan={
                          <>
                            <td className="hidden sm:table-cell">
                              <span className="kode-besar text-sm">{orang.code}</span>
                            </td>
                            <td className="hidden whitespace-nowrap sm:table-cell">
                              {sudahBayar ? rupiah(orang.total_amount) : "Gratis"}
                            </td>
                          </>
                        }
                        rincian={
                          <>
                            <p>{sudahBayar ? rupiah(orang.total_amount) : "Gratis"}</p>
                            <p>Daftar {tanggalPendek(orang.created_at)}</p>
                          </>
                        }
                        aksi={
                          <>
                            <a
                              href={linkWa(orang.whatsapp, teksWa)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tombol-kecil"
                            >
                              <IkonWhatsApp className="mr-2" />
                              {labelWa}
                            </a>
                            {orang.status === "pending" ? (
                              <KonfirmasiAksi
                                aksi={konfirmasiPendaftar}
                                tersembunyi={{ id: orang.id }}
                                labelPemicu="Konfirmasi pembayaran"
                                judul={`Konfirmasi ${orang.name}`}
                                penjelasan={`Pastikan ${rupiah(orang.total_amount)} sudah masuk. Setelah dikonfirmasi, tiketnya bisa dipakai check-in dan Anda bisa mengirim QR-nya lewat WhatsApp.`}
                                labelKonfirmasi="Ya, sudah dibayar"
                              />
                            ) : null}
                            {orang.status !== "cancelled" ? (
                              <KonfirmasiAksi
                                aksi={batalkanPendaftar}
                                tersembunyi={{ id: orang.id }}
                                labelPemicu="Batalkan"
                                judul={`Batalkan pendaftaran ${orang.name}`}
                                penjelasan="Tempatnya dilepas kembali ke kuota, dan tiketnya tidak bisa dipakai check-in."
                                labelKonfirmasi="Ya, batalkan"
                                nadaBahaya
                              />
                            ) : null}
                          </>
                        }
                      />
                    );
                  })}
                </TabelAdmin>
              )}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
