import type { Metadata } from "next";
import Link from "next/link";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import FormAcara from "@/components/admin/FormAcara";
import KonfirmasiAksi from "@/components/admin/KonfirmasiAksi";
import { db } from "@/lib/data";
import { rupiah, tanggalDanJam } from "@/lib/format";
import { hapusAcara } from "./actions";

export const metadata: Metadata = { title: "Acara", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ edit?: string; tersimpan?: string }> };

export default async function AdminAcara({ searchParams }: Props) {
  const { edit, tersimpan } = await searchParams;
  const data = await db();
  const daftar = await data.listEvents();
  const diedit = edit ? await data.getEventById(edit) : null;

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Acara</h1>
      <p className="mt-1 text-ink-soft">
        Acara yang belum diterbitkan hanya terlihat di halaman ini. Kuota dan tenggat menutup tombol daftar secara
        otomatis.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      <section className="mt-6">
        <h2>{diedit ? `Ubah: ${diedit.title}` : "Buat acara baru"}</h2>
        <div className="mt-3">
          <FormAcara acara={diedit ?? undefined} />
        </div>
        {diedit ? (
          <Link prefetch={false} href="/admin/acara" className="tombol-kecil mt-3">
            Batal mengubah, kembali ke form acara baru
          </Link>
        ) : null}
      </section>

      <section className="mt-10">
        <h2>Daftar acara</h2>
        {daftar.length === 0 ? (
          <p className="mt-2 text-ink-soft">Belum ada acara yang dibuat.</p>
        ) : (
          <div className="mt-3 grid gap-3">
            {daftar.map((acara) => (
              <article key={acara.id} className="kartu p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[1.05rem]">{acara.title}</h3>
                    <p className="text-sm text-ink-soft">
                      {tanggalDanJam(acara.starts_at)}, {acara.is_paid ? rupiah(acara.price) : "gratis"}
                      {acara.capacity ? `, kuota ${acara.capacity}` : ", tanpa batas kuota"}
                    </p>
                  </div>
                  <p
                    className={`rounded-[4px] border-2 px-2 py-1 text-sm font-semibold ${
                      acara.is_published ? "border-sukses text-sukses" : "border-garis text-ink-soft"
                    }`}
                  >
                    {acara.is_published ? "Terbit" : "Draf"}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link prefetch={false} href={`/admin/acara?edit=${acara.id}`} className="tombol-kecil">
                    Ubah
                  </Link>
                  <Link prefetch={false} href={`/admin/pendaftar?acara=${acara.id}`} className="tombol-kecil">
                    Lihat pendaftar
                  </Link>
                  {acara.is_published ? (
                    <Link prefetch={false} href={`/acara/${acara.slug}`} className="tombol-kecil">
                      Lihat halaman publik
                    </Link>
                  ) : null}
                  <KonfirmasiAksi
                    aksi={hapusAcara}
                    tersembunyi={{ id: acara.id }}
                    labelPemicu="Hapus"
                    judul={`Hapus acara ${acara.title}`}
                    penjelasan="Acara dan seluruh pendaftarnya ikut terhapus, dan tidak bisa dikembalikan."
                    labelKonfirmasi="Ya, hapus acara ini"
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
