import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Bagikan from "@/components/Bagikan";
import Markdown from "@/components/Markdown";
import { IkonKalender, IkonLokasi } from "@/components/Ikon";
import { kuotaAcara, satuAcara } from "@/lib/cache";
import { jam, rupiah, sudahLewat, tanggalDanJam, tanggalPanjang } from "@/lib/format";
import { ringkas } from "@/lib/markdown";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const acara = await satuAcara(slug);
  if (!acara || !acara.is_published) return { title: "Acara tidak ditemukan" };
  const deskripsi = `${tanggalDanJam(acara.starts_at)}${acara.location_name ? `, ${acara.location_name}` : ""}`;
  return {
    title: acara.title,
    description: acara.description ? ringkas(acara.description) : deskripsi,
    openGraph: { title: acara.title, description: deskripsi, type: "website" },
  };
}

export default async function DetailAcara({ params }: Props) {
  const { slug } = await params;
  const acara = await satuAcara(slug);
  if (!acara || !acara.is_published) notFound();

  const terpakai = new Map(acara.capacity === null ? [] : await kuotaAcara([acara.id]));
  const kuota = {
    remaining: acara.capacity === null ? null : Math.max(0, acara.capacity - (terpakai.get(acara.id) ?? 0)),
  };
  const tenggatLewat = acara.registration_deadline ? sudahLewat(acara.registration_deadline) : false;
  const acaraLewat = sudahLewat(acara.ends_at ?? acara.starts_at);
  const penuh = kuota.remaining !== null && kuota.remaining <= 0;
  const bisaDaftar = !tenggatLewat && !penuh && !acaraLewat;

  return (
    <div className="pb-24 md:pb-8">
      {acara.poster_url ? (
        <Image
          src={acara.poster_url}
          alt={`Poster ${acara.title}`}
          width={1200}
          height={1500}
          priority
          sizes="(max-width: 640px) 100vw, 600px"
          className="mx-auto h-auto w-full max-w-[600px] object-cover"
        />
      ) : null}

      <div className="kolom-isi py-5">
        <p className="flex flex-wrap items-center gap-2 text-xs">
          <span className="label-status bg-teal/10 text-teal-ink">{acara.is_paid ? rupiah(acara.price) : "Gratis"}</span>
          {penuh ? <span className="label-status bg-bahaya/10 text-bahaya">Kuota penuh</span> : null}
          {!penuh && kuota.remaining !== null ? (
            <span className="text-ink-soft">Sisa {kuota.remaining} tempat</span>
          ) : null}
        </p>
        <h1 className="mt-2">{acara.title}</h1>

        <div className="kartu mt-4 grid gap-2 p-4 text-[0.95rem]">
          <p className="flex items-start gap-2">
            <IkonKalender className="mt-0.5 shrink-0 text-teal-ink" />
            <span>
              {tanggalPanjang(acara.starts_at)}, {jam(acara.starts_at)}
              {acara.ends_at ? ` sampai ${jam(acara.ends_at)}` : ""}
            </span>
          </p>
          {acara.location_name ? (
            <p className="flex items-start gap-2">
              <IkonLokasi className="mt-0.5 shrink-0 text-teal-ink" />
              <span>
                {acara.location_name}
                {acara.location_map_url ? (
                  <>
                    {" "}
                    <a
                      href={acara.location_map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-teal-ink underline underline-offset-4"
                    >
                      Buka peta
                    </a>
                  </>
                ) : null}
              </span>
            </p>
          ) : null}
          {acara.is_recurring_note ? <p className="text-ink-soft">{acara.is_recurring_note}</p> : null}
        </div>

        {acara.description ? <Markdown sumber={acara.description} className="mt-4" /> : null}

        {!bisaDaftar ? (
          <p className="mt-4 rounded-[8px] border border-garis bg-paper p-3 text-sm font-semibold">
            {acaraLewat
              ? "Acara ini sudah lewat."
              : penuh
                ? "Kuota penuh. Pengurus mengumumkan kalau ada yang batal."
                : `Pendaftaran ditutup ${tanggalDanJam(acara.registration_deadline as string)}.`}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`/acara/${acara.slug}/kalender.ics`} className="tombol-kedua">
            <IkonKalender />
            Tambah ke kalender
          </a>
          <Bagikan
            judul={acara.title}
            teks={`${acara.title}, ${tanggalDanJam(acara.starts_at)}`}
            jalurCadangan={`/acara/${acara.slug}`}
          />
        </div>
      </div>

      {bisaDaftar ? (
        <div className="fixed bottom-[92px] left-0 right-0 z-30 border-t border-garis bg-paper p-3 md:static md:border-0 md:bg-transparent md:p-0">
          <div className="kolom-isi">
            <Link href={`/acara/${acara.slug}/daftar`} className="tombol-utama w-full">
              Daftar ikut acara ini
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
