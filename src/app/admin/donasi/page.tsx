import type { Metadata } from "next";
import Link from "next/link";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import { IkonWhatsApp } from "@/components/Ikon";
import { db } from "@/lib/data";
import { rupiah, samarkanWa, tanggalPendek } from "@/lib/format";
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

type Props = { searchParams: Promise<{ status?: string; cari?: string }> };

export default async function AdminDonasi({ searchParams }: Props) {
  const { status, cari } = await searchParams;
  const saringan = (SARINGAN.find((s) => s.nilai === status)?.nilai ?? "pending") as DonationStatus | "semua";
  const kataCari = cari ?? "";
  const donasi = await (await db()).listDonations({ status: saringan, cari: kataCari });

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
        <div className="mt-6 grid gap-3">
          {donasi.map((item) => (
            <article key={item.id} className="kartu p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-[family-name:var(--font-judul)] text-lg font-bold">{rupiah(item.total_amount)}</p>
                  <p className="text-sm text-ink-soft">
                    {item.package_count} paket, kode <span className="badge-kode text-sm">{item.code}</span>
                  </p>
                </div>
                <p
                  className={`rounded-[4px] border-2 px-2 py-1 text-sm font-semibold ${
                    item.status === "verified"
                      ? "border-sukses text-sukses"
                      : item.status === "rejected"
                        ? "border-bahaya text-bahaya"
                        : "border-ink-soft text-ink-soft"
                  }`}
                >
                  {NAMA_STATUS[item.status]}
                </p>
              </div>

              <p className="mt-2">
                {item.donor_name}
                {item.is_anonymous ? " (minta namanya disembunyikan di halaman publik)" : ""}
              </p>
              <p className="text-sm text-ink-soft">
                {samarkanWa(item.whatsapp)}, masuk {tanggalPendek(item.created_at)}
              </p>
              {item.admin_note ? <p className="mt-1 text-sm">Catatan: {item.admin_note}</p> : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={linkWa(
                    item.whatsapp,
                    `Assalamualaikum ${item.donor_name}, ini pengurus Dzun Nuun. Terkait donasi kode ${item.code} sebesar ${rupiah(item.total_amount)}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tombol-kecil"
                >
                  <IkonWhatsApp className="mr-2" />
                  Buka WhatsApp donatur
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
                    penjelasan="Dipakai kalau transfernya tidak ditemukan. Donatur akan melihat catatan Anda di halaman statusnya."
                    labelKonfirmasi="Tandai ditolak"
                    pakaiCatatan
                    nadaBahaya
                  />
                ) : null}
                <Link prefetch={false} href={`/donasi/${item.code}`} className="tombol-kecil">
                  Lihat halaman donatur
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
