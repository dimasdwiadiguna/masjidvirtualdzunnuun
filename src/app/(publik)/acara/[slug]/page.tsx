import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BagikanWa from "@/components/BagikanWa";
import Markdown from "@/components/Markdown";
import { IkonKalender, IkonLokasi } from "@/components/Ikon";
import { db } from "@/lib/data";
import { jam, rupiah, sudahLewat, tanggalDanJam, tanggalPanjang } from "@/lib/format";
import { ringkas } from "@/lib/markdown";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const acara = await (await db()).getEventBySlug(slug);
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
  const data = await db();
  const acara = await data.getEventBySlug(slug);
  if (!acara || !acara.is_published) notFound();

  const kuota = await data.eventCapacity(acara.id, acara.capacity);
  const tenggatLewat = acara.registration_deadline ? sudahLewat(acara.registration_deadline) : false;
  const acaraLewat = sudahLewat(acara.ends_at ?? acara.starts_at);
  const penuh = kuota.remaining !== null && kuota.remaining <= 0;
  const bisaDaftar = !tenggatLewat && !penuh && !acaraLewat;

  return (
    <div className="pb-8">
      {acara.poster_url ? (
        <Image
          src={acara.poster_url}
          alt={`Poster acara ${acara.title}`}
          width={1200}
          height={1500}
          priority
          sizes="(max-width: 640px) 100vw, 640px"
          className="mx-auto h-auto w-full max-w-[640px] border-b-2 border-ink object-cover"
        />
      ) : null}

      <div className="kolom-isi py-8">
        <h1>{acara.title}</h1>

        <div className="kartu mt-4 grid gap-2 p-4">
          <p className="flex items-start gap-2">
            <IkonKalender className="mt-0.5 shrink-0 text-teal-ink" />
            <span>
              {tanggalPanjang(acara.starts_at)}
              <br />
              {jam(acara.starts_at)}
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
                    <br />
                    <a
                      href={acara.location_map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center font-semibold text-teal-ink underline underline-offset-4"
                    >
                      Buka lokasi di peta
                    </a>
                  </>
                ) : null}
              </span>
            </p>
          ) : null}
          <p className="font-semibold text-teal-ink">{acara.is_paid ? rupiah(acara.price) : "Gratis"}</p>
          {acara.is_recurring_note ? <p className="text-ink-soft">{acara.is_recurring_note}</p> : null}
          {kuota.remaining !== null ? (
            <p className={penuh ? "font-semibold text-bahaya" : "text-ink-soft"}>
              {penuh ? "Kuota penuh" : `Sisa ${kuota.remaining} tempat dari ${acara.capacity}`}
            </p>
          ) : null}
        </div>

        {acara.description ? <Markdown sumber={acara.description} className="mt-5 max-w-[60ch]" /> : null}

        <div className="mt-6">
          {bisaDaftar ? (
            <Link href={`/acara/${acara.slug}/daftar`} className="tombol-utama w-full sm:w-auto">
              Daftar ikut acara ini
            </Link>
          ) : (
            <p className="rounded-[4px] border-2 border-ink-soft bg-paper p-3 font-semibold">
              {acaraLewat
                ? "Acara ini sudah lewat. Jadwal berikutnya kami umumkan di halaman Acara."
                : penuh
                  ? "Kuota penuh. Kalau ada yang batal, pengurus mengumumkannya lewat Saluran WhatsApp."
                  : `Pendaftaran ditutup pada ${tanggalDanJam(acara.registration_deadline as string)}.`}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <a href={`/acara/${acara.slug}/kalender.ics`} className="tombol-kedua">
            <IkonKalender />
            Tambah ke kalender
          </a>
          <BagikanWa
            teks={`${acara.title}, ${tanggalDanJam(acara.starts_at)}`}
            jalurCadangan={`/acara/${acara.slug}`}
          />
        </div>
      </div>
    </div>
  );
}
