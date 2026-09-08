import type { Metadata } from "next";
import Link from "next/link";
import BarisTabel from "@/components/admin/BarisTabel";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import TabelAdmin from "@/components/admin/TabelAdmin";
import { IkonWhatsApp } from "@/components/Ikon";
import { db } from "@/lib/data";
import { rupiah, samarkanWa, tanggalPendek } from "@/lib/format";
import {
  pesanDonasiBelumCocok,
  pesanDonasiDiterima,
  pesanPembukaDonasi,
} from "@/lib/pesan-wa";
import { linkWa } from "@/lib/wa";
import { tolakDonasi, verifikasiDonasi } from "./actions";
import type { DonationStatus } from "@/lib/data/types";

export const metadata: Metadata = { title: "Donasi", robots: { index: false } };
export const dynamic = "force-dynamic";

const SARINGAN: { nilai: DonationStatus | "semua"; label: string }[] = [
  { nilai: "pending", label: "Menunggu" },
  { nilai: "verified", label: "Terverifikasi" },
  { nilai: "rejected", label: "Ditolak" },
  { nilai: "semua", label: "Semua" },
];

const NAMA_STATUS: Record<DonationStatus, string> = {
  pending: "Menunggu",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

const KELAS_STATUS: Record<DonationStatus, string> = {
  pending: "status-tunggu",
  verified: "status-baik",
  rejected: "status-bahaya",
};

type Props = { searchParams: Promise<{ status?: string; cari?: string }> };

export default async function AdminDonasi({ searchParams }: Props) {
  const { status, cari } = await searchParams;
  const saringan = (SARINGAN.find((s) => s.nilai === status)?.nilai ?? "pending") as DonationStatus | "semua";
  const kataCari = cari ?? "";
  const data = await db();
  const [donasi, season] = await Promise.all([
    data.listDonations({ status: saringan, cari: kataCari }),
    data.getActiveSeason(),
  ]);

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Donasi</h1>
      <p className="mt-1 text-ink-soft">
        Cocokkan nominal transfer yang masuk dengan baris di bawah, lalu verifikasi. Hanya donasi terverifikasi yang
        menambah progress di halaman publik.
      </p>

      <nav aria-label="Saring status" className="mt-4 flex flex-wrap gap-2">
        {SARINGAN.map((item) => (
          <Link prefetch={false}
            key={item.nilai}
            href={`/admin/donasi?status=${item.nilai}${kataCari ? `&cari=${encodeURIComponent(kataCari)}` : ""}`}
            aria-current={saringan === item.nilai ? "page" : undefined}
            className={`tombol-kecil ${saringan === item.nilai ? "border-ink bg-teal text-paper" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <form method="get" className="mt-4 flex flex-wrap items-end gap-2">
        <input type="hidden" name="status" value={saringan} />
        <div className="min-w-[200px] flex-1">
          <label className="label-isian" htmlFor="cari">
            Cari nama, kode, atau nominal
          </label>
          <input id="cari" name="cari" defaultValue={kataCari} className="isian" placeholder="DZN-4K7P" />
        </div>
        <button type="submit" className="tombol-kecil">
          Cari
        </button>
        {kataCari ? (
          <Link prefetch={false} href={`/admin/donasi?status=${saringan}`} className="tombol-kecil">
            Hapus pencarian
          </Link>
        ) : null}
      </form>

      {donasi.length === 0 ? (
        <div className="kartu mt-6 p-4">
          <p className="font-semibold">
            {kataCari ? "Tidak ada donasi yang cocok dengan pencarian itu." : "Belum ada donasi pada status ini."}
          </p>
          <p className="mt-1 text-ink-soft">
            {kataCari
              ? "Coba cari dengan potongan nama, kode, atau nominal tanpa titik."
              : "Baris baru muncul begitu ada yang mengisi formulir patungan."}
          </p>
        </div>
      ) : (
        <TabelAdmin
          className="mt-6"
          keterangan={`Daftar donasi berstatus ${saringan === "semua" ? "semua status" : NAMA_STATUS[saringan]}`}
          kepala={
            <tr>
              <th scope="col">Donatur</th>
              <th scope="col">Nominal</th>
              <th scope="col" className="hidden sm:table-cell">
                Kode
              </th>
              <th scope="col" className="hidden sm:table-cell">
                Status
              </th>
              <th scope="col" className="sel-aksi">
                Aksi
              </th>
            </tr>
          }
        >
          {donasi.map((item) => {
            const isi = {
              nama: item.donor_name,
              kode: item.code,
              nominal: item.total_amount,
              paket: item.package_count,
              catatan: item.admin_note,
              slugSeason: season?.slug ?? null,
            };
            const teksWa =
              item.status === "verified"
                ? pesanDonasiDiterima(isi)
                : item.status === "rejected"
                  ? pesanDonasiBelumCocok(isi)
                  : pesanPembukaDonasi(isi);
            const labelWa =
              item.status === "verified"
                ? "Kirim kabar diterima"
                : item.status === "rejected"
                  ? "Kirim alasan"
                  : "WhatsApp";

            return (
              <BarisTabel
                key={item.id}
                kolom={5}
                judulBaris={`donasi ${item.donor_name}`}
                ringkas={
                  <>
                    <td>
                      <span className="font-semibold">{item.donor_name}</span>
                      {item.is_anonymous ? (
                        <span className="block text-xs text-ink-soft">nama disembunyikan di halaman publik</span>
                      ) : null}
                      <span className="block text-xs text-ink-soft sm:hidden">
                        <span className="kode-besar text-xs">{item.code}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap font-semibold">{rupiah(item.total_amount)}</td>
                  </>
                }
                tambahan={
                  <>
                    <td className="hidden sm:table-cell">
                      <span className="kode-besar text-sm">{item.code}</span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className={`label-status ${KELAS_STATUS[item.status]}`}>{NAMA_STATUS[item.status]}</span>
                    </td>
                  </>
                }
                rincian={
                  <>
                    <p>
                      <span className={`label-status ${KELAS_STATUS[item.status]}`}>{NAMA_STATUS[item.status]}</span>
                    </p>
                    <p>
                      {item.package_count} paket, {samarkanWa(item.whatsapp)}
                    </p>
                    <p>Masuk {tanggalPendek(item.created_at)}</p>
                    {item.admin_note ? <p>Catatan: {item.admin_note}</p> : null}
                  </>
                }
                aksi={
                  <>
                    <a
                      href={linkWa(item.whatsapp, teksWa)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tombol-kecil"
                    >
                      <IkonWhatsApp className="mr-2" />
                      {labelWa}
                    </a>
                    {item.status !== "verified" ? (
                      <KonfirmasiAksi
                        aksi={verifikasiDonasi}
                        tersembunyi={{ id: item.id }}
                        labelPemicu="Verifikasi"
                        judul={`Verifikasi ${rupiah(item.total_amount)}`}
                        penjelasan={`Pastikan nominal ini benar-benar sudah masuk ke rekening. Setelah diverifikasi, ${item.package_count} paket dari ${item.donor_name} ikut menambah progress di halaman publik.`}
                        labelKonfirmasi="Ya, dana sudah masuk"
                        pakaiCatatan
                      />
                    ) : null}
                    {item.status !== "rejected" ? (
                      <KonfirmasiAksi
                        aksi={tolakDonasi}
                        tersembunyi={{ id: item.id }}
                        labelPemicu="Tolak"
                        judul="Tandai belum bisa dicocokkan"
                        penjelasan="Dipakai kalau transfernya tidak ditemukan. Catatan Anda ikut terbawa ke pesan WhatsApp penolakan, jadi tulis dengan bahasa yang enak dibaca."
                        labelKonfirmasi="Tandai ditolak"
                        pakaiCatatan
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
    </div>
  );
}
