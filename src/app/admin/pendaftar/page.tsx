import type { Metadata } from "next";
import Link from "next/link";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import { IkonUnduh, IkonWhatsApp } from "@/components/Ikon";
import { db } from "@/lib/data";
import { rupiah, tanggalDanJam, tanggalPendek } from "@/lib/format";
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
                <div className="mt-4 grid gap-3">
                  {pendaftar.map((orang) => (
                    <article key={orang.id} className="kartu p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">
                            {orang.name}, {orang.quantity} orang
                          </p>
                          <p className="text-sm text-ink-soft">
                            <span className="kode-besar text-sm">{orang.code}</span>
                            {orang.total_amount > 0 ? `, ${rupiah(orang.total_amount)}` : ", gratis"}
                            {`, daftar ${tanggalPendek(orang.created_at)}`}
                          </p>
                        </div>
                        <p
                          className={`rounded-[4px] border-2 px-2 py-1 text-sm font-semibold ${
                            orang.status === "cancelled"
                              ? "border-bahaya text-bahaya"
                              : orang.status === "pending"
                                ? "border-garis text-ink-soft"
                                : "border-sukses text-sukses"
                          }`}
                        >
                          {NAMA_STATUS[orang.status]}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={linkWa(
                            orang.whatsapp,
                            `Assalamualaikum ${orang.name}, ini pengurus Dzun Nuun. Terkait pendaftaran acara ${terpilih.title} dengan kode ${orang.code}.`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tombol-kecil"
                        >
                          <IkonWhatsApp className="mr-2" />
                          WhatsApp
                        </a>
                        {orang.status === "pending" ? (
                          <KonfirmasiAksi
                            aksi={konfirmasiPendaftar}
                            tersembunyi={{ id: orang.id }}
                            labelPemicu="Konfirmasi pembayaran"
                            judul={`Konfirmasi ${orang.name}`}
                            penjelasan={`Pastikan ${rupiah(orang.total_amount)} sudah masuk. Setelah dikonfirmasi, tiketnya bisa dipakai check-in.`}
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
                        <Link prefetch={false} href={`/tiket/${orang.code}`} className="tombol-kecil">
                          Lihat tiket
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
