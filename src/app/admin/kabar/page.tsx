import type { Metadata } from "next";
import Link from "next/link";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import FormKabar from "@/components/admin/FormKabar";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import { db } from "@/lib/data";
import { tanggalPendek } from "@/lib/format";
import { hapusKabar } from "./actions";

export const metadata: Metadata = { title: "Kabar Aksi", robots: { index: false } };
export const dynamic = "force-dynamic";

function hitungHari(mulai: string): number {
  const awal = new Date(`${mulai}T00:00:00+07:00`).getTime();
  const sekarang = Date.now();
  return Math.max(1, Math.floor((sekarang - awal) / 86_400_000) + 1);
}

type Props = { searchParams: Promise<{ edit?: string; tersimpan?: string }> };

export default async function AdminKabar({ searchParams }: Props) {
  const { edit, tersimpan } = await searchParams;
  const data = await db();
  const [daftar, season] = await Promise.all([data.listUpdates(), data.getActiveSeason()]);
  const diedit = edit ? await data.getUpdateById(edit) : null;

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Kabar Aksi</h1>
      <p className="mt-1 text-ink-soft">
        Satu foto, judul pendek, dan dua sampai empat kalimat. Hitungan hari yang naik terus adalah alasan orang membuka
        app ini lagi.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      <section className="mt-6">
        <h2>{diedit ? `Ubah: ${diedit.title}` : "Tulis kabar baru"}</h2>
        <div className="mt-3">
          <FormKabar
            kabar={diedit ?? undefined}
            season={season}
            hariOtomatis={season ? hitungHari(season.start_date) : null}
          />
        </div>
        {diedit ? (
          <Link prefetch={false} href="/admin/kabar" className="tombol-kecil mt-3">
            Batal mengubah, kembali ke form kabar baru
          </Link>
        ) : null}
      </section>

      <section className="mt-10">
        <h2>Kabar yang sudah ada</h2>
        {daftar.length === 0 ? (
          <p className="mt-2 text-ink-soft">Belum ada kabar yang ditulis.</p>
        ) : (
          <div className="mt-3 grid gap-3">
            {daftar.map((kabar) => (
              <article key={kabar.id} className="kartu p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[1.05rem]">
                      {kabar.day_number ? `Hari ke-${kabar.day_number}: ` : ""}
                      {kabar.title}
                    </h3>
                    <p className="text-sm text-ink-soft">{tanggalPendek(kabar.published_at)}</p>
                  </div>
                  <p
                    className={`rounded-[4px] border-2 px-2 py-1 text-sm font-semibold ${
                      kabar.is_published ? "border-sukses text-sukses" : "border-garis text-ink-soft"
                    }`}
                  >
                    {kabar.is_published ? "Terbit" : "Draf"}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link prefetch={false} href={`/admin/kabar?edit=${kabar.id}`} className="tombol-kecil">
                    Ubah
                  </Link>
                  {kabar.is_published ? (
                    <Link prefetch={false} href={`/kabar/${kabar.id}`} className="tombol-kecil">
                      Lihat halaman publik
                    </Link>
                  ) : null}
                  <KonfirmasiAksi
                    aksi={hapusKabar}
                    tersembunyi={{ id: kabar.id }}
                    labelPemicu="Hapus"
                    judul={`Hapus kabar ${kabar.title}`}
                    penjelasan="Kabar ini hilang dari halaman publik dan tidak bisa dikembalikan."
                    labelKonfirmasi="Ya, hapus kabar ini"
                    nadaBahaya
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
